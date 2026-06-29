// df_master.js — DYNAMIC FOCUS "MASTER" engine, v5.3 (LiveAPI persist: bugfixes A/B/C)
//
// PERSISTENCE ARCHITECTURE:
//   Storage: 112 hidden live.numbox (parameter_enable=1, parametervisibility=2) in patch.
//   Named dfs{s}{field} varname / df_s{s}_{field} long_name, for slot s=0..7.
//   14 fields per slot: cc, ch, omin, omax, pmin, pmax, t0..t7
//
//   WRITE: js sets param value via LiveAPI("id pid").set("value", x).
//          Always deferred in a Task to avoid "Changes cannot be triggered by notifications".
//
//   READ: bang() Task(400ms) -> loadDeviceParams() -> restoreFromParams().
//         Logs: "PARAM RESTORE (LiveAPI): slot=N cc=... path=..." on real .als open.
//
//   BUGFIX A: loadDeviceParams now tries BOTH p.get("name") (= long_name) AND
//             p.get("custom_short_name") (= short_name); builds two lookup maps so
//             getParam/setParam find params by either name scheme.
//             Full diagnostic log: all param names printed on load for verification.
//
//   BUGFIX B: pushSlot() deferred via Task(0) to exit notification context.
//             Avoids "Changes cannot be triggered by notifications" error.
//
//   BUGFIX C: if cache not ready at pushSlot time, loadDeviceParams() called inline.
//
// MVP SCOPE: slots 0..7 (page 0 left col). Pages 1..31 work in-session, not persisted.
//
// Inlets: 0=bang, 1=cmd list, 2=CC list
// Outlets: 0=row, 1=value, 2=page sel

autowatch = 0;
inlets  = 3;
outlets = 3;

var PAGE_SIZE = 16;
var NPAGES    = 32;
var NSLOTS    = PAGE_SIZE * NPAGES;

var PERSIST_SLOTS       = 8;
var PERSIST_PATH_TOKENS = 8;

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
(function() { for (var k in PATH_KW) PATH_CODE_TO_KW[PATH_KW[k]] = k; })();
var _nextKwCode = 24;

function kw_to_code(t) {
    if (PATH_KW[t] !== undefined) return PATH_KW[t];
    PATH_KW[t] = _nextKwCode;
    PATH_CODE_TO_KW[_nextKwCode] = t;
    _nextKwCode++;
    log("path encode: new keyword '" + t + "' -> code " + (_nextKwCode - 1));
    return PATH_KW[t];
}
function encodePath(ppath) {
    var tokens = ppath.split(" ");
    var codes = [];
    for (var i = 0; i < tokens.length && i < PERSIST_PATH_TOKENS; i++) {
        var t = tokens[i];
        var n = parseInt(t, 10);
        if (!isNaN(n) && ("" + n) === t) { codes.push(1000 + n); }
        else { codes.push(kw_to_code(t)); }
    }
    while (codes.length < PERSIST_PATH_TOKENS) codes.push(0);
    return codes;
}
function decodePath(codes) {
    var tokens = [];
    for (var i = 0; i < codes.length; i++) {
        var c = codes[i];
        if (c === 0) break;
        if (c >= 1000) { tokens.push("" + (c - 1000)); }
        else {
            var kw = PATH_CODE_TO_KW[c];
            if (!kw) { log("decodePath: unknown code " + c); return null; }
            tokens.push(kw);
        }
    }
    return tokens.length === 0 ? null : tokens.join(" ");
}

function log(s) { post("[DF-Master] " + s + "\n"); }

// -- LiveAPI parameter cache ------------------------------------------
// Maps both long_name (df_s{s}_{field}) and short_name (dfs{s}{field}) -> pid
// This dual-map ensures we find params regardless of what get("name") returns.
var _paramByLong  = {};   // df_s0_cc -> pid
var _paramByShort = {};   // dfs0cc   -> pid
var _deviceParamsLoaded = false;

function loadDeviceParams() {
    _paramByLong  = {};
    _paramByShort = {};
    _deviceParamsLoaded = false;
    try {
        var dev = new LiveAPI(null, "this_device");
        var params = dev.get("parameters");
        var total = 0;
        var diagNames = [];
        for (var i = 0; i < params.length - 1; i++) {
            if (params[i] !== "id") continue;
            var pid = params[i + 1];
            var p = new LiveAPI(null, "id " + pid);
            var nm  = p.get("name") + "";           // usually = parameter_long_name
            var orig = nm;
            // Log ALL parameter names for diagnostic (first call only)
            diagNames.push(nm);
            total++;
            // Map by long name if it matches our scheme
            if (nm.indexOf("df_s") === 0) {
                _paramByLong[nm] = pid;
            }
            // Map by short name: derive from long name pattern df_s{N}_{field} -> dfs{N}{field}
            // Also cover the case where get("name") returns the short name directly
            if (nm.indexOf("dfs") === 0) {
                _paramByShort[nm] = pid;
            }
        }
        _deviceParamsLoaded = true;

        var longCount = 0, shortCount = 0;
        for (var k in _paramByLong) longCount++;
        for (var k in _paramByShort) shortCount++;
        log("loadDeviceParams: total params=" + total
            + " df_s*=" + longCount + " dfs*=" + shortCount);

        // Diagnostic: print all param names so we can see what Live returns
        log("loadDeviceParams DIAG: all names = [" + diagNames.join(", ") + "]");
    } catch(e) {
        log("loadDeviceParams ERROR: " + e);
    }
}

