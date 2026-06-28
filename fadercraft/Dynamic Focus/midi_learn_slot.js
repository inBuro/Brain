// midi_learn_slot.js — MIDI Learn controller for one slot, GATED by Track Focus,
// with PICKUP (takeover) so switching tracks never jumps the value.
//
// Each instance routes MIDI to its parameter ONLY while its own host track is the
// selected track. Many instances share the same controller CC; only the instance on
// the selected track acts, so each track keeps its own independent value.
//
// Pickup: when a slot (re)gains focus, the parameter HOLDS its current value until
// the incoming controller value reaches/crosses it — then it takes over 1:1. No
// fabricated values; we just watch the real current value (fed back from live.dial)
// and wait for the controller to catch it.
//
// Inlets:
//   0 — bang from live.thisdevice (init)
//   1 — bang/int from live.button (Learn)
//   2 — CC input list: value, cc, channel
//   3 — restore learnedCC from pattr (int)
//   4 — restore learnedChannel from pattr (int)
//   5 — current parameter value (0.–1.) fed back from live.dial  ← pickup reference
//   6 — bang from live.button (Map) → enter map mode, capture next clicked parameter
//
// Outlets:
//   0 — normalized value (0.–1.) to live.dial
//   1 — learnedCC to pattr
//   2 — learnedChannel to pattr
//   3 — status string to label (e.g. "Learn MIDI" / "CC 13")
//   4 — arming flag (1 = waiting for a CC)   → blinks the Learn/CC button
//   5 — mapMode flag (1 = waiting for a param) → blinks the Map button
//
// MAP: click Map, then click any Live parameter; the slot's value drives that
// parameter (scaled to its range), LFO-style, via live_set view selected_parameter.

inlets = 7;
outlets = 6;
autowatch = 1;

var arming = false;
var learnedCC = -1;
var learnedChannel = -1;

// ── Track Focus state ────────────────────────────────────────────────
var hostTrack = null;
var selObserver = null;
var hostId = -1;
var active = 0;

// ── Pickup state ─────────────────────────────────────────────────────
var currentVal = 0.0;       // the real parameter value (fed back from live.dial)
var engaged = false;        // has the controller "caught" the value this focus?
var lastIncoming = -1;      // previous normalized CC value (for crossing detection)
var PICKUP_EPS = 0.02;      // close-enough tolerance to grab

// ── Map (target parameter) state ─────────────────────────────────────
var mapMode = false;
var paramObserver = null;
var targetParam = null;
var targetMin = 0.0, targetMax = 1.0;

function log(msg) {
    post("[ML-Slot] " + msg + "\n");   // console only — no longer drives the on-device label
}

// CC button caption: unmapped → CTA "Map CC", mapped → "CC <n>"
function updateLabel() {
    outlet(3, (learnedCC < 0) ? "Map CC" : ("CC " + learnedCC));
}

// ── Inlet 0: init · Inlet 1: Learn ───────────────────────────────────
function bang() {
    if (inlet === 1) { arm(1); return; }
    if (inlet === 6) { startMap(); return; }
    setupFocus();
    log("init: slot ready, learnedCC=" + learnedCC + " ch=" + learnedChannel);
    updateLabel();
}

// ── Track Focus ──────────────────────────────────────────────────────
function setupFocus() {
    var dev = new LiveAPI(null, "this_device");
    var parent = dev.get("canonical_parent");
    if (!parent || parent.length < 2) { log("ERROR: cannot resolve host track"); return; }
    hostTrack = new LiveAPI(null, "id " + parent[1]);
    hostId = parseInt(hostTrack.id, 10);
    post("[ML-Slot] setupFocus: hostId=" + hostId + " (track " + hostTrack.get("name") + ")\n");

    if (selObserver) selObserver.property = "";
    selObserver = new LiveAPI(onSelectedTrack, "live_set view");
    selObserver.property = "selected_track";

    // Watch the clicked parameter (used only while in map mode).
    if (paramObserver) paramObserver.property = "";
    paramObserver = new LiveAPI(onSelectedParam, "live_set view");
    paramObserver.property = "selected_parameter";
}

// ── Map: capture the next clicked parameter, then drive it ───────────
function startMap() {
    mapMode = true;
    log("MAP — click a parameter to control");
    outlet(5, 1);                  // blink the Map button while waiting for a click
}

