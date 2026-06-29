// df_master.js — DYNAMIC FOCUS "MASTER" engine (by-path mapping, 512 slots, 32 pages x 16 rows).
//
// ONE master device on a MIDI track that receives the controller. 512 slots across 32 pages;
// each page shows 16 rows: rows 0..7 = left column (vis indices 0..7),
//                          rows 8..15 = right column (vis indices 8..15).
//
// Each row:
//   * "Map CC"  button  -> arm, then twist an encoder        -> captures the CC (MIDI)
//   * "Map Parameter" button -> arm, then click a parameter  -> captures its PATH + name + range
//   * Min / Max numboxes -> the % of the param's range the encoder sweeps between
// A slot drives once it has BOTH a CC and a parameter path, accessed directly by path on every
// resolve -- works for device params, sends, mixer controls, anything Live exposes.
//
// Button labels update via the patch's `text $1, texton $1` mechanism (NOT setsymbol).
//
// Inlets:
//   0 -- bang from live.thisdevice (init) OR plain pattr left outlet (restore on load)
//   1 -- row command (list): [row, cmd, ...]
//         row = 0..15 (visual row on current page; 0..7 left col, 8..15 right col)
//         cmd = mapcc | mapparam | clear | min <v> | max <v>
//       OR page command (list): [page, N]  (N = 0-based page index, 0..31)
//       OR named message "page N" from a Max message box (calls function page(N))
//   2 -- CC list from ctlin: [value, cc, channel]
//
// Outlets:
//   0 -- full row:  [row, ccLabel, paramLabel, outMin, outMax, mapped(0/1), ccArm(0/1), paramArm(0/1)]
//   1 -- value:     [row, valueInt(0-100)]  row = 0..15           (on drive)
//   2 -- page sel:  [page, active(0/1)]  -- sent for all 32 pages after page change
//   3 -- pattr save: char-code integer list (JSON.stringify of SLOTS encoded as charCodes)
//
// Persistence (v4.5, plain pattr + outlet 3):
//   pattr df_data = plain pattr (NO parameter_enable). Stores atom list per-instance in .als.
//   SAVE: pushState() -> outlet(3, charCodeArray) -> pattr inlet 0.
//   RESTORE: pattr left outlet -> js inlet 0 -> list() -> restoreFromCodes().
//
// Path stability note:
//   slot.path = Live API canonical path, e.g. "live_set tracks 0 devices 0 parameters 2".
//   Stable across .als save/reload as long as track/device ORDER does not change.

autowatch = 0;
inlets  = 3;   // 0=init (bang) OR pattr restore (list of charCodes), 1=cmd, 2=CC
outlets = 4;   // 0=full row, 1=value, 2=page sel, 3=pattr save (charCode list)

var PAGE_SIZE = 16;
var NPAGES    = 32;
var NSLOTS    = PAGE_SIZE * NPAGES;  // 512

var currentPage = 0;

// SLOTS[i] = null OR { cc, ch, name, path, pmin, pmax, target, cur, anchorC, anchorP, engaged, lastIncoming }
var SLOTS = [], OUTMIN = [], OUTMAX = [];
function initSlots() {
    // Called at script load and at start of setvalueof (before repopulating from saved JSON).
    // Should appear at most TWICE per session.
    log("initSlots called");
    SLOTS = []; OUTMIN = []; OUTMAX = [];
    for (var i = 0; i < NSLOTS; i++) {
        SLOTS.push(null); OUTMIN.push(0); OUTMAX.push(100);
    }
}
initSlots();

var learnCCSlot = -1;
var learnPSlot  = -1;

var selTrackObs = null, selParamObs = null;
var PICKUP_EPS  = 0.02;

// -- Guards -----------------------------------------------------------

// Block pushState during device init / restore phase.
// On .als load, Live restores live.numbox parameters (parameter_initial_enable=1) which fire
// handleCmd min/max before pattr restore arrives on inlet 0. Without this guard those calls
// would clobber pattr via pushState with empty SLOTS.
// Cleared at end of restoreFromCodes Task (800ms) or by bang() Task (100ms) if no restore.
var _loading = true;

// Anti-clobber: pushState is skipped unless SLOTS has real data OR _explicitClear=true.
// Prevents writing sentinel 0 to pattr whenever SLOTS happen to be empty incidentally.
var _explicitClear = false;

function log(s) { post("[DF-Master] " + s + "\n"); }

