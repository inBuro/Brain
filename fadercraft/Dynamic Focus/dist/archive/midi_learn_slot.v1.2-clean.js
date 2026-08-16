// midi_learn_slot.js — MIDI Learn controller for one slot, GATED by Track Focus,
// with Value Scaling takeover so switching tracks never jumps the value.
//
// Each instance routes the learned controller CC to its hidden live.dial ONLY while
// its own host track is the selected track (Focus mode), or always (Absolute mode).
//
// Inlets:
//   0 — bang from live.thisdevice (init)
//   1 — bang/int from the CC button — toggles learn: idle→arm · arming→cancel · mapped→unmap
//   2 — CC input list: value, cc, channel
//   3 — restore learnedCC from live.numbox lnb_cc (int, stored as CC+1)
//   4 — restore learnedChannel from live.numbox lnb_ch (int)
//   5 — current parameter value (0.–1.) fed back from live.dial  ← pickup reference
//   6 — (reserved) takeover mode: hardcoded 2=Value Scaling, bus removed
//   7 — colour mode toggle (mode_icon param value): 0=STANDARD · 1=FOLLOW
//   8 — mapping mode (mode_abs param value): 0=Focus · 1=Lock
//   9 — target parameter id from MapButtonTint outlet 1 (mb_idout) or lnb_tgt restore
//  10 — slot name text from textedit pg_name_edit (user input; update only, no plain echo)
//  11 — X button click on panel slot 8 (bpslot7) → unmap main Map button
//
// Outlets:
//   0 — normalized value (0.–1.) to live.dial
//   1 — learnedCC (+1) → prepend set → lnb_cc
//   2 — learnedChannel   → prepend set → lnb_ch
//   3 — status string to CC button ("Map CC" / "CC 13")
//   4 — arming flag (1=waiting for CC) → blinks CC button
//   5 — colour [r g b a] → visible dial needlecolor
//   6 — colour [r g b a] → CC button tint
//   7 — packed 9-float → map-component tint [fill rgb | accent rgb | text rgb]
//   8 — colour mode int (0=FOLLOW, 1=STANDARD) → component mode inlets + device gate
//   9 — bullet indicator int (1=show host≠target, 0=hide) → blt_dot
//  10 — mode_abs tint: [r g b 1.0]=Follow track colour; "standard"=reset to amber
//  11 — slot name text for textedit restore (→ fromsymbol → prepend set → textedit)

inlets = 12;
outlets = 13;
autowatch = 1;
// v1.1-dev -- slot-8/main-Map visual mirror; it_dgc2 blink fix; X button on bpslot7.
// v15 -- unmap() race fix: cancel _rebindTask + clear _pendingRebindId before TgtId=0 write.
// v16 -- arm-state guard in _s7kaFn + _updateMapBtnVisibility: skip amber paint when slot
//         live.text == 1 (armed), so native blink shows when user re-arms a mapped slot.
// v17 -- CcControlDevice byname guards (now in v18). Diagnostic markers removed in v1.2 clean build.
// v18 -- CcControlDevice guard: _captureByNameFromId/_captureSlotBn abort if devName==="0"
//         (invalid device, e.g. control surface script) to prevent byname data corruption.
//         Per-iteration try-catch in device-name loops so non-fatal Live warnings don't break flow.
//         Same guard in _resolvePanelSlotsOnHostTrack loop.
// v19 -- Stale-notification guard in _doRebind(): verify TgtId current value === rid before
//         outlet(12). Fixes autonomous rebind after unmap when Live delivers a late
//         tgtIdObserver notification (Task(0) created after unmap() cancellation window).
// v20 -- lnb_tgt stored-value sync in unmap(): send "set 0" to lnb_tgt (varname added to AMXD)
//         so its stored value matches the cleared TgtId DevParam. Prevents potential write-through
//         push-back if Max reconciles live.numbox stored value with the Live parameter.
//         Investigation: _doRebind fires before onTargetId (TgtId set externally, not via JS) →
//         hypothesis: "set X" to lnb_tgt (via ps_tgt) writes through to TgtId without firing outlet.
//         Confirmed: stale stored value IS real after unmap; write-through plausible (unconfirmed by docs).
post("S7-PROD-v1.2 LOADED\n");

// ── Colour source ──────────────────────────────────────────────────────
var MODE_FOLLOW = 0, MODE_STANDARD = 1;
var colorMode = MODE_STANDARD;

// ── Mapping mode ───────────────────────────────────────────────────────
var absoluteMode = false;

var arming = false;
var learnedCC = -1;
var learnedChannel = -1;

// ── Track Focus state ─────────────────────────────────────────────────
var hostTrack = null;
var selObserver = null;
var colorObserver = null;
var dialParam = null;
var hostId = -1;
var active = 0;

// _lastSentDialValue: tracks the most recent value sent via outlet(0) → live.dial.
// Used to suppress _dialObserver echo: when our own write causes the "Slot 1" param to fire
// an observer notification, the callback would redundantly update currentVal with the same value.
// At 50+ CC/sec during fast rotation, these echo callbacks add scheduling overhead and can
// cause a race in Pickup mode (currentVal overwritten between routeCC calls).
// Suppression: if observer value matches what we last sent (within float epsilon), skip update.
// External changes (automation, preset restore) have different values → still processed.
var _lastSentDialValue = -1;

// ── Push-based observers (event-driven, replaces per-switch polling) ──
// _dialObserver: keeps currentVal always fresh; onSelectedTrack needs 0 IPC to read dial.
// _parentObserver: fires if device dragged to different track (canonical_parent is uncertain
//   in LOM notify support — rate-limited poll in checkParentMove() is the reliable fallback).
// _lastParentCheck: timestamp of last checkParentMove IPC; rate-limited to PARENT_CHECK_INTERVAL_MS.
var _dialObserver = null;
var _parentObserver = null;
var _lastParentCheck = 0;
var PARENT_CHECK_INTERVAL_MS = 0;      // no rate limit: bang() never fires on drag in Live 12; 1 IPC per track click

// ── Absolute mode: target track ───────────────────────────────────────
var targetParamId = -1;
var targetTrackId = -1;
var targetTrack = null;
var targetColorObserver = null;
var tgtIdParam = null;    // cached LiveAPI for TgtId DeviceParameter (write via API)
var tgtIdObserver = null; // LiveAPI observer on TgtId value — fires on preset restore too
var ccParamId = -1;       // cached pid for "CC" DeviceParameter
var chParamId = -1;       // cached pid for "Ch" DeviceParameter
var ccObserver = null;    // LiveAPI observer on CC value
var chObserver = null;    // LiveAPI observer on Ch value

// ── Cached LiveAPI for this_device ───────────────────────────────────
// new LiveAPI(null, "this_device") resolves the path via IPC on every construction.
// The device never changes during its lifetime — cache it and reset only on bang() reload.
// Saves 1 IPC per checkParentMove() call (= 1 IPC × N mapped instances × every track switch).
var _thisDeviceApi = null;
function _getThisDevice() {
    if (!_thisDeviceApi) _thisDeviceApi = new LiveAPI(null, "this_device");
    return _thisDeviceApi;
}
_getThisDevice.local = 1;

// ── Deferred rebind (Task-based, exits notification context) ──────────
// outlet(12) calls into live.remote~ inside MapButtonTint. Live forbids
// changing live.remote~ id from within a LiveAPI notification callback.
// Solution: schedule Task(0) — runs in next event cycle, outside notification.
// _initialized is set by bang() (= live.thisdevice signal), NOT by a fixed delay.
// Retry: live.remote~ may still not be ready even right after bang(); retry up to 5×300ms.
var _initialized    = false; // set TRUE in bang() — the real live.thisdevice signal
var _pendingRebindId = 0;    // global capture for Task closure (ES3-safe)
var _rebindTask     = null;  // Task handle for cancellation / retry
var _rebindAttempts = 0;     // retry counter (reset when a new target id is set)
// _lastWrittenTgtId: tracks what we last wrote to TgtId DeviceParameter.
// Prevents double-trigger loop: onTargetId(id) → tgtIdParam.set → observer → Task(0) →
// outlet(12) → MapButtonTint → mb_idout fires id AGAIN → onTargetId(id) → same value →
// skip write → no observer fire → loop ends. Prevents Map button double-blink.
var _lastWrittenTgtId = -1;  // -1 = never written; reset in bang(); 0 = after unmap()

// ── Takeover state ────────────────────────────────────────────────────
var takeoverMode = 2;    // Value Scaling: converges from any direction
var currentVal = 0.0;
var engaged = false;
var lastIncoming = -1;
var anchorC = -1;
var anchorP = 0.0;
var PICKUP_EPS = 0.02;

// ── Slot name (persistent via live.numbox char-code params, Mapping Deck pattern) ─
// CC / channel / targetParamId: lnb_cc / lnb_ch / lnb_tgt (Stored Only numboxes).
// Label text: lnb_t0..lnb_t5 — 6 Stored Only numboxes, 2 Unicode chars each (11-bit).
//   Codec: v = c0 + c1*CHAR_BASE  where CHAR_BASE=2048 (2^11), covers U+0000..U+07FF.
//   Sentinel: c0=0 = end of string. Max value per chunk = 2047+2047*2048 = 4194303 < mmax=4194304.
//   Supports: ASCII + Latin Extended + Cyrillic (U+0400..U+04FF). Chars >U+07FF → '?'(63).
// Restore path: observer on lnb_t0 + 500ms fallback timer → restoreLabel()
// Push path: text/msg_symbol/list → schedulePushLabel() → 400ms Task → LiveAPI.set
// _restoring: true while restoreLabel() is running — blocks schedulePushLabel() to
//   break echo loop (restore → _applyLabel → outlet(11) → textedit → text() → push).
var slotName = "";
// Hard limit: 10 chars — Ableton Sans 16pt, codec capacity 12 (6 chunks × 2 chars). Display fits in 99px presentation_rect W.
var MAX_LABEL_LEN = 10;             // display limit: 16pt fits 10 chars in 99px presentation_rect
var CHARS_PER_CHUNK = 2;            // 11-bit codec: 2 chars per numbox
var CHAR_BASE = 2048;               // 2^11 — base for packing; covers U+0000..U+07FF
var LABEL_CHUNKS = 6;               // 6 × 2 chars = 12 char max label
var LABEL_PARAM_PREFIX = "lbl_chunk_";
var _labelPids = null;              // [LABEL_CHUNKS] pids; null until _buildLabelPids()
var _restoreDone = false;
var _restoring = false;             // echo-loop guard (Mapping Deck pattern)
// _echoing removed: "set" to textedit never triggers outlet, so re-entrance cannot happen.
var _restoreObs  = null;
var _restoreTask = null;
var _pushLabelTask = null;
var _pendingPushName = "";          // global capture for Task closure (Max JS ES3 safe)
var _userStartedTyping = false;     // set on first inlet-10 input; blocks late restore from overwriting user input

// ── Byname persistence (device name + param index + occurrence) ──────────
// Stored in lnb_dn_0..6 (ASCII 3-char/chunk) + lnb_tpi (packed paramIdx+devOcc).
// Survives Cmd+D and cross-project transfer where runtime TgtId is stale.
// On init: if storedTgtId exists in session → use it; else resolve by name on host track.
var _tgtDevName      = null;  // device name captured at map time
var _tgtParamIdx     = -1;    // parameter index within that device
var _tgtDevOcc       = 0;     // device occurrence (0 = first same-named device on track)
var DN_CHUNKS        = 7;     // 7 × 3 ASCII chars = 21 chars max device name
var DN_BASE          = 128;   // ASCII-safe encoding base
var _dnPids          = null;  // [7] pids for DevNm0..DevNm6 live.numbox
var _tpiPid          = -1;    // pid for TgtPI live.numbox
var _pendingCaptureId = 0;    // global for Task closure safety (ES3)

// ── Panel byname persistence (8 slots in multimapDF) ─────────────────────
// Each slot stores devName (7 DN chunks × 3 ASCII chars) + paramIdx+devOcc (1 TPI box).
// Numbox shortnames: PnDnSC (S=slot 0-7, C=chunk 0-6) and PnTpiS (S=slot 0-7).
// 64 new live.numbox boxes added to AMXD (8 slots × 8 boxes each).
var _pBnPids        = null;   // array[8] of {dn:[pid*7], tpi:pid} — null until _findPanelBnParams()
var _pendingPanelSi = 0;      // ES3-safe globals for Task closures in panelmap()
var _pendingPanelId = 0;
var PANEL_SLOTS     = 8;
var _panelPrevTgts  = [-1,-1,-1,-1,-1,-1,-1,-1];  // previous mm_tgt_N values (change detection)

// ── Slot-7 mirror keep-alive (FOLLOW mode) ────────────────────────────────
// In FOLLOW mode, MapButtonTint state machine (it_dg always OPEN) can apply
// dark colors to bpslot7 when it_state re-evaluates (e.g., arm_metro tick or
// exclusiveArm chain). JS must continuously re-assert amber while mirror active.
// Keep-alive fires every 100ms — faster than 200ms blink metro → dark < 100ms.
var _s7mirrorId = 0;     // non-zero while main-Map mirror is active
var _s7kaTask   = null;  // Task handle

