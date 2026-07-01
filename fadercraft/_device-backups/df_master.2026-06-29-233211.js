// df_master.js — DYNAMIC FOCUS "MASTER" engine, v6.3 (arm blink fix: debounce first-CC, pollParam only on explicit arm)
//
// PERSISTENCE ARCHITECTURE (v5.9):
//   Slot params: 128 × 4 = 512 (df_sN_meta, df_sN_p0/p1/p2)
//   Global:      df_ch = 1
//   Page notes:  8 pages × 8 params = 64 (df_pgN_t0..t7)
//   Total:       577 live.numbox persist params.
//
//   Slot fields per N=0..127 (unchanged from v5.8):
//     df_sN_meta  (Int, mmax=2000000): (cc+1) + omin*129 + omax*13029
//     df_sN_p0    (Int, mmax=9999999): path_f % 1e7
//     df_sN_p1    (Int, mmax=9999999): floor(path_f/1e7) % 1e7
//     df_sN_p2    (Int, mmax=9999999): floor(path_f/1e14)
//
//   Page note fields per page N=0..7 (v5.9 new):
//     df_pgN_t0..df_pgN_t7  (Int, mmax=4194304): 3 ASCII chars each
//       v = c0 + c1*128 + c2*128^2  (max 2097151 < 4194304 < 2^24 ✓)
//       sentinel v=0 = empty chunk. 8 params × 3 chars = 24 chars max per page.
//
//   UI (v5.9 new):
//     pg_name_edit (textedit): shows/edits NOTES[currentPage]. On enter → pushNote().
//     pg_clear_btn (live.text button): clears all 16 slots on current page.
//
// GUARDS (v5.7, preserved in full):
//   pushSlot: !_restoreDone → blocked; empty slot + !_explicitClear → blocked.
//   pushNote: !_restoreDone → blocked.
//   clearSlot: _explicitClear=true before pushSlot.
//
// LOGS (v5.9 lean):
//   - loadDeviceParams: one summary line (total, found). DIAG only for slot 0 + df_ch.
//   - restoreFromParams: PARAM RESTORE only for non-empty slots; one "populated N/128" summary.
//   - setParam: no per-call pre-log (removed "setParam pre:").
//   - pushSlot: log only on real writes (not blocked).
//   - Observer/retry/guard-blocked logs: preserved.
//
// Inlets: 0=bang, 1=cmd list, 2=CC list
// Outlets: 0=row, 1=value, 2=page sel

autowatch = 0;
inlets  = 3;
outlets = 5;  // 0=row, 1=value, 2=page sel, 3=name field1, 4=name field2

var PAGE_SIZE     = 16;
var NPAGES        = 8;
var NSLOTS        = PAGE_SIZE * NPAGES;  // 128
var PERSIST_SLOTS = 128;
var NOTE_PAGES    = 8;
var NOTE_PARAMS   = 8;   // params per page (8 × 3 chars = 24 chars max)

var currentPage = 0;

var SLOTS = [], OUTMIN = [], OUTMAX = [];
var NOTES = [];          // field1 page names (note chunks 0-3)
var NOTES2 = [];         // field2 page names (note chunks 4-7)
var _globalCh = null;

function initSlots() {
    SLOTS = []; OUTMIN = []; OUTMAX = []; NOTES = []; NOTES2 = [];
    for (var i = 0; i < NSLOTS; i++) {
        SLOTS.push(null); OUTMIN.push(0); OUTMAX.push(100);
    }
    for (var i = 0; i < NOTE_PAGES; i++) { NOTES.push(defaultNote(i)); NOTES2.push(defaultNote(i)); }
}
// Default per-page name placeholder: "\\" (two backslashes)
function defaultNote(pg) { return "\\\\"; }
initSlots();

