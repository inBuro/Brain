// =============================================================================
// @llm-api  Sends Follower – Track  (SF-Track)
// =============================================================================
// IDENTITY
//   file          sends_follower_track.js  (loaded by Sends Follower – Track.amxd)
//   fingerprint   param_count = 45   ← use this to locate the device on a track
//   lives_on      normal audio/MIDI tracks (ti = 0, 1, 2, …) or return tracks
//
// LOAD VIA ABLETONMCP
//   talk(s, "load_browser_item", {"track_index": TI, "item_uri":
//     "query:UserLibrary#Max%20Devices:Sends%20Follower%20%E2%80%93%20Track.amxd"})
//   SF-Return URI: "query:UserLibrary#Max%20Devices:Sends%20Follower%20%E2%80%93%20Return.amxd"
//   Note: parameter is "item_uri" (not "uri") — wrong key silently drops URI
//
// ACCESS VIA ABLETONMCP  (socket 127.0.0.1:9877, JSON protocol)
//   read params   {"type":"get_device_parameters","params":{"track_index":TI,"device_index":DI}}
//   write param   {"type":"set_device_parameter","params":{"track_index":TI,"device_index":DI,
//                   "parameter_index":PI,"value":V}}
//   track_index   normal track N → N  |  return track N (0-based) → -(N+1)
//
// PARAMETER LAYOUT  (all 45 params, 0-based index)
//   [0]     Device On
//   [1-8]   DI1–DI8       device index of target device on the mapped track
//   [9]     MapAll        trigger: always reset 0→1 transition
//   [10-17] PI1–PI8       parameter index within target device
//   [18-25] TI1–TI8       track index of target track
//   [26-33] Max1–Max8     upper bound 0-100 (%)
//   [34-41] Min1–Min8     lower bound 0-100 (%)
//   [42]    MIDI Src      MIDI source selector
//   [43]    send_menu     which send to follow (0=None, 1=RetA, 2=RetB …)
//   [44]    sfcmd         encoded min/max write: slot*1000000 + min*1000 + max
//
// SLOT INDEX PARITY — invariant, never break
//   SF-Return has IDENTICAL DI/PI/TI/Max/Min/sfcmd indices to SF-Track above.
//   This is only possible because Mode in SF-Return has parameter_enable=0
//   (UI-only toggle, not a Live param). If Mode were a Live param it would
//   sit at [1] and shift every subsequent index by +1, breaking all MCP scripts.
//   Never add a Live parameter before DI in either device.
//
// TIDX ENCODING
//   normal track N → tidx = N  |  return track N (0-based) → tidx = -(N+1)
//
// SLOT ORDERING RULE
//   Divide 8 slots into equal sections per device (2 devices → slots 1-4 / 5-8).
//   Fill each section sequentially; never mix params from different devices.
//   Prefer tone/character params (freq, resonance, decay, drive…); Dry/Wet last.
//   Each slot must be perceptually distinct — no two slots same function+range.
//
// MAPALL RULE  ← critical
//   Always fire as 0→1 transition. Never write 1.0 when already 1.0.
//   Sequence: write all TI/DI/PI → MapAll(0→1) → sleep(2s) → write sfcmd per slot
//
// DEVICE IDENTIFICATION BY PARAM COUNT (AbletonMCP scan)
//   SF-Track=45  SF-Return=43  Auto Filter=45  Re-Envelope=19  Saturator=19
//   Corpus=39  Phaser-Flanger=31  Spectral Resonator=20  Erosion=6
//   (SF-Track vs Auto Filter: both 45 — SF-Track always at lowest DI on track)
//   (Saturator vs Re-Envelope: both 19 — distinguish by track/context)
// =============================================================================

// sends_follower_track.js
// Track variant of Sends Follower. Lives on a REGULAR or RETURN track and
// follows ONE specific send parameter of that track (its send to the
// selected return), rather than aggregating across all tracks in the set.
// On return track N only sends to return tracks N+1, N+2, … are available
// (Live limitation: a return cannot send to itself or earlier returns).
//
// Value source: this_device canonical_parent (host track) → mixer_device
//   → sends <k>, where k is the index of the selected return track (= menu item index).
// No scan of all tracks and no Peak/Total aggregation: single value.
//
// Incoming messages (from the patch, single inlet — all named):
//   select <menuIdx>    — select menu item: 0=None (inert), i>=1=send (i-1)
//   restoreidx <k>      — restore selection from parameter on load (same menuIdx)
//   bang                — read the selected send and output value (label "max")
//   arm <slot> <0|1>    — arm/disarm map-mode for slot N (Map button of row N)
//   unmap <slot>        — clear the captured target of slot N and release its live.remote~
//   restorepath <slot> <tokens...> — restore the target path of slot N from pattr on load
//
// The send menu is populated AT RUNTIME from JS (outlet 1 → live.menu): names are taken
// from live_set return_tracks. An observer for "return_tracks" repopulates the menu
// and re-establishes the selected ref on add/del/reorder of return tracks.
//
// If the device is on the master track or path is not resolved — nothing to target:
//   emit value 0 (N/A) and ask the patch to hide the menu (outlet 1 "menu hide").
//
// 8-slot mapper (own signal → arbitrary Live parameters) is ported
// 1:1 from the return version: arm/captureTarget/persist/unmap/restorepath + observer for
// "live_set view selected_parameter". Independent of the follow value source.

