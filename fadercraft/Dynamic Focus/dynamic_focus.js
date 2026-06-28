// dynamic_focus.js — proof-of-concept for the Dynamic Focus track-focus architecture.
//
// Goal: a Max for Live device that activates ONLY while its own host track is the
// currently selected track in Live. No global manager, no central router — every
// instance evaluates its own active-state independently and event-driven.
//
// This is a debugging prototype: it exposes Active/Inactive state, console logging
// and a visual indicator. No MIDI Learn, no parameter mapping, no real UI.
//
// Outlets:
//   0 -> active flag (1 = host track selected, 0 = not)  ... drive a live.text / led
//   1 -> debug string (host track name + selected track name)

autowatch = 1;
inlets = 1;
outlets = 2;

var DEBUG = 1;

// LiveAPI handles
var hostTrack = null;      // our own track (canonical_parent of this_device)
var selObserver = null;    // observer on live_set view -> "selected_track"

var hostId = -1;           // numeric id of our host track
var active = -1;           // last reported state (-1 = unknown, forces first emit)

function log() {
    if (!DEBUG) return;
    var s = "[DynFocus]";
    for (var i = 0; i < arguments.length; i++) s += " " + arguments[i];
    post(s + "\n");
}

// ---------------------------------------------------------------------------
// Setup. Called once the patch is loaded and the Live API is ready.
// In the device we trigger this from a [live.thisdevice] -> [loadbang]-style bang.
// ---------------------------------------------------------------------------
function bang() {
    init();
}

function init() {
    // 1) Resolve our own host track via the device's canonical_parent.
    var dev = new LiveAPI(null, "this_device");
    var parent = dev.get("canonical_parent"); // -> ["id", <n>]  (the track holding this device)
    if (!parent || parent.length < 2) {
        log("ERROR: could not resolve canonical_parent of this_device");
        return;
    }
    var hostPath = "id " + parent[1];
    hostTrack = new LiveAPI(null, hostPath);
    hostId = parseInt(hostTrack.id, 10);

    log("host track =", hostTrack.get("name"), "id", hostId, "path", hostTrack.unquotedpath);

    // 2) Observe the selected track. The callback fires every time the user
    //    changes selection — no polling required. We watch the VIEW's
    //    "selected_track" property; the callback delivers ["selected_track", "id", <n>].
    if (selObserver) selObserver.property = "";   // detach any previous observer
    selObserver = new LiveAPI(onSelectedTrack, "live_set view");
    selObserver.property = "selected_track";
    // Setting .property triggers one immediate callback with the current value,
    // so the initial state is evaluated without any extra work.
}

// ---------------------------------------------------------------------------
// Selection-change callback. args = ["selected_track", "id", <n>]
// ---------------------------------------------------------------------------
function onSelectedTrack(args) {
    if (!args || args.length < 3) return;
    if (args[0] != "selected_track") return;     // ignore unrelated notifications

    var selId = parseInt(args[2], 10);
    evaluate(selId);
}

function evaluate(selId) {
    var nowActive = (selId === hostId) ? 1 : 0;

    if (nowActive === active) return;            // nothing changed -> do nothing (cheap)
    active = nowActive;

    outlet(0, active);                           // gate / led

    if (DEBUG) {
        var sel = new LiveAPI(null, "id " + selId);
        var hostName = hostTrack ? hostTrack.get("name") : "?";
        log(active ? "ACTIVE  " : "inactive", "host:", hostName, "| selected:", sel.get("name"));
        outlet(1, "host=" + hostName + " sel=" + sel.get("name") + " active=" + active);
    }
}

// Manual re-query (e.g. after the host track is moved/renamed). Bind to a button.
function refresh() {
    init();
}

function clear() {
    if (selObserver) { selObserver.property = ""; selObserver = null; }
    hostTrack = null;
    hostId = -1;
    active = -1;
}