var learnCCSlot = -1;
var learnPSlot  = -1;
var _armCCTime  = 0;   // Date.now() when armCC was last called — ignore first CC for 300ms
var _lastArmCC  = 0;   // Date.now() of last Map CC click — debounce momentary press/release pair
var _lastArmP   = 0;   // Date.now() of last Map Param click — same debounce for toggle
// ── perf monitor: resolveAll cost + CC throughput, logged to Max window ──
var _DEBUG = false;    // gate verbose per-message logging (off = clean perf reading)
var _perf = { resolveMs: 0, resolveMax: 0, resolveSlots: 0, ccCount: 0 };
var _perfTask = new Task(function() {
    if (_perf.ccCount > 0) {
        log("PERF: CC " + _perf.ccCount + "/2s, resolveAll last=" + _perf.resolveMs
            + "ms max=" + _perf.resolveMax + "ms (" + _perf.resolveSlots + " slots)");
        _perf.ccCount = 0;
    }
}, this);
_perfTask.interval = 2000;
_perfTask.repeat();
var selTrackObs = null, selParamObs = null;
var PICKUP_EPS  = 0.02;

// -- Path encoding (base-150, 8 tokens, float64 exact) ----------------
var PATH_BASE = 150;
var PATH_KW = {
    "live_set": 1, "tracks": 2, "return_tracks": 3, "master_track": 4,
    "devices": 5, "parameters": 6, "mixer_device": 7, "sends": 8,
    "value": 9, "volume": 10, "panning": 11, "chains": 12,
    "clip_slots": 13, "clip": 14, "view": 15, "crossfader": 16,
    "cue_volume": 17, "track_activator": 18, "solo": 19, "arm": 20,
    "mute": 21, "output_routing": 22, "input_routing": 23
};
var PATH_CODE_TO_KW = {};
(function() { for (var k in PATH_KW) PATH_CODE_TO_KW[PATH_KW[k]] = k; })();

function encodePath(ppath) {
    var tokens = ppath.split(" ");
    var codes = [];
    for (var i = 0; i < tokens.length && i < 8; i++) {
        var t = tokens[i];
        var n = parseInt(t, 10);
        if (!isNaN(n) && ("" + n) === t) {
            if (n > 125) { log("encodePath WARNING: index " + n + " > 125, clamped. Path: " + ppath); n = 125; }
            codes.push(24 + n);
        } else {
            var kw = PATH_KW[t];
            if (kw === undefined) { log("encodePath WARNING: unknown keyword '" + t + "' in: " + ppath); kw = 0; }
            codes.push(kw);
        }
    }
    var result = 0, power = 1;
    for (var i = 0; i < codes.length; i++) { result += codes[i] * power; power *= PATH_BASE; }
    return result;
}

function decodePath(f) {
    var v = Math.round(f);
    if (v <= 0) return null;
    var tokens = [], remaining = v;
    for (var i = 0; i < 8; i++) {
        var code = remaining % PATH_BASE;
        remaining = Math.floor(remaining / PATH_BASE);
        if (code === 0) break;
        if (code >= 24) { tokens.push("" + (code - 24)); }
        else {
            var kw = PATH_CODE_TO_KW[code];
            if (!kw) { log("decodePath: unknown code " + code + " at token " + i); return null; }
            tokens.push(kw);
        }
        if (remaining === 0) break;
    }
    return tokens.length === 0 ? null : tokens.join(" ");
}

// -- meta field encoding (v5.8) ---------------------------------------
var META_OMIN_MUL = 129;
var META_OMAX_MUL = 13029;  // = 129 * 101

function encodeMeta(cc, omin, omax) {
    var cc_enc = (cc != null && cc >= 0) ? (cc + 1) : 0;
    return cc_enc + Math.round(omin) * META_OMIN_MUL + Math.round(omax) * META_OMAX_MUL;
}
function decodeMeta(m) {
    var v = Math.round(m);
    if (v < 0) v = 0;
    var cc_enc = v % META_OMIN_MUL;
    var cc     = (cc_enc > 0) ? (cc_enc - 1) : null;
    var rest   = Math.floor(v / META_OMIN_MUL);
    var omin   = rest % 101;
    var omax   = Math.floor(rest / 101);
    return { cc: cc, omin: omin, omax: omax };
}