inlets  = 1;
outlets = 5;   // 0 = device output ("max" <v>) → mm_sig → 8-slot mapper;
               // 1 = menu + map-slots + "barvis 0/1" (visibility of the "for MIDI map" numbox);
               // 2 = "knobset <0..1>"     — update the LARGE circle (plain dial, UI mirror);
               // 3 = "mididialset <0..1>" — update midi_dial numbox (Live parameter 0..127).
               //
               // TWO MODES (Source selector):
               //   • A/B/C/D: output = level of the selected track send; large circle ↔ send
               //     (bidirectional + guard). Numbox HIDDEN.
               //   • Manual: output = MANUAL source manualVal (midi_dial numbox, 0..127→0..1) →
               //     mapper; send NOT touched. Large circle ↔ numbox (bidirectional + guard).
               //     Numbox SHOWN.
               // Controls: LARGE circle (plain dial obj-3, parameter_enable:0) = visual+mouse,
               // not MIDI-mappable; midi_dial numbox (live.numbox, Int 0..127, parameter_enable:1)
               // = THE ONLY Live parameter → Cmd+M → user maps to hardware/MIDI.

var NSLOTS         = 8;    // number of mapper slots (same as return version)
var _sfPatcher     = this.patcher; // cached reference (this.patcher is unstable inside callbacks)

var sendRef        = null; // ONE LiveAPI reference to the selected send parameter
var sendValueObs   = null; // LiveAPI observer on send value (push model, no polling)
// selectedSend = return track index (0=A, 1=B, …). SPECIAL VALUE -1 = "Manual":
// send is not touched, source = manual (bar live.slider → output).
// Menu: item 0 = "Manual" (label; marker -1), item i (i>=1) = return index (i-1). I.e.
//   menuIndex = selectedSend + 1  and  selectedSend = menuIndex - 1.
var NONE           = -1;   // numeric marker for manual mode (var name is historical, not a label)
var selectedSend   = 0;    // default on fresh insert = Send A (menuIndex 1); parameter initial=1 too
var onTrack        = false;// whether the device is on a supported track (regular OR return)
var returnCountSnap = -1;  // number of send slots shown in the menu at the time it was populated
// _hostIsReturn: true if the device is on a return track, false if on a regular track.
// Affects liveReturnCount (how many sends are available) and sendLetter (label offset).
var _hostIsReturn  = false;
// _hostReturnIdx: index of the host return track in live_set.return_tracks (0-based), -1 if not a return.
// Return track N can only send to return tracks N+1, N+2, … (Live limitation).
// Number of available sends = total_returns - N - 1.
var _hostReturnIdx = -1;

// ---- two controls for the same send (hybrid: large circle + live.dial) ---------
// Both controls REFLECT the selected send level (read from bang) and WRITE to
// it (userval <src> <v> from movement: mouse on circle / MIDI encoder on live.dial
// / parameter automation on live.dial). Guard read<->write (details below in bang).
// READ<->WRITE GUARD for HYBRID (two controls + send):
//   • lastWritten — value JUST written to the send from either control;
//     the next read with the same value (within EPS) is our echo → don't push back.
//   • bigShown / midiShown — last value DISPLAYED on each control.
//     A control is updated from the send ONLY when its currently shown value
//     differs from the send by EPS. This breaks ping-pong between the two knobs:
//     the control that moved the send already has bigShown/midiShown == send → not pushed;
//     the OTHER control diverges → catches up to the send (one pass, no fighting).
var KNOB_EPS       = 0.0009; // difference threshold (send value 0..1; ~1/1024)
var lastWritten    = -1;     // last value written TO the send FROM a control
var bigShown       = -1;     // last value on the LARGE circle (knobset)
var midiShown      = -1;     // last value on the bar live.slider (mididialset)

// ---- MANUAL source (Manual mode) ----------------------------------------
// In Manual, midi_dial numbox (Int 0..127) is the MANUAL modulation source: its value
// is scaled /127 → 0..1 and goes to the output (outlet(0,"max",manualVal) → mm_sig → mapper).
// Send is NOT touched. Large circle ↔ numbox in sync (guard). manualVal is 0..1.
//
// manualVal PERSISTENCE: midi_dial numbox (live.numbox, parameter_enable:1) = Live parameter →
// Live saves/restores its value in .als PER-INSTANCE. On load the
// restored value arrives in JS via userval("midi", v) where v is already 0..1
// (after /127 in the patch). Cached in lastSliderVal, seeds manualVal when entering Manual.
var manualVal      = 0.0;
var lastSliderVal  = -1;     // last midi_dial numbox value (0..1 after /127); -1=not seen yet
var barVisShown    = -1;     // last sent numbox visibility state (0/1; -1=not sent)

// LiveAPI observers (live for the entire lifetime of the device)
var devPathObs     = null; // watches this_device canonical_parent path (device move)
var returnsObs     = null; // watches live_set "return_tracks" (add/del/reorder returns)
var rebuilding     = false; // reentrancy guard for callbacks

var RESYNC_MS      = 500;  // how often bang() cheaply checks the target (anti-race)
var lastResyncAt   = 0;    // timestamp of the last cheap resync

var RESULT_EPS     = 5e-4; // follow result difference threshold (below this — not sent downstream)
var lastResult     = -1;   // last sent value; -1 = "never sent"

// ---- automation guard: protect against "set" into bar parameter on load ----------
// PROBLEM: syncControls() sends `set <v>` to midi_dial (live.slider, parameter_enable:1)
// via outlet 3 → mididialset → prepend set → midi_dial[0].
// In Live 12 even a `set` message (display-only, no object output) to a live.* parameter
// with active automation can raise the automation-override flag → the envelope
// becomes "overridden" (gray/dashed) until "Re-Enable Automation" is pressed.
// SOLUTION: for RESTORE_GATE_MS after init() do NOT send mididialset to midi_dial.
// During this window Live positions the parameter itself from the restored value.
// After the window — normal syncControls operation; parameter under automation — Live
// moves the bar itself, envelope is not disturbed, JS only READS via userval.
var RESTORE_GATE_MS = 800; // ms: covers delay 400 (menu-restore) + 2-3 qmetro 33 ticks
var _restoreUntil  = 0;    // timestamp when restore window ends; 0 = outside window (normal)

