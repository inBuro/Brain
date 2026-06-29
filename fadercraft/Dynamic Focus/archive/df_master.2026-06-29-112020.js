// df_master.js — DYNAMIC FOCUS "MASTER" engine (by-path mapping).
//
// Inlets:
//   0  -- bang from live.thisdevice (init)
//   1  -- row/page commands from buttons  [row, cmd, ...] or [page, N]
//   2  -- CC list from ctlin:             [value, cc, channel]
//   3..34 -- pattr middle outlets (32 persist patrs, one per inlet)
//            inlet 3+pi*4+fi:  pi=persist-slot 0..7, fi=field 0..3
//            fi 0=cc/ch  fi 1=path  fi 2=omin/omax  fi 3=pmin/pmax
//
// Outlets:
//   0 -- full row:  [row, ccLabel, paramLabel, outMin, outMax, mapped, ccArm, paramArm]
//   1 -- value:     [row, valueInt(0-100)]
//   2 -- page sel:  [page, active(0/1)]
//
// Persistence (v5.0 — scalar float Live parameters):
//   8 persist slots (NPERS=8). Each slot = 4 scalar float pattr, parameter_enable=1.
//   Scalar float per-instance parameter IS confirmed to survive .als save/reload.
//   Encoding (all return integers to avoid float-parameter "bad number"):
//     _cc  : cc*16 + (ch-1),  sentinel = -1 (no CC)
//     _path: type*1e9 + trackIdx*1e5 + secondIdx*1e3 + paramIdx, sentinel = -1
//     _om  : omin*1000 + omax  (omin,omax in 0-100)
//     _pr  : round(pmin*10000)*10000 + round(pmax*10000)
//   On restore: setvalueof(v) is called by pattr via middle outlet -> specific inlet.
//   inlet - 3 = flat index 0..31 = pi*4 + fi.
//   Log prefix "PARAM RESTORE ON LOAD" distinguishes real .als restore from in-session.
//   path type codes: 0=device param, 1=track send, 2=track volume, 3=track panning,
//     4=return send, 5=return volume, 6=return panning, 7=master volume, 8=master panning.
//   name is NOT stored; re-read via LiveAPI.get("name") after resolve.
//   Persist slots 0-7 always map to abs-slots 0-7 (page 0, rows 0-7).

autowatch = 0;
inlets  = 35;   // 0=bang, 1=cmd, 2=CC, 3..34=32 pattr middle outlets
outlets = 3;    // 0=row, 1=value, 2=page sel

var PAGE_SIZE = 16;
var NPAGES    = 32;
var NSLOTS    = PAGE_SIZE * NPAGES;
var NPERS     = 8;   // persist slots: abs-slots 0-7

var currentPage = 0;
var SLOTS = [], OUTMIN = [], OUTMAX = [];
function initSlots() {
    log("initSlots");
    SLOTS = []; OUTMIN = []; OUTMAX = [];
    for (var i = 0; i < NSLOTS; i++) { SLOTS.push(null); OUTMIN.push(0); OUTMAX.push(100); }
}
initSlots();

var learnCCSlot = -1, learnPSlot = -1;
var selTrackObs = null, selParamObs = null;
var PICKUP_EPS  = 0.02;

// Restore accumulator: collect all 4 fields per persist-slot.
var _persData = [];
for (var _pi = 0; _pi < NPERS; _pi++) _persData.push({ cc:-1, path:-1, om:-1, pr:-1 });
var _persApplyTimer = null;
var _loading = true;   // blocks pushState until restore complete

function log(s) { post("[DF-Master] " + s + "\n"); }