// -- page note encoding (v5.9) ----------------------------------------
// 3 ASCII chars per Int: v = c0 + c1*128 + c2*16384
// c0=0 → end of string. encode_3chars returns 0 for empty/past-end chunk.
function encodeNoteChunk(s, offset) {
    var c = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
        var idx = offset + i;
        if (idx < s.length) {
            var code = s.charCodeAt(idx);
            c[i] = (code > 0 && code <= 127) ? code : 63;  // '?' for non-ASCII
        }
    }
    return c[0] + c[1] * 128 + c[2] * 16384;
}
function decodeNoteChunk(v) {
    v = Math.round(v);
    if (v <= 0) return '';
    var c0 =  v % 128;
    var c1 = Math.floor(v / 128) % 128;
    var c2 = Math.floor(v / 16384) % 128;
    var result = '';
    for (var i = 0; i < 3; i++) {
        var c = [c0, c1, c2][i];
        if (c === 0) break;
        result += String.fromCharCode(c);
    }
    return result;
}
var NAME_CHUNKS = 4;   // 4 chunks = 12 chars per name; the 8 note params hold TWO names (0-3 field1, 4-7 field2)
function encodeName(name) {
    var s = name ? name.slice(0, NAME_CHUNKS * 3) : '';
    var result = [];
    for (var i = 0; i < NAME_CHUNKS; i++) result.push(encodeNoteChunk(s, i * 3));
    return result;
}
function decodeName(params) {   // params = NAME_CHUNKS ints
    var result = '';
    for (var i = 0; i < params.length; i++) {
        var chunk = decodeNoteChunk(params[i]);
        result += chunk;
        if (chunk.length < 3) break;
    }
    return result;
}

function log(s) { post("[DF-Master] " + s + "\n"); }

// -- LiveAPI parameter cache ------------------------------------------
var _paramCache = {};
var _cacheReady = false;

function loadDeviceParams() {
    _paramCache = {};
    _cacheReady = false;
    try {
        var dev = new LiveAPI(null, "this_device");
        var params = dev.get("parameters");
        var total = 0, found = 0;
        for (var i = 0; i < params.length - 1; i++) {
            if (params[i] !== "id") continue;
            var pid = params[i + 1];
            var p = new LiveAPI(null, "id " + pid);
            var nm = p.get("name") + "";
            total++;
            if (nm.indexOf("df_s") === 0 || nm === "df_ch" || nm.indexOf("df_pg") === 0) {
                _paramCache[nm] = pid;
                found++;
            }
        }
        _cacheReady = true;
        log("loadDeviceParams: total=" + total + " df_*/df_ch=" + found);
        // DIAG only for slot 0 and df_ch (not 577 lines)
        var diag_keys = ["df_s0_meta", "df_s0_p0", "df_pg0_t0", "df_ch"];
        for (var di = 0; di < diag_keys.length; di++) {
            var dk = diag_keys[di];
            if (_paramCache[dk] !== undefined) {
                try {
                    var dp = new LiveAPI(null, "id " + _paramCache[dk]);
                    log("DIAG param: " + dk + " pid=" + _paramCache[dk]
                        + " min=" + dp.get("min") + " max=" + dp.get("max"));
                } catch(de) { log("DIAG param ERROR " + dk + ": " + de); }
            }
        }
    } catch(e) {
        log("loadDeviceParams ERROR: " + e);
    }
}

function ensureCache() {
    if (!_cacheReady) { log("ensureCache: loading now"); loadDeviceParams(); }
}

function setParam(name, val) {
    ensureCache();
    var pid = _paramCache[name];
    if (pid === undefined) { log("setParam not found: " + name); return; }
    try {
        (new LiveAPI(null, "id " + pid)).set("value", val);
    }
    catch(e) { log("setParam ERROR " + name + ": " + e); }
}

function getParam(name) {
    var pid = _paramCache[name];
    if (pid === undefined) return 0;
    try { return parseFloat((new LiveAPI(null, "id " + pid)).get("value")); }
    catch(e) { log("getParam ERROR " + name + ": " + e); return 0; }
}

// -- Restore state machine (v5.7, observer now on df_s0_meta) ---------
var _restoreDone   = false;
var _restoreObs    = null;
var _explicitClear = false;
var _retryDelays   = [200, 500, 1000, 2000, 4000, 8000];
var _retryIdx      = 0;
var _retryTask     = null;

