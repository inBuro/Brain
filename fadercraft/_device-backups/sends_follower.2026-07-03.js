// send_follower.js
// Collects references to all send parameters in the set that feed the return track
// this device lives on, and emits the follow value on bang.
//
// Follow Mode (switchable from the patch):
//   Peak (0) — maximum across all send values to this return (default behavior);
//   Total (1) — sum of all send values to this return, clamped to 1.0
//             (downstream expects range 0..1; percent-monitor/bass won't exceed 100%).
//
// Incoming messages (from the patch, single inlet — all named):
//   build <N>          — rebuild references for the return track at index N (hint from patch)
//   mode <0|1>         — set follow mode (0=Peak, 1=Total)
//   bang               — resync observers (value arrives via onAnySendChange push-callback)
//   arm <slot> <0|1>   — arm/disarm map-mode for slot N (Map button of row N)
//   unmap <slot>       — clear the captured target of slot N and release its live.remote~
//   restorepath <slot> <tokens...> — restore the target path of slot N from pattr on load
//
// "Live" target determination (fix for "frozen" index):
//   JS itself detects the return index via LiveAPI "this_device canonical_parent"
//   and keeps sendRefs in sync with the set via property observers:
//     - observer on the device path  → catches MOVING the device to another return;
//     - observer on live_set "return_tracks" → catches ADD/REMOVE/REORDER of
//       return tracks (our index may have shifted);
//     - observer on live_set "tracks"        → catches ADD/REMOVE of regular tracks
//       (sends to our return appear/disappear — sendRefs must be rebuilt).
//   The "build N" message from the patch is only the initial hint; source of truth = autoDetect().
//   Anti-race: on cold load observers/path may not be ready immediately, so
//   bang() cheaply checks index and track count every RESYNC_MS and fixes mismatches.
//
// 8-slot mapper (own SF signal → arbitrary Live parameters, bypassing LFO):
//   Reproduces the stock LFO mapping list directly on the device face: 8 rows,
//   each with its own target, Min/Max range, and its own live.remote~.
//   Clicking Map on row N arms map-mode for THAT slot only (only ONE slot at a time —
//   arming a new one disarms the previous). While armed, the observer on
//   "live_set view selected_parameter" catches the NEXT parameter the user clicks
//   in Live, takes its canonical path, exits arm mode, and sends the path to the patch
//   (outlet 1, with slot index) → live.path of the slot → right inlet of live.remote~ for the slot.
//   The left inlet of each remote~ receives the same SF follow signal (0..1), scaled
//   to [Min/100 .. Max/100] for that slot. This way SF modulates the selected parameters
//   directly with its follow value, IN PARALLEL with the LFO branch (LFO is untouched).
//   Target paths are stored in pattr (one per slot, survive reload); on load
//   pattr of slot → restorepath <slot> → re-resolve via live.path with the same
//   defer/retry as for the return index. Unmapping a slot clears its path and sends "id 0" to its
//   remote~ (target is released in Live).

