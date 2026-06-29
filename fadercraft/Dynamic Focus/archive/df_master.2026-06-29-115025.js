// df_master.js — DYNAMIC FOCUS "MASTER" engine, v5.2 (path-based mapping + LiveAPI persist)
//
// PERSISTENCE ARCHITECTURE (per-instance, .als save/load):
//   Storage: 112 hidden live.numbox objects in the patch (parametervisibility=2, Stored Only).
//   Each live.numbox has parameter_enable=1 so Live saves its value per-instance in .als.
//   Named dfs{s}{field} for slot s=0..7, field = cc/ch/omin/omax/pmin/pmax/t0..t7.
//   Long names: df_s{s}_{field} -- used for LiveAPI lookup by name (stable, no index reliance).
//
//   WRITE (on every mapping change):
//     js finds parameters on "this_device" by long_name via LiveAPI.
//     Sets value via param.set("value", x). No patch wires, no pattr, no getvalueof.
//
//   READ (on .als load):
//     After bang() from live.thisdevice, Task(400ms) builds param cache, reads all 112
//     parameter values by long_name, decodes SLOTS 0..7, resolves paths, renders.
//     Log marker: "PARAM RESTORE (LiveAPI): ..." -- appears ONLY on real .als open.
//
// PATH ENCODING (generic, no hardcoded type list):
//   Live API path = sequence of tokens (keywords + integer indices).
//   Keyword -> integer code 1..99+. Index N -> 1000+N. Sentinel: 0.
//   Unknown keywords auto-assigned new codes: no path is ever rejected.
//   Up to 8 tokens stored (t0..t7). Covers ALL known Live API paths.
//
// MVP SCOPE: slots 0..7 (page 0 left column). Pages 1..31 work in-session but NOT persisted.
//
// Inlets:
//   0 -- bang from live.thisdevice (init)
//   1 -- row command (list): [row, cmd, ...] or [page, N]
//   2 -- CC list from ctlin: [value, cc, channel]
//
// Outlets:
//   0 -- full row: [row, ccLabel, paramLabel, outMin, outMax, mapped, ccArm, paramArm]
//   1 -- value:    [row, valueInt(0-100)]
//   2 -- page sel: [page, active(0/1)]

autowatch = 0;
inlets  = 3;
outlets = 3;

var PAGE_SIZE = 16;
var NPAGES    = 32;
var NSLOTS    = PAGE_SIZE * NPAGES;

// MVP persist scope: slots 0..7 only (page 0 left column)
var PERSIST_SLOTS       = 8;
var PERSIST_PATH_TOKENS = 8;   // up to 8 path tokens (covers longest known Live paths)

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

// -- Path encoding dictionary -----------------------------------------
// Keyword -> code (1..N). Integer index N -> stored as 1000+N. Sentinel: 0.
// Generic: unknown keywords are auto-assigned next codes. No path ever rejected.
var PATH_KW = {
    "live_set":        1,
    "tracks":          2,
    "return_tracks":   3,
    "master_track":    4,
    "devices":         5,
    "parameters":      6,
    "mixer_device":    7,
    "sends":           8,
    "value":           9,
    "volume":          10,
    "panning":         11,
    "chains":          12,
    "clip_slots":      13,
    "clip":            14,
    "view":            15,
    "crossfader":      16,
    "cue_volume":      17,
    "track_activator": 18,
    "solo":            19,
    "arm":             20,
    "mute":            21,
    "output_routing":  22,
    "input_routing":   23
};
var PATH_CODE_TO_KW = {};
(function() {
    for (var kw in PATH_KW) PATH_CODE_TO_KW[PATH_KW[kw]] = kw;
})();
var _nextKwCode = 24;

function kw_to_code(token) {
    if (PATH_KW[token] !== undefined) return PATH_KW[token];
    PATH_KW[token] = _nextKwCode;
    PATH_CODE_TO_KW[_nextKwCode] = token;
    _nextKwCode++;
    log("path encode: new keyword '" + token + "' -> code " + (_nextKwCode - 1));
    return PATH_KW[token];
}

function encodePath(ppath) {
    var tokens = ppath.split(" ");
    var codes = [];
    for (var i = 0; i < tokens.length && i < PERSIST_PATH_TOKENS; i++) {
        var t = tokens[i];
        var n = parseInt(t, 10);
        if (!isNaN(n) && ("" + n) === t) {
            codes.push(1000 + n);
        } else {
            codes.push(kw_to_code(t));
        }
    }
    while (codes.length < PERSIST_PATH_TOKENS) codes.push(0);
    return codes;
}