function _armRestoreObserver() {
    var pid = _paramCache["df_s0_meta"];
    if (pid === undefined) {
        log("restore observer: df_s0_meta not in cache -- relying on retry");
        return;
    }
    try {
        _restoreObs = new LiveAPI(function() {
            if (_restoreDone) {
                if (_restoreObs) { _restoreObs.property = ""; _restoreObs = null; }
                return;
            }
            var curVal = 0;
            try { curVal = parseFloat((new LiveAPI(null, "id " + pid)).get("value")); } catch(e) {}
            log("restore trigger: observer fired df_s0_meta=" + curVal);
            if (_restoreObs) { _restoreObs.property = ""; _restoreObs = null; }
            if (_retryTask)  { _retryTask.cancel(); _retryTask = null; }
            if (!_restoreDone) {
                _restoreDone = true;
                restoreFromParams("observer");
            }
        }, "id " + pid);
        _restoreObs.property = "value";
        log("restore observer: armed on df_s0_meta pid=" + pid);
    } catch(e) {
        log("restore observer ERROR: " + e + " -- relying on retry");
    }
}

function _scheduleRetry() {
    if (_restoreDone) return;
    if (_retryIdx >= _retryDelays.length) {
        log("restore retry: all attempts exhausted, all-zero -- nothing to restore");
        if (_restoreObs) { _restoreObs.property = ""; _restoreObs = null; }
        return;
    }
    var delay = _retryDelays[_retryIdx];
    var attempt = _retryIdx + 1;
    _retryIdx++;
    _retryTask = new Task(function() {
        if (_restoreDone) return;
        var anyNonZero = false;
        var checkN = Math.min(PERSIST_SLOTS, 8);
        for (var s = 0; s < checkN; s++) {
            if (getParam("df_s" + s + "_meta") !== 0) { anyNonZero = true; break; }
        }
        if (!anyNonZero) {
            log("restore retry " + attempt + ": all-zero, rescheduling (delay was " + delay + "ms)");
            _scheduleRetry();
            return;
        }
        log("restore retry " + attempt + ": non-zero meta found -> restoring");
        if (_restoreObs) { _restoreObs.property = ""; _restoreObs = null; }
        _restoreDone = true;
        restoreFromParams("retry-" + attempt);
    }, this);
    _retryTask.schedule(delay);
}

// -- Init -------------------------------------------------------------
function bang() {
    if (inlet !== 0) return;
    _restoreDone   = false;
    _explicitClear = false;
    _retryIdx      = 0;
    if (_restoreObs) { _restoreObs.property = ""; _restoreObs = null; }
    if (_retryTask)  { _retryTask.cancel(); _retryTask = null; }

    var t = new Task(function() {
        loadDeviceParams();
        setupFocus();
        _armRestoreObserver();
        _scheduleRetry();
    }, this);
    t.schedule(200);
}

function setupFocus() {
    if (selTrackObs) selTrackObs.property = "";
    selTrackObs = new LiveAPI(onSelectedTrack, "live_set view");
    selTrackObs.property = "selected_track";
    if (selParamObs) selParamObs.property = "";
    selParamObs = new LiveAPI(onSelectedParam, "live_set view");
    selParamObs.property = "selected_parameter";
    resolveAll();
    renderCurrentPage();
    renderPageSel();
    renderNote();
}

