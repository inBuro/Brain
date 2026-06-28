// df_master.js — DYNAMIC FOCUS "MASTER" engine (by-name mapping, 512 slots, 32 pages × 16 rows).
//
// ONE master device on a MIDI track that receives the controller. 512 slots across 32 pages;
// each page shows 16 rows: rows 0..7 = left column (vis indices 0..7),
//                          rows 8..15 = right column (vis indices 8..15).
//
// Slot indexing:
//   absSlot = currentPage * PAGE_SIZE + visRow
//   visRow 0..7  → left column  (displayed on bcc0..7  / bmb0..7)
//   visRow 8..15 → right column (displayed on obj-3/obj-4 pairs for rows 8..15)
//
// Each row:
//   • "Map CC"  button  → arm, then twist an encoder        → captures the CC (MIDI)
//   • "Map Parameter" button → arm, then click a parameter  → captures its NAME + range
//   • Min / Max numboxes → the % of the param's range the encoder sweeps between
// A slot drives once it has BOTH a CC and a parameter name, re-resolved BY NAME on every
// track focus switch (silent on tracks lacking that name). Self-contained MIDI Effect.
//
// Button labels update via the patch's `text $1, texton $1` mechanism (NOT setsymbol).
//
// Inlets:
//   0 — bang from live.thisdevice (init)
//   1 — row command (list): [row, cmd, ...]
//         row = 0..15 (visual row on current page; 0..7 left col, 8..15 right col)
//         cmd = mapcc | mapparam | clear | min <v> | max <v>
//       OR page command (list): [page, N]  (N = 0-based page index, 0..31)
//       OR named message "page N" from a Max message box (calls function page(N))
//   2 — CC list from ctlin: [value, cc, channel]
//   3 — restore list from pattr (flat atom list, written by pushState outlet 3)
//
// Outlets:
//   0 — full row:  [row, ccLabel, paramLabel, outMin, outMax, mapped(0/1), ccArm(0/1), paramArm(0/1)]
//                  row = 0..15 (visual index; patch routes 0..7 → left col, 8..15 → right col)
//   1 — value:     [row, valueInt(0–100)]  row = 0..15           (on drive)
//   2 — page sel:  [page, active(0/1)]  — sent for all 32 pages after page change
//   3 — persist:   flat atom list [i cc ch omin omax pmin pmax name_sym ...]
//                  pushed to pattr df_data on every state change.
//                  8 atoms per non-empty slot. 'empty' sentinel when no slots mapped.
//                  name_sym: spaces encoded as __SP__ so name fits in one Max symbol atom.
//
// Persistence architecture (push-pull via pattr):
//   PUSH path (save): outlet(3) → pattr df_data stores the flat list.
//     pattrstorage df_store (@greedy 1 @savemode 2) reads pattr on .als save.
//   PULL path (restore): pattrstorage restores → pattr df_data → pattr outlet 0 →
//     js inlet 3 → list() on inlet 3 → restoreSlots() → Task.schedule(800) resolveAll.
//   This push-pull model (js pushes to pattr, pattr pulls back on restore) is robust
//   because pattr always holds current data — pattrstorage reads it passively.
//   No @bindto or getvalueof/setvalueof needed.
//
// Backward compatibility:
//   setvalueof from old 128-slot (16-page×8) or 48-slot sets loads into slots 0..127;
//   indices preserved, remaining pages empty.

autowatch = 1;
inlets  = 4;   // 0=init, 1=cmd, 2=CC, 3=restore-from-pattr
outlets = 4;   // 0=full row, 1=value, 2=page sel, 3=persist-push-to-pattr

var PAGE_SIZE = 16;   // 16 visible rows per page (8 left + 8 right)
var NPAGES    = 32;
var NSLOTS    = PAGE_SIZE * NPAGES;  // 512

var SP = "__SP__";  // space replacement for Max atom encoding

var currentPage = 0;   // 0-based

// SLOTS[r] = null OR { cc, ch, name, pmin, pmax, target, cur, anchorC, anchorP, engaged, lastIncoming }
// OUTMIN/OUTMAX[r] = the encoder's output window, in % of the param range (default 0..100)
var SLOTS = [], OUTMIN = [], OUTMAX = [];
function initSlots() {
    SLOTS = []; OUTMIN = []; OUTMAX = [];
    for (var i = 0; i < NSLOTS; i++) {
        SLOTS.push(null); OUTMIN.push(0); OUTMAX.push(100);
    }
}
initSlots();