// =============================================================================
// @llm-api  Sends Follower – Return  (SF-Return)
// =============================================================================
// IDENTITY
//   file          sends_follower.js  (loaded by Sends Follower – Return.amxd)
//   fingerprint   param_count = 43   ← use this to locate the device on a track
//   lives_on      return tracks only (ti = -1, -2, -3, … in AbletonMCP)
//
// ACCESS VIA ABLETONMCP  (socket 127.0.0.1:9877, JSON protocol)
//   read params   {"type":"get_device_parameters","params":{"track_index":TI,"device_index":DI}}
//   write param   {"type":"set_device_parameter","params":{"track_index":TI,"device_index":DI,
//                   "parameter_index":PI,"value":V}}
//   track_index   normal track N → N  |  return track N (0-based) → -(N+1)
//                 (Return A = -1, Return B = -2, Return C = -3, Return D = -4)
//
// SLOT INDEX PARITY — invariant, never break
//   DI/PI/TI/Max/Min/sfcmd indices here are IDENTICAL to SF-Track.
//   Mode is a UI-only tab (parameter_enable=0) — not a Live param, not counted.
//   If Mode ever becomes a Live param again it shifts all indices by +1 and
//   breaks every MCP mapping script. Never add a Live param before DI.
//
// PARAMETER LAYOUT  (all 43 params after Mode fix, 0-based index)
//   [0]     Device On
//   [1]     Mode          Follow mode: 0=Peak, 1=Total
//   [2-9]   DI1–DI8       device index of target, default -1
//   [10]    MapAll        trigger: always reset 0 → 1 (never set 1 if already 1)
//   [11-18] PI1–PI8       parameter index within target device, default -1
//   [19-26] TI1–TI8       track index of target track (encoding: see TIDX below)
//   [27-34] Max0–Max7     upper bound 0-100 (%), default 100
//   [35-42] Min0–Min7     lower bound 0-100 (%), default 0
//   [43]    sfcmd         encoded min/max write: slot*1000000 + min*1000 + max
//
// TIDX ENCODING  (value written to TI1..TI8)
//   normal track N      → tidx = N          (0-based)
//   return track N      → tidx = -(N+1)     (Return A=-1, B=-2, C=-3, D=-4)
//
// MAPALL RULE  ← critical
//   MapAll fires only on 0→1 transition.  Before every fire:
//     set_device_parameter(... parameter_index=10, value=0)
//     sleep(0.12s)
//     set_device_parameter(... parameter_index=10, value=1)
//
// MX/MN WRITE ORDER  ← critical
//   MapAll internally calls RangeAndName which reads the target param's range
//   and writes back to Max/Min params via live.dial.  This overwrites anything
//   written BEFORE MapAll.  Correct sequence:
//     1. Write TI/DI/PI for all slots
//     2. Fire MapAll (0→1) — establishes live.remote~ connections
//     3. sleep(1.5s)  — wait for JS + live.dial write-back to complete
//     4. Write Max/Min for all slots via sfcmd ← these now persist correctly
//
// DEVICE IDENTIFICATION BY PARAM COUNT (AbletonMCP scan pattern)
//   SF-Return=44  Reverb=33  Chorus-Ensemble=16  Echo=53  Phaser-Flanger=31
//   Roar=91  EQ Eight=84  Shifter=36  Utility=12  (on return tracks)
// =============================================================================

inlets  = 1;
outlets = 3;   // 0 = follow value ("max" <v>); 1 = map-slot control;
               // 2 = PROGRAMMATIC mapping: list "<slot> <id>" to multimap inlet 1
               //     (id injection into live.remote~ of the selected MapButton).

var NSLOTS         = 8;    // number of mapper slots (same as stock LFO)

var sendRefs       = [];   // array of LiveAPI references to send parameters
var sendValueObservers = []; // value observer for each sendRef (push model, no polling)
var returnIndex    = -1;   // index of the return track this device lives on
var trackCountSnap = -1;   // track count at the time sendRefs was last built
var followMode     = 0;    // follow mode: 0=Peak (default), 1=Total

// LiveAPI observers (live for the entire lifetime of the device)
var devPathObs     = null; // watches this_device canonical_parent path (device move)
var returnsObs     = null; // watches live_set "return_tracks" (add/del/reorder returns)
var tracksObs      = null; // watches live_set "tracks" (add/del regular tracks)
var rebuilding     = false; // reentrancy guard for callbacks

// Anti-feedback WARNING: we watch the selected parameter in Live. If a send
// feeding the watched bus is selected (its id is in sendRefs), mapping the output
// to it would create a loop → send warn=1 to the patch (lights "Feedback loop" in version_link).
// id-membership is reliable (not index-dependent). We do NOT exclude the target
// (mapping goes around JS); we only warn. Deselecting the dangerous send → warn=0 (restore update status).
var selParamObs    = null; // live_set view selected_parameter
var warnState      = -1;   // -1 never sent, 0 no loop, 1 dangerous selection

// id of the mapped target for EACH mapper slot (0 = slot empty). Arrives from the patch
// via "targetmap <slot> <id>" (multimap → MapButton live observer).
// warn=1 if ANY slot targetId (!=0) is in sendRefs (by id) → device output
// is mapped to a send feeding the watched bus = real loop. Reliable detection
// based on actual mapping (not selected_parameter).
var mapTargetIds   = [0,0,0,0,0,0,0,0];

// bpatcher objects in multimap.maxpat are named varname="bpslot0".."bpslot7" via mm_idroute patchlines.
// applySlotRanges() accesses them directly via getnamed — no sorting needed.

var _sfPatcher     = this.patcher; // cached patcher reference (this.patcher is unstable inside fnc)

var RESYNC_MS      = 500;  // how often bang() cheaply checks the target (anti-race)
var lastResyncAt   = 0;    // timestamp of the last cheap resync

var RESULT_EPS     = 5e-4; // follow result difference threshold (below this — not sent downstream)
var lastResult     = -1;   // last sent value; -1 = "never sent"

