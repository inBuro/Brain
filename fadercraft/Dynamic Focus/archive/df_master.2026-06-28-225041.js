// df_master.js — DYNAMIC FOCUS "MASTER" engine (by-name mapping, 8 slots, DF-Slot-style rows).
//
// ONE master device on a MIDI track that receives the controller. 8 slots; each row:
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
//   2 — CC list from ctlin: [value, cc, channel]
//
// Outlets:
//   0 — full row:  [row, ccLabel, paramLabel, outMin, outMax, mapped(0/1), ccArm(0/1), paramArm(0/1)]
//   1 — value:     [row, valueInt(0–100)]                                    (on drive)
//   Arm flags BLINK the button while learning (no text substitution — label stays put).

autowatch = 1;
inlets  = 3;
outlets = 2;

var NSLOTS = 8;
var SP = "__SP__";

// SLOTS[r] = null OR { cc, ch, name, pmin, pmax, target, cur, anchorC, anchorP, engaged, lastIncoming }
// OUTMIN/OUTMAX[r] = the encoder's output window, in % of the param range (default 0..100)
var SLOTS = [], OUTMIN = [], OUTMAX = [];
function initSlots() {
    SLOTS = []; OUTMIN = []; OUTMAX = [];
    for (var i = 0; i < NSLOTS; i++) { SLOTS.push(null); OUTMIN.push(0); OUTMAX.push(100); }
}
initSlots();

var learnCCSlot = -1;      // slot waiting for an encoder twist
var learnPSlot  = -1;      // slot waiting for a parameter click

var selTrackObs = null, selParamObs = null;
var PICKUP_EPS  = 0.02;

function log(s) { post("[DF-Master] " + s + "\n"); }

// ── Init ─────────────────────────────────────────────────────────────
function bang() {
    setupFocus();
    renderAll();
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

// ── Inlet 1: row command · Inlet 2: CC ───────────────────────────────
function list() {
    if (inlet === 1) { rowCommand(arrayfromargs(arguments)); return; }

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
        renderValue(i);
    }
}

function rowCommand(a) {
    if (a.length < 2) return;
    var r = a[0], cmd = a[1];
    if (r < 0 || r >= NSLOTS) return;
    if      (cmd == "mapcc")    armCC(r);
    else if (cmd == "mapparam") armParam(r);
    else if (cmd == "clear")    clearSlot(r);
    else if (cmd == "min")    { OUTMIN[r] = clampPct(a[2]); reapply(r); }
    else if (cmd == "max")    { OUTMAX[r] = clampPct(a[2]); reapply(r); }
}
function clampPct(x) { x = parseFloat(x); if (isNaN(x)) return 0; return Math.max(0, Math.min(100, x)); }

// ── Arm / capture ────────────────────────────────────────────────────
function armCC(r)    { learnCCSlot = r; renderRow(r); }
function armParam(r) { learnPSlot  = r; renderRow(r); }

function captureCC(r, cc, ch) {
    if (!SLOTS[r]) SLOTS[r] = newSlot();
    SLOTS[r].cc = cc; SLOTS[r].ch = ch;
    learnCCSlot = -1;
    resolveAll();
    renderRow(r);
}

function onSelectedParam(args) {
    if (learnPSlot < 0) return;
    if (!args || args.length < 3 || args[0] != "selected_parameter") return;
    var pid = parseInt(args[2], 10);
    if (pid <= 0) return;
    var p = new LiveAPI(null, "id " + pid);
    var r = learnPSlot;
    if (!SLOTS[r]) SLOTS[r] = newSlot();
    SLOTS[r].name = p.get("name") + "";          // force String
    SLOTS[r].pmin = parseFloat(p.get("min"));
    SLOTS[r].pmax = parseFloat(p.get("max"));
    learnPSlot = -1;
    resolveAll();
    renderRow(r);
}

function newSlot() {
    return { cc: null, ch: null, name: null, pmin: 0, pmax: 1,
             target: null, cur: 0, anchorC: -1, anchorP: 0, engaged: false, lastIncoming: -1 };
}

function clearSlot(r) {
    SLOTS[r] = null;
    if (learnCCSlot === r) learnCCSlot = -1;
    if (learnPSlot  === r) learnPSlot  = -1;
    renderRow(r);
}

// ── Focus → re-resolve every named slot's target ─────────────────────
function onSelectedTrack(args) {
    if (!args || args[0] != "selected_track") return;
    resolveAll();
    renderAll();
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
    var lo = OUTMIN[idx] / 100, hi = OUTMAX[idx] / 100;     // output window in fraction
    var frac = lo + p * (hi - lo);
    b.target.set("value", b.pmin + frac * (b.pmax - b.pmin));
}

// ── Render ───────────────────────────────────────────────────────────
function ccLabel(r) {                        // label stays put while learning — arming just BLINKS
    var b = SLOTS[r];
    return (b && b.cc != null) ? ("CC " + b.cc) : "Map CC";
}
function paramLabel(r) {                     // kept ≤12 chars so the button never ellipsises
    var b = SLOTS[r];
    if (!b || b.name == null) return "Map Param";
    return b.target ? b.name : (b.name + " ?");
}
function ccArm(r)    { return (learnCCSlot === r) ? 1 : 0; }   // blink CC button while waiting for a twist
function paramArm(r) { return (learnPSlot  === r) ? 1 : 0; }   // blink Param button while waiting for a click

function slotMapped(r) {           // 1 once a PARAMETER name is captured (drives × visibility)
    var b = SLOTS[r];
    return (b && b.name != null) ? 1 : 0;
}
function renderRow(r) {            // labels + min/max + mapped flag (× shows only when mapped) + arm-blink
    outlet(0, r, ccLabel(r), paramLabel(r), OUTMIN[r], OUTMAX[r], slotMapped(r), ccArm(r), paramArm(r));
}
function reapply(r) {              // live: push the current position through the new window onto the param
    var b = SLOTS[r];
    if (!b || !b.target) return;
    var lo = OUTMIN[r] / 100, hi = OUTMAX[r] / 100;
    var frac = lo + b.cur * (hi - lo);
    b.target.set("value", b.pmin + frac * (b.pmax - b.pmin));
    renderValue(r);
}
function renderValue(r) {         // value bar only
    var b = SLOTS[r];
    outlet(1, r, (b && b.target) ? Math.round(b.cur * 100) : 0);
}
function renderAll() {
    for (var r = 0; r < NSLOTS; r++) { renderRow(r); renderValue(r); }
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
        if (d.i < 0 || d.i >= NSLOTS) continue;
        SLOTS[d.i] = { cc: d.cc, ch: d.ch, name: d.name, pmin: d.pmin, pmax: d.pmax,
                       target: null, cur: 0, anchorC: -1, anchorP: 0, engaged: false, lastIncoming: -1 };
        OUTMIN[d.i] = (d.omin == null) ? 0 : d.omin;
        OUTMAX[d.i] = (d.omax == null) ? 100 : d.omax;
    }
    resolveAll();
    renderAll();
}