// CC-learn removed: ctlin/ccin engine infeasible on audio/return tracks (no MIDI input).

// ---- mapper state (8 slots) -----------------------------------------
var armedSlot      = -1;   // which slot is currently armed (-1 = none; only one at a time)
var slotPath       = [];   // canonical target path for each slot ("" = no target)
var slotRetry      = [];   // path resolve retry counter for each slot
var selParamObs    = null; // observer for live_set view "selected_parameter"
var MAP_RETRY_MS   = 150;  // retry interval for path resolve on cold load
var MAP_RETRY_MAX  = 20;   // max resolve attempts (~3 s) — then silently give up

// ---- multimap slot reset on host track change ---------------------------
// PROBLEM: MapButton saves the visual state of the Map[N] toggle (live.text,
// parameter_type:2) as a Live parameter. When the device is moved or COPIED to
// a DIFFERENT track, live.remote~ loses its target (ID gone), but Map[N] toggles
// remain in the "mapped" state (filled/yellow) — buttons show "mapped" even though
// there is no real target.
// FIX A (move): when canonical_parent changes (= device moved to another track) →
// reset all Map[N] parameters to 0. live.remote~ has already lost its target; Map[N]=0
// returns buttons to "Map me" state.
// FIX B (copy): on Cmd/Alt-drag copy JS restarts from scratch (_hostTrackId=0,
// savedHostIdx=-1). Detect "different track" via persisted track INDEX:
// rebuildMenu() saves the host track index in hidden Live parameter host_track_idx.
// On load init() waits 50ms (restore window), then compares savedHostIdx with
// currentTrackIndex() — mismatch = copy on a different track → reset.
// INVARIANT (same-track reload): savedHostIdx restored (same track) → match
// → no reset. Fresh insert: host_track_idx = -1 (initial) → no saved value
// → no reset (no mappings = no need). Track reorder changes the index —
// this is an edge-case with a false reset; accepted (better to reset than keep orphaned
// slots). TRACK DEVICE ONLY.
var _hostTrackId   = 0;    // Live object ID of host track (runtime; 0 = unknown)
var _mapParamIdxs  = null; // cache: array of parameter indices with shortname="Map" on this_device
var _savedHostIdx  = -1;   // last saved track index (restore via host_track_idx param)
                           // -1 = never saved (fresh insert)
var _slotResetDone = false; // guard: copy-reset happens only once on load

for (var _s = 0; _s < NSLOTS; _s++) {
    slotPath[_s]  = "";
    slotRetry[_s] = 0;
}

// Max calls loadbang() when the patch loads. Init is delegated to the patch chain
// (loadbang → deferlow → delay 400 → "init"), which waits for LiveAPI readiness.
// Do NOT call init() here: the JS object loads BEFORE live.thisdevice (LiveAPI not
// yet initialized) → calling it caused flooding "LiveAPI is not initialized".
function loadbang() {
    /* init deferred via patcher start_delay chain */
}

// Send letter by index, as labeled by Live: 0→A … 25→Z, 26→AA, 27→AB …
function sendLetter(k) {
    k = parseInt(k, 10);
    if (isNaN(k) || k < 0) return "?";
    var s = "";
    k = k + 1;                       // 1-based for bijective base-26
    while (k > 0) {
        var r = (k - 1) % 26;
        s = String.fromCharCode(65 + r) + s;
        k = Math.floor((k - 1) / 26);
    }
    return s;
}

function now() {
    return (new Date()).getTime();
}

function validSlot(n) {
    n = parseInt(n, 10);
    return (n >= 0 && n < NSLOTS) ? n : -1;
}

// Current Live object ID of the host track (0 if not resolved).
function currentHostTrackId() {
    try {
        var parent = new LiveAPI("this_device canonical_parent");
        return (parent && parent.id != 0) ? parseInt(parent.id, 10) : 0;
    } catch (e) { return 0; }
}

// Parse the type and index of the host track from canonical_parent.unquotedpath.
// Returns { isReturn: bool, idx: int } or { isReturn: false, idx: -1 } if not resolved.
// isReturn=true  → device is on a return track (live_set return_tracks N)
// isReturn=false → device is on a regular track (live_set tracks N); idx=-1 = not on a track
function currentHostInfo() {
    try {
        var parent = new LiveAPI("this_device canonical_parent");
        if (!parent || parent.id == 0) return { isReturn: false, idx: -1 };
        var p = parent.unquotedpath;
        if (!p) return { isReturn: false, idx: -1 };
        var m = p.match(/(?:^|\s)return_tracks\s+(\d+)/);
        if (m) return { isReturn: true, idx: parseInt(m[1], 10) };
        m = p.match(/(?:^|\s)tracks\s+(\d+)/);
        if (m) return { isReturn: false, idx: parseInt(m[1], 10) };
        return { isReturn: false, idx: -1 };
    } catch (e) { return { isReturn: false, idx: -1 }; }
}

// Encoded "signed" host track index for storage in host_track_idx (hidden param).
// Collision-free encoding with initial=-1:
//   regular track N → N+1   (>=1)
//   return track N  → -(N+2)  (<=−2; return 0 = -2, return 1 = -3, …)
//   fresh/unknown   → -1
// So -1 unambiguously means "fresh insert", return 0 is encoded as -2.
function currentTrackIndex() {
    var info = currentHostInfo();
    if (info.idx < 0) return -1;
    return info.isReturn ? -(info.idx + 2) : (info.idx + 1);
}