// ── Duplicate detection (Cmd+D guard) ────────────────────────────────────
// Two-phase check to distinguish Cmd+D from normal .als load:
//   Phase 1: Does stored target param id exist in this Live session?
//     - .als load (new session): Live assigns new runtime ids → old id not found → id=0 → NOT duplicate.
//     - Cmd+D (same session): original device's param still lives → found → proceed to Phase 2.
//   Phase 2: Does device slot (track_index*1000 + device_index) differ from stored slot?
//     - ORIGINAL: slot unchanged → matches stored → NOT duplicate → keep mapping.
//     - DUPLICATE: slot changed (new track position) → reset to cold state.
// lnb_dev_slot: Stored Only Float param (mmax=1000000), written at each successful init.
var _devSlotParamId = -1;  // cached pid for DevSlot DeviceParameter

// ── Internal: push label to textedit ─────────────────────────────────
// PRIMARY: this.patcher.getnamed("pg_name_edit").message("set", name)
//   Synchronous — fires in current Max event, before next user keystroke.
//   No deferlow window → char after limit is clamped and rejected without flashing.
//   Max "set" to textedit does NOT trigger text() outlet — no re-entrance.
// FALLBACK: outlet(11) → fromsymbol → deferlow → thispatcher "set" chain.
//   Activates if patcher API unavailable (shouldn't happen in M4L runtime).
// Truncates at MAX_LABEL_LEN — covers both live input AND restore-from-codec paths.
// Strips newlines/carriage returns (second barrier; primary = textedit keymode 1).
function _applyLabel(name) {
    name = name.replace(/[\n\r]/g, "");
    if (name.length > MAX_LABEL_LEN) name = name.slice(0, MAX_LABEL_LEN);
    slotName = name;
    try {
        var b = this.patcher.getnamed("pg_name_edit");
        if (b) {
            // Split on spaces: pass each word as a separate atom.
            // b.message("set", "Hello World") → Max quotes it → textedit shows "Hello World"
            // b.message.apply(["set","Hello","World"]) → set Hello World → no quotes.
            b.message.apply(b, ["set"].concat(name.split(" ")));
            return;
        }
    } catch(e) {}
    outlet(11, name);  // fallback: async via fromsymbol → deferlow
}
_applyLabel.local = 1;

// ── Numbox codec: 11-bit Unicode, 2 chars per chunk ──────────────────────────
// Covers U+0000..U+07FF (ASCII + Latin-Extended + Cyrillic). Chars ≥ U+0800 → '?'(63).
// v = c0 + c1 * CHAR_BASE  (CHAR_BASE=2048=2^11). Sentinel: c0=0 = end of string.
// Max chunk value: 2047 + 2047*2048 = 4,194,303 < parameter_mmax 4,194,304.
// live.numbox boxes must have maximum=4194304 (box attr) for LiveAPI.set to accept.
function _encodeChunk(s, offset) {
    var c0 = 0, c1 = 0;
    if (offset < s.length) {
        var code = s.charCodeAt(offset);
        c0 = (code > 0 && code < CHAR_BASE) ? code : 63;
    }
    if (offset + 1 < s.length) {
        var code = s.charCodeAt(offset + 1);
        c1 = (code > 0 && code < CHAR_BASE) ? code : 63;
    }
    var v = c0 + c1 * CHAR_BASE;
    // Belt-and-suspenders: max theoretical = 2047 + 2047*2048 = 4,194,303 < mmax 4,194,304.
    // This clamp is a safety net — should never trigger with valid input.
    return (v > 4194303) ? 0 : v;
}
_encodeChunk.local = 1;

function _decodeChunk(v) {
    v = Math.round(v);
    if (v <= 0) return '';
    // Belt-and-suspenders: reject values that exceed mmax (4194304 = CHAR_BASE * CHAR_BASE).
    // Handles corrupt/old saves where Int64 overflow (≈2^63) was stored in a parameter.
    if (v > 4194303) return '';
    var c0 = v % CHAR_BASE;
    var c1 = Math.floor(v / CHAR_BASE) % CHAR_BASE;
    var result = '';
    if (c0 !== 0) result += String.fromCharCode(c0);
    if (c1 !== 0) result += String.fromCharCode(c1);
    return result;
}
_decodeChunk.local = 1;

// Build pid cache by scanning this_device parameters.
// Matches by prefix "lbl_c" to cover BOTH shortname ("lbl_c0") and longname ("lbl_chunk_0").
// Live returns shortname via par.get("name"); longname starts with "lbl_c" too.
// Index extracted from the digits after "lbl_c" / "lbl_chunk_".
// Posts loud warning if fewer than LABEL_CHUNKS params found (silent failure was the old bug).
function _buildLabelPids() {
    _labelPids = [];
    for (var i = 0; i < LABEL_CHUNKS; i++) _labelPids.push(-1);
    var found = 0;
    try {
        var d = new LiveAPI(null, "this_device");
        var p = d.get("parameters");
        for (var i = 0; i < p.length; i++) {
            if (p[i] !== "id") continue;
            var pid = parseInt(p[i + 1], 10);
            if (pid <= 0) continue;
            var par = new LiveAPI(null, "id " + pid);
            var name = String(par.get("name"));
            if (name.indexOf("lbl_c") !== 0) continue;
            // Strip "lbl_c" or "lbl_chunk_" prefix, parse remaining digits as index
            var digits = name.replace(/^lbl_c(hunk_)?/, '');
            var idx = parseInt(digits, 10);
            if (isNaN(idx) || idx < 0 || idx >= LABEL_CHUNKS) continue;
            _labelPids[idx] = pid;
            found++;
        }
    } catch(e) {
        post("[DF Slot] _buildLabelPids ERROR: " + e + "\n");
    }
    if (found < LABEL_CHUNKS) {
        post("[DF Slot] WARNING: only " + found + "/" + LABEL_CHUNKS
             + " label pids found — persistence broken!\n");
    }
}
_buildLabelPids.local = 1;

// Read all chunks → decode → apply display.
// Sets _restoring=true for ~100ms to block schedulePushLabel() echo loop:
//   restoreLabel → _applyLabel → outlet(11) → textedit → text() → schedulePushLabel blocked.
function restoreLabel() {
    _restoring = true;
    if (!_labelPids) _buildLabelPids();
    var rawChunks = [], name = '';
    for (var i = 0; i < LABEL_CHUNKS; i++) {
        var pid = _labelPids[i], v = 0;
        if (pid > 0) {
            try { v = parseFloat(new LiveAPI(null, "id " + pid).get("value")) || 0; } catch(e) {}
        }
        rawChunks.push(v);
        var chunk = _decodeChunk(v);
        name += chunk;
        if (chunk.length < CHARS_PER_CHUNK) break;
    }
    _applyLabel(name);
    var t = new Task(function() { _restoring = false; }, this);
    t.schedule(100);
}
restoreLabel.local = 1;

// Idempotent trigger: observer OR timer wins; second call is no-op.
// _userStartedTyping guard: if user began typing before restore fires, the stored value
// (read from lnb_t0..5) would overwrite the freshly typed text — race between 400ms push
// and 500ms restore fallback. Guard cancels the restore silently; push will commit the
// user's input and future reloads will show the correct label.
function _doRestore() {
    if (_restoreDone) return;
    _restoreDone = true;
    if (_restoreObs)  { _restoreObs.property  = ""; _restoreObs  = null; }
    if (_restoreTask) { _restoreTask.cancel();       _restoreTask = null; }
    if (_userStartedTyping) {
        return;
    }
    restoreLabel();
}
_doRestore.local = 1;

// Arm observer on lnb_t0 (fires when Live restores the param) + 500ms fallback
function _armLabelRestore() {
    var pid = (_labelPids && _labelPids.length > 0) ? _labelPids[0] : -1;
    if (pid > 0) {
        try {
            _restoreObs = new LiveAPI(function() { _doRestore(); }, "id " + pid);
            _restoreObs.property = "value";
        } catch(e) {}
    }
    _restoreTask = new Task(function() { _doRestore(); }, this);
    _restoreTask.schedule(500);
}
_armLabelRestore.local = 1;

// Debounced write: 400ms after last user input → encode slotName → LiveAPI.set on lnb_tN.
// Guarded by _restoring flag (Mapping Deck pattern: "pushSlot BLOCKED (restore pending)").
// Uses _pendingPushName global (not closure) — Max JS Task callbacks may lose closure locals.
function schedulePushLabel() {
    if (_restoring) return;
    if (_pushLabelTask) { _pushLabelTask.cancel(); _pushLabelTask = null; }
    _pendingPushName = slotName;    // global: survives Task execution context (ES3 safe)
    _pushLabelTask = new Task(function() {
        _pushLabelTask = null;
        if (!_labelPids) _buildLabelPids();
        var s = _pendingPushName || "";
        var chunkVals = [];
        for (var i = 0; i < LABEL_CHUNKS; i++) {
            chunkVals.push(_encodeChunk(s, i * CHARS_PER_CHUNK));
        }
        for (var i = 0; i < LABEL_CHUNKS; i++) {
            var pid = _labelPids[i];
            if (pid <= 0) continue;
            try { new LiveAPI(null, "id " + pid).set("value", chunkVals[i]); } catch(e) {}
        }
    }, this);
    _pushLabelTask.schedule(400);
}
schedulePushLabel.local = 1;

// ── Label + colour update ─────────────────────────────────────────────
function updateLabel() {
    outlet(3, (learnedCC < 0) ? "Map CC" : ("CC " + learnedCC));
    pushTrackColor();
}