// -------------------------------------------------------------------------
// Scalar encoding / decoding
// -------------------------------------------------------------------------
function encodePath(path) {
    if (!path) return -1;
    var m;
    m = path.match(/^live_set tracks (\d+) devices (\d+) parameters (\d+)$/);
    if (m) return 0*1e9 + int(m[1])*1e5 + int(m[2])*1e3 + int(m[3]);
    m = path.match(/^live_set tracks (\d+) mixer_device sends (\d+) value$/);
    if (m) return 1*1e9 + int(m[1])*1e5 + int(m[2])*1e3;
    m = path.match(/^live_set tracks (\d+) mixer_device volume$/);
    if (m) return 2*1e9 + int(m[1])*1e5;
    m = path.match(/^live_set tracks (\d+) mixer_device panning$/);
    if (m) return 3*1e9 + int(m[1])*1e5;
    m = path.match(/^live_set return_tracks (\d+) mixer_device sends (\d+) value$/);
    if (m) return 4*1e9 + int(m[1])*1e5 + int(m[2])*1e3;
    m = path.match(/^live_set return_tracks (\d+) mixer_device volume$/);
    if (m) return 5*1e9 + int(m[1])*1e5;
    m = path.match(/^live_set return_tracks (\d+) mixer_device panning$/);
    if (m) return 6*1e9 + int(m[1])*1e5;
    if (path === "live_set master_track mixer_device volume")  return 7*1e9;
    if (path === "live_set master_track mixer_device panning") return 8*1e9;
    return -1;
}
function int(s) { return parseInt(s, 10); }

function decodePath(v) {
    v = Math.round(v);  if (v < 0) return null;
    var type = Math.floor(v / 1e9);
    var rem  = v - type * 1e9;
    var ti   = Math.floor(rem / 1e5); rem -= ti * 1e5;
    var si   = Math.floor(rem / 1e3); rem -= si * 1e3;
    var pi   = rem;
    if (type === 0) return "live_set tracks " + ti + " devices " + si + " parameters " + pi;
    if (type === 1) return "live_set tracks " + ti + " mixer_device sends " + si + " value";
    if (type === 2) return "live_set tracks " + ti + " mixer_device volume";
    if (type === 3) return "live_set tracks " + ti + " mixer_device panning";
    if (type === 4) return "live_set return_tracks " + ti + " mixer_device sends " + si + " value";
    if (type === 5) return "live_set return_tracks " + ti + " mixer_device volume";
    if (type === 6) return "live_set return_tracks " + ti + " mixer_device panning";
    if (type === 7) return "live_set master_track mixer_device volume";
    if (type === 8) return "live_set master_track mixer_device panning";
    return null;
}

function encodeCCH(cc, ch) { return (cc == null || cc < 0) ? -1 : cc * 16 + ((ch || 1) - 1); }
function decodeCCH(v) {
    v = Math.round(v);
    if (v < 0) return { cc: null, ch: null };
    return { cc: Math.floor(v / 16), ch: (v % 16) + 1 };
}

function encodeOM(omin, omax) { return Math.round(omin) * 1000 + Math.round(omax); }
function decodeOM(v) {
    v = Math.round(v);
    if (v < 0) return { omin: 0, omax: 100 };
    return { omin: Math.floor(v / 1000), omax: v % 1000 };
}

function encodePR(pmin, pmax) { return Math.round(pmin * 10000) * 10000 + Math.round(pmax * 10000); }
function decodePR(v) {
    v = Math.round(v);
    if (v < 0) return { pmin: 0.0, pmax: 1.0 };
    return { pmin: Math.floor(v / 10000) / 10000, pmax: (v % 10000) / 10000 };
}

// -------------------------------------------------------------------------
// getvalueof / setvalueof  (called by each pattr via its middle outlet -> inlet)
// -------------------------------------------------------------------------
function getvalueof() {
    // inlet 3..34 -> flat index 0..31 -> pi, fi
    var idx = inlet - 3;
    if (idx < 0 || idx > 31) return -1;
    var pi = Math.floor(idx / 4);
    var fi = idx % 4;
    var absSlot = pi;   // persist slot pi = abs-slot pi (page 0, row pi)
    var b = SLOTS[absSlot];
    if (!b || (b.cc == null && b.path == null)) return -1;
    if (fi === 0) return encodeCCH(b.cc, b.ch);
    if (fi === 1) { var ep = encodePath(b.path); return ep; }
    if (fi === 2) return encodeOM(OUTMIN[absSlot], OUTMAX[absSlot]);
    if (fi === 3) return encodePR(b.pmin, b.pmax);
    return -1;
}