// -- Persistence: plain pattr + outlet 3 (char-code list, Option C) ----
//
// Mechanism: plain pattr df_data (NO parameter_enable) holds a list of integers.
//   pattr CAN store atom lists per-instance in .als without parameter_enable.
//   No getvalueof/setvalueof (those are only for parameter-enabled patrs).
//
// SAVE: js encodes SLOTS as JSON string -> char-code array -> outlet(3, codes[]).
//   outlet 3 -> pattr inlet 0 -> pattr stores the integer list in .als.
//
// RESTORE: on .als load, pattr outputs its stored list from LEFT outlet (outlet 0)
//   -> js inlet 0 -> list() handler -> restoreFromCodes().
//
// GUARDS: _loading blocks pushState during init; _explicitClear allows writing
//   an explicit sentinel when user clears the last slot.
//
function restoreFromCodes(args) {
    // Called from list() on inlet 0 when pattr delivers its stored integer list at load time.
    log("restore: received " + args.length + " number(s), first=" + args[0]);

    if (!args || args.length === 0) { _loading = false; return; }

    // Sentinel: single 0 (or -1) means nothing was saved.
    if (args.length === 1 && (args[0] === 0 || args[0] === -1)) {
        log("restore: sentinel " + args[0] + " -- nothing to restore");
        _loading = false;
        return;
    }

    // Reconstruct JSON string from char codes.
    var raw = "";
    for (var i = 0; i < args.length; i++) {
        raw += String.fromCharCode(parseInt(args[i], 10));
    }
    log("restore: reconstructed string (" + raw.length + " chars), first 60: " + raw.substring(0, 60));

    if (raw.charAt(0) !== "{") {
        log("restore: unexpected format (first char='" + raw.charAt(0) + "') -- ignoring");
        _loading = false;
        return;
    }

    var state;
    try {
        state = JSON.parse(raw);
    } catch(e) {
        log("restore: JSON.parse failed: " + e);
        _loading = false;
        return;
    }

    if (!state || !state.slots || !state.slots.length) {
        log("restore: parsed OK but no slots");
        _loading = false;
        return;
    }

    initSlots();
    var n = 0;
    for (var k = 0; k < state.slots.length; k++) {
        var s = state.slots[k];
        var idx = parseInt(s.i, 10);
        if (isNaN(idx) || idx < 0 || idx >= NSLOTS) continue;
        SLOTS[idx] = newSlot();
        SLOTS[idx].cc   = (s.cc  != null && s.cc  >= 0) ? parseInt(s.cc,10)  : null;
        SLOTS[idx].ch   = (s.ch  != null && s.ch  > 0)  ? parseInt(s.ch,10)  : null;
        SLOTS[idx].name = s.name || null;
        SLOTS[idx].path = s.path || null;
        SLOTS[idx].pmin = isNaN(parseFloat(s.pmin)) ? 0.0 : parseFloat(s.pmin);
        SLOTS[idx].pmax = isNaN(parseFloat(s.pmax)) ? 1.0 : parseFloat(s.pmax);
        OUTMIN[idx] = (s.omin != null) ? Math.max(0, Math.min(100, parseInt(s.omin,10))) : 0;
        OUTMAX[idx] = (s.omax != null) ? Math.max(0, Math.min(100, parseInt(s.omax,10))) : 100;
        n++;
    }
    log("restore: populated " + n + " slot(s), resolveAll in 800ms");

    var task = new Task(function() {
        resolveAll();
        renderCurrentPage();
        renderPageSel();
        log("restore Task: resolveAll done, _loading cleared");
        _loading = false;
    }, this);
    task.schedule(800);
}

function buildSlotsArray() {
    var slots = [];
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || (b.cc == null && b.name == null)) continue;
        slots.push({
            i:    i,
            cc:   b.cc,
            ch:   b.ch,
            omin: Math.round(OUTMIN[i]),
            omax: Math.round(OUTMAX[i]),
            pmin: isNaN(b.pmin) ? 0.0 : b.pmin,
            pmax: isNaN(b.pmax) ? 1.0 : b.pmax,
            name: b.name,
            path: b.path
        });
    }
    return slots;
}