// ── Init ──────────────────────────────────────────────────────────────
// NOTE: findColorMode() and findAbsoluteMode() are NOT called in bang().
// Mode values are trusted from live.* outlet callbacks (inlet 7 → setMode,
// inlet 8 → setAbsoluteMode) which fire BEFORE live.thisdevice bang during
// parameter restore. Calling them here via LiveAPI risks: (a) reading before
// Live has finalised restore, (b) parseInt(Enum string) → NaN → wrong default.
function bang() {
    if (inlet === 1) { toggleLearn(); return; }
    // v23: X button on panel slot 8 sends a bare "bang" (not int/float) to inlet 11.
    // Without this guard it fell through into full device re-init below, which
    // re-discovers the still-live (never actually unmapped) TgtId and rebinds it —
    // the real cause of the day-long "mapping restores itself" bug.
    if (inlet === 11) { _handleXClick11(); return; }
    // live.thisdevice bang = Live API is ready. Set _initialized immediately (real signal).
    // _doRebind() checks this flag; observers are set up 200ms later in the Task.
    _initialized = true;
    _thisDeviceApi = null;      // reset cached LiveAPI — device id may change on reload
    _dialObserver = null;       // force _setupDialObserver() to re-arm in findDialParam() below
    dialParam = null;           // pair with _dialObserver reset: ensures findDialParam() runs in setupFocus()
    _lastSentDialValue = -1;    // reset echo-suppression sentinel
    if (_parentObserver) { _parentObserver.property = ""; _parentObserver = null; }
    _lastWrittenTgtId = -1;  // reset on every load — next onTargetId(id) will write even if same value
    _restoreDone = false;
    _userStartedTyping = false;     // clear per load — restore is allowed until user types first
    if (_restoreObs)  { _restoreObs.property  = ""; _restoreObs  = null; }
    if (_restoreTask) { _restoreTask.cancel();       _restoreTask = null; }
    setupFocus();             // sets hostId, arms selObserver/colorObserver, calls findDialParam() → _setupDialObserver()
    currentVal = readDialValue();  // sync initial value before _dialObserver fires for the first time
    // Push-based parent detection: fires when device is dragged to a different track rack.
    // canonical_parent NOT observable in Live 12 (jsliveapi: property cannot be listened to).
    // Reliable fallback: checkParentMove() poll via onSelectedTrack (PARENT_CHECK_INTERVAL_MS=0).
    try {
        _parentObserver = new LiveAPI(function(args) {
            if (!args || args[0] !== "canonical_parent") return;
            _lastParentCheck = Date.now();
            setupFocus();
            applyColor();
            updateBullet();
        }, "this_device");
        _parentObserver.property = "canonical_parent";
    } catch(e) { _parentObserver = null; }
    if (absoluteMode && targetParamId > 0) resolveTargetTrack();
    emitMode();
    updateLabel();
    updateBullet();
    // Build param caches + observers + arm label restore (200ms for Live to settle)
    var t = new Task(function() {
        _buildLabelPids();
        _findOwnParams();
        _findDevSlotParam();
        _findByNameParams();           // byname: cache DevNm0..6 + TgtPI pids
        _findPanelBnParams();          // panel byname: cache PnDnSC + PnTpiS pids (64 boxes)
        _setupOwnParamObservers();
        // Restore byname data from numboxes — must happen AFTER _findByNameParams().
        _restoreByNameData();          // populates _tgtDevName/_tgtParamIdx/_tgtDevOcc
        // Read stored TgtId (may have been refreshed by tgtIdObserver firing in _setupOwnParamObservers).
        var storedTgtId = 0;
        if (tgtIdParam) {
            try {
                storedTgtId = Math.round(parseFloat(
                    new LiveAPI(null, "id " + parseInt(tgtIdParam.id, 10)).get("value")
                ));
            } catch(e) {}
        }
        if (_isDuplicate()) {
            // Cmd+D detected. With byname persistence, try to resolve on the new host track
            // before falling back to cold reset. Cmd+D duplicates the whole track including
            // devices, so the same-named device exists at the same param index.
            var bynameIdDup = _resolveByNameOnHostTrack();
            if (bynameIdDup > 0) {
                post("[DF Slot] Cmd+D: byname resolved id=" + bynameIdDup + " dev=" + _tgtDevName + "\n");
                _bindToId(bynameIdDup);
                _resolvePanelSlotsOnHostTrack();  // panel slots: byname resolve on duplicated track
            } else {
                // No matching device on new host track (e.g. pasted to different instrument) → cold reset.
                _resetAllMappings();
            }
        } else {
            // Normal load or same-slot device.
            _saveDeviceSlot();
            if (storedTgtId > 0) {
                // Check whether stored id still exists in this Live session.
                var idExists = false;
                try {
                    var chk = new LiveAPI(null, "id " + storedTgtId);
                    idExists = (parseInt(chk.id, 10) > 0);
                    chk = null;
                } catch(e) {}

                if (idExists) {
                    // Same session: stored id is valid — use it directly (existing path).
                    // tgtIdObserver may have already scheduled _doRebind via Task(0).
                    targetParamId    = storedTgtId;
                    _pendingRebindId = storedTgtId;
                    if (_rebindAttempts > 0) {
                        // Already rebound by tgtIdObserver — no second _doRebind needed.
                    } else {
                        if (_rebindTask) { _rebindTask.cancel(); _rebindTask = null; }
                        var bt = new Task(function() { _doRebind(); }, this);
                        _rebindTask = bt;
                        bt.schedule(100);
                    }
                    // Panel slots: same session — raw-id rebind (IDs still valid).
                    var _mmBpF  = this.patcher.getnamed("multimap");
                    var _mmSubF = _mmBpF  ? _mmBpF.subpatcher(0)           : null;
                    var _mmIdrF = _mmSubF ? _mmSubF.getnamed("mm_idroute")  : null;
                    if (_mmIdrF) {
                        for (var _siF = 0; _siF < 8; _siF++) {
                            var _mmBoxF = this.patcher.getnamed("mm_tgt_" + _siF);
                            var _mmvF = _mmBoxF ? Math.round(_mmBoxF.getvalueof()) : 0;
                            // Skip si=7 (user slot 8): mm_tgt_7 mirrors main Map's target.
                            // Binding bpslot7's live_remote here → dual-bind with main Map
                            // ("cannot be controlled by more than one controlling device").
                            // Amber is provided by _updateMapBtnVisibility() below (reads mm_tgt_7).
                            if (_mmvF > 0 && _siF !== 7) { _mmIdrF.message(_siF, _mmvF); }
                        }
                    }
                } else {
                    // Stale id (cross-session or cross-project transfer).
                    // Try byname resolution against the current host track.
                    var bynameIdStale = _resolveByNameOnHostTrack();
                    if (bynameIdStale > 0) {
                        post("[DF Slot] stale TgtId: byname resolved id=" + bynameIdStale + " dev=" + _tgtDevName + "\n");
                        _bindToId(bynameIdStale);
                    } else {
                        // No match — device not found on host track. Clear stale id; device stays unmapped.
                        post("[DF Slot] stale TgtId: no byname match — clearing mapping\n");
                        try { if (tgtIdParam) tgtIdParam.set("value", 0); } catch(e) {}
                        targetParamId = -1;
                    }
                    // Panel slots: cross-session — IDs stale → byname resolve (THE KEY FIX).
                    _resolvePanelSlotsOnHostTrack();
                }
            } else {
                // Main slot unmapped; panel slots may still be mapped.
                // Determine session freshness by probing the first non-zero panel ID.
                var _panelFresh = true, _hasPanel = false;
                for (var _psi = 0; _psi < 8; _psi++) {
                    var _pBox = this.patcher.getnamed("mm_tgt_" + _psi);
                    var _pv   = _pBox ? Math.round(_pBox.getvalueof()) : 0;
                    if (_pv > 0) {
                        _hasPanel = true;
                        try { _panelFresh = (parseInt(new LiveAPI(null, "id " + _pv).id, 10) > 0); } catch(e) { _panelFresh = false; }
                        break;
                    }
                }
                if (_hasPanel && !_panelFresh) {
                    // Cross-session: byname resolve
                    _resolvePanelSlotsOnHostTrack();
                } else {
                    // Same session or nothing mapped: raw-id rebind (works or is no-op)
                    var _mmBpE  = this.patcher.getnamed("multimap");
                    var _mmSubE = _mmBpE  ? _mmBpE.subpatcher(0)           : null;
                    var _mmIdrE = _mmSubE ? _mmSubE.getnamed("mm_idroute")  : null;
                    if (_mmIdrE) {
                        for (var _siE = 0; _siE < 8; _siE++) {
                            var _mmBoxE = this.patcher.getnamed("mm_tgt_" + _siE);
                            var _mmvE = _mmBoxE ? Math.round(_mmBoxE.getvalueof()) : 0;
                            // Skip si=7: mirrors main Map — dual-bind guard (see fresh-load path).
                            if (_mmvE > 0 && _siE !== 7) { _mmIdrE.message(_siE, _mmvE); }
                        }
                    }
                }
            }
            // Sync _panelPrevTgts so the first panelmap() call doesn't re-trigger capture for
            // already-mapped slots (which would have stale IDs before byname resolve completes).
            for (var _pIt = 0; _pIt < 8; _pIt++) {
                var _pItBx = this.patcher.getnamed("mm_tgt_" + _pIt);
                _panelPrevTgts[_pIt] = _pItBx ? Math.round(_pItBx.getvalueof()) : 0;
            }
        }
        _armLabelRestore();
        // Restore bpslot7: un-arm live.text + inject parameter name (persisted mirror state).
        // mm_tgt_7 was restored by parameter recall; read its value to inject name.
        // message(0) ensures blink metro is stopped after reload (pattr may restore
        // live.text value=1 if user had it armed at save time). See onTargetId comment.
        try {
            var _mm7bpr = this.patcher.getnamed("multimap");
            var _mm7sr  = _mm7bpr  ? _mm7bpr.subpatcher(0)         : null;
            var _bp7r   = _mm7sr   ? _mm7sr.getnamed("bpslot7")     : null;
            var _bs7r   = _bp7r    ? _bp7r.subpatcher(0)            : null;
            if (_bs7r) {
                var _tgt7b = this.patcher.getnamed("mm_tgt_7");
                var _tgt7v = _tgt7b ? Math.round(_tgt7b.getvalueof()) : 0;
                var _ltxt7r = _bs7r.getnamed("live.text");
                if (_ltxt7r) _ltxt7r.message(0); // un-arm: stops any stale blink metro
                // Sync it_mapstore with mm_tgt_7 so state machine is consistent
                var _mst7r = _bs7r.getnamed("it_mapstore");
                if (_mst7r) _mst7r.message(_tgt7v > 0 ? 1 : 0);
                if (_tgt7v > 0) {
                    try {
                        var _lapi7r = new LiveAPI(null, "id " + _tgt7v);
                        var _lnr7r  = (parseInt(_lapi7r.id) > 0) ? _lapi7r.get("name") : null;
                        var _ptxt7r = (_lnr7r && _lnr7r.length > 0) ? _lnr7r.join(" ") : "Map";
                        if (_ptxt7r.length > 12) _ptxt7r = _ptxt7r.substring(0, 12) + "...";
                        if (_ltxt7r) { _ltxt7r.message("text", _ptxt7r); _ltxt7r.message("texton", _ptxt7r); }
                    } catch(_e7txr) {}
                }
            }
        } catch(_e7r) {}
        _updateMapBtnVisibility();
    }, this);
    t.schedule(200);
}

// ── Track Focus ───────────────────────────────────────────────────────
function setupFocus() {
    var dev = _getThisDevice();
    var parent = dev.get("canonical_parent");
    if (!parent || parent.length < 2) { return; }
    hostTrack = new LiveAPI(null, "id " + parent[1]);
    hostId = parseInt(hostTrack.id, 10);

    if (selObserver) selObserver.property = "";
    selObserver = new LiveAPI(onSelectedTrack, "live_set view");
    selObserver.property = "selected_track";

    if (colorObserver) { colorObserver.property = ""; }
    colorObserver = new LiveAPI(onTrackColor, "id " + hostId);
    colorObserver.property = "color";

    // "Slot 1" dialParam is the device's own parameter — does not change on track move.
    // Skip the full parameter scan (findDialParam) if already cached from a previous init.
    // Always run on first call (dialParam=null after bang()). Saves ~34 IPC on each drag.
    if (!dialParam) findDialParam();
    _lastParentCheck = Date.now();
}

function checkParentMove() {
    var _tc = Date.now();
    if (_tc - _lastParentCheck < PARENT_CHECK_INTERVAL_MS) { return; }
    _lastParentCheck = _tc;
    try {
        var dev = _getThisDevice();
        var parent = dev.get("canonical_parent");
        if (!parent || parent.length < 2) { return; }
        var newId = parseInt(parent[1], 10);
        if (newId === hostId) { return; }
        setupFocus();
        applyColor();
        updateBullet();
    } catch(e) {}
}
checkParentMove.local = 1;

// ── Colour defaults ───────────────────────────────────────────────────
var DEFAULT_CC = [0.011764705882352941, 0.7647058823529411, 0.8352941176470589, 1.0];

function onTrackColor() {
    if (colorMode !== MODE_FOLLOW) { return; }
    if (absoluteMode && targetTrackId > 0) { return; }
    applyColor();
}

function onTargetTrackColor() {
    if (colorMode === MODE_FOLLOW && absoluteMode) applyColor();
}

var INK_DARK  = [0.06, 0.06, 0.06];
var INK_LIGHT = [0.96, 0.96, 0.96];
function inkFor(r, g, b) {
    var hsp = Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b);
    return hsp > 0.5 ? INK_DARK : INK_LIGHT;
}

// Float-atom guard: JS 1.0===1 and 0.0===0 become integer atoms in Max.
// live.text rejects integer atoms in color messages (SendMessage error 2).
// Clamp near-1 to 0.999999, near-0 to 0.000001.
function _fa(v) {
    if (v >= 0.9999) return 0.999999;
    if (v <= 0.0001) return 0.000001;
    return v;
}
_fa.local = 1;

// Read actual lcdbgcolor from a live.text button.
// Returns {r,g,b} or null if unresolved (dark default / tint not yet fired).
function _colorForBtn(btn) {
    try {
        var bg = btn.getattr("lcdbgcolor");
        if (!bg || bg.length < 3) return null;
        var r = bg[0], g = bg[1], b = bg[2];
        if (r + g + b < 0.1) return null;  // dark default / tint not yet fired
        return { r: r, g: g, b: b };
    } catch(e) { return null; }
}
_colorForBtn.local = 1;

function pushDefaults() {
    outlet(6, DEFAULT_CC[0], DEFAULT_CC[1], DEFAULT_CC[2], DEFAULT_CC[3]);
    outlet(10, "standard");
}

function emitTrack(r, g, b) {
    var ink = inkFor(r, g, b);
    outlet(5, r, g, b, 1.0);
    if (learnedCC < 0) outlet(6, DEFAULT_CC[0], DEFAULT_CC[1], DEFAULT_CC[2], DEFAULT_CC[3]);
    else               outlet(6, r, g, b, 1.0);
    outlet(7, r, g, b,  r, g, b,  ink[0], ink[1], ink[2]);
    outlet(10, r, g, b, 1.0);
}

function applyColor() {
    if (colorMode === MODE_STANDARD) { pushDefaults(); return; }

    if (absoluteMode && targetTrack && targetTrackId > 0) {
        try {
            var ci = parseInt(targetTrack.get("color"), 10);
            if (!isNaN(ci)) {
                emitTrack(((ci >> 16) & 255) / 255.0,
                          ((ci >> 8)  & 255) / 255.0,
                          ( ci        & 255) / 255.0);
                return;
            }
        } catch(e) {}
    }

    if (!hostTrack) { pushDefaults(); return; }
    try {
        var ci = parseInt(hostTrack.get("color"), 10);
        if (isNaN(ci)) { pushDefaults(); return; }
        emitTrack(((ci >> 16) & 255) / 255.0,
                  ((ci >> 8)  & 255) / 255.0,
                  ( ci        & 255) / 255.0);
    } catch(e) { pushDefaults(); }
}