// -- Restore ----------------------------------------------------------
function restoreFromParams(triggerSource) {
    log("restoreFromParams: triggered by [" + (triggerSource || "unknown") + "]");
    ensureCache();

    // Global channel
    var ch_raw = getParam("df_ch");
    _globalCh = (ch_raw > 0) ? Math.round(ch_raw) : null;

    // Slots (log only non-empty)
    var restoredCount = 0;
    for (var s = 0; s < PERSIST_SLOTS; s++) {
        var meta = getParam("df_s" + s + "_meta");
        var p0   = getParam("df_s" + s + "_p0");
        var p1   = getParam("df_s" + s + "_p1");
        var p2   = getParam("df_s" + s + "_p2");
        var path_f = p0 + p1 * 1e7 + p2 * 1e14;

        var md    = decodeMeta(meta);
        var ppath = decodePath(path_f);

        var has_cc   = (md.cc != null && md.cc >= 0);
        var has_path = (ppath !== null);
        if (!has_cc && !has_path) continue;  // empty — skip silently

        log("PARAM RESTORE: slot=" + s
            + " meta=" + meta + " p0=" + p0 + " p1=" + p1 + " p2=" + p2
            + " path_f=" + path_f
            + " -> cc=" + md.cc + " omin=" + md.omin + " omax=" + md.omax
            + " path=" + (ppath || "null"));

        SLOTS[s] = newSlot();
        if (has_cc) { SLOTS[s].cc = md.cc; SLOTS[s].ch = _globalCh; }
        if (has_path) { SLOTS[s].path = ppath; SLOTS[s].name = resolveNameFromPath(ppath); }
        OUTMIN[s] = md.omin;
        OUTMAX[s] = md.omax;
        restoredCount++;
    }
    log("restoreFromParams: populated " + restoredCount + " of " + PERSIST_SLOTS + " slots");

    // Page notes — 8 chunks per page hold TWO names: t0-3 = field1, t4-7 = field2
    for (var pg = 0; pg < NOTE_PAGES; pg++) {
        var aC = [], bC = [];
        for (var t = 0; t < NAME_CHUNKS; t++) {
            aC.push(getParam("df_pg" + pg + "_t" + t));
            bC.push(getParam("df_pg" + pg + "_t" + (t + NAME_CHUNKS)));
        }
        var da = decodeName(aC), db = decodeName(bC);
        NOTES[pg]  = (da !== '') ? da : defaultNote(pg);
        NOTES2[pg] = (db !== '') ? db : defaultNote(pg);
    }
    log("restoreFromParams: notes restored (pg0=" + NOTES[0] + ")");

    var t2 = new Task(function() {
        resolveAll();
        for (var s = 0; s < PERSIST_SLOTS; s++) {
            var b = SLOTS[s];
            if (!b || !b.target || !b.path) continue;
            if (b.pmin === 0 && b.pmax === 1) {
                var pmin_v = parseFloat(b.target.get("min"));
                var pmax_v = parseFloat(b.target.get("max"));
                if (!isNaN(pmin_v)) b.pmin = pmin_v;
                if (!isNaN(pmax_v)) b.pmax = pmax_v;
            }
        }
        renderCurrentPage();
        renderPageSel();
        renderNote();
        log("restoreFromParams Task: done");
    }, this);
    t2.schedule(200);
}

function resolveNameFromPath(ppath) {
    try {
        var api = new LiveAPI(null, ppath);
        if (api && api.id && api.id > 0) {
            var n = api.get("name") + "";
            if (n && n.length > 0 && n !== "0") return n;
        }
    } catch(e) {}
    var tokens = ppath.split(" ");
    for (var i = tokens.length - 1; i >= 0; i--) {
        var t = tokens[i];
        if (isNaN(parseInt(t, 10)) && t !== "value") return t;
    }
    return "?";
}

// -- pushSlot (v5.7 guards preserved) ---------------------------------
function pushSlot(s) {
    if (s >= PERSIST_SLOTS) return;
    if (!_restoreDone) {
        log("pushSlot BLOCKED (restore pending): s=" + s);
        return;
    }
    var _s = s;
    var _allowEmpty = _explicitClear;
    _explicitClear = false;
    var b_check = SLOTS[_s];
    var isEmpty = (!b_check || (b_check.cc == null && !b_check.path));
    if (isEmpty && !_allowEmpty) {
        log("pushSlot BLOCKED (empty slot, not explicit clear): s=" + _s);
        return;
    }
    var t = new Task(function() {
        ensureCache();
        var b      = SLOTS[_s];
        var cc_val = (b && b.cc != null) ? b.cc : null;
        var meta   = encodeMeta(cc_val, OUTMIN[_s], OUTMAX[_s]);
        var path_f = (b && b.path) ? encodePath(b.path) : 0;
        var pf = path_f;
        var p0 = pf % 1e7;   pf = Math.floor(pf / 1e7);
        var p1 = pf % 1e7;   pf = Math.floor(pf / 1e7);
        var p2 = pf;
        setParam("df_s" + _s + "_meta", meta);
        setParam("df_s" + _s + "_p0",   p0);
        setParam("df_s" + _s + "_p1",   p1);
        setParam("df_s" + _s + "_p2",   p2);
        log("pushSlot OK: s=" + _s + " meta=" + meta + " path_f=" + path_f
            + " [p0=" + p0 + " p1=" + p1 + " p2=" + p2 + "]");
        if (cc_val != null) setParam("df_ch", (_globalCh !== null) ? _globalCh : 0);
    }, this);
    t.schedule(0);
}