// Write current SLOTS into plain pattr via outlet 3 (char-code integer list).
// ANTI-CLOBBER: skipped if SLOTS has no real data AND _explicitClear is false.
function pushState() {
    if (_loading) { return; }
    var slots = buildSlotsArray();
    if (slots.length === 0 && !_explicitClear) {
        log("pushState: SLOTS empty + not explicit clear -- skipped");
        return;
    }
    if (slots.length === 0) {
        log("pushState: explicit clear -> sentinel [0] to pattr");
        outlet(3, [0]);
        return;
    }
    var str = JSON.stringify({slots: slots});
    var codes = [];
    for (var i = 0; i < str.length; i++) { codes.push(str.charCodeAt(i)); }
    log("pushState: outlet(3, " + codes.length + " codes) for " + slots.length + " slot(s)");
    outlet(3, codes);
}

// -- Init -------------------------------------------------------------
function bang() {
    if (inlet !== 0) return;
    setupFocus();
    renderCurrentPage();
    renderPageSel();
    // plain pattr left-outlet fires BEFORE live.thisdevice bang on load (pattr outputs on init).
    // If restore arrived, _loading will be cleared by the 800ms Task.
    // If nothing arrived (empty set), clear _loading here after 100ms.
    var t = new Task(function() {
        if (_loading) {
            log("bang: no restore fired -- clearing _loading (empty set)");
            _loading = false;
        }
    }, this);
    t.schedule(100);
}

function setupFocus() {
    if (selTrackObs) selTrackObs.property = "";
    selTrackObs = new LiveAPI(onSelectedTrack, "live_set view");
    selTrackObs.property = "selected_track";
    if (selParamObs) selParamObs.property = "";
    selParamObs = new LiveAPI(onSelectedParam, "live_set view");
    selParamObs.property = "selected_parameter";
    resolveAll();
}

// -- Inlet dispatch ---------------------------------------------------
function list() {
    if (inlet === 1) { handleCmd(arrayfromargs(arguments)); return; }
    if (inlet === 2) { handleCC(arrayfromargs(arguments)); return; }
    // inlet 0: plain pattr left outlet fires a list of integers on .als load.
    if (inlet === 0) { restoreFromCodes(arrayfromargs(arguments)); return; }
}

function msg_int(v) {
    // inlet 0: pattr delivering a single integer sentinel (e.g. 0 for empty state)
    if (inlet === 0) { restoreFromCodes([v]); }
}

function anything() {
    // inlet 0: unexpected symbol — log and ignore
    if (inlet === 0) {
        log("inlet 0 anything: '" + messagename + "' (unexpected, ignoring)");
    }
}

function handleCC(a) {
    if (a.length < 3) return;
    var val = a[0], cc = a[1], ch = a[2];
    log("handleCC: val=" + val + " cc=" + cc + " ch=" + ch + " learnCCSlot=" + learnCCSlot);
    if (learnCCSlot >= 0) { captureCC(learnCCSlot, cc, ch); }
    var v = val / 127.0;
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || b.cc == null || b.cc !== cc || b.ch !== ch) continue;
        if (!b.target) continue;
        drive(i, b, v);
        var visRow = slotToVisRow(i);
        if (visRow >= 0) renderValueRow(visRow, i);
    }
}

// Named message handler: "page N" from message box calls this directly (not list()).
function page(n) {
    var pg = parseInt(n, 10);
    if (isNaN(pg) || pg < 0 || pg >= NPAGES) return;
    setPage(pg);
}

function handleCmd(a) {
    if (a.length < 2) return;
    var first = a[0];
    var cmd   = a[1];

    if (first === "page") {
        var pg = parseInt(cmd, 10);
        if (isNaN(pg) || pg < 0 || pg >= NPAGES) return;
        setPage(pg);
        return;
    }

    var visRow = first;
    if (visRow < 0 || visRow >= PAGE_SIZE) return;
    var absSlot = currentPage * PAGE_SIZE + visRow;

    if      (cmd === "mapcc")    armCC(absSlot);
    else if (cmd === "mapparam") armParam(absSlot);
    else if (cmd === "clear")    clearSlot(absSlot);
    else if (cmd === "min") {
        OUTMIN[absSlot] = clampPct(a[2]);
        reapply(absSlot);
        if (SLOTS[absSlot] && (SLOTS[absSlot].cc != null || SLOTS[absSlot].name != null)) {
            pushState();
        }
    }
    else if (cmd === "max") {
        OUTMAX[absSlot] = clampPct(a[2]);
        reapply(absSlot);
        if (SLOTS[absSlot] && (SLOTS[absSlot].cc != null || SLOTS[absSlot].name != null)) {
            pushState();
        }
    }
}

