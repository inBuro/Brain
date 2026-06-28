// midi_learn_slot.js — MIDI Learn controller for one slot.
//
// Inlets:
//   0 — bang from live.thisdevice (init)
//   1 — arm/disarm: 1 = start learning, 0 = cancel
//   2 — CC input list from [ctlin]: value, cc, channel  (ctlin sends value cc ch)
//   3 — restore learnedCC from pattr (int)
//   4 — restore learnedChannel from pattr (int)
//
// Outlets:
//   0 — normalized value (0.–1.) to live.dial via [prepend set]
//   1 — learnedCC to pattr (for save/load)
//   2 — learnedChannel to pattr (for save/load)
//   3 — debug string to message box

inlets = 5;
outlets = 4;

autowatch = 1;

var arming = false;
var learnedCC = -1;
var learnedChannel = -1;

function log(msg) {
    post("[ML-Slot] " + msg + "\n");
    outlet(3, msg);
}

// ── Inlet 0: bang from live.thisdevice (init) ────────────────────────
// ── Inlet 1: bang from live.button (Learn) ───────────────────────────
function bang() {
    if (inlet === 1) {          // live.button emits a bang on click → arm
        arm(1);
        return;
    }
    log("init: slot ready, learnedCC=" + learnedCC + " ch=" + learnedChannel);
}

// ── Inlet 1: arm toggle (1 = arm, 0 = cancel) ────────────────────────
function arm(v) {
    if (v) {
        arming = true;
        log("ARMING — twist the CC you want to map…");
    } else {
        arming = false;
        log("arm cancelled");
    }
}
arm.local = 1;

// ── Inlet 2: CC input — [ctlin] sends: value cc channel ──────────────
// ctlin in Max sends three separate values via three outlets (value, CC, ch).
// We wire all three into inlet 2 as a list by using [pack] upstream.
// Expected: list [value, cc, channel]
function list() {
    var args = arrayfromargs(arguments);
    if (args.length < 3) return;
    var val = args[0];
    var cc  = args[1];
    var ch  = args[2];

    if (arming) {
        // First incoming CC while armed → learn it
        learnedCC      = cc;
        learnedChannel = ch;
        arming         = false;
        // Persist to pattr outlets
        outlet(1, learnedCC);
        outlet(2, learnedChannel);
        log("learned CC=" + learnedCC + " ch=" + learnedChannel);
        // Also route this first value through immediately
        routeCC(val, cc, ch);
    } else {
        routeCC(val, cc, ch);
    }
}

function routeCC(val, cc, ch) {
    if (learnedCC < 0) return;             // nothing learned yet
    if (cc !== learnedCC) return;
    if (ch !== learnedChannel) return;

    var norm = val / 127.0;
    outlet(0, norm);                        // → [prepend set] → live.dial
    log("slot1 <- CC " + cc + " val " + val + " -> param " + norm.toFixed(3));
}

// ── Inlets 3–4: pattr restores learnedCC / learnedChannel ────────────
function msg_int(v) {
    var i = inlet;
    if (i === 1) {                 // Learn button delivered as int (1=arm, 0=cancel)
        arm(v);
    } else if (i === 3) {
        learnedCC = v;
        log("pattr restore: learnedCC=" + learnedCC);
    } else if (i === 4) {
        learnedChannel = v;
        log("pattr restore: learnedChannel=" + learnedChannel);
    }
}