// -- pushNote (v5.9) --------------------------------------------------
function pushNote(pg) {
    if (!_restoreDone) {
        log("pushNote BLOCKED (restore pending): pg=" + pg);
        return;
    }
    var _pg = pg;
    var t = new Task(function() {
        ensureCache();
        var aChunks = encodeName(NOTES[_pg]);
        var bChunks = encodeName(NOTES2[_pg]);
        for (var i = 0; i < NAME_CHUNKS; i++) {
            setParam("df_pg" + _pg + "_t" + i, aChunks[i]);
            setParam("df_pg" + _pg + "_t" + (i + NAME_CHUNKS), bChunks[i]);
        }
        log("pushNote OK: pg=" + _pg + " A=" + NOTES[_pg] + " B=" + NOTES2[_pg]);
    }, this);
    t.schedule(0);
}

function pushState() {
    for (var s = 0; s < PERSIST_SLOTS; s++) pushSlot(s);
    for (var pg = 0; pg < NOTE_PAGES; pg++) pushNote(pg);
}

// -- renderNote: set textedit content; placeholder is the textedit's native hint --
// outlet 3 → pg_name_edit textedit: set text content (empty => native hint shows)
function renderNote() {
    // pass words as separate atoms so a multi-word name is NOT sent as one
    // quoted symbol (textedit would display the literal quotes).
    // outlet 3 -> field1 (NOTES), outlet 4 -> field2 (NOTES2)
    var a1 = NOTES[currentPage]  || '';
    var a2 = NOTES2[currentPage] || '';
    var args1 = [3, "set"]; if (a1.length) args1 = args1.concat(a1.split(" "));
    outlet.apply(this, args1);
    var args2 = [4, "set"]; if (a2.length) args2 = args2.concat(a2.split(" "));
    outlet.apply(this, args2);
}

// -- pushNote debounce task (avoids LiveAPI flood on every keystroke) --
var _pushNoteTimer = null;
function schedulePushNote(pg) {
    if (_pushNoteTimer) { _pushNoteTimer.cancel(); _pushNoteTimer = null; }
    var _pg = pg;
    _pushNoteTimer = new Task(function() {
        _pushNoteTimer = null;
        pushNote(_pg);
    }, this);
    _pushNoteTimer.schedule(400);  // 400ms after last keystroke
}

// -- Inlet 1: row/page command. Inlet 2: CC ---------------------------
function list() {
    if (inlet === 1) { handleCmd(arrayfromargs(arguments)); return; }
    if (inlet === 2) { handleCC(arrayfromargs(arguments)); return; }
}

// Symbol-led messages (e.g. "clearpage", "pgname <text>") are dispatched by Max
// to a function of that name, NOT to list(). Catch them here and route to handleCmd.
function anything() {
    if (inlet !== 1) return;
    var a = [messagename].concat(arrayfromargs(arguments));
    handleCmd(a);
}

function handleCC(a) {
    if (a.length < 3) return;
    _perf.ccCount++;
    var val = a[0], cc = a[1], ch = a[2];
    if (_DEBUG) log("handleCC: val=" + val + " cc=" + cc + " ch=" + ch + " learnCCSlot=" + learnCCSlot);
    if (learnCCSlot >= 0) {
        // Ignore first CC for 300ms after arm — prevents the arm-button's own CC from
        // immediately self-capturing and killing the blink before it starts.
        var elapsed = Date.now() - _armCCTime;
        if (elapsed < 300) {
            log("handleCC: skip (arm debounce " + elapsed + "ms < 300ms)");
        } else {
            captureCC(learnCCSlot, cc, ch);
        }
    }
    var v = val / 127.0;
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || b.cc == null || b.cc !== cc) continue;
        if (!b.target) continue;
        drive(i, b, v);
        var visRow = slotToVisRow(i);
        if (visRow >= 0) renderValueRow(visRow, i);
    }
}

function page(n) {
    var pg = parseInt(n, 10);
    if (isNaN(pg) || pg < 0 || pg >= NPAGES) return;
    setPage(pg);
}

