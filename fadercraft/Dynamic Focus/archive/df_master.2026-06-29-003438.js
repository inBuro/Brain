// df_master.js — DYNAMIC FOCUS "MASTER" engine (by-name mapping, 128 slots, 16 pages × 8 rows).
//
// ONE master device on a MIDI track that receives the controller. 128 slots across 16 pages;
// each row (8 visible at a time):
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
//         cmd = mapcc | mapparam | clear | min <v> | max <v>
//       OR page command (list): [page, N]  (N = 0-based page index, 0..15)
//       OR named message "page N" from a Max message box (calls function page(N))
//   2 — CC list from ctlin: [value, cc, channel]
//
// Outlets:
//   0 — full row:  [row, ccLabel, paramLabel, outMin, outMax, mapped(0/1), ccArm(0/1), paramArm(0/1)]
//   1 — value:     [row, valueInt(0–100)]                                    (on drive)
//   2 — page sel:  [page, active(0/1)]  — sent for all 6 pages after page change
//   Arm flags BLINK the button while learning (no text substitution — label stays put).
//
// Pagination:
//   NSLOTS = 128 (16 pages × 8 rows). currentPage selects which 8 slots map to visible rows 0..7.
//   Physical slot index = currentPage * PAGE_SIZE + row.
//   Compatibility: setvalueof from old 6-page (48-slot) or 1-page (8-slot) sets loads into
//   slots 0..47 (pages 1..6) — indices preserved, remaining pages empty.

autowatch = 1;
inlets  = 3;
outlets = 3;   // 0=full row, 1=value, 2=page sel

var PAGE_SIZE = 8;
var NPAGES    = 16;
var NSLOTS    = PAGE_SIZE * NPAGES;  // 128

var SP = "__SP__";

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

// ── Inlet 1: row/page command · Inlet 2: CC ──────────────────────────
function list() {
    if (inlet === 1) { handleCmd(arrayfromargs(arguments)); return; }

    var a = arrayfromargs(arguments);            // inlet 2: CC [value, cc, channel]
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

    // row command: [row (0..7 visual), cmd, ...]
    var visRow = first;
    if (visRow < 0 || visRow >= PAGE_SIZE) return;
    var absSlot = currentPage * PAGE_SIZE + visRow;

    if      (cmd === "mapcc")    armCC(absSlot);
    else if (cmd === "mapparam") armParam(absSlot);
    else if (cmd === "clear")    clearSlot(absSlot);
    else if (cmd === "min")    { OUTMIN[absSlot] = clampPct(a[2]); reapply(absSlot); }
    else if (cmd === "max")    { OUTMAX[absSlot] = clampPct(a[2]); reapply(absSlot); }
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

// Returns the visible row index (0..7) for an absolute slot, or -1 if not on current page
function slotToVisRow(absSlot) {
    var pg = Math.floor(absSlot / PAGE_SIZE);
    if (pg !== currentPage) return -1;
    return absSlot - currentPage * PAGE_SIZE;
}

// ── Arm / capture ────────────────────────────────────────────────────
function armCC(absSlot)    { learnCCSlot = absSlot; renderAbsSlot(absSlot); }
function armParam(absSlot) { learnPSlot  = absSlot; renderAbsSlot(absSlot); }

function captureCC(absSlot, cc, ch) {
    if (!SLOTS[absSlot]) SLOTS[absSlot] = newSlot();
    SLOTS[absSlot].cc = cc; SLOTS[absSlot].ch = ch;
    learnCCSlot = -1;
    resolveAll();
    renderAbsSlot(absSlot);
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

// Render one visible row (0..7) → outlet 0
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

// Render all 8 visible rows for current page
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

// ── Persistence (getvalueof / setvalueof bound to a pattr) ───────────
function getvalueof() {
    var plain = [];
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || (b.cc == null && b.name == null)) continue;
        plain.push({ i: i, cc: b.cc, ch: b.ch, name: b.name, pmin: b.pmin, pmax: b.pmax,
                     omin: OUTMIN[i], omax: OUTMAX[i] });
    }
    return JSON.stringify(plain).split(" ").join(SP);
}

function setvalueof(v) {
    var s = ("" + v).split(SP).join(" ");
    if (s.charAt(0) !== "[") return;
    var plain;
    try { plain = JSON.parse(s); } catch (e) { return; }
    initSlots();
    for (var k = 0; k < plain.length; k++) {
        var d = plain[k];
        // i values 0..7 from old 8-slot sets load naturally into page 1 (slots 0..7)
        if (d.i < 0 || d.i >= NSLOTS) continue;
        SLOTS[d.i] = { cc: d.cc, ch: d.ch, name: d.name, pmin: d.pmin, pmax: d.pmax,
                       target: null, cur: 0, anchorC: -1, anchorP: 0, engaged: false, lastIncoming: -1 };
        OUTMIN[d.i]  = (d.omin  == null) ? 0   : d.omin;
        OUTMAX[d.i]  = (d.omax  == null) ? 100 : d.omax;
    }
    // Defer the resolve so LiveAPI is ready. pattrstorage calls setvalueof BEFORE
    // live.thisdevice fires its bang, so direct resolveAll() here would fail silently
    // (LiveAPI paths not yet available). Schedule at 800 ms — enough for device graph
    // to finish init. bang() from live.thisdevice additionally calls resolveAll(),
    // so the worst case is a double-resolve which is harmless.
    var task = new Task(function() {
        resolveAll();
        renderCurrentPage();
        renderPageSel();
    }, this);
    task.schedule(800);
}