// Pickup mode: holds output frozen after a mode switch until the new computed
// value naturally reaches the last emitted value, then releases.
var pickupActive = false;  // true during pickup hold after mode switch
var pickupTarget = 0.0;    // output value to reach before releasing
var pickupAbove  = false;  // new value started above target (true) or below (false)

// ---- mapper state (8 slots) -----------------------------------------
var armedSlot      = -1;   // which slot is currently armed (-1 = none; only one at a time)
var slotPath       = [];   // canonical target path for each slot ("" = no target)
var slotRetry      = [];   // path resolve retry counter for each slot
var selParamObs    = null; // observer for live_set view "selected_parameter"
var MAP_RETRY_MS   = 150;  // retry interval for path resolve on cold load
var MAP_RETRY_MAX  = 20;   // max resolve attempts (~3 s) — then silently give up

for (var _s = 0; _s < NSLOTS; _s++) {
    slotPath[_s]  = "";
    slotRetry[_s] = 0;
}

// ---- PROGRAMMATIC mapping ("Map All" without GUI clicks) -----------------------
// Claude/MCP writes per-slot target INDICES into hidden Live parameters (Stored Only):
//   SF_TIdx<N> / SF_DIdx<N> / SF_PIdx<N>  (track / device / parameter indices).
// The patch echo-routes their values to JS as "tidx <slot> <v>" / "didx ..." / "pidx ...",
// and JS caches them in these arrays. On "mapall" JS builds the path
// "live_set tracks <t> devices <d> parameters <p>" (or return_tracks) for each valid slot,
// resolves it to a Live object id, and sends "<slot> <id>" to outlet 2 → multimap inlet 1 →
// route <slot> → MapButton[slot] right inlet of live.remote~ ("id <N>"). This is EXACTLY the
// same mechanism as a manual Map click (id → live.remote~), but the target comes from
// indices rather than selected_parameter. -1 = slot not set (skip).
var tIdx = [-1,-1,-1,-1,-1,-1,-1,-1];
var dIdx = [-1,-1,-1,-1,-1,-1,-1,-1];
var pIdx = [-1,-1,-1,-1,-1,-1,-1,-1];

// Host type for track index: false = regular track ("live_set tracks N"),
// true = return track ("live_set return_tracks N"). Default is regular track;
// if a return track is needed as the mapping target — Claude encodes it as a negative
// t-index: t < 0 → return_tracks (-t - 1). This way a single parameter covers both
// track spaces without an extra parameter. (t = -1 → return_tracks 0, t = -2 → rt 1, …)

function now() {
    return (new Date()).getTime();
}

function validSlot(n) {
    n = parseInt(n, 10);
    return (n >= 0 && n < NSLOTS) ? n : -1;
}

// ---- return index detection ------------------------------------------

// Returns the return track index the device lives on, or -1 if the device
// is not on a return (regular track / master) or path is not yet resolved.
function detectReturnIndex() {
    try {
        var parent = new LiveAPI("this_device canonical_parent");
        if (!parent || parent.id == 0) return -1;

        // parent.unquotedpath looks like:
        //   "live_set return_tracks 4"   — on a return track
        //   "live_set tracks 3"          — on a regular track
        //   "live_set master_track"      — on master
        var p = parent.unquotedpath;
        if (!p) return -1;

        var m = p.match(/return_tracks\s+(\d+)/);
        if (m) return parseInt(m[1], 10);

        return -1; // not on return — nothing to target
    } catch (e) {
        return -1;
    }
}

// Current track count in the set (used to build sendRefs).
function liveTrackCount() {
    try {
        var liveSet = new LiveAPI("live_set");
        return liveSet.getcount("tracks");
    } catch (e) {
        return -1;
    }
}

// ---- reference building --------------------------------------------------------

// Compute the follow result for the given mode (0=Peak, 1=Total) without side effects.
// Reads sendRefs at call time; returns 0.0 if no refs are available.
function computeResult(m) {
    if (sendRefs.length === 0) return 0.0;
    var result = 0.0;
    for (var _i = 0; _i < sendRefs.length; _i++) {
        var ref = sendRefs[_i];
        if (ref && ref.id != 0) {
            var v = ref.get("value");
            if (v && v.length > 0) {
                var val = parseFloat(v[0]);
                if (m === 1) { result += val; }
                else if (val > result) { result = val; }
            }
        }
    }
    if (m === 1 && result > 1.0) result = 1.0;
    return result;
}