function decodePath(codes) {
    var tokens = [];
    for (var i = 0; i < codes.length; i++) {
        var c = codes[i];
        if (c === 0) break;
        if (c >= 1000) {
            tokens.push("" + (c - 1000));
        } else {
            var kw = PATH_CODE_TO_KW[c];
            if (!kw) {
                log("decodePath: unknown code " + c + " -- path corrupt");
                return null;
            }
            tokens.push(kw);
        }
    }
    if (tokens.length === 0) return null;
    return tokens.join(" ");
}

function log(s) { post("[DF-Master] " + s + "\n"); }

// -- LiveAPI parameter cache ------------------------------------------
// Cache: long_name -> pid (parameter id)
var _paramCache = {};
var _deviceParamsLoaded = false;

function loadDeviceParams() {
    _paramCache = {};
    _deviceParamsLoaded = false;
    try {
        var dev = new LiveAPI(null, "this_device");
        var params = dev.get("parameters");
        for (var i = 0; i < params.length - 1; i++) {
            if (params[i] !== "id") continue;
            var pid = params[i + 1];
            var p = new LiveAPI(null, "id " + pid);
            var ln = p.get("name") + "";
            if (ln.indexOf("df_s") === 0) {
                _paramCache[ln] = pid;
            }
        }
        _deviceParamsLoaded = true;
        var count = 0;
        for (var k in _paramCache) count++;
        log("loadDeviceParams: cached " + count + " dfs params");
    } catch(e) {
        log("loadDeviceParams ERROR: " + e);
    }
}

function setParam(long_name, val) {
    if (!_deviceParamsLoaded) return;
    var pid = _paramCache[long_name];
    if (pid === undefined) {
        log("setParam: not found: " + long_name);
        return;
    }
    try {
        var p = new LiveAPI(null, "id " + pid);
        p.set("value", val);
    } catch(e) {
        log("setParam ERROR " + long_name + ": " + e);
    }
}

function getParam(long_name) {
    if (!_deviceParamsLoaded) return 0;
    var pid = _paramCache[long_name];
    if (pid === undefined) return 0;
    try {
        var p = new LiveAPI(null, "id " + pid);
        return parseFloat(p.get("value"));
    } catch(e) {
        log("getParam ERROR " + long_name + ": " + e);
        return 0;
    }
}

