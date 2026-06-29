// df_master.js — DYNAMIC FOCUS "MASTER" engine, v5.7 (clobber fix: pushSlot restore gate + empty-slot guard)
//
// PERSISTENCE ARCHITECTURE:
//   Storage: 40 live.numbox objects in patch (dfp_0_0..dfp_7_2 + dfp_N_1a..d),
//            parameter_enable=1, parametervisibility=2.
//   These appear in device.parameters. live.numbox with
//   parameter_initial_enable=0 did NOT appear -- live.numbox parameter_enable=1 is the right primitive.
//
//   Fields per slot (slots 0..7, page 0 MVP):
//     df_s{N}_cc    = (cc+1)*100 + ch   (sentinel 0 = empty; cc=-1 -> field=0)
//                     cc 0..127 -> (cc+1)*100+ch = 100..12816; ch 0..16
//     df_s{N}_om    = omin*101 + omax   (default omin=0 omax=100 -> field=100)
//     df_s{N}_path0 = path_f % 10000          (Int, 0..9999, mmax=13000 -- proven safe)
//     df_s{N}_path1 = floor(path_f/1e4) % 10000
//     df_s{N}_path2 = floor(path_f/1e8) % 10000
//     df_s{N}_path3 = floor(path_f/1e12)       (<= 1699 for real Live paths)
//   path_f = path0 + path1*1e4 + path2*1e8 + path3*1e12
//   path_f = base-150 integer (unchanged): token[0]+token[1]*150+...+token[7]*150^7
//            Max ~1.7e15 < 2^53. Each chunk <= 9999 < 13000 (Int mmax). No rounding.
//
//   WHY SPLIT: Live ignores parameter_mmax for Float-type (parameter_type=1) live.numbox --
//   runtime reports max=255, so path_f~1.8e12 was rejected with "Invalid value".
//   Int-type (parameter_type=0) respects mmax=13000 (proven: cc=78 survived reload).
//   Each chunk 0..9999 is safely within Int range. 4 chunks cover up to 1e16.
//
//   WRITE: js writes via LiveAPI("this_device") parameters -> find by name -> set("value", x).
//          Deferred Task(0). Filter: startsWith("df_s").
//   READ: bang() -> event-driven restore (v5.6):
//         1. Observer on df_s0_om: when value changes 0->non-zero, Manual has been applied -> restore.
//         2. Retry fallback: if observer doesn't fire (empty set, om stays 0), poll up to 6 times
//            with growing delays (200,500,1000,2000,4000,8000 ms). If any om param != 0 -> restore.
//            If all stay 0 after all retries -> nothing to restore (empty set), silent exit.
//         PARAM RESTORE (LiveAPI): slot=N ... path=... log on real .als open only.
//
// MVP SCOPE: slots 0..7 (page 0 left col). See SCALE PLAN at bottom.
//
// Inlets: 0=bang, 1=cmd list, 2=CC list
// Outlets: 0=row, 1=value, 2=page sel

autowatch = 0;
inlets  = 3;
outlets = 3;

var PAGE_SIZE = 16;
var NPAGES    = 32;
var NSLOTS    = PAGE_SIZE * NPAGES;

var PERSIST_SLOTS = 8;   // MVP: slots 0..7 only

var currentPage = 0;

var SLOTS = [], OUTMIN = [], OUTMAX = [];
function initSlots() {
    SLOTS = []; OUTMIN = []; OUTMAX = [];
    for (var i = 0; i < NSLOTS; i++) {
        SLOTS.push(null); OUTMIN.push(0); OUTMAX.push(100);
    }
}
initSlots();

var learnCCSlot = -1;
var learnPSlot  = -1;
var selTrackObs = null, selParamObs = null;
var PICKUP_EPS  = 0.02;

// -- Path encoding (base-150, 8 tokens, float64 exact) ----------------
// Keywords: 1..23 (same as PATH_KW codes below).
// Index N (0..125): stored as 24+N. Max index=125 covers all real track/device/param indices.
// Sentinel: 0 (end of path).
// float = t0 + t1*150 + t2*150^2 + ... + t7*150^7
// max value = 149*(1+150+...+150^7) ~ 1.7e15 < 2^53=9e15 -> exact in float64.
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
var _nextKwCode = 24;