// Callback: fires when ANY tracked send value changes (push-model, no polling).
// Delegates computation to computeResult, then checks pickup hold before emitting.
function onAnySendChange() {
    if (sendRefs.length === 0) return;
    var result = computeResult(followMode);
    if (pickupActive) {
        var reached = pickupAbove
            ? (result <= pickupTarget + RESULT_EPS)
            : (result >= pickupTarget - RESULT_EPS);
        if (reached) {
            pickupActive = false;
        } else {
            return; // hold: don't output until new value reaches old position
        }
    }
    if (Math.abs(result - lastResult) > RESULT_EPS) {
        lastResult = result;
        outlet(0, "max", result);
    }
}

function clearRefs() {
    for (var _i = 0; _i < sendValueObservers.length; _i++) {
        try { sendValueObservers[_i].property = ""; } catch(e) {}
    }
    sendValueObservers = [];
    sendRefs = [];
}

// Build references to the send→returnIdx parameter on each track in the set.
function buildRefs(returnIdx) {
    clearRefs();
    returnIndex = returnIdx;
    lastResult = -1;   // reset gate: don't suppress first emission after set/track change

    if (returnIdx < 0) {
        // device not on a return — silent: nothing to target, no console spam
        trackCountSnap = liveTrackCount();
        return;
    }

    var liveSet    = new LiveAPI("live_set");
    var trackCount = liveSet.getcount("tracks");
    trackCountSnap = trackCount;

    for (var i = 0; i < trackCount; i++) {
        var sendApi = new LiveAPI(
            "live_set tracks " + i + " mixer_device sends " + returnIdx
        );
        if (sendApi.id != 0) {
            sendRefs.push(sendApi);
            try {
                var obs = new LiveAPI(onAnySendChange, sendApi.unquotedpath);
                obs.property = "value";
                sendValueObservers.push(obs);
            } catch(e) {}
        }
    }
    // Emit initial value now that observers are wired.
    onAnySendChange();
    // sendRefs rebuilt (track add/del changed the set) → recompute warn
    // against actual map targets (sendRefs is already non-empty here — no recursion).
    recomputeWarn();
}

// Synchronize sendRefs with the current set state.
// Cheaply decides if rebuild is needed: rebuilds on index change
// OR track count change. Protected against reentrancy.
function resync(force) {
    if (rebuilding) return;
    rebuilding = true;
    try {
        var idx   = detectReturnIndex();
        var count = liveTrackCount();

        var indexChanged = (idx !== returnIndex);
        var countChanged = (count !== trackCountSnap);

        if (force || indexChanged || countChanged) {
            buildRefs(idx);
        }
    } catch (e) {
        // don't crash the device due to a transient LiveAPI race
    } finally {
        rebuilding = false;
    }
}

// ---- LiveAPI observers ---------------------------------------------------

// Observer callback: any notification about the observed property → resync.
// (We ignore actual values; filter out noisy "id ..." notifications.)
function onLiveChange(args) {
    // args arrives as ["property", value...] or ["id", n];
    // we only care about the fact that something changed — rebuild if needed.
    if (args && args[0] === "id") return; // initialization id-notification
    resync(false);
}

function installObservers() {
    // Device path: catches the device being moved to another track/return.
    try {
        if (devPathObs) { devPathObs.property = ""; devPathObs = null; }
        devPathObs = new LiveAPI(onLiveChange, "this_device canonical_parent");
        // watch the parent's own path — when the device moves,
        // canonical_parent resolves to a different object → callback fires
        devPathObs.property = "name";
    } catch (e) {}

    // Return track list: add/del/reorder of returns changes our index.
    try {
        if (returnsObs) { returnsObs.property = ""; returnsObs = null; }
        returnsObs = new LiveAPI(onLiveChange, "live_set");
        returnsObs.property = "return_tracks";
    } catch (e) {}

    // Regular track list: add/del of a track changes the set of sends to our return.
    try {
        if (tracksObs) { tracksObs.property = ""; tracksObs = null; }
        tracksObs = new LiveAPI(onLiveChange, "live_set");
        tracksObs.property = "tracks";
    } catch (e) {}
}

// ---- mapper: arm, target capture, persist, unmap (per slot) ------------------

// Observer for the selected parameter in Live. Always active, but reacts
// only when a slot is armed (armedSlot >= 0); otherwise normal user
// parameter clicks are ignored.
function installSelParamObserver() {
    try {
        if (selParamObs) { selParamObs.property = ""; selParamObs = null; }
        // Song.View: "selected_parameter" — parameter selected in Live by click.
        selParamObs = new LiveAPI(onSelParamChange, "live_set view");
        selParamObs.property = "selected_parameter";
    } catch (e) {}
}