function clampPct(x) { x = parseFloat(x); if (isNaN(x)) return 0; return Math.max(0, Math.min(100, x)); }

// -- Page switching ---------------------------------------------------
function setPage(pg) {
    if (learnCCSlot >= 0 && Math.floor(learnCCSlot / PAGE_SIZE) !== pg) learnCCSlot = -1;
    if (learnPSlot  >= 0 && Math.floor(learnPSlot  / PAGE_SIZE) !== pg) learnPSlot  = -1;
    currentPage = pg;
    renderCurrentPage();
    renderPageSel();
}

function slotToVisRow(absSlot) {
    var pg = Math.floor(absSlot / PAGE_SIZE);
    if (pg !== currentPage) return -1;
    return absSlot - currentPage * PAGE_SIZE;
}

// -- Arm / capture ----------------------------------------------------
function armCC(absSlot) {
    var prev = learnCCSlot;
    learnCCSlot = absSlot;
    log("armCC: absSlot=" + absSlot + " page=" + currentPage + " (prev=" + prev + ")");
    if (prev >= 0 && prev !== absSlot) renderAbsSlot(prev);
    renderAbsSlot(absSlot);
}

function armParam(absSlot) {
    var prev = learnPSlot;
    learnPSlot = absSlot;
    if (prev >= 0 && prev !== absSlot) renderAbsSlot(prev);
    renderAbsSlot(absSlot);
    // Immediate poll: capture the parameter ALREADY selected in Live.
    // Observer only fires on CHANGE; poll covers the case where user clicked before Map Param.
    pollSelectedParam();
}

function pollSelectedParam() {
    if (learnPSlot < 0) return;
    var api = new LiveAPI(null, "live_set view");
    var sp = api.get("selected_parameter");
    if (!sp || sp.length < 2 || sp[0] !== "id") return;
    var pid = parseInt(sp[1], 10);
    if (pid <= 0) return;
    captureParam(learnPSlot, pid);
}

// Works for device params, mixer volume/pan, sends -- anything Live exposes.
function captureParam(absSlot, pid) {
    var p = new LiveAPI(null, "id " + pid);
    var pname = p.get("name") + "";
    var pmin  = parseFloat(p.get("min"));
    var pmax  = parseFloat(p.get("max"));
    var ppath = p.unquotedpath;

    if (!ppath || ppath.length === 0) {
        log("captureParam: empty path for id " + pid + " name=" + pname + " -- aborted");
        return;
    }

    if (!SLOTS[absSlot]) SLOTS[absSlot] = newSlot();
    SLOTS[absSlot].name  = pname;
    SLOTS[absSlot].path  = ppath;
    SLOTS[absSlot].pmin  = isNaN(pmin) ? 0.0 : pmin;
    SLOTS[absSlot].pmax  = isNaN(pmax) ? 1.0 : pmax;
    learnPSlot = -1;

    log("captureParam: absSlot=" + absSlot + " name=" + pname + " path=" + ppath);

    resolveAll();
    renderAbsSlot(absSlot);
    pushState();
}

function captureCC(absSlot, cc, ch) {
    log("captureCC: absSlot=" + absSlot + " cc=" + cc + " ch=" + ch);
    if (!SLOTS[absSlot]) SLOTS[absSlot] = newSlot();
    SLOTS[absSlot].cc = cc; SLOTS[absSlot].ch = ch;
    learnCCSlot = -1;
    resolveAll();
    renderAbsSlot(absSlot);
    pushState();
}

function onSelectedParam(args) {
    if (learnPSlot < 0) return;
    if (!args || args.length < 3 || args[0] != "selected_parameter") return;
    var pid = parseInt(args[2], 10);
    if (pid <= 0) return;
    captureParam(learnPSlot, pid);
}

function newSlot() {
    return { cc: null, ch: null, name: null, path: null, pmin: 0, pmax: 1,
             target: null, cur: 0, anchorC: -1, anchorP: 0, engaged: false, lastIncoming: -1 };
}

function clearSlot(absSlot) {
    SLOTS[absSlot] = null;
    if (learnCCSlot === absSlot) learnCCSlot = -1;
    if (learnPSlot  === absSlot) learnPSlot  = -1;
    renderAbsSlot(absSlot);
    var anyLeft = false;
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (b && (b.cc != null || b.name != null)) { anyLeft = true; break; }
    }
    if (!anyLeft) _explicitClear = true;
    pushState();
    _explicitClear = false;
}