// -- Init -------------------------------------------------------------
function bang() {
    if (inlet !== 0) return;
    // Task(400ms): ensures LiveAPI device context is ready before param scan + restore
    var t = new Task(function() {
        loadDeviceParams();
        setupFocus();
        restoreFromParams();
    }, this);
    t.schedule(400);
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

// -- Restore from persisted LiveAPI parameters ------------------------
function restoreFromParams() {
    if (!_deviceParamsLoaded) {
        log("restoreFromParams: params not loaded");
        return;
    }
    var restoredCount = 0;
    for (var s = 0; s < PERSIST_SLOTS; s++) {
        var cc_v   = Math.round(getParam("df_s" + s + "_cc"));
        var ch_v   = Math.round(getParam("df_s" + s + "_ch"));
        var omin_v = Math.round(getParam("df_s" + s + "_omin"));
        var omax_v = Math.round(getParam("df_s" + s + "_omax"));
        var pmin_v = getParam("df_s" + s + "_pmin");
        var pmax_v = getParam("df_s" + s + "_pmax");

        var codes = [];
        for (var ti = 0; ti < PERSIST_PATH_TOKENS; ti++) {
            codes.push(Math.round(getParam("df_s" + s + "_t" + ti)));
        }

        var ppath   = decodePath(codes);
        var has_cc  = (cc_v >= 0 && cc_v <= 127);
        var has_path = (ppath !== null);

        log("PARAM RESTORE (LiveAPI): slot=" + s
            + " cc=" + cc_v + " ch=" + ch_v
            + " omin=" + omin_v + " omax=" + omax_v
            + " pmin=" + pmin_v + " pmax=" + pmax_v
            + " path=" + (ppath || "null"));

        if (!has_cc && !has_path) continue;

        SLOTS[s] = newSlot();
        if (has_cc) {
            SLOTS[s].cc = cc_v;
            SLOTS[s].ch = (ch_v > 0) ? ch_v : null;
        }
        if (has_path) {
            SLOTS[s].name  = resolveNameFromPath(ppath);
            SLOTS[s].path  = ppath;
            SLOTS[s].pmin  = isNaN(pmin_v) ? 0.0 : pmin_v;
            SLOTS[s].pmax  = isNaN(pmax_v) ? 1.0 : pmax_v;
        }
        OUTMIN[s] = (omin_v >= 0 && omin_v <= 100) ? omin_v : 0;
        OUTMAX[s] = (omax_v >= 0 && omax_v <= 100) ? omax_v : 100;
        restoredCount++;
    }
    log("restoreFromParams: populated " + restoredCount + " slot(s), scheduling resolveAll");

    // Defer resolveAll: LiveAPI handles for parameter targets need device context
    var t2 = new Task(function() {
        resolveAll();
        renderCurrentPage();
        renderPageSel();
        log("restoreFromParams Task: resolveAll + render done");
    }, this);
    t2.schedule(200);
}

// Try to get display name for a path via LiveAPI lookup.
// Works for any parameter Live exposes (device params, sends, mixer).
function resolveNameFromPath(ppath) {
    try {
        var api = new LiveAPI(null, ppath);
        if (api && api.id && api.id > 0) {
            var n = api.get("name") + "";
            if (n && n.length > 0 && n !== "0") return n;
        }
    } catch(e) {}
    // Fallback: last meaningful keyword in path
    var tokens = ppath.split(" ");
    for (var i = tokens.length - 1; i >= 0; i--) {
        var t = tokens[i];
        var n = parseInt(t, 10);
        if (isNaN(n) && t !== "value") return t;
    }
    return "?";
}

// -- Persist: write slot to LiveAPI parameters ────────────────────────
function pushSlot(s) {
    if (s >= PERSIST_SLOTS) return;   // only slots 0..7 persisted
    if (!_deviceParamsLoaded) {
        log("pushSlot " + s + ": params not loaded, skip");
        return;
    }
    var b = SLOTS[s];
    if (!b || (b.cc == null && b.path == null)) {
        // Empty slot: write sentinels
        setParam("df_s" + s + "_cc",    -1.0);
        setParam("df_s" + s + "_ch",     0.0);
        setParam("df_s" + s + "_omin",   0.0);
        setParam("df_s" + s + "_omax", 100.0);
        setParam("df_s" + s + "_pmin",   0.0);
        setParam("df_s" + s + "_pmax",   1.0);
        for (var ti = 0; ti < PERSIST_PATH_TOKENS; ti++) {
            setParam("df_s" + s + "_t" + ti, 0.0);
        }
        return;
    }
    setParam("df_s" + s + "_cc",   (b.cc != null) ? b.cc : -1.0);
    setParam("df_s" + s + "_ch",   (b.ch != null) ? b.ch :  0.0);
    setParam("df_s" + s + "_omin", OUTMIN[s]);
    setParam("df_s" + s + "_omax", OUTMAX[s]);
    setParam("df_s" + s + "_pmin", isNaN(b.pmin) ? 0.0 : b.pmin);
    setParam("df_s" + s + "_pmax", isNaN(b.pmax) ? 1.0 : b.pmax);

    if (b.path) {
        var codes = encodePath(b.path);
        for (var ti = 0; ti < PERSIST_PATH_TOKENS; ti++) {
            setParam("df_s" + s + "_t" + ti, codes[ti]);
        }
    } else {
        for (var ti = 0; ti < PERSIST_PATH_TOKENS; ti++) {
            setParam("df_s" + s + "_t" + ti, 0.0);
        }
    }
    log("pushSlot: s=" + s + " cc=" + (b.cc != null ? b.cc : -1)
        + " path=" + (b.path || "null"));
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

// -- Page switching ---------------------------------------------------
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

// -- Arm / capture ----------------------------------------------------
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

// captureParam: accepts ANY Live API unquotedpath -- sends, device params, mixer, returns.
// No encodePath filter. v5.1 regression (filter that blocked Sends) is NOT present here.
function captureParam(absSlot, pid) {
    var p = new LiveAPI(null, "id " + pid);
    var pname = p.get("name") + "";
    var pmin  = parseFloat(p.get("min"));
    var pmax  = parseFloat(p.get("max"));
    var ppath = p.unquotedpath;

    if (!ppath || ppath.length === 0) {
        log("captureParam: WARNING -- empty path for id=" + pid + " name=" + pname + " -- aborted");
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
    pushSlot(absSlot);
}

// -- Focus -> re-resolve every slot's target by path ------------------
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

// -- Drive ------------------------------------------------------------
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

// -- Render -----------------------------------------------------------
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