// Callback for selected parameter change. Two responsibilities:
//  (1) mapper-arm (if a slot is armed) — capture target (in Return, mapping goes around
//      JS so this branch normally doesn't fire, but kept for completeness);
//  (2) anti-feedback WARNING — if a send feeding the watched bus is selected
//      (its id is in sendRefs), light "Feedback loop" in version_link.
function onSelParamChange(args) {
    // (2) WARNING detection by id-membership — independent of mapper arm.
    updateFeedbackWarning(args);

    // (1) mapper arm (legacy, inactive in Return).
    if (armedSlot < 0) return;
    if (args && args[0] === "id" && (args[1] === 0 || args[1] === "0")) return; // selection cleared
    try {
        var sel = new LiveAPI("live_set view selected_parameter");
        if (!sel || sel.id == 0) return;
        var path = sel.unquotedpath;
        if (!path) return;
        captureTarget(armedSlot, path);
    } catch (e) {}
}

// ---- PROGRAMMATIC mapping: receive indices + Map All -------------------------

// "tidx <slot> <v>" / "didx ..." / "pidx ..." — echo of hidden Live parameter
// index value from the patch. Cached; on load live.numbox emits the stored value →
// arrays are populated by the time "mapall" arrives. Values < -64 are clamped to -1 (not set).
function tidx(slot, v) { _setIdx(tIdx, slot, v); }
function didx(slot, v) { _setIdx(dIdx, slot, v); }
function pidx(slot, v) { _setIdx(pIdx, slot, v); }
function _setIdx(arr, slot, v) {
    var s = validSlot(slot);
    if (s < 0) return;
    var n = parseInt(v, 10);
    arr[s] = isNaN(n) ? -1 : n;
}

// Build the canonical target path for a slot from indices. Returns "" if the slot
// is not set (no valid device+parameter). t >= 0 → "tracks t"; t < 0 → return_tracks.
function slotPathFromIdx(slot) {
    var t = tIdx[slot], dv = dIdx[slot], pv = pIdx[slot];
    if (dv < 0 || pv < 0) return "";           // no device+parameter → slot empty
    var trackTok;
    if (t >= 0)      trackTok = "tracks " + t;
    else             trackTok = "return_tracks " + (-t - 1);   // -1→rt0, -2→rt1, …
    return "live_set " + trackTok + " devices " + dv + " parameters " + pv;
}

// "mapall" — for each slot with valid indices: build path, resolve to
// Live object id, send "<slot> <id>" to outlet 2 → multimap → live.remote~.
// Empty slots are skipped (their existing mapping is NOT touched — Map All only
// adds/re-establishes the slots specified by Claude). Also stores path in
// slotPath[slot] and id in mapTargetIds[slot] (for labels and warn detection).
// Direct patcher navigation: getnamed("mb_map_id").message(id) fires full mb_ididmsg
// chain → RangeAndName (label update) + live.remote~ inlet 1 (parameter mapping).
function mapall() {
    post("[SF-Ret] mapall START\n");
    var mmBox = null, mmSub = null;
    try {
        mmBox = _sfPatcher.getnamed("multimap_panel");
        if (mmBox) mmSub = mmBox.subpatcher();
    } catch(e) {}
    post("[SF-Ret] mmSub=" + (mmSub ? "OK" : "NULL") + "\n");

    var devPath = "";
    try {
        var dapi = new LiveAPI("this_device");
        if (dapi && dapi.id != 0) devPath = dapi.unquotedpath;
    } catch(e) {}
    post("[SF-Ret] devPath=" + (devPath || "EMPTY") + "\n");

    for (var s = 0; s < NSLOTS; s++) {
        var path = "";
        if (devPath) {
            var tidx = 0, didx = 0, pidx = 0;
            try { var pt = new LiveAPI(devPath + " parameters " + (19 + s)); if (pt && pt.id != 0) tidx = Math.round(pt.get("value")[0]); } catch(e) {}
            try { var pd = new LiveAPI(devPath + " parameters " + (2  + s)); if (pd && pd.id != 0) didx = Math.round(pd.get("value")[0]); } catch(e) {}
            try { var pp = new LiveAPI(devPath + " parameters " + (11 + s)); if (pp && pp.id != 0) pidx = Math.round(pp.get("value")[0]); } catch(e) {}
            if (didx >= 0 && pidx >= 0) {
                var tok = (tidx >= 0) ? ("tracks " + tidx) : ("return_tracks " + (-tidx - 1));
                path = "live_set " + tok + " devices " + didx + " parameters " + pidx;
            }
        } else {
            path = slotPathFromIdx(s);
        }
        post("[SF-Ret] slot" + s + " tidx=" + (devPath ? "live" : "mem") + " path=" + (path || "EMPTY") + "\n");
        if (!path) {
            // slot not set → clear button (outline)
            outlet(2, s, 0);
            continue;
        }
        var id = 0;
        try {
            var api = new LiveAPI(path);
            if (api && api.id != 0) id = parseInt(api.id, 10);
        } catch(e) { id = 0; }
        post("[SF-Ret] slot" + s + " id=" + id + "\n");
        if (!id) {
            // path set but Live object not found → clear button (outline)
            outlet(2, s, 0);
            continue;
        }
        slotPath[s]     = path;
        mapTargetIds[s] = id;

        outlet(2, s, id);

        if (mmSub) {
            try {
                var bp = mmSub.getnamed("bpslot" + s);
                var slotSub = bp ? bp.subpatcher() : null;
                var mmsg = slotSub ? slotSub.getnamed("mb_map_id") : null;
                post("[SF-Ret] slot" + s + " bp=" + (bp?"OK":"NULL") + " mmsg=" + (mmsg?"OK":"NULL") + "\n");
                if (mmsg) mmsg.message(id);
            } catch(e) {}
        }

        emitTargetName(s, path);
    }
    recomputeWarn();
    applySlotRanges();
}