// Reset all Map[N] parameters of the multimap to 0 via LiveAPI.
// Map[N] = live.text toggle (parameter_type:2, shortname "Map") inside MapButton.
// Setting to 0 → button returns to "Map me" state (unfilled/grey).
// live.remote~ has already lost its target (ID gone when track changed).
//
// UNDO-SAFE: all LiveAPI.set() calls execute via Task.execute() — this runs the
// writes OUTSIDE the current Max transaction and does NOT create undo entries in Live.
// (LiveAPI.set() inside a direct callback creates an undo entry; via Task — it does not.)
function resetMultimapSlots() {
    try {
        var dev = new LiveAPI("this_device");
        if (!dev || dev.id == 0) return;
        var n = dev.getcount("parameters");
        // Build/update the cache of Map parameter indices on first call.
        if (!_mapParamIdxs) {
            _mapParamIdxs = [];
            for (var i = 0; i < n; i++) {
                var papi = new LiveAPI("this_device parameters " + i);
                if (!papi || papi.id == 0) continue;
                var nm = papi.get("name");
                if (nm && String(nm[0]) === "Map") {
                    _mapParamIdxs.push(i);
                }
            }
        }
        // Write 0 to each Map parameter via Task (undo-safe).
        var idxs = _mapParamIdxs.slice(); // copy, don't close over cache
        for (var j = 0; j < idxs.length; j++) {
            (function(idx) {
                var t = new Task(function() {
                    try {
                        var mp = new LiveAPI("this_device parameters " + idx);
                        if (mp && mp.id != 0) mp.set("value", 0);
                    } catch (e2) {}
                }, this);
                t.execute();
            })(idxs[j]);
        }
    } catch (e) {}
}

// ---- host track and send detection ---------------------------------

// true if the device is on a REGULAR or RETURN track (both supported).
// false = master track, path not resolved, or other unsupported host.
function detectOnTrack() {
    try {
        var info = currentHostInfo();
        return info.idx >= 0;   // idx=-1 = not resolved / master
    } catch (e) {
        return false;
    }
}

// How many send slots are available for the current host track.
//   Regular track: all return tracks → live_set.getcount("return_tracks")
//   Return track N: only subsequent returns (N+1, N+2, …) → total - N - 1
//   (Live limitation: return track N can only send to return tracks N+1…)
function liveReturnCount() {
    try {
        var liveSet = new LiveAPI("live_set");
        var total = liveSet.getcount("return_tracks");
        if (_hostIsReturn && _hostReturnIdx >= 0) {
            var avail = total - _hostReturnIdx - 1;
            return avail > 0 ? avail : 0;
        }
        return total;
    } catch (e) {
        return -1;
    }
}

// Populate the menu with send slot names (outlet 1 → live.menu: clear + append...).
// Before populating, tell the patch to show the menu (we are on a track); if not on a track —
// hide the menu and return.
//
// Two host types are supported:
//   • Regular track: all return tracks → items A, B, C, …
//   • Return track N: only subsequent return tracks (N+1, N+2, …) → labels
//     correspond to the REAL return track letters in Live:
//     first_available = N+1 → label sendLetter(N+1), etc.
//     Example: return 0 (A-bass) → available B, C, … (sends to tracks B, C).
//             return 1 (B)       → available C, D, …
//
// Menu invariant: item 0 = "Manual", item k+1 (k>=0) = label of the k-th available send.
// selectedSend = k (0-based relative to AVAILABLE sends).
// buildRef() converts to absolute Live API index: on return track N, offset = N+1.
function rebuildMenu() {
    // Update _hostIsReturn / _hostReturnIdx from current host.
    var info = currentHostInfo();
    _hostIsReturn  = info.isReturn;
    _hostReturnIdx = info.isReturn ? info.idx : -1;

    onTrack = (info.idx >= 0);
    if (!onTrack) {
        outlet(1, "menu", "hide");
        returnCountSnap = -1;
        return;
    }
    // Lock the host track ID on first successful track binding.
    // (Used in resync() to detect track change on live-move.)
    if (_hostTrackId === 0) {
        _hostTrackId = currentHostTrackId();
    }
    // Persist encoded track index to hidden Live parameter host_track_idx.
    // Encoding: regular track N → N+1 (>=1); return track N → -(N+2) (<=−2); fresh=-1.
    // Used on load to detect copying to another track.
    var tidx = currentTrackIndex();
    if (tidx !== -1) {
        outlet(1, "host_track_idx", tidx);  // → patch → host_track_idx live.numbox
    }
    outlet(1, "menu", "show");

    // n = number of available send slots for this host type.
    var n = liveReturnCount();
    returnCountSnap = n;
    // SOURCE PERSISTENCE: "clear" on a umenu with a Live parameter may reset the parameter
    // to initial (=1, Send A), which triggers select(1) inside rebuildMenu().
    // Save selectedSend BEFORE clear and restore AFTER the append loop, so that
    // neither a potential parameter reset nor a select() callback overwrites the desired value.
    var savedSel = selectedSend;
    outlet(1, "menu", "clear");
    outlet(1, "menu", "append", "Manual");     // item 0 = Manual (manual source; selectedSend=-1)
    for (var k = 0; k < n; k++) {
        // Label = REAL return track letter of the destination.
        // Regular track:  k → sendLetter(k)  (0→A, 1→B, …)
        // Return track N: k → sendLetter(N+1+k) (mapping shifted by own_idx+1)
        var letterIdx = _hostIsReturn ? (_hostReturnIdx + 1 + k) : k;
        outlet(1, "menu", "append", sendLetter(letterIdx));
    }
    // Restore saved selection (undo any clobber from clear).
    if (n > 0 && savedSel >= n) savedSel = n - 1;  // clamp (return removed)
    selectedSend = savedSel;
    outlet(1, "menu", "set", selectedSend + 1); // menuIndex = selectedSend+1 (None=0)
    buildRef();
}

// ---- building a single reference to the selected send --------------------------------