function setvalueof(v) {
    // Called by pattr middle outlet on .als restore. inlet 3..34 tells us pi, fi.
    var idx = inlet - 3;
    if (idx < 0 || idx > 31) return;
    var pi = Math.floor(idx / 4);
    var fi = idx % 4;
    var fnames = ["cc", "path", "om", "pr"];
    log("PARAM RESTORE ON LOAD: pi=" + pi + " fi=" + fi + "(" + fnames[fi] + ") v=" + v);
    _persData[pi][fnames[fi]] = v;
    // Debounce apply: fire 400ms after last setvalueof call
    if (_persApplyTimer) { _persApplyTimer.cancel(); _persApplyTimer = null; }
    _persApplyTimer = new Task(function() { applyPersistedData(); }, this);
    _persApplyTimer.schedule(400);
}

function applyPersistedData() {
    _persApplyTimer = null;
    var n = 0;
    for (var pi = 0; pi < NPERS; pi++) {
        var d = _persData[pi];
        var pathV = d.path;
        var ccV   = d.cc;
        // Skip if both sentinel / never received
        if ((pathV < 0 || pathV == null) && (ccV < 0 || ccV == null)) continue;
        var absSlot = pi;
        if (!SLOTS[absSlot]) SLOTS[absSlot] = newSlot();
        var b = SLOTS[absSlot];
        var cch = decodeCCH(ccV != null ? ccV : -1);
        b.cc = cch.cc;  b.ch = cch.ch;
        b.path = decodePath(pathV != null ? pathV : -1);
        var om = decodeOM(d.om != null ? d.om : -1);
        OUTMIN[absSlot] = om.omin;  OUTMAX[absSlot] = om.omax;
        var pr = decodePR(d.pr != null ? d.pr : -1);
        b.pmin = pr.pmin;  b.pmax = pr.pmax;
        n++;
    }
    log("applyPersistedData: applied " + n + " slot(s), resolve+render in 400ms");
    var task = new Task(function() {
        for (var i = 0; i < NPERS; i++) {
            var b2 = SLOTS[i];
            if (!b2 || !b2.path) continue;
            var api = new LiveAPI(null, b2.path);
            if (api && api.id > 0) {
                b2.name   = api.get("name") + "";
                b2.target = api;
                b2.cur    = normValue(b2);
                b2.anchorP = b2.cur;
            } else {
                b2.name   = "slot" + i + "?";
                b2.target = null;
            }
        }
        renderCurrentPage();
        renderPageSel();
        log("applyPersistedData Task: render done, _loading cleared");
        _loading = false;
    }, this);
    task.schedule(400);
}

// -------------------------------------------------------------------------
// pushState
// -------------------------------------------------------------------------
function pushState() {
    if (_loading) return;
    // notifyclients() signals all 32 pattr objects (bound to dfengine) to re-read getvalueof().
    notifyclients();
}

// -------------------------------------------------------------------------
// Init
// -------------------------------------------------------------------------
function bang() {
    if (inlet !== 0) return;
    setupFocus();
    var t = new Task(function() {
        if (_loading) {
            log("bang: no restore by 1500ms -- empty set");
            _loading = false;
            renderCurrentPage();
            renderPageSel();
        }
    }, this);
    t.schedule(1500);
}

function setupFocus() {
    if (selTrackObs) selTrackObs.property = "";
    selTrackObs = new LiveAPI(onSelectedTrack, "live_set view");
    selTrackObs.property = "selected_track";
    if (selParamObs) selParamObs.property = "";
    selParamObs = new LiveAPI(onSelectedParam, "live_set view");
    selParamObs.property = "selected_parameter";
    resolveAll();
}

// -------------------------------------------------------------------------
// Inlet dispatch
// -------------------------------------------------------------------------
function list() {
    if (inlet === 1) { handleCmd(arrayfromargs(arguments)); return; }
    if (inlet === 2) { handleCC(arrayfromargs(arguments));  return; }
    if (inlet >= 3 && inlet <= 34) {
        var args = arrayfromargs(arguments);
        if (args.length > 0) setvalueof(args[0]);
        return;
    }
}

function msg_int(v) {
    if (inlet === 1) { handleCmd([v]); return; }
    if (inlet >= 3 && inlet <= 34) { setvalueof(v); return; }
}