var learnCCSlot = -1;      // absolute slot index waiting for an encoder twist
var learnPSlot  = -1;      // absolute slot index waiting for a parameter click

var selTrackObs = null, selParamObs = null;
var PICKUP_EPS  = 0.02;

function log(s) { post("[DF-Master] " + s + "\n"); }

// ── Init ─────────────────────────────────────────────────────────────
function bang() {
    if (inlet !== 0) return;
    setupFocus();
    renderCurrentPage();
    renderPageSel();
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

// ── Inlet 1: row/page command · Inlet 2: CC · Inlet 3: restore ───────
function list() {
    if (inlet === 1) { handleCmd(arrayfromargs(arguments)); return; }
    if (inlet === 2) { handleCC(arrayfromargs(arguments)); return; }
    if (inlet === 3) { restoreSlots(arrayfromargs(arguments)); return; }
}

function handleCC(a) {
    if (a.length < 3) return;
    var val = a[0], cc = a[1], ch = a[2];

    if (learnCCSlot >= 0) { captureCC(learnCCSlot, cc, ch); }

    var v = val / 127.0;
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || b.cc == null || b.cc !== cc || b.ch !== ch) continue;
        if (!b.target) continue;
        drive(i, b, v);
        // render value only if this slot is on the current page
        var visRow = slotToVisRow(i);
        if (visRow >= 0) renderValueRow(visRow, i);
    }
}

// Named message handler: Max message box "page $1" sends a named message "page" + int,
// which calls this function directly (NOT list()). list() only fires for list atoms.
function page(n) {
    var pg = parseInt(n, 10);
    if (isNaN(pg) || pg < 0 || pg >= NPAGES) return;
    setPage(pg);
}

function handleCmd(a) {
    if (a.length < 2) return;
    var first = a[0];
    var cmd   = a[1];

    // page command: [page, N] — also handled via named message function page() above
    if (first === "page") {
        var pg = parseInt(cmd, 10);
        if (isNaN(pg) || pg < 0 || pg >= NPAGES) return;
        setPage(pg);
        return;
    }

    // row command: [row (0..15 visual), cmd, ...]
    var visRow = first;
    if (visRow < 0 || visRow >= PAGE_SIZE) return;
    var absSlot = currentPage * PAGE_SIZE + visRow;

    if      (cmd === "mapcc")    armCC(absSlot);
    else if (cmd === "mapparam") armParam(absSlot);
    else if (cmd === "clear")    clearSlot(absSlot);
    else if (cmd === "min")    { OUTMIN[absSlot] = clampPct(a[2]); reapply(absSlot); pushState(); }
    else if (cmd === "max")    { OUTMAX[absSlot] = clampPct(a[2]); reapply(absSlot); pushState(); }
}

function clampPct(x) { x = parseFloat(x); if (isNaN(x)) return 0; return Math.max(0, Math.min(100, x)); }

// ── Page switching ────────────────────────────────────────────────────
function setPage(pg) {
    // cancel any learn in progress on a different page
    if (learnCCSlot >= 0 && Math.floor(learnCCSlot / PAGE_SIZE) !== pg) learnCCSlot = -1;
    if (learnPSlot  >= 0 && Math.floor(learnPSlot  / PAGE_SIZE) !== pg) learnPSlot  = -1;
    currentPage = pg;
    renderCurrentPage();
    renderPageSel();
}

// Returns the visible row index (0..15) for an absolute slot, or -1 if not on current page
function slotToVisRow(absSlot) {
    var pg = Math.floor(absSlot / PAGE_SIZE);
    if (pg !== currentPage) return -1;
    return absSlot - currentPage * PAGE_SIZE;
}

// ── Arm / capture ────────────────────────────────────────────────────
// Exclusive arm: only one CC-arm and one Param-arm at a time.
// When arming a new slot, re-render the previously armed slot first
// (with ccArm=0 / paramArm=0) so the blink stops on the old row.
function armCC(absSlot) {
    var prev = learnCCSlot;
    learnCCSlot = absSlot;
    if (prev >= 0 && prev !== absSlot) renderAbsSlot(prev);
    renderAbsSlot(absSlot);
}
function armParam(absSlot) {
    var prev = learnPSlot;
    learnPSlot = absSlot;
    if (prev >= 0 && prev !== absSlot) renderAbsSlot(prev);
    renderAbsSlot(absSlot);
}

