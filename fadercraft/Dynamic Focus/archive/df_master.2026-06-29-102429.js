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
//   0 -- bang from live.thisdevice (init)
//   1 -- row command (list): [row, cmd, ...]
//         row = 0..15 (visual row on current page; 0..7 left col, 8..15 right col)
//         cmd = mapcc | mapparam | clear | min <v> | max <v>
//       OR page command (list): [page, N]  (N = 0-based page index, 0..31)
//       OR named message "page N" from a Max message box (calls function page(N))
//   2 -- CC list from ctlin: [value, cc, channel]
//   3 -- restore: JSON string from pattr df_data on .als load
//
// Outlets:
//   0 -- full row:  [row, ccLabel, paramLabel, outMin, outMax, mapped(0/1), ccArm(0/1), paramArm(0/1)]
//   1 -- value:     [row, valueInt(0-100)]  row = 0..15           (on drive)
//   2 -- page sel:  [page, active(0/1)]  -- sent for all 32 pages after page change
//   3 -- persist:   single JSON symbol -> pattr df_data (parameter_enable=1 -> Live saves per-instance)
//
// Persistence (v4.2, JSON-in-pattr, no pattrstorage):
//   PUSH: pushState() -> JSON.stringify(state) -> outlet(3, jsonStr) -> pattr df_data (direct wire).
//         Live saves pattr value per-instance in .als (pattr parameter_enable=1 in patching).
//         pushState() ONLY fires when SLOTS has real data OR on explicit user unmap (_explicitClear).
//         Never fires with empty SLOTS from incidental calls (numbox init, render, etc).
//   PULL: on .als load pattr df_data auto-restores saved value -> outlet 0 -> js inlet 3 -> restoreSlots.
//         restoreSlots: JSON.parse -> populate SLOTS -> Task(800ms) -> resolveAll.
//   pattrstorage: REMOVED. Plain pattr with parameter_enable=1 is the M4L per-instance mechanism.
//
// Path stability note:
//   slot.path = Live API canonical path, e.g. "live_set tracks 0 devices 0 parameters 2".
//   Stable across .als save/reload as long as track/device ORDER does not change.

autowatch = 0;
inlets  = 4;   // 0=init, 1=cmd, 2=CC, 3=restore-from-pattr
outlets = 4;   // 0=full row, 1=value, 2=page sel, 3=persist-push-to-pattr

var PAGE_SIZE = 16;
var NPAGES    = 32;
var NSLOTS    = PAGE_SIZE * NPAGES;  // 512

var currentPage = 0;

