// dynamic_focus.js
// -----------------------------------------------------------------------------
// Dynamic Focus — Track-Focus proof-of-concept (Max for Live, [js] object)
//
// Purpose of this prototype (see README.md / research thesis):
//   Validate that an independent Max for Live device can activate itself ONLY
//   while its own host track is the currently selected track in Ableton Live,
//   with no central manager and negligible CPU when inactive.
//
//   This file is the "brain". It exposes nothing but Active/Inactive state:
//     - outlet 0 : int 1 (Active) / 0 (Inactive)  -> drives MIDI gate + LED
//     - optional console logging (post)            -> toggle via "log 1"/"log 0"
//   No MIDI Learn, no parameter mapping, no UI beyond debugging.
//
// Architecture (per instance, fully self-contained):
//   1. Resolve own host track:  LiveAPI("this_device").goto("canonical_parent")
//   2. Read the selected track: LiveAPI("live_set view").get("selected_track")
//   3. Observe selection:       LiveAPI(cb, "live_set view").property =
//                               "selected_track"   (event-driven, no polling)
//   4. active = (selected_track_id === own_track_id)
//
// Conventions mirror solo_follower.js (defensive LiveAPI access, Task-based
// deferral, retrying init) which ships in the same project.
// -----------------------------------------------------------------------------

autowatch = 1;
inlets = 1;
outlets = 1;

// --- tuning ------------------------------------------------------------------
var INIT_RETRY_MS = 400;   // backoff while the Live API is not yet ready
var INIT_MAX_RETRIES = 40; // ~16s worst case during set load

// --- state -------------------------------------------------------------------
var enabled = 1;
var initialized = 0;
var rebuilding = 0;
var initRetries = 0;
var logging = 0;

var ownTrackId = 0;        // id of this device's host track (stable for session)
var active = -1;           // -1 = unknown, 0 = inactive, 1 = active

var selObserver = null;    // observer on "live_set view" selected_track
var initTask = null;

// =============================================================================
// Message handlers
// =============================================================================

function bang() {
    safeInit();
}

// "refresh"  -> re-resolve own track + re-evaluate (e.g. after moving device)
// "log 1/0"  -> toggle console logging
// "id"       -> post the resolved own-track id (debugging)
function anything() {
    var m = messagename;
    if (m === "refresh") {
        safeInit();
    } else if (m === "log") {
        logging = (arguments.length > 0 && arguments[0]) ? 1 : 0;
        post("[DynamicFocus] logging " + (logging ? "on" : "off") + "\n");
    } else if (m === "id") {
        post("[DynamicFocus] own track id = " + ownTrackId +
             ", active = " + active + "\n");
    }
}

// int on inlet 0 = enable (1) / disable (0)
function msg_int(v) {
    enabled = v ? 1 : 0;

    if (!enabled) {
        // Inactive by definition while disabled; release the gate / LED.
        setActive(0);
        return;
    }

    if (!initialized) {
        safeInit();
    } else {
        evaluate();
    }
}

// =============================================================================
// Initialization (resolve own track, install the selection observer)
// =============================================================================

function safeInit() {
    if (rebuilding) return;
    cancelInitTask();
    initialized = 0;
    initRetries = 0;
    scheduleInit(1);
}

function scheduleInit(delayMs) {
    cancelInitTask();
    initTask = new Task(function () { tryInit(); }, this);
    initTask.schedule(delayMs);
}

function cancelInitTask() {
    if (initTask) {
        try { initTask.cancel(); } catch (e) {}
        initTask = null;
    }
}

function tryInit() {
    if (!enabled) return;
    if (rebuilding) return;

    rebuilding = 1;

    try {
        // 1) Reference our own host track via the device's canonical parent.
        var trackApi = new LiveAPI("this_device");
        if (!isValidApi(trackApi)) { initFailed(); return; }

        trackApi.goto("canonical_parent");
        if (!isValidApi(trackApi)) { initFailed(); return; }

        ownTrackId = parseIntSafe(trackApi.id);
        if (ownTrackId <= 0) { initFailed(); return; }

        // 2) Observe selection changes (event-driven; no polling).
        installSelectionObserver();

        initialized = 1;
        rebuilding = 0;
        initRetries = 0;

        if (logging) {
            post("[DynamicFocus] init ok — own track id " + ownTrackId + "\n");
        }

        // 3) Evaluate current state right away.
        evaluate();
    } catch (e) {
        initFailed();
    }
}

function initFailed() {
    rebuilding = 0;
    initialized = 0;
    ownTrackId = 0;
    initRetries++;
    if (initRetries <= INIT_MAX_RETRIES) {
        scheduleInit(INIT_RETRY_MS);
    } else if (logging) {
        post("[DynamicFocus] init failed (gave up after " +
             INIT_MAX_RETRIES + " retries)\n");
    }
}

// =============================================================================
// Selection observer + evaluation
// =============================================================================

function installSelectionObserver() {
    uninstallSelectionObserver();
    try {
        selObserver = new LiveAPI(selectionCallback, "live_set view");
        if (!isValidApi(selObserver)) { selObserver = null; return; }
        // Firing this property triggers the callback on every selection change,
        // including return tracks and the master track.
        selObserver.property = "selected_track";
    } catch (e) {
        selObserver = null;
    }
}

function uninstallSelectionObserver() {
    if (selObserver) {
        try { selObserver.property = ""; } catch (e) {}
        selObserver = null;
    }
}

// Live calls this with the new selected_track value. We ignore the payload and
// re-read canonically — cheaper and avoids id-format ambiguity across versions.
function selectionCallback() {
    if (!enabled) return;
    if (!initialized) return;
    evaluate();
}

// Core decision: are we the selected track?
function evaluate() {
    if (!enabled) { setActive(0); return; }
    if (ownTrackId <= 0) return;

    var selId = readSelectedTrackId();
    setActive(selId === ownTrackId ? 1 : 0);
}

function readSelectedTrackId() {
    try {
        var view = new LiveAPI("live_set view");
        if (!isValidApi(view)) return 0;

        var raw = view.get("selected_track");
        // "selected_track" returns ["id", <n>] in M4L.
        if (raw instanceof Array) {
            for (var i = 0; i < raw.length; i++) {
                var n = parseInt(raw[i], 10);
                if (n > 0) return n;
            }
            return 0;
        }
        return parseInt(raw, 10) || 0;
    } catch (e) {
        return 0;
    }
}

// =============================================================================
// Output
// =============================================================================

function setActive(v) {
    v = v ? 1 : 0;
    if (v === active) return;   // edge-triggered: no redundant output / CPU
    active = v;

    outlet(0, active);          // 1 = Active, 0 = Inactive

    if (logging) {
        post("[DynamicFocus] " + (active ? "ACTIVE" : "INACTIVE") +
             " (track " + ownTrackId + ")\n");
    }
}

// =============================================================================
// Lifecycle / teardown
// =============================================================================

function freebang() {
    cancelInitTask();
    uninstallSelectionObserver();
    initialized = 0;
    rebuilding = 0;
    ownTrackId = 0;
    active = -1;
}

// =============================================================================
// Helpers (defensive LiveAPI access — same idioms as solo_follower.js)
// =============================================================================

function parseIntSafe(v) {
    if (typeof v === "number") return v | 0;
    if (v instanceof Array && v.length > 0) return parseInt(v[0], 10) || 0;
    return parseInt(v, 10) || 0;
}

function isValidApi(api) {
    try {
        return api && api.id && api.id !== 0;
    } catch (e) {
        return false;
    }
}