function kw_to_code(t) {
    if (PATH_KW[t] !== undefined) return PATH_KW[t];
    // Auto-assign new code. Cap at PATH_BASE-1 to stay in base-150 scheme.
    // (Unknown keywords beyond 23 get codes 24+: but 24+ collide with index encoding!)
    // SAFE: check if we have room before assigning.
    if (_nextKwCode >= 24) {
        // Codes 24..PATH_BASE-1 are reserved for INDICES. New keyword must go in a
        // separate namespace. Use PATH_BASE + 0,1,2... but encode as separate field.
        // For now: log warning and fall back to code 23 (input_routing) as unknown-fallback.
        // This should never happen with real Live paths since we cover all known keywords.
        log("kw_to_code WARNING: unknown keyword '" + t + "', using fallback code 23");
        return 23;
    }
    PATH_KW[t] = _nextKwCode;
    PATH_CODE_TO_KW[_nextKwCode] = t;
    _nextKwCode++;
    return PATH_KW[t];
}

// Correction: keyword codes 1..23, index codes 24+N. _nextKwCode only reaches 24 if new
// keywords are encountered (which shouldn't happen with known Live API). Re-init correctly:
_nextKwCode = 24;  // not used for keywords -- keywords are fixed 1..23

function encodePath(ppath) {
    // Returns a float64 integer encoding up to 8 tokens.
    var tokens = ppath.split(" ");
    var codes = [];
    for (var i = 0; i < tokens.length && i < 8; i++) {
        var t = tokens[i];
        var n = parseInt(t, 10);
        if (!isNaN(n) && ("" + n) === t) {
            // Integer index: store as 24+N
            if (n > 125) {
                log("encodePath WARNING: index " + n + " > 125, clamped to 125. Path: " + ppath);
                n = 125;
            }
            codes.push(24 + n);
        } else {
            var kw = PATH_KW[t];
            if (kw === undefined) {
                log("encodePath WARNING: unknown keyword '" + t + "' in path: " + ppath);
                kw = 0;  // will terminate path early, but better than silent corruption
            }
            codes.push(kw);
        }
    }
    // Encode as base-150 polynomial
    var result = 0;
    var power = 1;
    for (var i = 0; i < codes.length; i++) {
        result += codes[i] * power;
        power *= PATH_BASE;
    }
    return result;
}

function decodePath(f) {
    // f = float64 integer. Returns path string or null if empty/corrupt.
    var v = Math.round(f);  // ensure integer (float might have fractional noise)
    if (v <= 0) return null;
    var tokens = [];
    var remaining = v;
    for (var i = 0; i < 8; i++) {
        var code = remaining % PATH_BASE;
        remaining = Math.floor(remaining / PATH_BASE);
        if (code === 0) break;
        if (code >= 24) {
            // Integer index
            tokens.push("" + (code - 24));
        } else {
            var kw = PATH_CODE_TO_KW[code];
            if (!kw) {
                log("decodePath: unknown code " + code + " at token " + i);
                return null;
            }
            tokens.push(kw);
        }
        if (remaining === 0) break;
    }
    return tokens.length === 0 ? null : tokens.join(" ");
}

// -- cc/ch field encoding ---------------------------------------------
// cc_field = (cc + 1) * 100 + ch
//   sentinel 0 = no CC (cc = -1, ch = 0 -> (0)*100+0 = 0)
//   cc=0,ch=0 -> 100; cc=127,ch=16 -> 12816
function encodeCC(cc, ch) {
    if (cc == null || cc < 0) return 0;
    return (cc + 1) * 100 + (ch > 0 ? ch : 0);
}
function decodeCC(f) {
    var v = Math.round(f);
    if (v <= 0) return { cc: null, ch: null };
    return { cc: Math.floor(v / 100) - 1, ch: v % 100 };
}

// -- omin/omax field encoding -----------------------------------------
// om_field = omin * 101 + omax  (omin,omax in [0,100])
//   default: omin=0, omax=100 -> field=100
//   sentinel: -1 (negative) = use defaults
function encodeOM(omin, omax) {
    return Math.round(omin) * 101 + Math.round(omax);
}
function decodeOM(f) {
    var v = Math.round(f);
    if (v < 0) return { omin: 0, omax: 100 };
    return { omin: Math.floor(v / 101), omax: v % 101 };
}

function log(s) { post("[DF-Master] " + s + "\n"); }

// -- LiveAPI parameter cache ------------------------------------------
// pattr with parameter_enable=1: get("name") returns the varname string.
// varnames: df_s0_cc, df_s0_path, df_s0_om, df_s1_cc, ...
var _paramCache = {};  // "df_s0_cc" -> pid
var _cacheReady = false;