function handleCmd(a) {
    if (a.length < 1) return;
    var first = a[0];

    // "clearpage" arrives as single-atom message → length=1, handled here
    if (first === "clearpage") {
        var base = currentPage * PAGE_SIZE;
        for (var r = 0; r < PAGE_SIZE; r++) {
            var absSlot = base + r;
            SLOTS[absSlot] = null;
            if (learnCCSlot === absSlot) learnCCSlot = -1;
            if (learnPSlot  === absSlot) learnPSlot  = -1;
            _explicitClear = true;
            pushSlot(absSlot);
        }
        renderCurrentPage();
        log("clearpage: cleared page " + currentPage);
        return;
    }

    if (a.length < 2) return;
    var cmd   = a[1];
    if (first === "page") {
        var pg = parseInt(cmd, 10);
        if (isNaN(pg) || pg < 0 || pg >= NPAGES) return;
        setPage(pg);
        return;
    }
    if (first === "pgname" || first === "pgname2") {
        // textedit outputs its buffer as a list led by the selector "text"
        // (valuemode 0). Fed through [prepend pgname]/[prepend pgname2]:
        //   [<sel>, "text", <word1>, ...]  → drop the "text" token.
        var parts = [];
        for (var i = 1; i < a.length; i++) parts.push(a[i] + "");
        if (parts.length && parts[0] === "text") parts.shift();
        var raw = parts.join(" ");
        // Latin-only: keep printable ASCII (0x20-0x7E); drop non-ASCII (would persist as "?").
        var clean = "";
        for (var k = 0; k < raw.length; k++) {
            var cc = raw.charCodeAt(k);
            if (cc >= 32 && cc <= 126) clean += raw.charAt(k);
        }
        clean = clean.slice(0, NAME_CHUNKS * 3);   // 12 chars per field
        if (first === "pgname") NOTES[currentPage]  = clean;   // field1 (section 1)
        else                    NOTES2[currentPage] = clean;   // field2 (section 2)
        renderNote();                   // reflect cleaned value back into both fields
        schedulePushNote(currentPage);  // debounced persist (writes both halves)
        return;
    }
    var visRow = first;
    if (visRow < 0 || visRow >= PAGE_SIZE) return;
    var absSlot = currentPage * PAGE_SIZE + visRow;
    if      (cmd === "mapcc")    armCC(absSlot);
    else if (cmd === "mapparam") armParam(absSlot);
    else if (cmd === "clear")    clearSlot(absSlot);
    else if (cmd === "min") {
        OUTMIN[absSlot] = clampPct(a[2]);
        reapply(absSlot);
        pushSlot(absSlot);
    }
    else if (cmd === "max") {
        OUTMAX[absSlot] = clampPct(a[2]);
        reapply(absSlot);
        pushSlot(absSlot);
    }
}

function clampPct(x) { x = parseFloat(x); if (isNaN(x)) return 0; return Math.max(0, Math.min(100, x)); }

function setPage(pg) {
    if (learnCCSlot >= 0 && Math.floor(learnCCSlot / PAGE_SIZE) !== pg) learnCCSlot = -1;
    if (learnPSlot  >= 0 && Math.floor(learnPSlot  / PAGE_SIZE) !== pg) learnPSlot  = -1;
    currentPage = pg;
    renderCurrentPage();
    renderPageSel();
    renderNote();  // update textedit with new page note
}

function slotToVisRow(absSlot) {
    var pg = Math.floor(absSlot / PAGE_SIZE);
    if (pg !== currentPage) return -1;
    return absSlot - currentPage * PAGE_SIZE;
}

function armCC(absSlot) {
    // momentary Map CC button fires on press AND release → 2 calls per click.
    // Debounce so one physical click = one action; lets the click TOGGLE arm.
    var now = Date.now();
    if (now - _lastArmCC < 300) return;   // ignore the release half of the click
    _lastArmCC = now;
    if (learnCCSlot === absSlot) {         // second click on same slot → stop mapping
        learnCCSlot = -1;
        renderAbsSlot(absSlot);
        log("armCC: stopped " + absSlot);
        return;
    }
    var prev = learnCCSlot;
    learnCCSlot = absSlot;
    _armCCTime = now;  // start debounce window: ignore first CC for 300ms
    log("armCC: absSlot=" + absSlot + " page=" + currentPage + " (prev=" + prev + ") -- waiting for CC");
    if (prev >= 0 && prev !== absSlot) renderAbsSlot(prev);
    renderAbsSlot(absSlot);
}