function buildRef() {
    // Teardown value observer before switching target
    if (sendValueObs) { try { sendValueObs.property = ""; } catch(e) {} sendValueObs = null; }
    sendRef = null;
    lastResult = -1;   // reset gate: don't suppress first emission after target change
    if (!onTrack) return;
    if (selectedSend < 0) return;              // None — no target, control is inert
    // Live API stores sends as a global array (one slot per return track, including
    // unavailable ones). On a return track N, sends[0..N] are disabled (return N
    // cannot send to itself or earlier returns). The first available send is at
    // absolute index N+1. selectedSend is 0-based relative to AVAILABLE sends,
    // so the absolute index must be offset by _hostReturnIdx+1 when on a return track.
    var absoluteSendIdx = (_hostIsReturn && _hostReturnIdx >= 0)
        ? (_hostReturnIdx + 1 + selectedSend)
        : selectedSend;
    var path = "this_device canonical_parent mixer_device sends " + absoluteSendIdx;
    try {
        var api = new LiveAPI(path);
        if (api && api.id != 0) {
            sendRef = api;
            // Install push-observer on value (replaces polling in bang())
            sendValueObs = new LiveAPI(onSendValueChange, api.unquotedpath);
            sendValueObs.property = "value";
        }
    } catch (e) {
        sendRef = null;
    }
}

function onSendValueChange(args) {
    if (_restoreUntil > 0 && now() < _restoreUntil) return; // silent during restore window
    if (!sendRef || sendRef.id == 0) return;
    var val = 0.0;
    // args can arrive as a number or array depending on Max version
    if (args !== undefined && args !== null) {
        var raw = Array.isArray(args) ? parseFloat(args[args.length - 1]) : parseFloat(args);
        if (!isNaN(raw)) val = Math.min(1.0, Math.max(0.0, raw));
    }
    if (Math.abs(val - lastResult) > RESULT_EPS) {
        lastResult = val;
        outlet(0, "max", val);
    }
    syncControls(val);
}

// Cheap sync: rebuild menu/ref when host status or return count changes.
// Protected against reentrancy.
// Also detects host track change (canonical_parent moved to another track)
// and resets Map[N] multimap slots to "Map me" before rebuilding.
function resync(force) {
    if (rebuilding) return;
    rebuilding = true;
    try {
        var nowOnTrack = detectOnTrack();
        var count      = liveReturnCount();
        // !sendRef counts as "changed" ONLY when a real target is selected
        // (selectedSend>=0): in None sendRef is always null — that is normal, not a trigger.
        var missingRef = (selectedSend >= 0 && !sendRef);
        var changed = (nowOnTrack !== onTrack) || (count !== returnCountSnap) || missingRef;

        // Detect host track change: compare current ID with cached one.
        // Reset only when _hostTrackId was already set (!=0) and changed.
        // Same-track reload: JS reinitializes from scratch, _hostTrackId=0 → first
        // resync (force=true from init) → rebuildMenu writes ID → cache filled.
        // Drag to ANOTHER track: device does not restart, _hostTrackId is set →
        // canonical_parent changes → IDs differ → reset Map slots.
        if (nowOnTrack && _hostTrackId !== 0) {
            var newId = currentHostTrackId();
            if (newId !== 0 && newId !== _hostTrackId) {
                // Moved to another track: live.remote~ already lost targets,
                // Map[N] toggles remained filled → reset to "Map me".
                _hostTrackId   = newId;   // update immediately to avoid double reset
                _mapParamIdxs  = null;    // invalidate index cache
                _slotResetDone = true;    // guard: copy-detect in init() Task will skip reset
                resetMultimapSlots();
                changed = true;           // menu rebuild is mandatory
            }
        }

        if (force || changed) {
            rebuildMenu();
        }
    } catch (e) {
        // don't crash the device due to a transient LiveAPI race
    } finally {
        rebuilding = false;
    }
}

// ---- LiveAPI observers ---------------------------------------------------

function onLiveChange(args) {
    if (args && args[0] === "id") return; // initialization id-notification
    resync(false);
}

function installObservers() {
    // Device path: catches the device being moved to another track/return.
    try {
        if (devPathObs) { devPathObs.property = ""; devPathObs = null; }
        devPathObs = new LiveAPI(onLiveChange, "this_device canonical_parent");
        devPathObs.property = "name";
    } catch (e) {}

    // Return track list: add/del/reorder/rename changes the send menu.
    try {
        if (returnsObs) { returnsObs.property = ""; returnsObs = null; }
        returnsObs = new LiveAPI(onLiveChange, "live_set");
        returnsObs.property = "return_tracks";
    } catch (e) {}
}

// ---- initialization on load --------------------------------------------

// "hosttrackidx <k>" from the patch on load — Live restored the host_track_idx parameter.
// Cache the saved index for copy-detection in init().
function hosttrackidx(k) {
    _savedHostIdx = parseInt(k, 10);
    if (isNaN(_savedHostIdx)) _savedHostIdx = -1;
}