function pushTrackColor() { applyColor(); }
// ── MapButton visual state ────────────────────────────────────────────
// Sets obj-9 (border) hidden state and obj-14 (Map btn) amber fill + dark text
// for Standard+mapped slots. Called on bind/unmap/mode/init events.
// Gate it_dg in MapButtonTint (V19 expr) blocks async state-machine amber overwrite;
// JS sets both lcdbgcolor=amber and lcdcolor=inkFor(amber)=dark directly.
//
// Main cell:  slotMapped = (targetParamId > 0)
// Panel cells: slotMapped from mm_tgt_N live.numbox (Stored Only, persist across reloads)
function _updateMapBtnVisibility() {
    if (!_initialized) return;
    var standardMode = (colorMode === MODE_STANDARD);

    // Main cell (obj-46 / varname "df_mapparam").
    try {
        var mainBp = this.patcher.getnamed("df_mapparam");
        if (mainBp) {
            var mainSub = mainBp.subpatcher(0);
            if (mainSub) {
                var mainMapped = (targetParamId > 0);
                var mainBorder = mainSub.getnamed("border");
                if (mainBorder) {
                    mainBorder.message("hidden", (standardMode && mainMapped) ? 1 : 0);
                }
                if (standardMode && mainMapped) {
                    var mainBtn = mainSub.getnamed("live.text");
                    // Guard: if the main Map button is currently armed (live.text==1), let the
                    // native blink run instead of overriding it with amber. (v16 arm-state guard)
                    if (mainBtn && Math.round(mainBtn.getvalueof()) !== 1) {
                        // Patch gate it_dg closed (V19) in Standard+mapped: set amber fill + dark text directly.
                        // lcd_control_fg amber = [0.999999, 0.678, 0.337]; inkFor(amber) → INK_DARK.
                        var AR = 0.999999, AG = 0.678, AB = 0.337;
                        var mbInk = inkFor(AR, AG, AB);
                        mainBtn.message("lcdbgcolor", AR, AG, AB, 0.999999);
                        mainBtn.message("bordercolor", AR, AG, AB, 0.999999);
                        mainBtn.message("lcdcolor", _fa(mbInk[0]), _fa(mbInk[1]), _fa(mbInk[2]), 0.999999);
                    }
                }
            }
        }
    } catch(e) {}

    // Panel cells — read persistent TgtId from mm_tgt_N live.numbox (parameter_enable=1,
    // Stored Only) in the MAIN PATCHER. Survive Live Set save/reload via native parameter restore.
    try {
        var panelBp = this.patcher.getnamed("multimap");
        if (panelBp) {
            var panelSub = panelBp.subpatcher(0);
            if (panelSub) {
                for (var si = 0; si < 8; si++) {
                    try {
                        var mmTgtBox = this.patcher.getnamed("mm_tgt_" + si);
                        var slotMapped = mmTgtBox ? (mmTgtBox.getvalueof() > 0) : false;
                        var slotHidden = (standardMode && slotMapped) ? 1 : 0;
                        var slotBp = panelSub.getnamed("bpslot" + si);
                        if (!slotBp) continue;
                        var slotSub = slotBp.subpatcher(0);
                        if (!slotSub) continue;
                        var borderObj = slotSub.getnamed("border");
                        if (borderObj) borderObj.message("hidden", slotHidden);
                        if (standardMode && slotMapped) {
                            var slotBtn = slotSub.getnamed("live.text");
                            // Guard: skip amber paint when slot is armed (live.text==1) so
                            // native blink is visible while user picks a new parameter. (v16)
                            if (slotBtn && Math.round(slotBtn.getvalueof()) !== 1) {
                                var AR2 = 0.999999, AG2 = 0.678, AB2 = 0.337;
                                var sbInk = inkFor(AR2, AG2, AB2);
                                slotBtn.message("lcdbgcolor", AR2, AG2, AB2, 0.999999);
                                slotBtn.message("bordercolor", AR2, AG2, AB2, 0.999999);
                                slotBtn.message("lcdcolor", _fa(sbInk[0]), _fa(sbInk[1]), _fa(sbInk[2]), 0.999999);
                            }
                        }
                        // FOLLOW mode: slot 8 (si=7) mirrors main Map — paint amber directly.
                        // In FOLLOW mode MapButtonTint's state machine requires mm_idroute to
                        // set mflag (its own mapped indicator). We cannot call mm_idroute for
                        // slot 8 (dual-bind error), so we paint amber via JS color messages.
                        // Colors persist until the state machine re-evaluates (user arms slot 8
                        // or mode changes — both are handled: mode change re-calls this function,
                        // user arm resets slot to independent state which is correct UX).
                        if (!standardMode && slotMapped && si === 7) {
                            var slotBtn7 = slotSub.getnamed("live.text");
                            // Guard: skip amber paint when bpslot7 is armed (live.text==1) so
                            // native blink shows through. Keep-alive (_s7kaFn) has same guard. (v16)
                            if (slotBtn7 && Math.round(slotBtn7.getvalueof()) !== 1) {
                                var AR7 = 0.999999, AG7 = 0.678, AB7 = 0.337;
                                var ink7 = inkFor(AR7, AG7, AB7);
                                slotBtn7.message("lcdbgcolor", AR7, AG7, AB7, 0.999999);
                                slotBtn7.message("bordercolor", AR7, AG7, AB7, 0.999999);
                                slotBtn7.message("lcdcolor", _fa(ink7[0]), _fa(ink7[1]), _fa(ink7[2]), 0.999999);
                            }
                        }
                        // Slot 8 (si=7) X button: show/hide based on mirror state.
                        // X button (varname='live.text[1]') is hidden by default.
                        // Show it when bpslot7 is mirroring main Map (slotMapped=true).
                        if (si === 7) {
                            var xBtn7 = slotSub.getnamed("live.text[1]");
                            if (xBtn7) xBtn7.message("hidden", slotMapped ? 0 : 1);
                        }
                    } catch(e2) {}
                }
            }
        }
    } catch(e) {}
}
_updateMapBtnVisibility.local = 1;

// ── Colour mode ───────────────────────────────────────────────────────
function emitMode() { outlet(8, colorMode); }
function setMode(m) { colorMode = m ? MODE_FOLLOW : MODE_STANDARD; emitMode(); applyColor(); _updateMapBtnVisibility(); }

function findColorMode() {
    try {
        var d = new LiveAPI(null, "this_device");
        var p = d.get("parameters");
        for (var i = 0; i < p.length; i++) {
            if (p[i] == "id") {
                var pid = parseInt(p[i + 1], 10);
                if (pid <= 0) continue;
                var par = new LiveAPI(null, "id " + pid);
                if (par.get("name") == "Color Mode") {
                    colorMode = parseInt(par.get("value"), 10) ? MODE_FOLLOW : MODE_STANDARD;
                    return;
                }
            }
        }
    } catch(e) {}
}

// ── Mapping mode (Focus / Absolute) ───────────────────────────────────
function setAbsoluteMode(v) {
    absoluteMode = (v === 1);
    if (!absoluteMode) {
        clearTargetTrack();
    } else if (targetParamId > 0) {
        resolveTargetTrack();
    }
    applyColor();
    updateBullet();
}

function findAbsoluteMode() {
    try {
        var d = new LiveAPI(null, "this_device");
        var p = d.get("parameters");
        for (var i = 0; i < p.length; i++) {
            if (p[i] == "id") {
                var pid = parseInt(p[i + 1], 10);
                if (pid <= 0) continue;
                var par = new LiveAPI(null, "id " + pid);
                if (par.get("name") == "Mapping Mode") {
                    absoluteMode = (parseInt(par.get("value"), 10) === 1);
                    return;
                }
            }
        }
    } catch(e) {}
}

// ── Target parameter / track resolution ──────────────────────────────
function onTargetId(id) {
    targetParamId = (id > 0) ? id : -1;
    // Only write TgtId DeviceParameter for a VALID id (>0) AND only if the value actually changed.
    // Guard 1 (id>0): MapButtonTint fires id=0 on fresh-load init — must NOT overwrite preset value.
    // Guard 2 (id !== _lastWrittenTgtId): prevents the double-blink loop where the deferred rebind
    //   triggers MapButtonTint → mb_idout fires the same id back → onTargetId again → would write
    //   the same value again → observer fires again → another rebind → Map blinks twice.
    //   With this guard: second call with same id → skip write → no observer → loop ends cleanly.
    // Unmap writes 0 explicitly in unmap() — that is the only intentional 0 write.
    if (id > 0 && id !== _lastWrittenTgtId) {
        _lastWrittenTgtId = id;  // set BEFORE async tgtIdParam.set (global, survives Task context)
        if (!tgtIdParam) _findOwnParams();
        if (tgtIdParam) {
            try { tgtIdParam.set("value", id); } catch(e) {}
        }
        // Capture byname data (devName/paramIdx/devOcc) for this target.
        // Deferred: may be called from tgtIdObserver (notification context) where LiveAPI calls are risky.
        // _pendingCaptureId is global (ES3-safe Task closure).
        _pendingCaptureId = id;
        var _ct = new Task(function() { _captureByNameFromId(_pendingCaptureId); }, this);
        _ct.schedule(0);
        // ── Slot-7/main-Map mirror: sync panel slot 7 to main Map target ──────────────
        // Visual mirror only: mm_tgt_7 stores id so _updateMapBtnVisibility paints slot 8 amber.
        // We do NOT touch bpslot7's live.remote~ — Live rejects two live.remote~ objects bound
        // to the same parameter ("cannot be controlled by more than one controlling device").
        //
        // CRITICAL: _panelPrevTgts[7] is updated INSIDE the Task, AFTER mm_tgt_7.message().
        // If set BEFORE the Task (synchronously), panelmap() can fire between the two operations:
        //   it reads mm_tgt_7=old but sees _panelPrevTgts[7]=new → detects "change" → calls
        //   onTargetId(old) → echo loop that corrupts state for all subsequent interactions.
        var _s7mainId = id;
        var _s7mainT = new Task(function() {
            try {
                var _nb7m = this.patcher.getnamed("mm_tgt_7");
                if (_nb7m) _nb7m.message(_s7mainId);
                _panelPrevTgts[7] = _s7mainId;  // set AFTER mm_tgt_7, atomic from panelmap's view
                // Un-arm bpslot7 live.text and inject parameter name.
                //
                // WHY message(0): when user armed bpslot7 to initiate slot8→main mapping,
                // live.text value=1 was set and the blink metro (arm_mg → metro 200 →
                // counter 0 1 → it_phtrig → state machine) started and never stopped.
                // The state machine alternates state=1 (BLACK bg + track-color text) / state=2
                // every 200ms — overriding _updateMapBtnVisibility() amber each cycle.
                //
                // Sending 0 to live.text:
                //   (a) stops the blink metro via arm_mg gate (value=0 → metro off)
                //   (b) triggers state=0 synchronously (it_vtrig → state machine → grey reset)
                // _updateMapBtnVisibility() below then sets amber colors AFTER the grey reset,
                // and those colors persist because the metro is now stopped.
                try {
                    var _mm7bp = this.patcher.getnamed("multimap");
                    var _mm7s  = _mm7bp  ? _mm7bp.subpatcher(0)          : null;
                    var _bp7   = _mm7s   ? _mm7s.getnamed("bpslot7")      : null;
                    var _bs7   = _bp7    ? _bp7.subpatcher(0)             : null;
                    if (_bs7) {
                        var _ltxt7 = _bs7.getnamed("live.text");
                        if (_ltxt7) {
                            _ltxt7.message(0); // un-arm: stops metro; cascade → state=0 → grey
                            var _lt7v = _ltxt7.getvalueof();
                        }
                        // Also directly set it_mapstore=1 so state machine evaluates state=2 (amber) on next trigger
                        var _mst7 = _bs7.getnamed("it_mapstore");
                        if (_mst7) _mst7.message(1);
                        try {
                            var _lapi7 = new LiveAPI(null, "id " + _s7mainId);
                            var _lnr7  = (parseInt(_lapi7.id) > 0) ? _lapi7.get("name") : null;
                            var _ptxt7 = (_lnr7 && _lnr7.length > 0) ? _lnr7.join(" ") : "Map";
                            if (_ptxt7.length > 12) _ptxt7 = _ptxt7.substring(0, 12) + "...";
                            if (_ltxt7) { _ltxt7.message("text", _ptxt7); _ltxt7.message("texton", _ptxt7); }
                        } catch(_e7tx) {}
                    }
                } catch(_e7ms) {}
                _updateMapBtnVisibility();
                // Start keep-alive to hold amber in FOLLOW mode (see _s7kaFn / _s7mirrorId).
                _s7mirrorId = _s7mainId;
                _s7kaStop();
                _s7kaTask = new Task(_s7kaFn, this);
                _s7kaTask.interval = 100;
                _s7kaTask.repeat();
            } catch(_e7m) {}
        }, this);
        _s7mainT.schedule(0);
        // ─────────────────────────────────────────────────────────────────────────────
    }
    if (absoluteMode) {
        if (targetParamId > 0) resolveTargetTrack();
        else                   clearTargetTrack();
        applyColor();
        updateBullet();
    }
    _updateMapBtnVisibility();
}

function resolveTargetTrack() {
    clearTargetTrack();
    if (targetParamId <= 0) return;
    try {
        var paramAPI = new LiveAPI(null, "id " + targetParamId);
        var devParent = paramAPI.get("canonical_parent");
        if (!devParent || devParent.length < 2) return;
        var devAPI = new LiveAPI(null, "id " + devParent[1]);
        var trkParent = devAPI.get("canonical_parent");
        if (!trkParent || trkParent.length < 2) return;
        targetTrackId = parseInt(trkParent[1], 10);
        targetTrack = new LiveAPI(null, "id " + targetTrackId);
        if (targetColorObserver) { targetColorObserver.property = ""; }
        targetColorObserver = new LiveAPI(onTargetTrackColor, "id " + targetTrackId);
        targetColorObserver.property = "color";
    } catch(e) { clearTargetTrack(); }
}

function clearTargetTrack() {
    if (targetColorObserver) { targetColorObserver.property = ""; }
    targetColorObserver = null;
    targetTrack = null;
    targetTrackId = -1;
}

// ── Bullet indicator ──────────────────────────────────────────────────
function updateBullet() {
    var show = absoluteMode && targetTrackId > 0 && hostId > 0 && targetTrackId !== hostId;
    outlet(9, show ? 1 : 0);
}

// ── Dial value read-back ──────────────────────────────────────────────
function findDialParam() {
    dialParam = null;
    try {
        var d = new LiveAPI(null, "this_device");
        var p = d.get("parameters");
        for (var i = 0; i < p.length; i++) {
            if (p[i] == "id") {
                var pid = parseInt(p[i + 1], 10);
                if (pid <= 0) continue;
                var par = new LiveAPI(null, "id " + pid);
                if (par.get("name") == "Slot 1") { dialParam = par; break; }
            }
        }
    } catch(e) { dialParam = null; }
    _setupDialObserver();  // arm value observer; idempotent if already set up
}