function armParam(absSlot) {
    // same debounce as armCC so one click = one action → click TOGGLES arm
    var now = Date.now();
    if (now - _lastArmP < 300) return;   // ignore release half of the click
    _lastArmP = now;
    if (learnPSlot === absSlot) {         // second click on same slot → stop, go cold
        learnPSlot = -1;
        renderAbsSlot(absSlot);
        log("armParam: stopped " + absSlot);
        return;
    }
    var prev = learnPSlot;
    learnPSlot = absSlot;
    if (prev >= 0 && prev !== absSlot) renderAbsSlot(prev);
    renderAbsSlot(absSlot);  // render first so blink starts immediately
    // Delay poll by 250ms: lets blink render before potentially auto-capturing
    var _slot = absSlot;
    var t = new Task(function() {
        if (learnPSlot === _slot) pollSelectedParam();
    }, this);
    t.schedule(250);
}

function pollSelectedParam() {
    if (learnPSlot < 0) return;
    var api = new LiveAPI(null, "live_set view");
    var sp = api.get("selected_parameter");
    if (!sp || sp.length < 2 || sp[0] !== "id") return;
    var pid = parseInt(sp[1], 10);
    if (pid <= 0) return;
    captureParam(learnPSlot, pid);
}

function captureParam(absSlot, pid) {
    var p = new LiveAPI(null, "id " + pid);
    var pname = p.get("name") + "";
    var pmin  = parseFloat(p.get("min"));
    var pmax  = parseFloat(p.get("max"));
    var ppath = p.unquotedpath;
    if (!ppath || ppath.length === 0) {
        log("captureParam: empty path id=" + pid + " name=" + pname + " -- aborted");
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
    pushSlot(absSlot);
}

function captureCC(absSlot, cc, ch) {
    log("captureCC: absSlot=" + absSlot + " cc=" + cc + " ch=" + ch);
    if (!SLOTS[absSlot]) SLOTS[absSlot] = newSlot();
    SLOTS[absSlot].cc = cc;
    SLOTS[absSlot].ch = (ch > 0) ? ch : null;
    _globalCh = (ch > 0) ? ch : null;
    learnCCSlot = -1;
    resolveAll();
    renderAbsSlot(absSlot);
    pushSlot(absSlot);
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
    _explicitClear = true;
    pushSlot(absSlot);
}

function onSelectedTrack(args) {
    if (!args || args[0] != "selected_track") return;
    resolveAll();
    renderCurrentPage();
}

// DYNAMIC FOCUS core: re-target every named slot to the same-named parameter
// on the CURRENTLY SELECTED track. Map once -> follows whatever track is selected.
function resolveAll() {
    var _t0 = Date.now(), _n = 0;
    var t = new LiveAPI(null, "live_set view selected_track");
    var devs = t.get("devices");
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || b.name == null) continue;
        _n++;
        b.target = findParamByName(devs, b.name);
        if (b.target) {
            var mn = parseFloat(b.target.get("min"));
            var mx = parseFloat(b.target.get("max"));
            if (!isNaN(mn)) b.pmin = mn;
            if (!isNaN(mx)) b.pmax = mx;
        }
        b.anchorC = -1; b.engaged = false; b.lastIncoming = -1;
        b.cur = b.target ? normValue(b) : 0;
        b.anchorP = b.cur;
    }
    _perf.resolveMs = Date.now() - _t0;
    if (_perf.resolveMs > _perf.resolveMax) _perf.resolveMax = _perf.resolveMs;
    _perf.resolveSlots = _n;
    log("PERF resolveAll: " + _perf.resolveMs + "ms for " + _n + " mapped slot(s)");
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

function ccLabel(absSlot) {
    var b = SLOTS[absSlot];
    return (b && b.cc != null) ? ("CC " + b.cc) : "Map CC";
}
function paramLabel(absSlot) {
    var b = SLOTS[absSlot];
    if (!b || b.name == null) return "Map Parameter";
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