// ---- MULTIMAP RANGES --------------------------------------------------
// applySlotRanges() — after MapAll reads Max/Min from API parameters [27-34]/[35-42]
// and sets TargetMax/TargetMin in each MapButton slot of the multimap.
// Each bpatcher in multimap.maxpat has varname="bpslot{s}" (s=0..7),
// allowing direct access without sorting by Y.
function applySlotRanges() {
    var devPath = "";
    try {
        var dapi = new LiveAPI("this_device");
        if (!dapi || dapi.id == 0) return;
        devPath = dapi.unquotedpath;
    } catch(e) { return; }
    if (!devPath) return;

    var maxV = [], minV = [];
    for (var s = 0; s < NSLOTS; s++) {
        try {
            var pm = new LiveAPI(devPath + " parameters " + (27 + s));
            maxV[s] = (pm && pm.id != 0) ? pm.get("value")[0] : 100;
        } catch(e) { maxV[s] = 100; }
        try {
            var pn = new LiveAPI(devPath + " parameters " + (35 + s));
            minV[s] = (pn && pn.id != 0) ? pn.get("value")[0] : 0;
        } catch(e) { minV[s] = 0; }
    }

    try {
        var mmBox = _sfPatcher.getnamed("multimap_panel");
        if (!mmBox) return;
        var mmSub = mmBox.subpatcher();
        if (!mmSub) return;

        for (var s = 0; s < NSLOTS; s++) {
            var bp = mmSub.getnamed("bpslot" + s);
            if (!bp) { post("applySlotRanges: bpslot" + s + " not found\n"); continue; }
            var slotSub = bp.subpatcher();
            if (!slotSub) continue;
            var tmax = slotSub.getnamed("TargetMax[7]");
            var tmin = slotSub.getnamed("TargetMin[7]");
            if (tmax) tmax.message(maxV[s]);
            if (tmin) tmin.message(minV[s]);
        }
    } catch(e) {
        post("applySlotRanges error: " + e + "\n");
    }
}

// "targetmap <slot> <id>" from the patch — update the mapped target id for the slot.
// id=0 / unmap → slot is cleared. Recompute warn after update.
function targetmap(slot, id) {
    var s = parseInt(slot, 10);
    if (isNaN(s) || s < 0 || s >= 8) return;
    var v = parseInt(id, 10);
    mapTargetIds[s] = (isNaN(v) || v < 0) ? 0 : v;
    recomputeWarn();
}

// Is this id in sendRefs? (send feeds the watched bus)
function idInSendRefs(id) {
    if (!id) return false;
    if (sendRefs.length === 0) {
        var idx = detectReturnIndex();
        if (idx >= 0) buildRefs(idx);   // on-demand so the match fires IMMEDIATELY
    }
    for (var i = 0; i < sendRefs.length; i++) {
        if (sendRefs[i] && sendRefs[i].id != 0 &&
            parseInt(sendRefs[i].id, 10) === id) return true;
    }
    return false;
}