// Keep currentVal current via push from Live — eliminates readDialValue() IPC on track activation.
// Idempotent: no-op if already set up (_dialObserver != null). Reset _dialObserver in bang() to re-arm.
// Observer fires whenever dial value changes: CC routing (active track), automation, or preset restore.
// All of these are legitimate updates — no false positives.
function _setupDialObserver() {
    if (_dialObserver) return;
    if (!dialParam) return;
    try {
        var pid = parseInt(dialParam.id, 10);
        if (pid <= 0) return;
        _dialObserver = new LiveAPI(function(args) {
            if (!args || args[0] !== "value") return;
            var v = parseFloat(args[1]);
            if (isNaN(v)) return;
            v = Math.max(0, Math.min(1, v));
            // Echo suppression: our own outlet(0) write triggers a "Slot 1" notification
            // back to us. During fast CC rotation (50+/sec) this doubles Max scheduler load
            // and can corrupt currentVal between routeCC() calls (Pickup mode race).
            // If value matches what we last sent, it's our own echo — skip redundant update.
            // External changes (automation, preset restore) have different values → handled.
            if (Math.abs(v - _lastSentDialValue) < 0.0002) return;
            currentVal = v;
        }, "id " + pid);
        _dialObserver.property = "value";
    } catch(e) { _dialObserver = null; }
}
_setupDialObserver.local = 1;

// Deferred rebind body — called from Task, safely outside notification context.
// Normal (set-reload): _initialized is true → single attempt; live.remote~ already
// bound natively, one mb_ididin pass is enough to update the visual.
// Fresh-instance race: _initialized was false when rebind was first triggered →
// live.remote~ may not be ready yet → retry up to 5× at 300ms.
var MAX_REBIND_ATTEMPTS = 5;
var REBIND_RETRY_MS     = 300;
function _doRebind() {
    _rebindTask = null;
    var rid = _pendingRebindId;
    if (rid <= 0) return;
    // v19 stale-notification guard: verify that TgtId parameter still equals rid
    // before firing outlet(12). Fixes race condition where tgtIdObserver schedules
    // _doRebind(rid) via Task(0), but by the time the Task runs the user has already
    // called unmap() (TgtId=0). The unmap() cancellation in unmap() runs before the
    // Task is created by the late observer callback — so cancellation cannot reach it.
    // Reading the live value at execution time detects the stale notification and aborts.
    // Fail-open when tgtIdParam not yet resolved (first-map during init).
    if (tgtIdParam) {
        try {
            var _curTgt = Math.round(parseFloat(tgtIdParam.get("value")));
            if (_curTgt !== rid) {
                _pendingRebindId = 0;
                return;
            }
        } catch(e) {}
    }
    _rebindAttempts++;
    var _td = Date.now();
    outlet(12, rid);   // → obj-46[1] → mb_ididin → visual + live.remote~ rebind; mb_bindtrig stops blink
    // (a) Immediate: update lcdcolor + hidden/border for main cell + all panel slots.
    _updateMapBtnVisibility();
    // (b) Backup at 700ms: Follow-mode track tint + edge cases.
    var vt = new Task(function() { _updateMapBtnVisibility(); applyColor(); }, this);
    vt.schedule(700);
    if (absoluteMode) { resolveTargetTrack(); applyColor(); updateBullet(); }
    // Already initialized: Live API ready, single pass is sufficient — no retries.
    if (_initialized) return;
    // Not yet initialized: fresh-instance race — schedule retry.
    if (_rebindAttempts < MAX_REBIND_ATTEMPTS) {
        _rebindTask = new Task(function() { _doRebind(); }, this);
        _rebindTask.schedule(REBIND_RETRY_MS);
    }
}
_doRebind.local = 1;

// Scan this_device parameters once, cache TgtId LiveAPI + CC/Ch pids.
function _findOwnParams() {
    tgtIdParam = null;
    ccParamId = -1;
    chParamId = -1;
    try {
        var d = new LiveAPI(null, "this_device");
        var p = d.get("parameters");
        for (var i = 0; i < p.length; i++) {
            if (p[i] !== "id") continue;
            var pid = parseInt(p[i + 1], 10);
            if (pid <= 0) continue;
            var par = new LiveAPI(null, "id " + pid);
            var name = String(par.get("name"));
            if      (name === "TgtId") { tgtIdParam = par; }
            else if (name === "CC")    { ccParamId = pid; }
            else if (name === "Ch")    { chParamId = pid; }
        }
    } catch(e) {}
}
_findOwnParams.local = 1;

// ── Duplicate detection helpers ───────────────────────────────────────────

// Encode current device position as track_index*1000 + device_index.
// Returns -1 if path cannot be determined.
function _getDeviceSlot() {
    try {
        var dev = new LiveAPI(null, "this_device");
        var path = dev.path;
        dev = null;
        var m = path.match(/tracks (\d+) devices (\d+)/);
        if (!m) return -1;
        return parseInt(m[1], 10) * 1000 + parseInt(m[2], 10);
    } catch(e) {
        return -1;
    }
}
_getDeviceSlot.local = 1;

// Find and cache the pid of the DevSlot DeviceParameter (lnb_dev_slot).
function _findDevSlotParam() {
    _devSlotParamId = -1;
    try {
        var d = new LiveAPI(null, "this_device");
        var p = d.get("parameters");
        for (var i = 0; i < p.length; i++) {
            if (p[i] !== "id") continue;
            var pid = parseInt(p[i + 1], 10);
            if (pid <= 0) continue;
            var par = new LiveAPI(null, "id " + pid);
            if (String(par.get("name")) === "DevSlot") {
                _devSlotParamId = pid;
                return;
            }
        }
    } catch(e) {}
}
_findDevSlotParam.local = 1;

// ── Byname codec helpers ──────────────────────────────────────────────────
// 3 ASCII chars per chunk: v = c0 + c1*128 + c2*128^2. Max 127+127*128+127*16384=2097151.
// mmax on numbox must be ≥ 2097152. Sentinel: c0=0 = end of string.
function _encDnChunk(s, off) {
    function safe(cc) { return (cc > 0 && cc <= 127) ? cc : 63; }
    var c0 = 0, c1 = 0, c2 = 0;
    if (off     < s.length) c0 = safe(s.charCodeAt(off));
    if (off + 1 < s.length) c1 = safe(s.charCodeAt(off + 1));
    if (off + 2 < s.length) c2 = safe(s.charCodeAt(off + 2));
    return c0 + c1 * DN_BASE + c2 * DN_BASE * DN_BASE;
}
_encDnChunk.local = 1;

function _decDnChunk(v) {
    v = Math.round(v); if (v <= 0) return '';
    var c0 = v % DN_BASE;
    var c1 = Math.floor(v / DN_BASE) % DN_BASE;
    var c2 = Math.floor(v / (DN_BASE * DN_BASE)) % DN_BASE;
    var r  = '';
    if (c0 > 0) r += String.fromCharCode(c0);
    if (c1 > 0) r += String.fromCharCode(c1);
    if (c2 > 0) r += String.fromCharCode(c2);
    return r;
}
_decDnChunk.local = 1;

// Scan this_device params for DevNm0..6 and TgtPI shortnames.
function _findByNameParams() {
    _dnPids = []; for (var i = 0; i < DN_CHUNKS; i++) _dnPids.push(-1);
    _tpiPid = -1;
    try {
        var d = new LiveAPI(null, "this_device"), p = d.get("parameters");
        for (var i = 0; i < p.length; i++) {
            if (p[i] !== "id") continue;
            var pid = parseInt(p[i + 1], 10); if (pid <= 0) continue;
            var nm = String(new LiveAPI(null, "id " + pid).get("name"));
            if (nm.indexOf("DevNm") === 0) {
                var idx = parseInt(nm.slice(5), 10);
                if (!isNaN(idx) && idx >= 0 && idx < DN_CHUNKS) _dnPids[idx] = pid;
            } else if (nm === "TgtPI") {
                _tpiPid = pid;
            }
        }
    } catch(e) {}
}
_findByNameParams.local = 1;

// ── Panel byname helpers ──────────────────────────────────────────────────

// Scan this_device params for PnDnSC (DN chunks) and PnTpiS (TPI) shortnames.
// Populates _pBnPids[slot].dn[chunk] and _pBnPids[slot].tpi.
function _findPanelBnParams() {
    _pBnPids = [];
    for (var s = 0; s < PANEL_SLOTS; s++) {
        _pBnPids.push({dn: [-1,-1,-1,-1,-1,-1,-1], tpi: -1});
    }
    try {
        var d = new LiveAPI(null, "this_device"), p = d.get("parameters");
        for (var i = 0; i < p.length; i++) {
            if (p[i] !== "id") continue;
            var pid = parseInt(p[i+1], 10); if (pid <= 0) continue;
            var nm = String(new LiveAPI(null, "id " + pid).get("name"));
            var mDn = nm.match(/^PnDn(\d)(\d)$/);
            if (mDn) {
                var si  = parseInt(mDn[1], 10), ci = parseInt(mDn[2], 10);
                if (si >= 0 && si < PANEL_SLOTS && ci >= 0 && ci < 7) _pBnPids[si].dn[ci] = pid;
                continue;
            }
            var mTp = nm.match(/^PnTpi(\d)$/);
            if (mTp) {
                var si2 = parseInt(mTp[1], 10);
                if (si2 >= 0 && si2 < PANEL_SLOTS) _pBnPids[si2].tpi = pid;
            }
        }
    } catch(e) { post("[DF Slot] _findPanelBnParams ERR: " + e + "\n"); }
}
_findPanelBnParams.local = 1;

// Write encoded byname data for one panel slot.
function _encodePanelBn(slotIdx, devName, paramIdx, devOcc) {
    if (!_pBnPids || slotIdx < 0 || slotIdx >= PANEL_SLOTS) return;
    var entry = _pBnPids[slotIdx];
    var s = devName || "";
    for (var c = 0; c < 7; c++) {
        var pid = entry.dn[c]; if (pid <= 0) continue;
        try { new LiveAPI(null, "id " + pid).set("value", _encDnChunk(s, c * 3)); } catch(e) {}
    }
    if (entry.tpi > 0) {
        var packed = (paramIdx >= 0 ? paramIdx : 0) + (devOcc || 0) * 10000;
        try { new LiveAPI(null, "id " + entry.tpi).set("value", packed); } catch(e) {}
    }
}
_encodePanelBn.local = 1;

// Zero out panel byname numboxes for a slot (called on unmap).
function _clearPanelBnSlot(slotIdx) {
    if (!_pBnPids || slotIdx < 0 || slotIdx >= PANEL_SLOTS) return;
    var entry = _pBnPids[slotIdx];
    for (var c = 0; c < 7; c++) {
        if (entry.dn[c] > 0) { try { new LiveAPI(null, "id " + entry.dn[c]).set("value", 0); } catch(e) {} }
    }
    if (entry.tpi > 0) { try { new LiveAPI(null, "id " + entry.tpi).set("value", 0); } catch(e) {} }
}
_clearPanelBnSlot.local = 1;

// ── Slot-7 keep-alive helpers ─────────────────────────────────────────────
function _s7kaStop() {
    if (_s7kaTask) { _s7kaTask.cancel(); _s7kaTask = null; }
}
_s7kaStop.local = 1;

// Called by keep-alive Task every 100ms. 'this' = jsthis (Task created with jsthis context).
// Only fires in FOLLOW mode; STANDARD mode handled by state machine (state=2 → amber via it_emit).
function _s7kaFn() {
    if (_s7mirrorId <= 0 || !_initialized || colorMode !== MODE_FOLLOW) return;
    try {
        var kaTgt = this.patcher.getnamed("mm_tgt_7");
        if (!kaTgt || kaTgt.getvalueof() <= 0) return;
        var kaPanBp  = this.patcher.getnamed("multimap");
        var kaPanSub = kaPanBp  ? kaPanBp.subpatcher(0)         : null;
        var kaBpBp   = kaPanSub ? kaPanSub.getnamed("bpslot7")   : null;
        var kaBpSub  = kaBpBp   ? kaBpBp.subpatcher(0)           : null;
        if (!kaBpSub) return;
        var kaBtn = kaBpSub.getnamed("live.text");
        if (kaBtn) {
            // Guard: bpslot7 is currently armed (user clicked Map to re-arm it).
            // Skip amber paint so the native MapButtonTint blink is visible. (v16)
            if (Math.round(kaBtn.getvalueof()) === 1) return;
            var kaAR = 0.999999, kaAG = 0.678, kaAB = 0.337;
            kaBtn.message("lcdbgcolor", kaAR, kaAG, kaAB, 0.999999);
            kaBtn.message("bordercolor", kaAR, kaAG, kaAB, 0.999999);
            var kaInk = inkFor(kaAR, kaAG, kaAB);
            kaBtn.message("lcdcolor", _fa(kaInk[0]), _fa(kaInk[1]), _fa(kaInk[2]), 0.999999);
        }
    } catch(e) {}
}
_s7kaFn.local = 1;
// ─────────────────────────────────────────────────────────────────────────────