function anything() {
    if (inlet === 1) { handleCmd(arrayfromargs(messagename, arguments)); }
}

// -------------------------------------------------------------------------
// CC handling
// -------------------------------------------------------------------------
function handleCC(a) {
    if (a.length < 3) return;
    var val = a[0], cc = a[1], ch = a[2];
    if (learnCCSlot >= 0) captureCC(learnCCSlot, cc, ch);
    var v = val / 127.0;
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || b.cc == null || b.cc !== cc || b.ch !== ch || !b.target) continue;
        drive(i, b, v);
        var vr = slotToVisRow(i);
        if (vr >= 0) renderValueRow(vr, i);
    }
}

// -------------------------------------------------------------------------
// Commands
// -------------------------------------------------------------------------
function page(n) { var pg = parseInt(n,10); if (!isNaN(pg) && pg >= 0 && pg < NPAGES) setPage(pg); }

function handleCmd(a) {
    if (a.length < 2) return;
    var first = a[0], cmd = a[1];
    if (first === "page") { var pg = parseInt(cmd,10); if (!isNaN(pg)) setPage(pg); return; }
    var visRow = first;
    if (visRow < 0 || visRow >= PAGE_SIZE) return;
    var absSlot = currentPage * PAGE_SIZE + visRow;
    if      (cmd === "mapcc")    armCC(absSlot);
    else if (cmd === "mapparam") armParam(absSlot);
    else if (cmd === "clear")    clearSlot(absSlot);
    else if (cmd === "min") { OUTMIN[absSlot] = clampPct(a[2]); reapply(absSlot); if (slotHasData(absSlot)) pushState(); }
    else if (cmd === "max") { OUTMAX[absSlot] = clampPct(a[2]); reapply(absSlot); if (slotHasData(absSlot)) pushState(); }
}

function slotHasData(i) { var b = SLOTS[i]; return b && (b.cc != null || b.path != null); }
function clampPct(x)    { x = parseFloat(x); if (isNaN(x)) return 0; return Math.max(0, Math.min(100, x)); }

function setPage(pg) {
    if (learnCCSlot >= 0 && Math.floor(learnCCSlot/PAGE_SIZE) !== pg) learnCCSlot = -1;
    if (learnPSlot  >= 0 && Math.floor(learnPSlot /PAGE_SIZE) !== pg) learnPSlot  = -1;
    currentPage = pg;
    renderCurrentPage();
    renderPageSel();
}

function slotToVisRow(absSlot) {
    if (Math.floor(absSlot/PAGE_SIZE) !== currentPage) return -1;
    return absSlot - currentPage * PAGE_SIZE;
}

// -------------------------------------------------------------------------
// Arm / capture
// -------------------------------------------------------------------------
function armCC(absSlot) {
    var prev = learnCCSlot;  learnCCSlot = absSlot;
    if (prev >= 0 && prev !== absSlot) renderAbsSlot(prev);
    renderAbsSlot(absSlot);
}

function armParam(absSlot) {
    var prev = learnPSlot;  learnPSlot = absSlot;
    if (prev >= 0 && prev !== absSlot) renderAbsSlot(prev);
    renderAbsSlot(absSlot);
    pollSelectedParam();
}

function pollSelectedParam() {
    if (learnPSlot < 0) return;
    var api = new LiveAPI(null, "live_set view");
    var sp  = api.get("selected_parameter");
    if (!sp || sp.length < 2 || sp[0] !== "id") return;
    var pid = parseInt(sp[1], 10);
    if (pid <= 0) return;
    captureParam(learnPSlot, pid);
}

function captureParam(absSlot, pid) {
    var p     = new LiveAPI(null, "id " + pid);
    var pname = p.get("name") + "";
    var pmin  = parseFloat(p.get("min"));
    var pmax  = parseFloat(p.get("max"));
    var ppath = p.unquotedpath;
    if (!ppath || ppath.length === 0) { log("captureParam: empty path -- aborted"); return; }
    var encoded = encodePath(ppath);
    if (encoded < 0) { log("captureParam: unsupported path '" + ppath + "' -- cannot persist"); return; }
    if (!SLOTS[absSlot]) SLOTS[absSlot] = newSlot();
    SLOTS[absSlot].name = pname;
    SLOTS[absSlot].path = ppath;
    SLOTS[absSlot].pmin = isNaN(pmin) ? 0.0 : pmin;
    SLOTS[absSlot].pmax = isNaN(pmax) ? 1.0 : pmax;
    learnPSlot = -1;
    log("captureParam: absSlot=" + absSlot + " name=" + pname + " encoded=" + encoded);
    resolveAll();
    renderAbsSlot(absSlot);
    pushState();
}