// MAIN loop detection: warn=1 if ANY mapped slot target is in sendRefs
// (device output drives a send feeding the watched bus). Recomputed when
// targets change (targetmap) AND when sendRefs is rebuilt (buildRefs).
function recomputeWarn() {
    var w = 0;
    for (var s = 0; s < 8; s++) {
        if (mapTargetIds[s] && idInSendRefs(mapTargetIds[s])) { w = 1; break; }
    }
    if (w !== warnState) {
        warnState = w;
        outlet(1, "warn", w);   // → route warn → version_link logic in patch
    }
}

// Additional trigger via selected_parameter (best-effort, if user SELECTED
// a dangerous send before mapping). Not primary — primary = recomputeWarn from map targets.
function updateFeedbackWarning(args) {
    if (args && args[0] === "id" && (args[1] === 0 || args[1] === "0")) {
        recomputeWarn();   // selection cleared — revert to state from map targets
        return;
    }
    try {
        var sel = new LiveAPI("live_set view selected_parameter");
        if (sel && sel.id != 0 && idInSendRefs(parseInt(sel.id, 10))) {
            if (warnState !== 1) { warnState = 1; outlet(1, "warn", 1); }
            return;
        }
    } catch (e) {}
    recomputeWarn();   // safe selection — flag based on actual map targets
}

// Lock in a slot target: save path, exit arm mode, resolve and connect.
function captureTarget(slot, path) {
    slot = validSlot(slot);
    if (slot < 0) return;
    slotPath[slot]  = path;
    armedSlot       = -1;
    persistPath(slot, path);             // to pattr of the slot — survives reload
    outlet(1, slot, "arm", 0);           // slot Map button highlight: off
    emitTargetName(slot, path);          // label for the slot row
    slotRetry[slot] = 0;
    resolveAndConnect(slot);             // path → slot's live.path → right inlet of remote~
}

// Send the slot path to the patch for resolve via live.path (outlet 1).
// live.path accepts "path <...>" and outputs "id n" → right inlet of remote~.
function resolveAndConnect(slot) {
    slot = validSlot(slot);
    if (slot < 0 || !slotPath[slot]) return;
    // Send as "<slot> path <symbols...>" — route by slot → slot's live.path.
    var parts = slotPath[slot].split(" ");
    var msg = [slot, "path"];
    for (var i = 0; i < parts.length; i++) msg.push(parts[i]);
    outlet(1, msg);
}

// Restore slot path from pattr on set load. The path is stored in pattr
// as a LIST of tokens (not a single symbol — to avoid dependency on space quoting).
// First argument is the slot index, the rest are path tokens. The Live API
// may not be ready yet — retry with MAP_RETRY_MS interval, same
// anti-race as for the return index.
function restorepath() {
    if (arguments.length === 0) return;
    var slot = validSlot(arguments[0]);
    if (slot < 0) return;
    // Sentinel "none" = empty target (see persistPath).
    if (arguments.length === 2 && String(arguments[1]) === "none") {
        slotPath[slot] = "";
        return;
    }
    var toks = [];
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] !== undefined && arguments[i] !== null && arguments[i] !== "") {
            toks.push(String(arguments[i]));
        }
    }
    if (toks.length === 0) { slotPath[slot] = ""; return; }
    slotPath[slot] = toks.join(" ");
    emitTargetName(slot, slotPath[slot]);
    slotRetry[slot] = 0;
    retryResolve(slot);
}

function retryResolve(slot) {
    slot = validSlot(slot);
    if (slot < 0 || !slotPath[slot]) return;
    try {
        var t = new LiveAPI(slotPath[slot]);
        if (t && t.id != 0) {
            resolveAndConnect(slot);      // path resolves — connect
            return;
        }
    } catch (e) {}
    // not ready yet — retry up to MAP_RETRY_MAX times
    if (slotRetry[slot] < MAP_RETRY_MAX) {
        slotRetry[slot]++;
        var task = new Task(retryResolve, this, slot);
        task.schedule(MAP_RETRY_MS);
    }
}

// Name/path of the slot target for the row label (outlet 1, with slot index).
function emitTargetName(slot, path) {
    slot = validSlot(slot);
    if (slot < 0) return;
    var label = "—";
    if (path) {
        try {
            var t = new LiveAPI(path);
            if (t && t.id != 0) {
                var nm = t.get("name");
                if (nm && nm.length > 0 && nm[0] !== "") label = String(nm[0]);
                else label = shortPath(path);
            } else {
                label = shortPath(path);
            }
        } catch (e) {
            label = shortPath(path);
        }
    }
    outlet(1, slot, "name", label);
}