// Capture byname data (devName/paramIdx/devOcc) for a panel slot from a fresh param id.
// Called deferred via Task(0) — safe outside notification context.
// Uses globals _pendingPanelSi / _pendingPanelId (ES3-safe Task closure pattern).
function _captureSlotBn(slotIdx, paramId) {
    if (paramId <= 0 || slotIdx < 0 || slotIdx >= PANEL_SLOTS) return;
    if (!_pBnPids) _findPanelBnParams();
    try {
        var paramApi = new LiveAPI(null, "id " + paramId);
        var ppath = paramApi.unquotedpath;
        if (!ppath || ppath.length === 0) return;
        var m = ppath.match(/^live_set tracks (\d+) devices (\d+) parameters (\d+)$/);
        if (!m) return;  // mixer/return/master — byname not applicable
        var trackN   = parseInt(m[1], 10);
        var devIdx   = parseInt(m[2], 10);
        var paramIdx = parseInt(m[3], 10);
        var devApi   = new LiveAPI(null, "live_set tracks " + trackN + " devices " + devIdx);
        if (!(parseInt(devApi.id, 10) > 0)) return;
        var devName  = devApi.get("name") + "";
        // Guard: CcControlDevice returns "0" for "name" — abort to avoid storing corrupt byname.
        if (!devName || devName === "0") return;
        var trackApi = new LiveAPI(null, "live_set tracks " + trackN);
        var devs = trackApi.get("devices"), occ = 0, di = 0;
        for (var k = 0; k + 1 < devs.length && di < devIdx; k += 2) {
            if (devs[k] !== "id") continue;
            var dd = new LiveAPI(null, "id " + devs[k+1]);
            var ddName2; try { ddName2 = dd.get("name") + ""; } catch(_cce2) { di++; continue; }
            if (ddName2 === devName) occ++;
            di++;
        }
        _encodePanelBn(slotIdx, devName, paramIdx, occ);
        post("[DF Slot] panel bn capture: slot=" + slotIdx + " dev=" + devName + " param=" + paramIdx + " occ=" + occ + "\n");
    } catch(e) { post("[DF Slot] _captureSlotBn ERR: " + e + "\n"); }
}
_captureSlotBn.local = 1;

// Resolve all panel slots by byname on the host track (cross-session restore / drag).
// Reads stored byname data from pnl_dn_S_C + pnl_tpi_S, resolves on host track,
// updates mm_tgt_N numbox (fresh id persisted to .als) and rebinds live.remote~.
function _resolvePanelSlotsOnHostTrack() {
    if (!_pBnPids) _findPanelBnParams();
    var dev    = _getThisDevice();
    var parent = dev.get("canonical_parent");
    if (!parent || parent.length < 2) return;
    var hostTrkApi = new LiveAPI(null, "id " + parent[1]);
    if (!(parseInt(hostTrkApi.id, 10) > 0)) return;
    var hostPath = hostTrkApi.unquotedpath;
    var hostDevs = hostTrkApi.get("devices");
    var mmBp  = this.patcher.getnamed("multimap");
    var mmSub = mmBp  ? mmBp.subpatcher(0)          : null;
    var mmIdr = mmSub ? mmSub.getnamed("mm_idroute") : null;
    for (var si = 0; si < PANEL_SLOTS; si++) {
        try {
            var entry = _pBnPids[si];
            var name2 = "";
            for (var c = 0; c < 7; c++) {
                var pid = entry.dn[c]; var v2 = 0;
                if (pid > 0) { try { v2 = parseFloat(new LiveAPI(null, "id " + pid).get("value")) || 0; } catch(e) {} }
                var ch2 = _decDnChunk(v2); name2 += ch2;
                if (ch2.length < 3) break;
            }
            if (!name2 || name2.length === 0) continue;
            var paramIdx2 = -1, devOcc2 = 0;
            if (entry.tpi > 0) {
                try {
                    var packed2 = Math.round(parseFloat(new LiveAPI(null, "id " + entry.tpi).get("value")));
                    if (packed2 > 0) { paramIdx2 = packed2 % 10000; devOcc2 = Math.floor(packed2 / 10000); }
                } catch(e) {}
            }
            if (paramIdx2 < 0) continue;
            var occ2 = 0, di2 = 0, freshId = -1;
            for (var k2 = 0; k2 + 1 < hostDevs.length; k2 += 2) {
                if (hostDevs[k2] !== "id") continue;
                var dd2 = new LiveAPI(null, "id " + hostDevs[k2+1]);
                var dd2Name; try { dd2Name = dd2.get("name") + ""; } catch(_cce3) { di2++; continue; }
                if (dd2Name === name2) {
                    if (occ2 === devOcc2) {
                        var pa2 = new LiveAPI(null, hostPath + " devices " + di2 + " parameters " + paramIdx2);
                        if (pa2 && parseInt(pa2.id, 10) > 0) freshId = parseInt(pa2.id, 10);
                        break;
                    }
                    occ2++;
                }
                di2++;
            }
            if (freshId > 0) {
                var mmBox = this.patcher.getnamed("mm_tgt_" + si);
                if (mmBox) mmBox.message(freshId);  // patcher write → persisted to .als
                // Skip si=7: mirrors main Map — dual-bind guard (see restore path comments).
                if (mmIdr && si !== 7) mmIdr.message(si, freshId);  // rebind live.remote~
                post("[DF Slot] panel slot " + si + ": byname resolved id=" + freshId + " dev=" + name2 + "\n");
            }
        } catch(e2) {}
    }
}
_resolvePanelSlotsOnHostTrack.local = 1;

// Write devName/paramIdx/devOcc into byname numboxes + update JS vars.
function _pushByNameData(devName, paramIdx, devOcc) {
    _tgtDevName  = devName  || null;
    _tgtParamIdx = (paramIdx >= 0) ? paramIdx : -1;
    _tgtDevOcc   = devOcc   || 0;
    if (!_dnPids) _findByNameParams();
    var s = devName || "";
    for (var i = 0; i < DN_CHUNKS; i++) {
        var pid = _dnPids[i]; if (pid <= 0) continue;
        try { new LiveAPI(null, "id " + pid).set("value", _encDnChunk(s, i * 3)); } catch(e) {}
    }
    if (_tpiPid > 0) {
        // Pack: paramIdx + devOcc * 10000. Ranges: paramIdx 0-9999, devOcc 0-99.
        var packed = (paramIdx >= 0 ? paramIdx : 0) + (devOcc || 0) * 10000;
        try { new LiveAPI(null, "id " + _tpiPid).set("value", packed); } catch(e) {}
    }
}
_pushByNameData.local = 1;

// Read byname data from numboxes into JS vars.
function _restoreByNameData() {
    if (!_dnPids) _findByNameParams();
    _tgtDevName  = null; _tgtParamIdx = -1; _tgtDevOcc = 0;
    var name = "";
    for (var i = 0; i < DN_CHUNKS; i++) {
        var pid = _dnPids ? _dnPids[i] : -1, v = 0;
        if (pid > 0) { try { v = parseFloat(new LiveAPI(null, "id " + pid).get("value")) || 0; } catch(e) {} }
        var chunk = _decDnChunk(v); name += chunk;
        if (chunk.length < 3) break;
    }
    if (name.length > 0) _tgtDevName = name;
    if (_tpiPid > 0) {
        try {
            var packed = Math.round(parseFloat(new LiveAPI(null, "id " + _tpiPid).get("value")));
            if (packed > 0) {
                _tgtParamIdx = packed % 10000;
                _tgtDevOcc   = Math.floor(packed / 10000);
            }
        } catch(e) {}
    }
}
_restoreByNameData.local = 1;

// Capture devName/paramIdx/devOcc from a fresh (valid) param id.
// Called deferred via Task(0) — safe outside notification context.
// Silent no-op if id is stale (unquotedpath empty) → byname data unchanged.
// Does NOT capture for mixer/return/master params (no named-device path).
function _captureByNameFromId(paramId) {
    if (paramId <= 0) return;
    try {
        var paramApi = new LiveAPI(null, "id " + paramId);
        var ppath = paramApi.unquotedpath;
        if (!ppath || ppath.length === 0) return;
        var m = ppath.match(/^live_set tracks (\d+) devices (\d+) parameters (\d+)$/);
        if (!m) return;  // mixer/return/master — byname not applicable
        var trackN   = parseInt(m[1], 10);
        var devIdx   = parseInt(m[2], 10);
        var paramIdx = parseInt(m[3], 10);
        var devApi = new LiveAPI(null, "live_set tracks " + trackN + " devices " + devIdx);
        if (!(parseInt(devApi.id, 10) > 0)) return;
        var devName = devApi.get("name") + "";
        // Guard: CcControlDevice and other non-standard device types return "0" for "name".
        // Writing byname data for "0" corrupts cross-session restore — abort silently.
        if (!devName || devName === "0") return;
        // Count same-named devices before devIdx (occurrence index)
        var trackApi = new LiveAPI(null, "live_set tracks " + trackN);
        var devs = trackApi.get("devices"), occ = 0, di = 0;
        for (var k = 0; k + 1 < devs.length && di < devIdx; k += 2) {
            if (devs[k] !== "id") continue;
            var dd = new LiveAPI(null, "id " + devs[k + 1]);
            // Per-iteration guard: CcControlDevice in device list produces non-fatal
            // "no attribute 'canonical_parent'" warning and returns 0 for "name".
            // Catch silently and skip — don't break the occ count or bubble to outer catch.
            var ddName; try { ddName = dd.get("name") + ""; } catch(_cce) { di++; continue; }
            if (ddName === devName) occ++;
            di++;
        }
        _pushByNameData(devName, paramIdx, occ);
        post("[DF Slot] byname capture: dev=" + devName + " paramIdx=" + paramIdx + " occ=" + occ + "\n");
    } catch(e) { post("[DF Slot] _captureByNameFromId ERR: " + e + "\n"); }
}
_captureByNameFromId.local = 1;

// Resolve _tgtDevName/_tgtParamIdx/_tgtDevOcc against the HOST TRACK of this DF Slot device.
// Returns fresh runtime param id, or -1 if no match.
function _resolveByNameOnHostTrack() {
    if (!_tgtDevName || _tgtParamIdx < 0) return -1;
    try {
        var dev     = _getThisDevice();
        var parent  = dev.get("canonical_parent");
        if (!parent || parent.length < 2) return -1;
        var t = new LiveAPI(null, "id " + parent[1]);
        if (!(parseInt(t.id, 10) > 0)) return -1;
        var devs = t.get("devices"), occ = 0, di = 0;
        for (var k = 0; k + 1 < devs.length; k += 2) {
            if (devs[k] !== "id") continue;
            var d = new LiveAPI(null, "id " + devs[k + 1]);
            var dName; try { dName = d.get("name") + ""; } catch(_cce4) { di++; continue; }
            if (dName === _tgtDevName) {
                if (occ === _tgtDevOcc) {
                    var pa = new LiveAPI(null, t.unquotedpath + " devices " + di + " parameters " + _tgtParamIdx);
                    if (pa && parseInt(pa.id, 10) > 0) return parseInt(pa.id, 10);
                    return -1;
                }
                occ++;
            }
            di++;
        }
    } catch(e) {}
    return -1;
}
_resolveByNameOnHostTrack.local = 1;

// Write fresh id to TgtId numbox + trigger rebind + save slot.
// Used by both byname-resolve paths (dup + stale).
function _bindToId(id) {
    targetParamId     = id;
    _lastWrittenTgtId = id;
    if (!tgtIdParam) _findOwnParams();
    try { if (tgtIdParam) tgtIdParam.set("value", id); } catch(e) {}
    _pendingRebindId  = id;
    _rebindAttempts   = 0;
    if (_rebindTask) { _rebindTask.cancel(); _rebindTask = null; }
    var rbt = new Task(function() { _doRebind(); }, this);
    _rebindTask = rbt;
    rbt.schedule(100);
    _saveDeviceSlot();
}
_bindToId.local = 1;