function onSelectedParam(args) {
    if (!mapMode) return;                       // only capture while mapping
    if (!args || args.length < 3) return;
    if (args[0] != "selected_parameter") return;
    var pid = parseInt(args[2], 10);
    if (pid <= 0) return;
    targetParam = new LiveAPI(null, "id " + pid);
    targetMin = parseFloat(targetParam.get("min"));
    targetMax = parseFloat(targetParam.get("max"));
    mapMode = false;
    outlet(5, 0);                               // captured → stop blinking the Map button
    log("mapped -> " + targetParam.get("name") + " [" + targetMin + ".." + targetMax + "]");
    writeTarget(currentVal);                    // snap target to the current value
}

function writeTarget(v) {
    if (!targetParam) return;
    targetParam.set("value", targetMin + v * (targetMax - targetMin));
}

function onSelectedTrack(args) {
    if (!args || args.length < 3) return;
    if (args[0] != "selected_track") return;
    var selId = parseInt(args[2], 10);
    var nowActive = (selId === hostId) ? 1 : 0;
    post("[ML-Slot] focus check: hostId=" + hostId + " selId=" + selId + " -> " + (nowActive ? "ACTIVE" : "inactive") + "\n");
    if (nowActive === active) return;
    active = nowActive;
    if (active) {                       // re-arm pickup every time we regain focus
        engaged = false;
        lastIncoming = -1;
    }
    log("focus: " + (active ? "ACTIVE" : "inactive"));
}

// ── Learn ────────────────────────────────────────────────────────────
function arm(v) {
    if (v) { arming = true;  log("ARMING — twist the CC you want to map…"); }
    else   { arming = false; log("arm cancelled"); }
    outlet(4, arming ? 1 : 0);     // blink the Learn/CC button while armed
}
arm.local = 1;

// ── Inlet 2: CC input — list [value, cc, channel] ────────────────────
function list() {
    var args = arrayfromargs(arguments);
    if (args.length < 3) return;
    var val = args[0], cc = args[1], ch = args[2];

    if (arming) {
        learnedCC = cc;
        learnedChannel = ch;
        arming = false;
        outlet(1, learnedCC);
        outlet(2, learnedChannel);
        log("learned CC=" + learnedCC + " ch=" + learnedChannel);
        updateLabel();
        outlet(4, 0);              // captured → stop blinking the Learn button
        engaged = true;            // just-learned twist owns control immediately
        routeCC(val, cc, ch);
    } else {
        routeCC(val, cc, ch);
    }
}

function routeCC(val, cc, ch) {
    if (learnedCC < 0) return;
    if (cc !== learnedCC) return;
    if (ch !== learnedChannel) return;
    if (!active) return;                   // Track Focus gate

    var v = val / 127.0;

    // ── Pickup: hold until the controller reaches/crosses the current value ──
    if (!engaged) {
        var caught = Math.abs(v - currentVal) < PICKUP_EPS;
        if (!caught && lastIncoming >= 0) {
            var lo = Math.min(lastIncoming, v), hi = Math.max(lastIncoming, v);
            caught = (currentVal >= lo && currentVal <= hi);   // crossed between samples
        }
        lastIncoming = v;
        if (!caught) {
            log("pickup hold: enc=" + v.toFixed(2) + " waiting for " + currentVal.toFixed(2));
            return;                        // do NOT move the parameter
        }
        engaged = true;
        log("pickup engaged @ " + currentVal.toFixed(2));
    }

    lastIncoming = v;
    currentVal = v;
    outlet(0, v);                          // follow 1:1
    log("slot1 <- CC " + cc + " val " + val + " -> param " + v.toFixed(3));
}

// ── Inlet 5: current value fed back from live.dial (pickup reference) ─
function msg_float(v) {
    if (inlet === 5) {
        currentVal = Math.max(0.0, Math.min(1.0, v));
        writeTarget(currentVal);               // target mirrors the slot value (CC, drag, automation)
    }
}

// ── Ints: Learn button, pattr restore, value feedback ────────────────
function msg_int(v) {
    var i = inlet;
    if (i === 1)      arm(v);
    else if (i === 3) { learnedCC = v;      log("pattr restore: learnedCC=" + learnedCC); updateLabel(); }
    else if (i === 4) { learnedChannel = v; log("pattr restore: learnedChannel=" + learnedChannel); }
    else if (i === 5) { currentVal = Math.max(0.0, Math.min(1.0, v)); writeTarget(currentVal); }
}