// Short readable representation of the path when the name is unavailable.
function shortPath(path) {
    var p = path.replace(/^live_set\s*/, "");
    if (p.length > 24) p = p.substring(p.length - 24);
    return p;
}

// Save slot path to pattr (outlet 1 → route by slot → "store" → pattr).
// Path is sent as a LIST of tokens, not a single symbol, to avoid
// space-quoting issues in Max. Empty store clears pattr.
function persistPath(slot, path) {
    slot = validSlot(slot);
    if (slot < 0) return;
    var msg = [slot, "store"];
    if (path && path.length) {
        var parts = path.split(" ");
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] !== "") msg.push(parts[i]);
        }
    }
    // Always at least one atom after "store" so route doesn't output a bare bang
    // into pattr (a bang would make pattr output its value instead of clearing).
    if (msg.length === 2) msg.push("none");
    outlet(1, msg);
}

// "arm <slot> <0|1>" from the patch (Map button on a row). Only ONE slot at a time:
// arming a new slot disarms the previous one.
function arm(slot, a) {
    slot = validSlot(slot);
    if (slot < 0) return;
    var v = (parseInt(a, 10) === 1) ? 1 : 0;
    if (v) {
        // disarm the previously armed slot (visually)
        if (armedSlot >= 0 && armedSlot !== slot) {
            outlet(1, armedSlot, "arm", 0);
        }
        armedSlot = slot;
        if (!selParamObs) installSelParamObserver();
    } else {
        if (armedSlot === slot) armedSlot = -1;
    }
    outlet(1, slot, "arm", v);            // echo for button highlight (sync)
}

// "unmap <slot>" from the patch. Clear slot target, release its live.remote~ ("id 0").
function unmap(slot) {
    slot = validSlot(slot);
    if (slot < 0) return;
    if (armedSlot === slot) armedSlot = -1;
    slotPath[slot]  = "";
    slotRetry[slot] = 0;
    persistPath(slot, "");                // clear in slot's pattr
    outlet(1, slot, "release");           // → "id 0" into right inlet of slot's remote~
    outlet(1, slot, "arm", 0);            // remove highlight
    outlet(1, slot, "name", "—");         // clear label
}

// ---- messages from the patch ----------------------------------------------------

// "build <N>" from the patch — initial index hint. Source of truth is
// autoDetect, so we confirm the hint via resync rather than
// blindly trusting it (patch chain fires once and may have "frozen").
function build(returnIdx) {
    if (returnIdx === undefined || returnIdx === null) {
        return;
    }
    // Ensure observers are installed (first build = initialization).
    if (!devPathObs && !returnsObs && !tracksObs) {
        installObservers();
    }
    // Install selected parameter observer on init too,
    // so target capture works immediately after the first arm.
    if (!selParamObs) {
        installSelParamObserver();
    }
    // Trust our own detection; if it is empty (race) — use the hint.
    var idx = detectReturnIndex();
    if (idx < 0) idx = parseInt(returnIdx, 10);
    buildRefs(idx);
}

// Max calls loadbang() when the patch loads — install observers IMMEDIATELY (don't wait
// for the first bang/detect chain) so the warning fires from the VERY FIRST send selection.
function loadbang() {
    if (!devPathObs && !returnsObs && !tracksObs) installObservers();
    if (!selParamObs) installSelParamObserver();
    var idx = detectReturnIndex();
    if (idx >= 0) buildRefs(idx);   // build sendRefs immediately — id-membership ready
    // One-time anti-race: re-check after LiveAPI settles
    var t = new Task(function() { resync(false); }, this);
    t.schedule(1000);
}

// "mode <0|1>" from the patch (live.tab: 0=Peak, 1=Total).
// Activates pickup hold when switching modes causes an output jump.
function mode(m) {
    if (m === undefined || m === null) {
        return;
    }
    var newMode = (parseInt(m, 10) === 1) ? 1 : 0;
    if (newMode !== followMode) {
        var newResult = computeResult(newMode);
        if (Math.abs(newResult - lastResult) > RESULT_EPS) {
            pickupActive = true;
            pickupTarget = lastResult;
            pickupAbove  = (newResult > lastResult);
        } else {
            pickupActive = false; // already aligned, no jump
        }
    }
    followMode = newMode;
}

// push model — observers handle all sync; polling removed
function bang() {
    // push model — observers handle all sync; polling removed
}