function captureCC(absSlot, cc, ch) {
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
    var p = new LiveAPI(null, "id " + pid);
    var absSlot = learnPSlot;
    if (!SLOTS[absSlot]) SLOTS[absSlot] = newSlot();
    SLOTS[absSlot].name = p.get("name") + "";
    SLOTS[absSlot].pmin = parseFloat(p.get("min"));
    SLOTS[absSlot].pmax = parseFloat(p.get("max"));
    learnPSlot = -1;
    resolveAll();
    renderAbsSlot(absSlot);
    pushState();
}

function newSlot() {
    return { cc: null, ch: null, name: null, pmin: 0, pmax: 1,
             target: null, cur: 0, anchorC: -1, anchorP: 0, engaged: false, lastIncoming: -1 };
}

function clearSlot(absSlot) {
    SLOTS[absSlot] = null;
    if (learnCCSlot === absSlot) learnCCSlot = -1;
    if (learnPSlot  === absSlot) learnPSlot  = -1;
    renderAbsSlot(absSlot);
    pushState();
}

// ── Focus → re-resolve every named slot's target ─────────────────────
function onSelectedTrack(args) {
    if (!args || args[0] != "selected_track") return;
    resolveAll();
    renderCurrentPage();
}

function resolveAll() {
    var t = new LiveAPI(null, "live_set view selected_track");
    var devs = t.get("devices");
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || b.name == null) continue;
        b.target = findParamByName(devs, b.name);
        b.anchorC = -1; b.engaged = false; b.lastIncoming = -1;
        b.cur = b.target ? normValue(b) : 0;
        b.anchorP = b.cur;
    }
}

function findParamByName(devs, name) {
    for (var i = 0; i < devs.length; i++) {
        if (devs[i] != "id") continue;
        var d = new LiveAPI(null, "id " + devs[i + 1]);
        var ps = d.get("parameters");
        for (var j = 0; j < ps.length; j++) {
            if (ps[j] != "id") continue;
            var p = new LiveAPI(null, "id " + ps[j + 1]);
            if ((p.get("name") + "") == name) return p;
        }
    }
    return null;
}

function normValue(b) {
    if (!b.target) return 0;
    var v = parseFloat(b.target.get("value"));
    if (isNaN(v) || b.pmax === b.pmin) return 0;
    return Math.max(0, Math.min(1, (v - b.pmin) / (b.pmax - b.pmin)));
}

// ── Drive: Value-Scaling takeover, then map into the [min%,max%] window ─
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

// ── Render ───────────────────────────────────────────────────────────
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

// Render one visible row (0..15) → outlet 0
// visRow 0..7 = left column rows 0..7
// visRow 8..15 = right column rows 8..15
function renderVisRow(visRow) {
    var absSlot = currentPage * PAGE_SIZE + visRow;
    outlet(0, visRow, ccLabel(absSlot), paramLabel(absSlot),
           OUTMIN[absSlot], OUTMAX[absSlot],
           slotMapped(absSlot), ccArm(absSlot), paramArm(absSlot));
}

// Render value for one visible row → outlet 1
function renderValueRow(visRow, absSlot) {
    var b = SLOTS[absSlot];
    outlet(1, visRow, (b && b.target) ? Math.round(b.cur * 100) : 0);
}

// Render an absolute slot if it's on current page
function renderAbsSlot(absSlot) {
    var visRow = slotToVisRow(absSlot);
    if (visRow < 0) return;
    renderVisRow(visRow);
    renderValueRow(visRow, absSlot);
}

// Render all 16 visible rows for current page (both columns)
function renderCurrentPage() {
    for (var r = 0; r < PAGE_SIZE; r++) {
        var absSlot = currentPage * PAGE_SIZE + r;
        renderVisRow(r);
        renderValueRow(r, absSlot);
    }
}

// Send page button states → outlet 2: [page_idx, active(0/1)] for each page
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