// Two-phase duplicate detection — independent of whether main mapping (TgtId) exists.
//
// Phase 1: collect all external param IDs stored by this device:
//   - TgtId (main Map button target)
//   - mm_tgt_0..7 (multimap panel slot targets)
//   Any id > 0 means the user has mapped at least one parameter.
//   Check if at least one of these ids still exists in the current Live session.
//   On .als load (new session) Live reassigns all runtime ids → old ids not found → NOT duplicate.
//   On Cmd+D (same session) the original params still live → found → proceed to Phase 2.
//   If no external ids at all (nothing mapped) → nothing to protect → return false.
//
// Phase 2: verify whether this is Cmd+D or a preset drag-from-browser.
//   Step A: compare device slot (track_index*1000 + device_index). Same slot → original device → NOT dup.
//   Step B (slot differs): check if the ORIGINAL device still exists at the stored slot.
//     Cmd+D: original is still in the set at storedSlot, and its TgtId matches → IS duplicate → reset.
//     Preset drag (original removed): nothing at storedSlot → NOT duplicate → preserve mapping.
//   This correctly distinguishes "user Cmd+D" from "user saved preset, deleted original, dragged copy".
//
// BUG-FIX (2026-07-22): old Phase 2 was storedSlot !== currentSlot → reset. This false-positived on
//   .adv preset drag-from-browser to same Live Set: TgtId valid (target param exists) + slot changed
//   (new position) → wrongly detected as duplicate → _resetAllMappings() fired → CC/target lost.
//   Fix: after slot mismatch, verify original is at storedSlot with matching TgtId.
// BUG-FIX (2026-07-21 v2): previously gated on TgtId>0, so panel-only mappings were never checked.
// BUG-FIX (2026-07-21 v1): lnb_dev_slot initial=-1; guard storedSlot < 0 = "never written".
function _isDuplicate() {
    // Phase 1: gather all known external param IDs (TgtId + panel mm_tgt_0..7)
    var storedTgtId = 0;  // TgtId specifically — used in Phase 2 for device identity check
    var externalIds = [];
    if (tgtIdParam) {
        try {
            var tid = Math.round(parseFloat(
                new LiveAPI(null, "id " + parseInt(tgtIdParam.id, 10)).get("value")
            ));
            if (tid > 0) { storedTgtId = tid; externalIds.push(tid); }
        } catch(e) {}
    }
    for (var si = 0; si < 8; si++) {
        try {
            var box = this.patcher.getnamed("mm_tgt_" + si);
            if (box) {
                var mmv = Math.round(box.getvalueof());
                if (mmv > 0) externalIds.push(mmv);
            }
        } catch(e) {}
    }
    if (externalIds.length === 0) return false;  // nothing mapped → no routing risk → NOT duplicate
    var foundAny = false;
    for (var ei = 0; ei < externalIds.length; ei++) {
        try {
            var chkApi = new LiveAPI(null, "id " + externalIds[ei]);
            if (parseInt(chkApi.id, 10) > 0) { foundAny = true; chkApi = null; break; }
            chkApi = null;
        } catch(e) {}
    }
    if (!foundAny) return false;  // no external id found in session → cross-session load → NOT duplicate

    // Phase 2A: slot comparison.
    var currentSlot = _getDeviceSlot();
    if (currentSlot < 0) return false;  // can't determine path → safe fallback
    if (_devSlotParamId <= 0) return false;
    var storedSlot = -1;
    try {
        storedSlot = Math.round(parseFloat(
            new LiveAPI(null, "id " + _devSlotParamId).get("value")
        ));
    } catch(e) {}
    if (storedSlot < 0) return false;  // never initialized (initial=-1) → first run → NOT duplicate
    if (storedSlot === currentSlot) {
        return false;
    }

    // Phase 2B: verify the original device is still at storedSlot.
    // Cmd+D: original still in set at storedSlot AND has matching TgtId → IS duplicate → reset.
    // Preset drag (original removed or absent): nothing at storedSlot → NOT duplicate → preserve.
    var storedTrack = Math.floor(storedSlot / 1000);
    var storedDevIdx = storedSlot % 1000;
    try {
        var origDev = new LiveAPI(null, "live_set tracks " + storedTrack + " devices " + storedDevIdx);
        var origId = parseInt(origDev.id, 10);
        if (origId <= 0) {
            return false;
        }
        // Device found at stored slot. If we have a stored TgtId, verify it matches (confirms same DF Slot).
        if (storedTgtId > 0) {
            var origParams = origDev.get("parameters");
            for (var pi2 = 0; pi2 < origParams.length; pi2++) {
                if (origParams[pi2] !== "id") continue;
                var ppid2 = parseInt(origParams[pi2 + 1], 10);
                if (ppid2 <= 0) continue;
                var ppar2 = new LiveAPI(null, "id " + ppid2);
                if (String(ppar2.get("name")) === "TgtId") {
                    var origTgtId = Math.round(parseFloat(ppar2.get("value")));
                    if (origTgtId === storedTgtId) {
                        return true;
                    }
                    return false;
                }
            }
            // Device at stored slot has no TgtId param — not a DF Slot device → NOT duplicate.
            return false;
        } else {
            // Panel-only mapping (TgtId=0). Can't verify via TgtId — assume Cmd+D if device is present.
            return true;
        }
    } catch(e) {
        return false;
    }
}
_isDuplicate.local = 1;

// Write current device slot to lnb_dev_slot DeviceParameter for future comparison.
function _saveDeviceSlot() {
    var slot = _getDeviceSlot();
    if (slot < 0) return;
    if (_devSlotParamId > 0) {
        try { new LiveAPI(null, "id " + _devSlotParamId).set("value", slot); } catch(e) {}
    }
}
_saveDeviceSlot.local = 1;

// Reset all mappings to cold/unmapped state (called when duplicate detected).
// Clears: learnedCC, learnedChannel, targetParamId, MapButton live.remote~,
//         mm_tgt_0..7 visual state. Updates DeviceParameters so next .als save
//         captures the cleared state.
function _resetAllMappings() {
    // JS state
    learnedCC = -1;
    learnedChannel = -1;
    arming = false;
    engaged = false;
    targetParamId = -1;
    _lastWrittenTgtId = 0;
    _pendingRebindId = 0;
    if (_rebindTask) { _rebindTask.cancel(); _rebindTask = null; }
    _rebindAttempts = 0;
    clearTargetTrack();
    // DeviceParameters via LiveAPI (persist cleared state into next .als save)
    if (!tgtIdParam) _findOwnParams();
    try { if (tgtIdParam) tgtIdParam.set("value", 0); } catch(e) {}
    try { if (ccParamId > 0) new LiveAPI(null, "id " + ccParamId).set("value", 0); } catch(e) {}
    try { var _lnbCh=this.patcher.getnamed("lnb_ch"); if(_lnbCh) _lnbCh.message(-1); } catch(e) {}
    // Display numboxes (outlet paths update live.numbox display)
    outlet(1, 0);   // → ps_cc → lnb_cc display
    outlet(2, -1);  // → ps_ch → lnb_ch display
    outlet(4, 0);   // arming indicator off
    // Reset MapButton: send id=0 to MapButtonTint inlet 1 → live.remote~ unbinds.
    // Safe here: called from Task context, not from notification callback.
    outlet(12, 0);
    // Force MapButtonTint state machine to cold/unmapped state.
    // outlet(12,0) unbinds live.remote~ but it_dg gate (controlled by p setButtonColor)
    // may stay closed — p setButtonColor only opens it when live.text button fires.
    // Sending message(0) to live.text (obj-14) directly triggers:
    //   obj-14 → obj-39 (p setButtonColor) → it_dg gate opens
    //   obj-14 → it_vtrig → it_state = 0 (cold) → default colors applied
    // This also sends value=0 to p mapping (obj-42) which re-sends id=0 to live.remote~
    // (harmless double-unbind — already unbound by outlet(12,0) above).
    try {
        var _rmbp = this.patcher.getnamed("df_mapparam");
        if (_rmbp) {
            var _rms = _rmbp.subpatcher(0);
            if (_rms) { var _rmb = _rms.getnamed("live.text"); if (_rmb) _rmb.message(0); }
        }
    } catch(_rme) {}
    // Clear panel slot target ids (mm_tgt_0..7 drive visual amber state)
    for (var i = 0; i < 8; i++) {
        try {
            var box = this.patcher.getnamed("mm_tgt_" + i);
            if (box) box.message(0);
        } catch(e) {}
    }
    // Unmap live.remote~ in each panel slot via mm_idroute inside multimapDF.
    // mm_tgt_N have NO outgoing wires — clearing them above only resets visual state.
    // live.remote~ holds its own binding; must be cleared explicitly.
    // Path: mm_idroute.message(i, 0) → route 0..7 → bpslot_i inlet 1 (mb_ididin) →
    //       mb_ididmsg "id $1" → live.remote~ "id 0" → unbind.
    try {
        var mmBpanel = this.patcher.getnamed("multimap");
        if (mmBpanel) {
            var mmPsub = mmBpanel.subpatcher(0);
            if (mmPsub) {
                var mmIdr = mmPsub.getnamed("mm_idroute");
                if (mmIdr) {
                    for (var mi = 0; mi < 8; mi++) {
                        mmIdr.message(mi, 0);
                    }
                }
                // Force each panel slot's MapButtonTint to cold state.
                // mm_idroute path unbinds live.remote~ but leaves it_dg gate closed
                // (p setButtonColor only opens it via live.text button path).
                for (var pi = 0; pi < 8; pi++) {
                    try {
                        var _pbp = mmPsub.getnamed("bpslot" + pi);
                        if (!_pbp) continue;
                        var _pbs = _pbp.subpatcher(0);
                        if (!_pbs) continue;
                        var _pbb = _pbs.getnamed("live.text");
                        if (_pbb) _pbb.message(0);
                    } catch(_pbe) {}
                }
            }
        }
    } catch(e2) {}
    // Record new device slot so our position is known for next run
    _saveDeviceSlot();
    // Refresh label and visual state
    updateLabel();
    _updateMapBtnVisibility();
}
_resetAllMappings.local = 1;

// Set up LiveAPI value-observers on TgtId / CC / Ch parameters.
// Tears down previous observers first (safe to call on re-init in bang()).
// TgtId observer: fires on preset restore → outlet 12 → obj-46[inlet 1] → visual + rebind.
// CC / Ch observers: update learnedCC / learnedChannel JS vars so routing works after preset load.
function _setupOwnParamObservers() {
    if (tgtIdObserver) { tgtIdObserver.property = ""; tgtIdObserver = null; }
    if (ccObserver)    { ccObserver.property = "";    ccObserver = null; }
    if (chObserver)    { chObserver.property = "";    chObserver = null; }

    if (tgtIdParam) {
        var pid = parseInt(tgtIdParam.id, 10);
        if (pid > 0) {
            tgtIdObserver = new LiveAPI(function(args) {
                if (!args || args[0] !== "value") return;
                var id = Math.round(parseFloat(args[1]));
                targetParamId = (id > 0) ? id : -1;
                if (id > 0) {
                    // DEFER: outlet(12) → live.remote~ id-change forbidden in notification context.
                    // Task(0) schedules execution in the next event cycle, safely outside notification.
                    _pendingRebindId = id;
                    _rebindAttempts = 0;
                    if (_rebindTask) { _rebindTask.cancel(); _rebindTask = null; }
                    var t = new Task(function() { _doRebind(); }, this);
                    _rebindTask = t;
                    t.schedule(0);
                } else {
                    if (absoluteMode) { clearTargetTrack(); applyColor(); updateBullet(); }
                }
            }, "id " + pid);
            tgtIdObserver.property = "value";
        }
    }

    if (ccParamId > 0) {
        ccObserver = new LiveAPI(function(args) {
            if (!args || args[0] !== "value") return;
            learnedCC = Math.round(parseFloat(args[1])) - 1;  // stored as CC+1
            updateLabel();
        }, "id " + ccParamId);
        ccObserver.property = "value";
    }

    if (chParamId > 0) {
        chObserver = new LiveAPI(function(args) {
            if (!args || args[0] !== "value") return;
            learnedChannel = Math.round(parseFloat(args[1]));
        }, "id " + chParamId);
        chObserver.property = "value";
    }
}
_setupOwnParamObservers.local = 1;

function readDialValue() {
    if (!dialParam) findDialParam();
    if (!dialParam) return currentVal;
    try {
        var v = parseFloat(dialParam.get("value"));
        if (isNaN(v)) return currentVal;
        return Math.max(0.0, Math.min(1.0, v));
    } catch(e) { dialParam = null; return currentVal; }
}

// ── Selected track observer ───────────────────────────────────────────
function onSelectedTrack(args) {
    if (!args || args.length < 3) return;
    if (args[0] != "selected_track") return;
    // Drag detection: bang() never fires on track move in Live 12; canonical_parent not observable.
    // checkParentMove() reads canonical_parent (1 IPC) and re-arms colorObserver on host change.
    // Task(0): selected_track notification fires AFTER LOM move completes — immediate check suffices.
    var _cpmT = new Task(function() { checkParentMove(); }, this);
    _cpmT.schedule(0);
    var selId = parseInt(args[2], 10);
    var nowActive = (selId === hostId) ? 1 : 0;
    if (nowActive === active) {
        return;
    }
    active = nowActive;
    if (active) {
        engaged = false;
        lastIncoming = -1;
        anchorC = -1;
        // _dialObserver keeps currentVal fresh at all times — no IPC read on track activation.
        anchorP = currentVal;
    }
}

// ── Learn ─────────────────────────────────────────────────────────────
function arm(v) {
    arming = v ? true : false;
    outlet(4, arming ? 1 : 0);
}
arm.local = 1;

function toggleLearn() {
    if (arming) { unmap(); return; }
    arm(1);
}
toggleLearn.local = 1;