function loadDeviceParams() {
    _paramCache = {};
    _cacheReady = false;
    try {
        var dev = new LiveAPI(null, "this_device");
        var params = dev.get("parameters");
        var total = 0;
        var found = 0;
        var allNames = [];
        for (var i = 0; i < params.length - 1; i++) {
            if (params[i] !== "id") continue;
            var pid = params[i + 1];
            var p = new LiveAPI(null, "id " + pid);
            var nm = p.get("name") + "";
            allNames.push(nm);
            total++;
            if (nm.indexOf("df_s") === 0) {
                _paramCache[nm] = pid;
                found++;
            }
        }
        _cacheReady = true;
        log("loadDeviceParams: total=" + total + " df_s*=" + found);
        log("loadDeviceParams DIAG all names: [" + allNames.join(", ") + "]");
        // Per-parameter DIAG: show actual min/max as reported by Live at runtime
        for (var k in _paramCache) {
            try {
                var dp = new LiveAPI(null, "id " + _paramCache[k]);
                var dmin = dp.get("min") + "";
                var dmax = dp.get("max") + "";
                log("DIAG param: name=" + k + " pid=" + _paramCache[k] + " min=" + dmin + " max=" + dmax);
            } catch(de) { log("DIAG param ERROR " + k + ": " + de); }
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
        var sp = new LiveAPI(null, "id " + pid);
        var spmin = sp.get("min") + "";
        var spmax = sp.get("max") + "";
        log("setParam pre: " + name + "=" + val + " pid=" + pid + " pmin=" + spmin + " pmax=" + spmax);
        sp.set("value", val);
    }
    catch(e) { log("setParam ERROR " + name + ": " + e); }
}

function getParam(name) {
    var pid = _paramCache[name];
    if (pid === undefined) return 0;
    try { return parseFloat((new LiveAPI(null, "id " + pid)).get("value")); }
    catch(e) { log("getParam ERROR " + name + ": " + e); return 0; }
}

// -- Restore state machine (v5.7) -------------------------------------
// Prevents double-restore: observer + retry share a single "done" flag.
// _restoreDone also gates pushSlot: no writes to params until restore is complete.
var _restoreDone = false;
var _restoreObs  = null;   // LiveAPI observer on df_s0_om (marker param)
// _explicitClear: set by clearSlot to allow pushSlot to write an empty slot exactly once.
var _explicitClear = false;
// Retry schedule: ms delays between attempts (index 0 = first retry after initial fail)
var _retryDelays = [200, 500, 1000, 2000, 4000, 8000];
var _retryIdx    = 0;
var _retryTask   = null;

function _armRestoreObserver() {
    // Watch df_s0_om: default value is 0 (defaul omin=0,omax=0 before any mapping).
    // After Manual params are applied by Live, a mapped slot has om=100 (omin=0,omax=100).
    // The transition 0->100 (or any non-zero) signals that Manual values are ready.
    // We must have _paramCache loaded before doing this.
    var pid = _paramCache["df_s0_om"];
    if (pid === undefined) {
        log("restore observer: df_s0_om not in cache -- observer skipped, relying on retry");
        return;
    }
    try {
        _restoreObs = new LiveAPI(function() {
            // Callback fires when df_s0_om value changes.
            // This catches 0->N transition when Live applies Manual params.
            if (_restoreDone) {
                // Already done -- unregister
                if (_restoreObs) { _restoreObs.property = ""; _restoreObs = null; }
                return;
            }
            // Read the current value to confirm it's actually non-zero (not noise)
            var curVal = 0;
            try { curVal = parseFloat((new LiveAPI(null, "id " + pid)).get("value")); } catch(e) {}
            log("restore trigger: observer fired df_s0_om=" + curVal);
            if (_restoreObs) { _restoreObs.property = ""; _restoreObs = null; }
            if (_retryTask)  { _retryTask.cancel(); _retryTask = null; }
            if (!_restoreDone) {
                _restoreDone = true;
                restoreFromParams("observer");
            }
        }, "id " + pid);
        _restoreObs.property = "value";
        log("restore observer: armed on df_s0_om pid=" + pid);
    } catch(e) {
        log("restore observer ERROR: " + e + " -- relying on retry");
    }
}

function _scheduleRetry() {
    if (_restoreDone) return;
    if (_retryIdx >= _retryDelays.length) {
        log("restore retry: all " + _retryDelays.length + " attempts exhausted, all-zero -- nothing to restore");
        // Clean up observer if still alive
        if (_restoreObs) { _restoreObs.property = ""; _restoreObs = null; }
        return;
    }
    var delay = _retryDelays[_retryIdx];
    var attempt = _retryIdx + 1;
    _retryIdx++;
    _retryTask = new Task(function() {
        if (_restoreDone) return;
        // Check if any om param is non-zero (Manual has been applied)
        var anyNonZero = false;
        for (var s = 0; s < PERSIST_SLOTS; s++) {
            var v = getParam("df_s" + s + "_om");
            if (v !== 0) { anyNonZero = true; break; }
        }
        if (!anyNonZero) {
            log("restore retry " + attempt + ": all-zero, rescheduling (delay was " + delay + "ms)");
            _scheduleRetry();
            return;
        }
        // Non-zero found: Manual applied, do restore
        log("restore retry " + attempt + ": non-zero om found -> restoring");
        if (_restoreObs) { _restoreObs.property = ""; _restoreObs = null; }
        _restoreDone = true;
        restoreFromParams("retry-" + attempt);
    }, this);
    _retryTask.schedule(delay);
}

// -- Init -------------------------------------------------------------
function bang() {
    if (inlet !== 0) return;
    // Reset restore state machine for this load cycle
    _restoreDone   = false;
    _explicitClear = false;
    _retryIdx    = 0;
    if (_restoreObs)  { _restoreObs.property = ""; _restoreObs = null; }
    if (_retryTask)   { _retryTask.cancel(); _retryTask = null; }

    // Initial short delay: enough for JS context to stabilize, not enough for Manual params.
    // We load cache + setup focus here, then arm the restore machinery.
    var t = new Task(function() {
        loadDeviceParams();
        setupFocus();
        // Arm observer (event-driven, fires when Live applies Manual values)
        _armRestoreObserver();
        // Arm retry fallback (handles empty set + cases where observer doesn't fire)
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
}

// -- Restore from persisted pattr parameters --------------------------
function restoreFromParams(triggerSource) {
    log("restoreFromParams: triggered by [" + (triggerSource || "unknown") + "]");
    ensureCache();
    var restoredCount = 0;
    for (var s = 0; s < PERSIST_SLOTS; s++) {
        var cc_f   = getParam("df_s" + s + "_cc");
        var om_f   = getParam("df_s" + s + "_om");
        // Reassemble path_f from 4 Int chunks (base 10000)
        var p0 = getParam("df_s" + s + "_path0");
        var p1 = getParam("df_s" + s + "_path1");
        var p2 = getParam("df_s" + s + "_path2");
        var p3 = getParam("df_s" + s + "_path3");
        var path_f = p0 + p1 * 10000 + p2 * 1e8 + p3 * 1e12;

        var cc_dec = decodeCC(cc_f);
        var om_dec = decodeOM(om_f);
        var ppath  = decodePath(path_f);

        log("PARAM RESTORE (LiveAPI): slot=" + s
            + " cc_f=" + cc_f + " om_f=" + om_f
            + " path0=" + p0 + " path1=" + p1 + " path2=" + p2 + " path3=" + p3
            + " path_f=" + path_f
            + " -> cc=" + cc_dec.cc + " ch=" + cc_dec.ch
            + " omin=" + om_dec.omin + " omax=" + om_dec.omax
            + " path=" + (ppath || "null"));

        var has_cc   = (cc_dec.cc != null && cc_dec.cc >= 0);
        var has_path = (ppath !== null);
        if (!has_cc && !has_path) continue;

        SLOTS[s] = newSlot();
        if (has_cc) {
            SLOTS[s].cc = cc_dec.cc;
            SLOTS[s].ch = (cc_dec.ch > 0) ? cc_dec.ch : null;
        }
        if (has_path) {
            SLOTS[s].path = ppath;
            SLOTS[s].name = resolveNameFromPath(ppath);
            // pmin/pmax not stored in 3-field scheme -- read from LiveAPI on resolve
            // They will be populated on first resolveAll() via normValue
        }
        OUTMIN[s] = om_dec.omin;
        OUTMAX[s] = om_dec.omax;
        restoredCount++;
    }
    log("restoreFromParams: populated " + restoredCount + " slot(s)");

    var t2 = new Task(function() {
        // Re-read pmin/pmax from live targets after resolve
        resolveAll();
        // Backfill pmin/pmax from live parameter
        for (var s = 0; s < PERSIST_SLOTS; s++) {
            var b = SLOTS[s];
            if (!b || !b.target || !b.path) continue;
            // Only fill if default values (0/1) -- preserve any previously captured values
            if (b.pmin === 0 && b.pmax === 1) {
                var pmin_v = parseFloat(b.target.get("min"));
                var pmax_v = parseFloat(b.target.get("max"));
                if (!isNaN(pmin_v)) b.pmin = pmin_v;
                if (!isNaN(pmax_v)) b.pmax = pmax_v;
            }
        }
        renderCurrentPage();
        renderPageSel();
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

// -- Persist: write slot to pattr parameters (deferred Task) ----------
// Deferred via Task(0) to exit notification callback context.
// Avoids "Changes cannot be triggered by notifications".
//
// GUARDS (v5.7):
//   1. Restore gate: if _restoreDone===false, skip entirely -- Live's Manual values
//      have not yet been read; any write here would clobber the saved state.
//      Sources that fire before restore completes: MapButtonDF_M.maxpat nbox_min/nbox_max
//      emit their parameter_initial values on load -> handleCmd min/max -> pushSlot.
//   2. Empty-slot guard: if slot has no cc AND no path, skip unless _explicitClear is set.
//      This prevents a UI-driven default state (OUTMIN=0, OUTMAX=100, b=null) from
//      overwriting a legitimately saved non-zero slot after restore.
//      clearSlot sets _explicitClear=true before calling pushSlot to bypass this guard.
function pushSlot(s) {
    if (s >= PERSIST_SLOTS) return;
    // GUARD 1: restore gate
    if (!_restoreDone) {
        log("pushSlot BLOCKED (restore pending): s=" + s);
        return;
    }
    var _s = s;
    // GUARD 2: empty-slot guard (snapshot _explicitClear at call time, then clear it)
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
        var b = SLOTS[_s];
        var cc_f   = (b && b.cc != null) ? encodeCC(b.cc, b.ch) : 0;
        var om_f   = encodeOM(OUTMIN[_s], OUTMAX[_s]);
        var path_f = (b && b.path) ? encodePath(b.path) : 0;
        // Split path_f into 4 Int chunks (base 10000).
        // Each chunk 0..9999 is within mmax=13000. Covers up to 1e16.
        var pf = path_f;
        var p0 = pf % 10000;         pf = Math.floor(pf / 10000);
        var p1 = pf % 10000;         pf = Math.floor(pf / 10000);
        var p2 = pf % 10000;         pf = Math.floor(pf / 10000);
        var p3 = pf;                 // remainder, <= 1699 for real paths
        setParam("df_s" + _s + "_cc",    cc_f);
        setParam("df_s" + _s + "_om",    om_f);
        setParam("df_s" + _s + "_path0", p0);
        setParam("df_s" + _s + "_path1", p1);
        setParam("df_s" + _s + "_path2", p2);
        setParam("df_s" + _s + "_path3", p3);
        log("pushSlot OK: s=" + _s + " cc_f=" + cc_f + " path_f=" + path_f
            + " [p0=" + p0 + " p1=" + p1 + " p2=" + p2 + " p3=" + p3 + "] om_f=" + om_f);
    }, this);
    t.schedule(0);
}

function pushState() {
    for (var s = 0; s < PERSIST_SLOTS; s++) pushSlot(s);
}

// -- Inlet 1: row/page command . Inlet 2: CC --------------------------
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
        if (!b || b.cc == null || b.cc !== cc || b.ch !== ch) continue;
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
    if (a.length < 2) return;
    var first = a[0];
    var cmd   = a[1];
    if (first === "page") {
        var pg = parseInt(cmd, 10);
        if (isNaN(pg) || pg < 0 || pg >= NPAGES) return;
        setPage(pg);
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

// captureParam: accepts ANY Live API unquotedpath -- sends, device params, mixer.
// No encodePath filter.
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
    SLOTS[absSlot].cc = cc; SLOTS[absSlot].ch = ch;
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
    // _explicitClear bypasses the empty-slot guard in pushSlot (intentional zero-write).
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

// -- SCALE PLAN (to implement after MVP validation) -------------------
// pattr with parameter_enable=1 is the right primitive (confirmed by cc=78 test).
// live.numbox with parameter_initial_enable=0 does NOT appear in device.parameters.
//
// Current: 24 pattr (8 slots x 3 fields). Covers page 0 left column.
//
// For 128 mapped slots: 128 x 3 = 384 pattr objects.
// For 256 mapped slots: 256 x 3 = 768 pattr objects.
//
// UNKNOWN: does Live cap device.parameters at some N (e.g. 256)?
// The DIAG log shows all parameter names -- if Live caps at 256, we'll see < 384 after
// adding more pattr. Need empirical test with 400+ pattr before committing to 256 slots.
//
// Compact encoding already in place (3 floats/slot). The only question is pattr count limit.
// Next step: add 384 pattr for slots 0..127 and check how many appear in device.parameters.