// "init" from the patch (loadbang/live.thisdevice → deferlow → delay → init).
// Reliable kick NOT tied to the return-detect chain: installs observers,
// populates menu (None + letters), and rebuilds ref.
// IMPORTANT: do NOT force selection here. Default selectedSend=None (fresh insert). If
// umenu parameter restored saved selection (select() already ran on load),
// selectedSend holds it — init does NOT overwrite it (persist is kept).
// After this qmetro triggers bang() for polling.
function init() {
    _restoreUntil = now() + RESTORE_GATE_MS;    // open restore window: don't write to midi_dial during this period
    installObservers();
    if (!selParamObs) installSelParamObserver();
    rebuildMenu();                              // clear + append None+letters + show/hide + set + buildRef
    barVisShown = -1;                           // force re-emit of bar visibility on load
    updateBarVis();                             // None → show bar+label; A/B/C/D → hide

    // Copy-to-new-track detection: 200ms after init (when Live has restored
    // host_track_idx and hosttrackidx() has already been called) — compare saved
    // index with current. Mismatch = device copied/moved to another track.
    // Delay 200ms covers restore order (host_track_idx arrives before init-kick
    // in normal restore, but the task gives extra margin).
    // _slotResetDone guard: don't reset twice (move-detect in resync() may fire
    // earlier on drag — reset already done, skip copy-detect).
    if (!_slotResetDone) {
        var t = new Task(function() {
            if (_slotResetDone) return;
            // _savedHostIdx encoding: -1 = fresh insert (no reset);
            // regular track N → N+1 (>=1); return track N → -(N+2) (<=−2).
            // -1 means exclusively "never saved" (return 0 is encoded as -2).
            if (_savedHostIdx === -1) return;
            var cur = currentTrackIndex();
            // cur !== -1 = host known; cur !== _savedHostIdx = moved
            if (cur !== -1 && cur !== _savedHostIdx) {
                _slotResetDone = true;
                _mapParamIdxs  = null;
                resetMultimapSlots();
            }
        }, this);
        t.schedule(200);
    }
}

// ---- messages from the patch: send selection -------------------------------------

// "select <menuIndex>" from the patch (umenu selection) — menuIndex 0 = None, i>=1 = send (i-1).
function select(menuIndex) {
    if (menuIndex === undefined || menuIndex === null) return;
    var mi = parseInt(menuIndex, 10);
    if (isNaN(mi) || mi < 0) return;
    // Note: boot-redirect Manual→A in the load window was removed.
    // It was clobbering SAVED Manual on reload (couldn't distinguish "fresh insert" from "restore saved Manual").
    // Fresh insert defaults to Send A via the send_menu parameter itself
    // (parameter_initial:[1] + parameter_initial_enable:1 = umenu outputs index 1 on
    // first load without a saved value). Saved Manual now survives.
    var prevSel = selectedSend;   // where we are coming from
    var newSel  = mi - 1;         // 0(None)→-1, 1→A(0), 2→B(1)…
    // Entering Manual (None): seed manualVal so the output lands WHERE IT SHOULD,
    // without a jump to 0:
    //   • from a real send (user switched A/B/C/D→Manual): take the current
    //     send value — the parameter stays where it was (sendRef still on OLD target,
    //     read before buildRef());
    //   • on LOAD (restoring saved Manual): no send (prevSel also Manual or
    //     not ready yet) — take the PERSISTED bar value (lastSliderVal),
    //     which Live already restored and which arrived in JS before menu-restore.
    if (newSel < 0) {
        if (prevSel >= 0 && sendRef && sendRef.id != 0) {
            try { manualVal = clamp01(parseFloat(sendRef.get("value"))); } catch (e) {}
        } else if (lastSliderVal >= 0) {
            manualVal = clamp01(lastSliderVal);   // restore: manual value = persisted bar
        }
    }
    selectedSend = newSel;        // 0(None)→-1, 1→A(0), 2→B(1)…
    buildRef();                   // None → sendRef=null (manual source)
    // Selection changed — force resync of BOTH controls to the new target value:
    // reset guard/last-shown so the NEXT bang immediately sets them.
    lastWritten = -1;
    bigShown    = -1;
    midiShown   = -1;
    updateBarVis();               // None → show bar+label; A/B/C/D → hide
}

// Visibility of "for MIDI map" bar + label: visible ONLY in None (manual source).
// outlet(1,"barvis",0/1) → patch (route barvis → script show/hide). Send on change.
function updateBarVis() {
    var vis = (selectedSend < 0) ? 1 : 0;
    if (vis !== barVisShown) {
        barVisShown = vis;
        outlet(1, "barvis", vis);
    }
}

// "restoreidx <k>" from the patch on load — restore selection from parameter.
function restoreidx(k) {
    select(k);
}

// ---- writing to send from the MAIN control ---------------------------------------
// "userval <v>" from the patch: control was moved (mouse / mapped HW encoder or
// fader / parameter automation). Write 1:1 to the selected send.
// Scale: live.dial is configured 0..1 linear == send value range (0..1),
// so no scaling needed — only clamp.
function clamp01(x) {
    if (x < 0) return 0.0;
    if (x > 1) return 1.0;
    return x;
}

// "userval <src> <v>" from the patch — control <src> ("big"|"midi") was moved.
//   • A/B/C/D: write 1:1 to the selected send (as before).
//   • None: do NOT write to send — update MANUAL source manualVal (it goes to output).
// Source is already at val → mark its *Shown=val (don't push back to it);
// the OTHER control will catch up on the next bang().
// Scale: both controls 0..1 == range 0..1 (send or manual), no scaling needed.
function userval(src, v) {
    // backward compatibility: if one argument arrived (old "userval <v>"),
    // treat as big (but the patch now always sends src).
    if (v === undefined) { v = src; src = "big"; }
    if (v === undefined || v === null) return;
    var val = parseFloat(v);
    if (isNaN(val)) return;
    val = clamp01(val);

    // source is already at val — mark its *Shown (don't push back)
    if (src === "midi") {
        midiShown     = val;
        lastSliderVal = val;   // CACHE numbox value: needed to seed manualVal on restore
    } else {
        bigShown  = val;
    }

    if (selectedSend < 0) {
        // None — MANUAL source: update manualVal, do NOT touch send.
        manualVal = val;
        return;                                // output will emit on next bang() (mm_sig → mapper)
    }

    if (!sendRef || sendRef.id == 0) return;   // not on track / not ready yet
    lastWritten = val;                         // guard: next read of this value won't push back
    try {
        sendRef.set("value", val);
    } catch (e) {}
}