// ── Persistence: push-pull flat atom list via pattr df_data ──────────
//
// FORMAT (8 atoms per non-empty slot):
//   [i, cc, ch, omin, omax, pmin, pmax, name_sym]
//   i        = absolute slot index (int, 0..511)
//   cc       = CC number (int, 0..127) or -1 if not set
//   ch       = MIDI channel (int, 1..16) or 0 if not set
//   omin     = OUTMIN[i] (int, 0..100)
//   omax     = OUTMAX[i] (int, 0..100)
//   pmin     = parameter min value (float)
//   pmax     = parameter max value (float)
//   name_sym = parameter name symbol (spaces encoded as __SP__) or 'null' if no param
//
// Sentinel: ['empty'] when no slots are mapped (ensures pattr stores something non-nil)
//
// WHY FLAT ATOMS (not JSON string):
//   pattr stores Max atoms natively — flat list of ints, floats, symbols.
//   No encoding issues, no length limits that matter, no special character problems.
//   JSON string as a single Max symbol is fragile: may be truncated, Max may
//   split it, or pattr may reject a very long symbol in some contexts.
//
// PUSH: called after every state change → outlet(3, atoms...)
//   pattr df_data receives via its inlet, stores current value
//   pattrstorage df_store (@greedy 1 @savemode 2) reads pattr on .als save
//
// PULL: on .als load:
//   pattrstorage restores stored atoms → pattr df_data outlet → js inlet 3
//   list() on inlet 3 → restoreSlots() → Task.schedule(800) for resolveAll
//
function pushState() {
    var atoms = [];
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || (b.cc == null && b.name == null)) continue;
        atoms.push(i);
        atoms.push(b.cc != null ? b.cc : -1);
        atoms.push(b.ch != null ? b.ch : 0);
        atoms.push(Math.round(OUTMIN[i]));
        atoms.push(Math.round(OUTMAX[i]));
        atoms.push(isNaN(b.pmin) ? 0.0 : b.pmin);
        atoms.push(isNaN(b.pmax) ? 1.0 : b.pmax);
        atoms.push(b.name != null ? b.name.split(" ").join(SP) : "null");
    }
    if (atoms.length === 0) {
        outlet(3, "empty");
    } else {
        outlet.apply(this, [3].concat(atoms));
    }
}

function restoreSlots(a) {
    // Handles list from pattr outlet → js inlet 3
    // a = array of atoms from arrayfromargs(arguments)
    if (a.length === 1 && ("" + a[0]) === "empty") {
        // empty state sentinel — nothing to restore
        return;
    }
    // Old JSON format check: starts with '[' → old format, ignore gracefully
    if (a.length === 1 && ("" + a[0]).charAt(0) === "[") {
        log("restoreSlots: old JSON format detected, ignoring (old data will be lost)");
        return;
    }
    // Validate: must be divisible by 8
    var n = a.length;
    if (n % 8 !== 0) {
        log("restoreSlots: atom count " + n + " not divisible by 8, truncating");
        n = n - (n % 8);
    }
    if (n === 0) return;

    initSlots();
    for (var k = 0; k < n; k += 8) {
        var i     = parseInt(a[k], 10);
        var cc_v  = parseInt(a[k+1], 10);
        var ch_v  = parseInt(a[k+2], 10);
        var omin  = parseInt(a[k+3], 10);
        var omax  = parseInt(a[k+4], 10);
        var pmin  = parseFloat(a[k+5]);
        var pmax  = parseFloat(a[k+6]);
        var nsym  = "" + a[k+7];

        if (isNaN(i) || i < 0 || i >= NSLOTS) continue;

        SLOTS[i] = newSlot();
        SLOTS[i].cc   = (cc_v >= 0) ? cc_v : null;
        SLOTS[i].ch   = (ch_v > 0)  ? ch_v : null;
        SLOTS[i].name = (nsym === "null") ? null : nsym.split(SP).join(" ");
        SLOTS[i].pmin = isNaN(pmin) ? 0.0 : pmin;
        SLOTS[i].pmax = isNaN(pmax) ? 1.0 : pmax;
        OUTMIN[i] = isNaN(omin) ? 0   : Math.max(0, Math.min(100, omin));
        OUTMAX[i] = isNaN(omax) ? 100 : Math.max(0, Math.min(100, omax));
    }
    log("restoreSlots: loaded " + (n/8) + " slots, scheduling resolveAll in 800ms");

    // Defer resolveAll — pattrstorage calls us BEFORE live.thisdevice bang,
    // LiveAPI paths not yet available. 800ms is enough for device graph init.
    // bang() from live.thisdevice additionally calls resolveAll (double-resolve harmless).
    var task = new Task(function() {
        resolveAll();
        renderCurrentPage();
        renderPageSel();
    }, this);
    task.schedule(800);
}
