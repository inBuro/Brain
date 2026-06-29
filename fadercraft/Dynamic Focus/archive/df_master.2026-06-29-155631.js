// df_master.js — DYNAMIC FOCUS "MASTER" engine, v6.0 (classnamespace fix, Clear Page fix, placeholder)
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
outlets = 4;  // 0=row, 1=value, 2=page sel, 3=textedit set

var PAGE_SIZE     = 16;
var NPAGES        = 8;
var NSLOTS        = PAGE_SIZE * NPAGES;  // 128
var PERSIST_SLOTS = 128;
var NOTE_PAGES    = 8;
var NOTE_PARAMS   = 8;   // params per page (8 × 3 chars = 24 chars max)

var currentPage = 0;

var SLOTS = [], OUTMIN = [], OUTMAX = [];
var NOTES = [];          // NOTES[8]: page name strings
var _globalCh = null;

function initSlots() {
    SLOTS = []; OUTMIN = []; OUTMAX = []; NOTES = [];
    for (var i = 0; i < NSLOTS; i++) {
        SLOTS.push(null); OUTMIN.push(0); OUTMAX.push(100);
    }
    for (var i = 0; i < NOTE_PAGES; i++) NOTES.push('');
}
initSlots();

var learnCCSlot = -1;
var learnPSlot  = -1;
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
function encodeNote(name) {
    // Returns array of NOTE_PARAMS ints
    var s = name ? name.slice(0, 24) : '';
    var result = [];
    for (var i = 0; i < NOTE_PARAMS; i++) result.push(encodeNoteChunk(s, i * 3));
    return result;
}
function decodeNote(params) {
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

    // Page notes
    for (var pg = 0; pg < NOTE_PAGES; pg++) {
        var chunks = [];
        for (var t = 0; t < NOTE_PARAMS; t++) chunks.push(getParam("df_pg" + pg + "_t" + t));
        NOTES[pg] = decodeNote(chunks);
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
        var chunks = encodeNote(NOTES[_pg]);
        for (var i = 0; i < NOTE_PARAMS; i++) {
            setParam("df_pg" + _pg + "_t" + i, chunks[i]);
        }
        log("pushNote OK: pg=" + _pg + " note=" + NOTES[_pg]);
    }, this);
    t.schedule(0);
}

function pushState() {
    for (var s = 0; s < PERSIST_SLOTS; s++) pushSlot(s);
    for (var pg = 0; pg < NOTE_PAGES; pg++) pushNote(pg);
}

// -- renderNote: put current page note into textedit ------------------
var NOTE_PLACEHOLDER = "page name";
function renderNote() {
    var note = NOTES[currentPage] || '';
    // Show placeholder when empty — textedit shows grey hint text
    outlet(3, "set", note !== '' ? note : NOTE_PLACEHOLDER);
}

// -- Inlet 1: row/page command. Inlet 2: CC ---------------------------
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
    if (first === "pgname") {
        // pgname <text> — user edited the page name textedit (arrives via outlet 1 = full string)
        var newName = (a.length > 1) ? (a[1] + "") : "";
        if (a.length > 2) {
            var parts = [];
            for (var i = 1; i < a.length; i++) parts.push(a[i] + "");
            newName = parts.join(" ");
        }
        newName = newName.slice(0, 24);
        // Treat placeholder as empty
        if (newName === NOTE_PLACEHOLDER) newName = "";
        NOTES[currentPage] = newName;
        pushNote(currentPage);
        renderNote();  // refresh to show placeholder if needed
        log("pgname: page=" + currentPage + " note=" + JSON.stringify(newName));
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
    pollSelectedParam();
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