// SLOTS[i] = null OR { cc, ch, name, path, pmin, pmax, target, cur, anchorC, anchorP, engaged, lastIncoming }
var SLOTS = [], OUTMIN = [], OUTMAX = [];
function initSlots() {
    // Called once at script load and once at start of restoreSlots (before repopulating).
    // Should appear at most TWICE per session in Max Console.
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

// Prevent pattr feedback loop during pushState.
// pushState -> outlet(3) -> pattr -> pattr echoes value back to js inlet 3 -> restoreSlots.
// _pushing=true makes restoreSlots return early without wiping SLOTS.
var _pushing = false;

// Block pushState during device init / restore phase.
// On .als load, Live restores live.numbox objects (parameter_initial_enable=1) which fire
// handleCmd min/max -> pushState BEFORE pattr restore arrives at js.
// Without this guard those empty-SLOTS calls would overwrite pattr with sentinel.
// Cleared at end of restoreSlots Task (800ms) or by bang() Task (100ms) if no restore data.
var _loading = true;

// Anti-clobber: pushState() skips writing to pattr unless SLOTS has real data OR this is true.
// Set true only in clearSlot() when user explicitly unmaps the last slot.
// All incidental empty-SLOTS calls (numbox init, page switch, render feedback) are no-ops.
var _explicitClear = false;

function log(s) { post("[DF-Master] " + s + "\n"); }

// -- Init -------------------------------------------------------------
function bang() {
    if (inlet !== 0) return;
    setupFocus();
    renderCurrentPage();
    renderPageSel();
    // If pattr has saved data it arrives at inlet 3 synchronously during device load
    // (pattr restores before bang in M4L). We give 100ms then clear _loading if
    // restoreSlots never fired (= new empty set / first run).
    var t = new Task(function() {
        if (_loading) {
            log("bang: no restoreSlots fired -- clearing _loading (empty set)");
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
    if (inlet === 3) { restoreSlots(arrayfromargs(arguments)); return; }
}

// pattr delivers a single int (sentinel -1) via msg_int, not list().
function msg_int(v) {
    if (inlet === 3) { restoreSlots([v]); }
}

// pattr delivers a JSON symbol via anything() handler (symbol with no spaces is routed here).
function anything() {
    if (inlet === 3) {
        var a = arrayfromargs(messagename, arguments);
        restoreSlots(a);
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
        // Only push if slot has data (numbox drag on empty row must not push)
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
    // Observer only fires on CHANGE; poll covers the case where user clicked before pressing Map Param.
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

// -- Persistence: JSON-in-pattr (v4.2) --------------------------------
//
// State object (JSON-stringified, stored as single symbol in pattr df_data):
//   { "slots": [ { "i": <int>, "cc": <int|null>, "ch": <int|null>,
//                  "omin": <int>, "omax": <int>,
//                  "pmin": <float>, "pmax": <float>,
//                  "name": <str|null>, "path": <str|null> }, ... ] }
//
// Only non-empty slots are included.
// JSON is encoded via encodeURIComponent -> no spaces -> single Max symbol atom.
// pattr df_data (parameter_enable=1, parametertype=3/blob) saves per-instance in .als.
//
// ANTI-CLOBBER RULE:
//   pushState() skips writing to pattr if SLOTS has no real data AND _explicitClear=false.
//   Incidental calls with empty SLOTS (numbox init, etc.) are silent no-ops.
//
function pushState() {
    if (_loading) { return; }

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

    if (slots.length === 0) {
        if (!_explicitClear) {
            log("pushState: SLOTS empty + not explicit clear -- skipped (pattr unchanged)");
            return;
        }
        log("pushState: explicit clear -> sentinel -1 to pattr");
        _pushing = true;
        outlet(3, -1);
        _pushing = false;
    } else {
        var json = JSON.stringify({slots: slots});
        // encodeURIComponent removes ALL spaces and special chars from the JSON string.
        // Live API paths contain spaces ("live_set tracks 0 mixer_device sends 0 value").
        // Max tokenises outlet symbols by whitespace -> spaces inside JSON split it into
        // multiple atoms -> pattr receives "bad number" / Bad parameter value error.
        // encodeURIComponent: spaces -> %20, all non-safe chars encoded -> guaranteed 1 atom.
        // Decode with decodeURIComponent in restoreSlots before JSON.parse.
        var encoded = encodeURIComponent(json);
        log("pushState: " + slots.length + " slot(s) -> pattr (" + encoded.length + " chars)");
        _pushing = true;
        outlet(3, encoded);
        _pushing = false;
    }
}

function restoreSlots(a) {
    if (_pushing) { return; }

    log("restoreSlots: received " + a.length + " atom(s), first=" + (""+a[0]).substring(0,40));

    if (a.length === 0) { _loading = false; return; }

    // Sentinel: int -1 (explicit clear)
    if (a.length === 1 && (a[0] === -1 || (""+a[0]) === "-1" || (""+a[0]) === "empty")) {
        log("restoreSlots: sentinel -- nothing to restore, clearing _loading");
        _loading = false;
        return;
    }

    // Expect single encoded symbol (starts with '%7B' = encoded '{')
    var encoded = "" + a[0];
    var raw;
    try {
        raw = decodeURIComponent(encoded);
    } catch(e) {
        log("restoreSlots: decodeURIComponent failed: " + e + " -- ignoring, clearing _loading");
        _loading = false;
        return;
    }

    if (!raw || raw.charAt(0) !== "{") {
        log("restoreSlots: unexpected format after decode (first='" + raw.charAt(0) + "') -- ignoring");
        _loading = false;
        return;
    }

    var state;
    try {
        state = JSON.parse(raw);
    } catch(e) {
        log("restoreSlots: JSON.parse failed: " + e + " -- clearing _loading");
        _loading = false;
        return;
    }

    if (!state || !state.slots || !state.slots.length) {
        log("restoreSlots: parsed OK but no slots -- clearing _loading");
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
    log("restoreSlots: populated " + n + " slot(s), resolveAll in 800ms");

    // Defer resolveAll: pattr restores before live.thisdevice bang, LiveAPI paths may not
    // be ready. 800ms gives Live time to finish device init.
    // _loading cleared AFTER resolveAll so late numbox inits cannot corrupt pattr.
    var task = new Task(function() {
        resolveAll();
        renderCurrentPage();
        renderPageSel();
        log("restoreSlots Task: resolveAll done, _loading cleared");
        _loading = false;
    }, this);
    task.schedule(800);
}
