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
// A slot drives once it has BOTH a CC and a parameter path, accessed directly by path.
// Works for device params, mixer volume/pan, sends, any Live parameter.
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
//
// Outlets:
//   0 -- full row:  [row, ccLabel, paramLabel, outMin, outMax, mapped(0/1), ccArm(0/1), paramArm(0/1)]
//   1 -- value:     [row, valueInt(0-100)]  row = 0..15           (on drive)
//   2 -- page sel:  [page, active(0/1)]  -- sent for all 32 pages after page change
//
// NOTE: Persistence is deferred. pushState() is a no-op stub.
// This version is the stabilization rollback (v4.x path-based capture, clean console).

autowatch = 0;
inlets  = 3;   // 0=init, 1=cmd, 2=CC
outlets = 3;   // 0=full row, 1=value, 2=page sel

var PAGE_SIZE = 16;
var NPAGES    = 32;
var NSLOTS    = PAGE_SIZE * NPAGES;  // 512

var currentPage = 0;

// SLOTS[r] = null OR { cc, ch, name, path, pmin, pmax, target, cur, anchorC, anchorP, engaged, lastIncoming }
var SLOTS = [], OUTMIN = [], OUTMAX = [];
function initSlots() {
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

function log(s) { post("[DF-Master] " + s + "\n"); }

// -- Init -------------------------------------------------------------
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

// -- Inlet 1: row/page command . Inlet 2: CC --------------------------
function list() {
    if (inlet === 1) { handleCmd(arrayfromargs(arguments)); return; }
    if (inlet === 2) { handleCC(arrayfromargs(arguments)); return; }
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
    else if (cmd === "min")    { OUTMIN[absSlot] = clampPct(a[2]); reapply(absSlot); }
    else if (cmd === "max")    { OUTMAX[absSlot] = clampPct(a[2]); reapply(absSlot); }
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
    log("armCC: absSlot=" + absSlot + " page=" + currentPage + " (prev=" + prev + ") -- waiting for CC");
    if (prev >= 0 && prev !== absSlot) renderAbsSlot(prev);
    renderAbsSlot(absSlot);
}

function armParam(absSlot) {
    var prev = learnPSlot;
    learnPSlot = absSlot;
    if (prev >= 0 && prev !== absSlot) renderAbsSlot(prev);
    renderAbsSlot(absSlot);
    // Immediate poll: capture parameter already selected in Live right now.
    // Observer only fires on CHANGE; if user clicked before pressing Map Param, poll catches it.
    pollSelectedParam();
}

// Read live_set view selected_parameter right now and capture it.
function pollSelectedParam() {
    if (learnPSlot < 0) return;
    var api = new LiveAPI(null, "live_set view");
    var sp = api.get("selected_parameter");
    // sp = ['id', <pid>] when a parameter is selected, or [] / ['id', 0] when none
    if (!sp || sp.length < 2 || sp[0] !== "id") return;
    var pid = parseInt(sp[1], 10);
    if (pid <= 0) return;
    captureParam(learnPSlot, pid);
}

// Shared capture logic. Stores name (display), path (stable address), pmin/pmax (scale).
// Accepts ANY Live API unquotedpath: device params, sends, mixer, etc.
// No encodePath filter -- that was the v5.1 regression that broke Send capture.
function captureParam(absSlot, pid) {
    var p = new LiveAPI(null, "id " + pid);
    var pname = p.get("name") + "";
    var pmin  = parseFloat(p.get("min"));
    var pmax  = parseFloat(p.get("max"));
    // unquotedpath examples:
    //   device param:   "live_set tracks 0 devices 0 parameters 2"
    //   send A:         "live_set tracks 0 mixer_device sends 0 value"
    //   mixer volume:   "live_set tracks 0 mixer_device volume"
    var ppath = p.unquotedpath;

    if (!ppath || ppath.length === 0) {
        log("captureParam: WARNING -- empty path for id " + pid + " name=" + pname + ". Aborted.");
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
    pushState();
}

// -- Focus -> re-resolve every slot's target by path ------------------
// Uses b.path directly (no name scan). O(slots). Covers all Live API paths.
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

// -- Drive: Value-Scaling takeover, then map into [min%, max%] window -
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

// -- Persistence stub -------------------------------------------------
// Persistence is deferred to a future task.
// pushState() is a no-op -- no pattr outlet, no data written.
function pushState() {
    // no-op: persistence not implemented yet
}