// ---- mapper: arm, target capture, persist, unmap (per slot) ------------------
// (ported 1:1 from return version — independent of the follow value source)

function installSelParamObserver() {
    try {
        if (selParamObs) { selParamObs.property = ""; selParamObs = null; }
        selParamObs = new LiveAPI(onSelParamChange, "live_set view");
        selParamObs.property = "selected_parameter";
    } catch (e) {}
}

function onSelParamChange(args) {
    if (armedSlot < 0) return;
    if (args && args[0] === "id" && (args[1] === 0 || args[1] === "0")) return;
    try {
        var sel = new LiveAPI("live_set view selected_parameter");
        if (!sel || sel.id == 0) return;
        var path = sel.unquotedpath;
        if (!path) return;
        captureTarget(armedSlot, path);
    } catch (e) {}
}

function captureTarget(slot, path) {
    slot = validSlot(slot);
    if (slot < 0) return;
    slotPath[slot]  = path;
    armedSlot       = -1;
    persistPath(slot, path);
    outlet(1, slot, "arm", 0);
    emitTargetName(slot, path);
    slotRetry[slot] = 0;
    resolveAndConnect(slot);
}

function resolveAndConnect(slot) {
    slot = validSlot(slot);
    if (slot < 0 || !slotPath[slot]) return;
    var parts = slotPath[slot].split(" ");
    var msg = [slot, "path"];
    for (var i = 0; i < parts.length; i++) msg.push(parts[i]);
    outlet(1, msg);
}

function restorepath() {
    if (arguments.length === 0) return;
    var slot = validSlot(arguments[0]);
    if (slot < 0) return;
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
            resolveAndConnect(slot);
            return;
        }
    } catch (e) {}
    if (slotRetry[slot] < MAP_RETRY_MAX) {
        slotRetry[slot]++;
        var task = new Task(retryResolve, this, slot);
        task.schedule(MAP_RETRY_MS);
    }
}

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

function shortPath(path) {
    var p = path.replace(/^live_set\s*/, "");
    if (p.length > 24) p = p.substring(p.length - 24);
    return p;
}

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
    if (msg.length === 2) msg.push("none");
    outlet(1, msg);
}

// "targetmap <slot> <id>" from the patch (multimap_panel out1 → prepend targetmap → JS)
// Called when Map[N] button is clicked in the multimap panel.
// slot = slot number (0-7), id = live-object id (unused in Track, but matches Return protocol).
// Sets armedSlot, starts selParamObserver → next Live parameter click
// → onSelParamChange → captureTarget → persist (slotPath + live.numbox).
function targetmap(slot, id) {
    slot = validSlot(slot);
    if (slot < 0) return;
    // Disarm previous slot if any
    if (armedSlot >= 0 && armedSlot !== slot) {
        outlet(1, armedSlot, "arm", 0);
    }
    armedSlot = slot;
    if (!selParamObs) installSelParamObserver();
    outlet(1, slot, "arm", 1);    // echo-confirmation to slot
}


function arm(slot, a) {
    slot = validSlot(slot);
    if (slot < 0) return;
    var v = (parseInt(a, 10) === 1) ? 1 : 0;
    if (v) {
        if (armedSlot >= 0 && armedSlot !== slot) {
            outlet(1, armedSlot, "arm", 0);
        }
        armedSlot = slot;
        if (!selParamObs) installSelParamObserver();
    } else {
        if (armedSlot === slot) armedSlot = -1;
    }
    outlet(1, slot, "arm", v);
}

function unmap(slot) {
    slot = validSlot(slot);
    if (slot < 0) return;
    if (armedSlot === slot) armedSlot = -1;
    slotPath[slot]  = "";
    slotRetry[slot] = 0;
    persistPath(slot, "");
    outlet(1, slot, "release");
    outlet(1, slot, "arm", 0);
    outlet(1, slot, "name", "—");
}

// ---- value polling ---------------------------------------------------------

// Bang from qmetro — read selected send + cheap periodic target check.
function bang() {
    var t = now();
    // Resync: in None the ABSENCE of sendRef is NORMAL (not a reason to trigger rebuild
    // every tick). Force-resync on !sendRef only when a REAL target is selected
    // (selectedSend>=0). Periodic cheap resync (RESYNC_MS) runs always —
    // catches add/del of return tracks and also runs in None (menu will be rebuilt).
    var needResync = ((selectedSend >= 0 && !sendRef) || (t - lastResyncAt) >= RESYNC_MS);
    if (needResync) {
        lastResyncAt = t;
        if (!devPathObs && !returnsObs) {
            installObservers();
        }
        if (!selParamObs) {
            installSelParamObserver();
        }
        resync(false);
    }

    // === None — MANUAL source: output = manualVal, both controls <-> manualVal ===
    // Send is NOT read/written. Output (mm_sig→mapper) drives the manual value.
    if (selectedSend < 0) {
        // Change-gate: send only on actual change of the manual value.
        if (Math.abs(manualVal - lastResult) > RESULT_EPS) {
            lastResult = manualVal;
            outlet(0, "max", manualVal);
        }
        syncControls(manualVal);
        return;
    }


    // === A/B/C/D — value arrives via onSendValueChange observer (push) ===
    // bang() no longer reads sendRef.get("value") — only ensures N/A when
    // no target and stays silent during the restore window.
    if (!sendRef || sendRef.id == 0) {
        if (_restoreUntil > 0 && now() < _restoreUntil) return;
        outlet(0, "max", 0.0);
    }
}