// -- Focus -> re-resolve every slot's target by path ------------------
function onSelectedTrack(args) {
    if (!args || args[0] != "selected_track") return;
    resolveAll();
    renderCurrentPage();
}

function resolveAll() {
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || !b.path) continue;
        var api = new LiveAPI(null, b.path);
        b.target = (api && api.id && api.id > 0) ? api : null;
        b.anchorC = -1; b.engaged = false; b.lastIncoming = -1;
        b.cur = b.target ? normValue(b) : 0;
        b.anchorP = b.cur;
    }
}

function normValue(b) {
    if (!b.target) return 0;
    var v = parseFloat(b.target.get("value"));
    if (isNaN(v) || b.pmax === b.pmin) return 0;
    return Math.max(0, Math.min(1, (v - b.pmin) / (b.pmax - b.pmin)));
}

// -- Drive: Value-Scaling takeover, then map into [min%,max%] window --
function drive(idx, b, v) {
    var p;
    if (b.engaged) p = v;
    else if (b.anchorC < 0) { b.anchorC = v; b.lastIncoming = v; return; }
    else if (v >= b.anchorC) p = b.anchorP + ((b.anchorC < 1) ? (v - b.anchorC) / (1 - b.anchorC) : 1) * (1 - b.anchorP);
    else p = (b.anchorC > 0) ? b.anchorP * (v / b.anchorC) : 0;
    if (!b.engaged && Math.abs(p - v) < PICKUP_EPS) b.engaged = true;
    b.lastIncoming = v;
    b.cur = p;
    var lo = OUTMIN[idx] / 100, hi = OUTMAX[idx] / 100;
    var frac = lo + p * (hi - lo);
    frac = Math.max(0, Math.min(1, frac));
    b.target.set("value", b.pmin + frac * (b.pmax - b.pmin));
}

// -- Render -----------------------------------------------------------
function ccLabel(absSlot) {
    var b = SLOTS[absSlot];
    return (b && b.cc != null) ? ("CC " + b.cc) : "Map CC";
}
function paramLabel(absSlot) {
    var b = SLOTS[absSlot];
    if (!b || b.name == null) return "Map Param";
    return b.target ? b.name : (b.name + " ?");
}
function ccArm(absSlot)    { return (learnCCSlot === absSlot) ? 1 : 0; }
function paramArm(absSlot) { return (learnPSlot  === absSlot) ? 1 : 0; }

function slotMapped(absSlot) {
    var b = SLOTS[absSlot];
    return (b && b.name != null) ? 1 : 0;
}

function renderVisRow(visRow) {
    var absSlot = currentPage * PAGE_SIZE + visRow;
    outlet(0, visRow, ccLabel(absSlot), paramLabel(absSlot),
           OUTMIN[absSlot], OUTMAX[absSlot],
           slotMapped(absSlot), ccArm(absSlot), paramArm(absSlot));
}

function renderValueRow(visRow, absSlot) {
    var b = SLOTS[absSlot];
    outlet(1, visRow, (b && b.target) ? Math.round(b.cur * 100) : 0);
}

function renderAbsSlot(absSlot) {
    var visRow = slotToVisRow(absSlot);
    if (visRow < 0) return;
    renderVisRow(visRow);
    renderValueRow(visRow, absSlot);
}

function renderCurrentPage() {
    for (var r = 0; r < PAGE_SIZE; r++) {
        var absSlot = currentPage * PAGE_SIZE + r;
        renderVisRow(r);
        renderValueRow(r, absSlot);
    }
}

function renderPageSel() {
    for (var pg = 0; pg < NPAGES; pg++) {
        outlet(2, pg, (pg === currentPage) ? 1 : 0);
    }
}

function reapply(absSlot) {
    var b = SLOTS[absSlot];
    if (!b || !b.target) return;
    var lo = OUTMIN[absSlot] / 100, hi = OUTMAX[absSlot] / 100;
    var frac = lo + b.cur * (hi - lo);
    frac = Math.max(0, Math.min(1, frac));
    b.target.set("value", b.pmin + frac * (b.pmax - b.pmin));
    var visRow = slotToVisRow(absSlot);
    if (visRow >= 0) renderValueRow(visRow, absSlot);
}