function unmap() {
    // Race guard: tgtIdObserver may have scheduled _rebindTask(0) just before unmap().
    // Cancel it now so _doRebind() never fires outlet(12, stale_id) after we've cleared state.
    // Also reset _pendingRebindId so _doRebind() short-circuits even if a task slips through.
    if (_rebindTask) { _rebindTask.cancel(); _rebindTask = null; }
    _pendingRebindId = 0;
    learnedCC = -1;
    learnedChannel = -1;
    arming = false;
    engaged = false;
    targetParamId = -1;
    outlet(1, 0);        // clear lnb_cc display
    outlet(2, -1);       // clear lnb_ch display
    outlet(4, 0);
    // Clear DeviceParameters via LiveAPI so preset reflects unmapped state.
    // TgtId is cleared here (only intentional 0 write — guard in onTargetId skips id=0).
    _lastWrittenTgtId = 0;  // reflect the 0 write so onTargetId(0) guard stays consistent
    // Stop keep-alive synchronously so no amber fires between now and Task execution.
    // (Task sets _s7mirrorId=0 again inside for belt-and-suspenders safety.)
    _s7mirrorId = 0;
    _s7kaStop();
    // ── Slot-7/main-Map mirror: clear panel slot 7 on main Map unmap ─────────
    // _panelPrevTgts[7] updated INSIDE Task (after mm_tgt_7) to prevent echo loop.
    var _s7uT = new Task(function() {
        try {
            var _nb7u = this.patcher.getnamed("mm_tgt_7");
            if (_nb7u) _nb7u.message(0);
            _panelPrevTgts[7] = 0;  // atomic with mm_tgt_7 clear
            try {
                var _mm7bpu = this.patcher.getnamed("multimap");
                var _mm7su  = _mm7bpu  ? _mm7bpu.subpatcher(0)         : null;
                var _bp7u   = _mm7su   ? _mm7su.getnamed("bpslot7")     : null;
                var _bs7u   = _bp7u    ? _bp7u.subpatcher(0)            : null;
                if (_bs7u) {
                    var _ltxt7u = _bs7u.getnamed("live.text");
                    if (_ltxt7u) {
                        _ltxt7u.message(0); // un-arm: stops metro, resets arm state
                        _ltxt7u.message("text", "Map");
                        _ltxt7u.message("texton", "Map");
                        // State machine (it_rt) only resets lcdcolor, NOT lcdbgcolor.
                        // JS may have written amber to lcdbgcolor; reset explicitly.
                        // Values from live.text JSON defaults (lcdbgcolor dark, lcdcolor warm light).
                        _ltxt7u.message("lcdbgcolor", 0.082, 0.082, 0.086, 1.0);
                        _ltxt7u.message("lcdcolor",   0.717, 0.631, 0.498, 1.0);
                    }
                    // Clear it_mapstore so state machine evaluates state=0 correctly
                    var _mst7u = _bs7u.getnamed("it_mapstore");
                    if (_mst7u) _mst7u.message(0);
                    // Hide X button (slotMapped=false after unmap → _updateMapBtnVisibility
                    // handles it too, but explicit reset here is belt-and-suspenders).
                    var _xbtu = _bs7u.getnamed("live.text[1]");
                    if (_xbtu) _xbtu.message("hidden", 1);
                }
            } catch(_e7us) {}
            _updateMapBtnVisibility();
            // Belt-and-suspenders: keep-alive was already stopped synchronously above.
            _s7mirrorId = 0;
            _s7kaStop();
        } catch(_e7u) {}
    }, this);
    _s7uT.schedule(0);
    // ─────────────────────────────────────────────────────────────────────────
    if (!tgtIdParam) _findOwnParams();
    try { if (tgtIdParam) tgtIdParam.set("value", 0); } catch(e) {}
    // v20: sync lnb_tgt stored value to 0. "set X" via ps_tgt potentially writes through to TgtId
    // via parameter_enable=1 binding without firing outlet. Stale stored value X after unmap
    // could trigger tgtIdObserver (silent write-through) → autonomous _doRebind.
    // varname "lnb_tgt" was added to lnb_tgt box in DEV.amxd (was "live.numbox[2]").
    try {
        var _lnbt20 = this.patcher.getnamed("lnb_tgt");
        if (_lnbt20) {
            _lnbt20.message("set", 0);
        } else {
        }
    } catch(e) {}
    try { if (ccParamId > 0) new LiveAPI(null, "id " + ccParamId).set("value", 0); } catch(e) {}
    try { var _lnbCh=this.patcher.getnamed("lnb_ch"); if(_lnbCh) _lnbCh.message(-1); } catch(e) {}
    // Clear byname data so unmap is fully clean.
    _tgtDevName = null; _tgtParamIdx = -1; _tgtDevOcc = 0;
    if (!_dnPids) _findByNameParams();
    for (var _ui = 0; _ui < DN_CHUNKS; _ui++) {
        if (_dnPids && _dnPids[_ui] > 0) {
            try { new LiveAPI(null, "id " + _dnPids[_ui]).set("value", 0); } catch(e) {}
        }
    }
    if (_tpiPid > 0) { try { new LiveAPI(null, "id " + _tpiPid).set("value", 0); } catch(e) {} }
    updateLabel();
    _updateMapBtnVisibility();
}
unmap.local = 1;

// ── Track selection (Lock mode) ───────────────────────────────────────
function selectTargetTrack() {
    if (!absoluteMode) return;
    var selectId = (targetTrackId > 0) ? targetTrackId : hostId;
    if (selectId <= 0) return;
    try {
        var view = new LiveAPI(null, "live_set view");
        var cur = view.get("selected_track");
        if (!cur || cur.length < 2) return;
        if (parseInt(cur[1], 10) === selectId) return;
        view.set("selected_track", "id " + selectId);
    } catch(e) {}
}
selectTargetTrack.local = 1;

// ── CC routing ────────────────────────────────────────────────────────
function list() {
    var args = arrayfromargs(arguments);

    // Inlet 10: slot name text from textedit (multi-word → arrives as list)
    if (inlet === 10) {
        _userStartedTyping = true;
        var raw = args.join(" ");
        var combined = (raw.length > MAX_LABEL_LEN) ? raw.slice(0, MAX_LABEL_LEN) : raw;
        _applyLabel(combined);
        schedulePushLabel();
        return;
    }

    // Inlet 2: CC input list [value, cc, channel]
    if (args.length < 3) return;
    var val = args[0], cc = args[1], ch = args[2];
    if (arming) {
        learnedCC = cc;
        learnedChannel = ch;
        arming = false;
        // Write DeviceParameters so preset save captures CC/Ch values.
        // lnb_ch: use patcher.getnamed to send raw number (raw→inlet 0 updates stored value + LOM).
        // LiveAPI.set only updates LOM, not stored value — does NOT survive .als reload.
        if (chParamId < 0 || (!ccParamId && ccParamId !== 0)) _findOwnParams();
        try { if (ccParamId > 0) new LiveAPI(null, "id " + ccParamId).set("value", learnedCC + 1); } catch(e) {}
        try { var _lnbCh=this.patcher.getnamed("lnb_ch"); if(_lnbCh) _lnbCh.message(learnedChannel); } catch(e) {}
        outlet(1, learnedCC + 1);   // → ps_cc → lnb_cc display update
        outlet(2, learnedChannel);  // → ps_ch → lnb_ch display update (redundant but harmless)
        outlet(4, 0);
        updateLabel();
        _updateMapBtnVisibility();
        engaged = true;
        routeCC(val, cc, ch);
    } else {
        routeCC(val, cc, ch);
    }
}

function routeCC(val, cc, ch) {
    if (learnedCC < 0) return;
    if (cc !== learnedCC) return;
    if (ch !== learnedChannel) return;
    if (!absoluteMode && !active) return;

    if (absoluteMode) selectTargetTrack();

    var v = val / 127.0;

    if (engaged) { lastIncoming = v; setVal(v); return; }

    if (takeoverMode === 0) {
        engaged = true; lastIncoming = v; setVal(v); return;
    }

    if (takeoverMode === 2) {
        if (anchorC < 0) { anchorC = v; lastIncoming = v; return; }
        var p;
        if (v >= anchorC) p = anchorP + ((anchorC < 1) ? (v - anchorC) / (1 - anchorC) : 1) * (1 - anchorP);
        else              p = (anchorC > 0) ? anchorP * (v / anchorC) : 0;
        if (Math.abs(p - v) < PICKUP_EPS) engaged = true;
        lastIncoming = v; setVal(p); return;
    }

    var caught = Math.abs(v - currentVal) < PICKUP_EPS;
    if (!caught && lastIncoming >= 0) {
        var lo = Math.min(lastIncoming, v), hi = Math.max(lastIncoming, v);
        caught = (currentVal >= lo && currentVal <= hi);
    }
    lastIncoming = v;
    if (!caught) return;
    engaged = true;
    setVal(v);
}

function setVal(p) {
    currentVal = Math.max(0.0, Math.min(1.0, p));
    _lastSentDialValue = currentVal;  // suppress _dialObserver echo for this write
    outlet(0, currentVal);
}

// ── Text from textedit (textedit sends ALL content with "text" selector) ─
// PRIMARY inlet-10 handler. msg_symbol/list below are fallbacks.
// Empty input = user deliberately cleared the field — display and persist empty string.
// Hard limit = MAX_LABEL_LEN enforced on every keystroke (continuous).
// If raw > N chars: clamp + echo back (via _applyLabel → outlet(11)) so the field immediately
// shows the truncated version. User cannot type more than N characters.
// deferlow in the echo path coalesces rapid calls — no flicker.
// Panel rebind trigger — fired from AMXD when mm_panel outlet 1 fires (any panel slot maps).
// mb_bindtrig in MapButtonTint handles blink-stop locally (patch-based, canonical approach).
// Mirrors _doRebind() visual update: immediate + 700ms backup.
// Also detects which mm_tgt_N changed (vs _panelPrevTgts) and captures byname data for that slot.
function panelmap() {
    if (!_initialized) return;
    _updateMapBtnVisibility();
    var vt = new Task(function() { _updateMapBtnVisibility(); applyColor(); }, this);
    vt.schedule(700);
    // Detect changed slot and trigger byname capture (or clear on unmap).
    // _pendingPanelSi / _pendingPanelId are ES3-safe globals for the Task closure.
    for (var si = 0; si < 8; si++) {
        try {
            var mmBox = this.patcher.getnamed("mm_tgt_" + si);
            var mmv = mmBox ? Math.round(mmBox.getvalueof()) : 0;
            if (mmv !== _panelPrevTgts[si]) {
                _panelPrevTgts[si] = mmv;
                if (mmv > 0) {
                    _pendingPanelSi = si;
                    _pendingPanelId = mmv;
                    var _ct = new Task(function() { _captureSlotBn(_pendingPanelSi, _pendingPanelId); }, this);
                    _ct.schedule(0);
                } else {
                    _clearPanelBnSlot(si);
                }
                // ── Slot-7/main-Map mirror: panel slot 7 → main Map ───────────────────
                // When slot 7 changes, sync main Map target.
                // onTargetId guard (_lastWrittenTgtId) prevents echo-loop from the
                // subsequent obj-46[out1] → inlet 9 callback after _doRebind/outlet(12).
                if (si === 7) {
                    if (mmv > 0) {
                        onTargetId(mmv);
                    }
                }
                // ─────────────────────────────────────────────────────────────────────
            }
        } catch(e) {}
    }
}

function text() {
    if (inlet !== 10) return;
    _userStartedTyping = true;
    var args = arrayfromargs(arguments);
    var raw = (args.length > 0) ? args.join(" ") : "";
    var combined = (raw.length > MAX_LABEL_LEN) ? raw.slice(0, MAX_LABEL_LEN) : raw;
    _applyLabel(combined);
    schedulePushLabel();
}

// ── Symbol inlet (single-word slot name from textedit — fallback) ─────
function msg_symbol(v) {
    if (inlet === 10) {
        _userStartedTyping = true;
        var raw = String(v);
        if (raw === '0') return; // Max default bang value — ignore
        var s = (raw.length > MAX_LABEL_LEN) ? raw.slice(0, MAX_LABEL_LEN) : raw;
        _applyLabel(s);
        schedulePushLabel();
    }
}

// ── Integer inlets ────────────────────────────────────────────────────
// inlet 10: textedit sends INT when content is purely numeric (Max type-coercion).
//   Treat as label text — convert to string and apply.
function msg_int(v) {
    var i = inlet;
    if      (i === 1) toggleLearn();
    else if (i === 3) { learnedCC = v - 1; updateLabel(); }   // restore from lnb_cc
    else if (i === 4) { learnedChannel = v; }                  // restore from lnb_ch
    else if (i === 5) { currentVal = Math.max(0.0, Math.min(1.0, v)); }
    else if (i === 6) { takeoverMode = v; }
    else if (i === 7) { setMode(v); }
    else if (i === 8) { setAbsoluteMode(v); }
    else if (i === 9) { onTargetId(v); }
    else if (i === 10) {
        _userStartedTyping = true;
        var raw10 = String(v);
        var s10 = (raw10.length > MAX_LABEL_LEN) ? raw10.slice(0, MAX_LABEL_LEN) : raw10;
        _applyLabel(s10);
        schedulePushLabel();
    }
    else if (i === 11) { _handleXClick11(); }
}

// X button clicked on panel slot 8 (bpslot7) — unmap the main Map button.
// Flow: MapButtonTint xt_out → multimapDF xt_mm_out → mm_panel[3] → here (inlet 11).
// v22: live.text (parameter_enable=1) may send this as float, not int — msg_int
// alone silently dropped it. Shared by both msg_int and msg_float for inlet 11.
function _handleXClick11() {
    // Guard: only fire if _s7mirrorId > 0 (mirror is actually active).
    if (_s7mirrorId > 0) {
        // 1. Reset main MapButtonTint live.text to 0 (stops blink metro, triggers state machine)
        try {
            var _mbp11 = this.patcher.getnamed("df_mapparam");
            var _mbs11 = _mbp11 ? _mbp11.subpatcher(0) : null;
            var _mbt11 = _mbs11 ? _mbs11.getnamed("live.text") : null;
            if (_mbt11) _mbt11.message(0);
        } catch(_e11) {}
        // 2. Send id=0 to main MapButtonTint inlet 1 → live.remote~ unbind
        outlet(12, 0);
        // 3. Clear JS CC/channel state + TgtId DeviceParameter
        unmap();
    }
}
_handleXClick11.local = 1;

// ── Float inlets ──────────────────────────────────────────────────────
// inlet 10: textedit may send FLOAT for numeric content (fallback to msg_float).
function msg_float(v) {
    if (inlet === 5) currentVal = Math.max(0.0, Math.min(1.0, v));
    else if (inlet === 10) {
        _userStartedTyping = true;
        var raw10f = String(Math.round(v));
        var s10f = (raw10f.length > MAX_LABEL_LEN) ? raw10f.slice(0, MAX_LABEL_LEN) : raw10f;
        _applyLabel(s10f);
        schedulePushLabel();
    }
    else if (inlet === 11) { _handleXClick11(); }
}