function captureCC(absSlot, cc, ch) {
    if (!SLOTS[absSlot]) SLOTS[absSlot] = newSlot();
    SLOTS[absSlot].cc = cc;  SLOTS[absSlot].ch = ch;
    learnCCSlot = -1;
    resolveAll();
    renderAbsSlot(absSlot);
    pushState();
}

function onSelectedParam(args) {
    if (learnPSlot < 0) return;
    if (!args || args.length < 3 || args[0] != "selected_parameter") return;
    var pid = parseInt(args[2], 10);
    if (pid <= 0) return;
    captureParam(learnPSlot, pid);
}

function newSlot() {
    return { cc:null, ch:null, name:null, path:null, pmin:0, pmax:1,
             target:null, cur:0, anchorC:-1, anchorP:0, engaged:false, lastIncoming:-1 };
}

function clearSlot(absSlot) {
    SLOTS[absSlot] = null;
    if (learnCCSlot === absSlot) learnCCSlot = -1;
    if (learnPSlot  === absSlot) learnPSlot  = -1;
    renderAbsSlot(absSlot);
    pushState();
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
        if (!b.name && b.target) b.name = b.target.get("name") + "";
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
    else if (v >= b.anchorC) p = b.anchorP + ((b.anchorC < 1) ? (v-b.anchorC)/(1-b.anchorC) : 1)*(1-b.anchorP);
    else p = (b.anchorC > 0) ? b.anchorP*(v/b.anchorC) : 0;
    if (!b.engaged && Math.abs(p-v) < PICKUP_EPS) b.engaged = true;
    b.lastIncoming = v;  b.cur = p;
    var frac = Math.max(0, Math.min(1, OUTMIN[idx]/100 + p*(OUTMAX[idx]-OUTMIN[idx])/100));
    b.target.set("value", b.pmin + frac*(b.pmax-b.pmin));
}

function reapply(absSlot) {
    var b = SLOTS[absSlot];
    if (!b || !b.target) return;
    drive(absSlot, b, b.lastIncoming >= 0 ? b.lastIncoming : b.cur);
}

// -------------------------------------------------------------------------
// Render
// -------------------------------------------------------------------------
function ccLabel(i)    { var b=SLOTS[i]; return (b&&b.cc!=null) ? "CC "+b.cc : "Map CC"; }
function paramLabel(i) { var b=SLOTS[i]; if (!b||b.name==null) return "Map Param"; return b.target ? b.name : (b.name+" ?"); }
function ccArm(i)      { return learnCCSlot===i ? 1 : 0; }
function paramArm(i)   { return learnPSlot===i  ? 1 : 0; }
function slotMapped(i) { var b=SLOTS[i]; return (b&&b.name!=null) ? 1 : 0; }

function renderVisRow(vr) {
    var s = currentPage*PAGE_SIZE + vr;
    outlet(0, vr, ccLabel(s), paramLabel(s), OUTMIN[s], OUTMAX[s], slotMapped(s), ccArm(s), paramArm(s));
}
function renderValueRow(vr, s) { var b=SLOTS[s]; outlet(1, vr, (b&&b.target)?Math.round(b.cur*100):0); }
function renderAbsSlot(s) { var vr=slotToVisRow(s); if (vr<0) return; renderVisRow(vr); renderValueRow(vr,s); }
function renderCurrentPage() { for (var r=0; r<PAGE_SIZE; r++) { var s=currentPage*PAGE_SIZE+r; renderVisRow(r); renderValueRow(r,s); } }
function renderPageSel() { for (var pg=0; pg<NPAGES; pg++) outlet(2, pg, pg===currentPage?1:0); }