// Bring BOTH controls (large circle + bar) to target with read<->write guard.
// Echo-guard: read ~= lastWritten = our write echo → clear guard. Then EACH
// control is updated INDEPENDENTLY, only when its shown value differs from target
// by EPS: the source control is already at target (not pushed), the OTHER catches up
// (breaks ping-pong); external change (mixer/MIDI) diverges both → both move. Works
// the same in both modes (target = send value OR manualVal).
function syncControls(target) {
    if (lastWritten >= 0 && Math.abs(target - lastWritten) <= KNOB_EPS) {
        lastWritten = -1;             // echo absorbed, clear guard
    }
    if (Math.abs(target - bigShown) > KNOB_EPS) {
        bigShown = target;
        outlet(2, "knobset", target);     // → LARGE circle (prepend set, silent); parameter_enable:0 — not automatable, safe to write
    }
    // AUTOMATION GUARD: in restore window do NOT send set to midi_dial (live.slider,
    // parameter_enable:1). If the parameter has automation, even a display-set
    // in Live 12 can raise the override flag. Live positions the bar from .als itself.
    // After the window — normal operation: update midiShown so the first post-gate
    // bang does not fire unnecessarily.
    if (_restoreUntil > 0 && now() < _restoreUntil) {
        // restore window: sync midiShown to target without writing to the parameter;
        // when window ends, midiShown will already be correct → no spurious set.
        midiShown = target;
        return;
    }
    _restoreUntil = 0;                         // window closed — clear marker
    if (Math.abs(target - midiShown) > KNOB_EPS) {
        midiShown = target;
        outlet(3, "mididialset", target); // → bar live.slider (set, silent)
    }
}

// ---- AUTO-MAPPING (TIdx/DIdx/PIdx/MapAll) ----------------------------------
// Device parameters (Track version):
//   [1..8]  Max[slot0..7]  — from multimap TargetMax
//   [9..16] Min[slot0..7]  — from multimap TargetMin
//   [19..26] DI1-DI8
//   [27]    MapAll
//   [28..35] PI1-PI8
//   [36..43] TI1-TI8
//
// TIdx: regular track = 0-based; Return A=-1, B=-2, C=-3, D=-4.

var SF_TRACK_DI_START  = 1;
var SF_TRACK_MAPALL    = 9;
var SF_TRACK_PI_START  = 10;
var SF_TRACK_TI_START  = 18;
var SF_TRACK_MAX_START = 26;
var SF_TRACK_MIN_START = 34;

function slotPathFromIdx(slot) {
    var devPath = "";
    try {
        var dapi = new LiveAPI("this_device");
        if (!dapi || dapi.id == 0) return "";
        devPath = dapi.unquotedpath;
    } catch(e) { return ""; }

    var tidx = 0, didx = 0, pidx = 0;
    try {
        var pt = new LiveAPI(devPath + " parameters " + (SF_TRACK_TI_START + slot));
        tidx = (pt && pt.id != 0) ? Math.round(pt.get("value")[0]) : 0;
    } catch(e) {}
    try {
        var pd = new LiveAPI(devPath + " parameters " + (SF_TRACK_DI_START + slot));
        didx = (pd && pd.id != 0) ? Math.round(pd.get("value")[0]) : 0;
    } catch(e) {}
    try {
        var pp = new LiveAPI(devPath + " parameters " + (SF_TRACK_PI_START + slot));
        pidx = (pp && pp.id != 0) ? Math.round(pp.get("value")[0]) : 0;
    } catch(e) {}

    if (tidx < 0) {
        var retIdx = -(tidx + 1);
        return "live_set return_tracks " + retIdx + " devices " + didx + " parameters " + pidx;
    } else {
        return "live_set tracks " + tidx + " devices " + didx + " parameters " + pidx;
    }
}

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
            var pm = new LiveAPI(devPath + " parameters " + (SF_TRACK_MAX_START + s));
            maxV[s] = (pm && pm.id != 0) ? pm.get("value")[0] : 100;
        } catch(e) { maxV[s] = 100; }
        try {
            var pn = new LiveAPI(devPath + " parameters " + (SF_TRACK_MIN_START + s));
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

// "mapall" — trigger from sf_mapall live.text (via patch).
// Reads TIdx/DIdx/PIdx for each slot, builds path, resolves Live-object-id,
// sends id via outlet 4 → multimap_panel in1 → mm_ididin → live.remote~
// (same mechanism as in the Return version).
function mapall() {
    post("[SF-Track] mapall START\n");
    var mmBox = null, mmSub = null;
    try {
        mmBox = _sfPatcher.getnamed("multimap_panel");
        if (mmBox) mmSub = mmBox.subpatcher();
    } catch(e) { post("[SF-Track] mmBox ERROR: " + e + "\n"); }
    post("[SF-Track] mmSub=" + (mmSub ? "OK" : "NULL") + "\n");

    for (var s = 0; s < NSLOTS; s++) {
        var path = slotPathFromIdx(s);
        if (!path) { post("[SF-Track] slot" + s + " path EMPTY\n"); continue; }
        var id = 0;
        try {
            var api = new LiveAPI(path);
            if (api && api.id != 0) id = parseInt(api.id, 10);
        } catch(e) { id = 0; }
        if (!id) { post("[SF-Track] slot" + s + " id=0 path=" + path + "\n"); continue; }
        post("[SF-Track] slot" + s + " id=" + id + "\n");
        slotPath[s] = path;

        if (mmSub) {
            try {
                var bp = mmSub.getnamed("bpslot" + s);
                var slotSub = bp ? bp.subpatcher() : null;
                var mmsg = slotSub ? slotSub.getnamed("mb_map_id") : null;
                post("[SF-Track] slot" + s + " bp=" + (bp?"OK":"NULL") + " slotSub=" + (slotSub?"OK":"NULL") + " mmsg=" + (mmsg?"OK":"NULL") + "\n");
                if (mmsg) mmsg.message(id);
            } catch(e) { post("[SF-Track] slot" + s + " NAV ERROR: " + e + "\n"); }
        }

        emitTargetName(s, path);
    }
    applySlotRanges();
}