// Ensure cache is loaded (called lazily if not ready)
function ensureParamCache() {
    if (!_deviceParamsLoaded) {
        log("ensureParamCache: cache not ready, loading now");
        loadDeviceParams();
    }
}

// Look up pid by long_name (df_s{s}_{field}) first, then by short_name (dfs{s}{field})
function findPid(long_name) {
    var pid = _paramByLong[long_name];
    if (pid !== undefined) return pid;
    // Derive short_name from long_name: df_s{N}_{field} -> dfs{N}{field}
    // e.g. df_s0_cc -> dfs0cc
    var short_name = long_name.replace(/^df_s(\d+)_(.+)$/, "dfs$1$2");
    pid = _paramByShort[short_name];
    if (pid !== undefined) return pid;
    return undefined;
}

function setParam(long_name, val) {
    ensureParamCache();
    var pid = findPid(long_name);
    if (pid === undefined) {
        log("setParam: not found: " + long_name + " (tried both df_s* and dfs* forms)");
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
    var pid = findPid(long_name);
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
    ensureParamCache();
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
        var ppath    = decodePath(codes);
        var has_cc   = (cc_v >= 0 && cc_v <= 127);
        var has_path = (ppath !== null);

        log("PARAM RESTORE (LiveAPI): slot=" + s
            + " cc=" + cc_v + " ch=" + ch_v
            + " omin=" + omin_v + " omax=" + omax_v
            + " pmin=" + pmin_v + " pmax=" + pmax_v
            + " codes=[" + codes.slice(0,4).join(",") + "...]"
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
    log("restoreFromParams: populated " + restoredCount + " slot(s)");

    var t2 = new Task(function() {
        resolveAll();
        renderCurrentPage();
        renderPageSel();
        log("restoreFromParams Task: resolveAll + render done");
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

// -- Persist: write slot to LiveAPI parameters (DEFERRED via Task) ─────
// BUGFIX B: param.set() called inside notification callback triggers
// "Changes cannot be triggered by notifications". Must defer to next tick.
function pushSlotDeferred(s) {
    var slot_s = s;
    var t = new Task(function() {
        ensureParamCache();
        var b = SLOTS[slot_s];
        if (!b || (b.cc == null && b.path == null)) {
            setParam("df_s" + slot_s + "_cc",    -1.0);
            setParam("df_s" + slot_s + "_ch",     0.0);
            setParam("df_s" + slot_s + "_omin",   0.0);
            setParam("df_s" + slot_s + "_omax", 100.0);
            setParam("df_s" + slot_s + "_pmin",   0.0);
            setParam("df_s" + slot_s + "_pmax",   1.0);
            for (var ti = 0; ti < PERSIST_PATH_TOKENS; ti++) {
                setParam("df_s" + slot_s + "_t" + ti, 0.0);
            }
            return;
        }
        setParam("df_s" + slot_s + "_cc",   (b.cc != null) ? b.cc : -1.0);
        setParam("df_s" + slot_s + "_ch",   (b.ch != null) ? b.ch :  0.0);
        setParam("df_s" + slot_s + "_omin", OUTMIN[slot_s]);
        setParam("df_s" + slot_s + "_omax", OUTMAX[slot_s]);
        setParam("df_s" + slot_s + "_pmin", isNaN(b.pmin) ? 0.0 : b.pmin);
        setParam("df_s" + slot_s + "_pmax", isNaN(b.pmax) ? 1.0 : b.pmax);
        if (b.path) {
            var codes = encodePath(b.path);
            for (var ti = 0; ti < PERSIST_PATH_TOKENS; ti++) {
                setParam("df_s" + slot_s + "_t" + ti, codes[ti]);
            }
        } else {
            for (var ti = 0; ti < PERSIST_PATH_TOKENS; ti++) {
                setParam("df_s" + slot_s + "_t" + ti, 0.0);
            }
        }
        log("pushSlot OK: s=" + slot_s
            + " cc=" + (b.cc != null ? b.cc : -1)
            + " path=" + (b.path || "null"));
    }, this);
    t.schedule(0);   // next tick, out of notification context
}

function pushSlot(s) {
    if (s >= PERSIST_SLOTS) return;
    pushSlotDeferred(s);
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

function captureParam(absSlot, pid) {
    var p = new LiveAPI(null, "id " + pid);
    var pname = p.get("name") + "";
    var pmin  = parseFloat(p.get("min"));
    var pmax  = parseFloat(p.get("max"));
    var ppath = p.unquotedpath;

    if (!ppath || ppath.length === 0) {
        log("captureParam: empty path for id=" + pid + " name=" + pname + " -- aborted");
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
    pushSlot(absSlot);   // deferred via Task(0) -- safe from notification context
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
