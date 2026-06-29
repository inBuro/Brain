// df_master.js — DYNAMIC FOCUS "MASTER" engine (by-path mapping).
//
// Inlets:
//   0    -- bang from live.thisdevice (init)
//   1    -- row/page commands: [row, cmd, ...] or [page, N]
//   2    -- CC from ctlin: [value, cc, channel]
//   3..26 -- pattr middle outlets (24 persist patrs, 8 slots x 3 fields)
//            inlet = 3 + pi*3 + fi  (pi=0..7 slot, fi=0..2 field)
//            fi 0 = _cc   (cc*16+(ch-1), sentinel -1)
//            fi 1 = _path (type*1e9 + trackIdx*1e5 + secondIdx*1e3 + paramIdx, sentinel -1)
//            fi 2 = _om   (omin*1000 + omax, default 100)
//
// Outlets:
//   0 -- full row:  [row, ccLabel, paramLabel, outMin, outMax, mapped, ccArm, paramArm]
//   1 -- value:     [row, valueInt(0-100)]
//   2 -- page sel:  [page, active(0/1)]
//
// Persistence (v5.1 — 24 scalar float Live-parameters, Путь B confirmed):
//   8 persist slots (pi=0..7) always mapped to abs-slots 0-7 (page 0, rows 0-7).
//   3 scalar float parameters per slot. pmin/pmax are NOT stored -- read from LiveAPI on restore.
//   Scalar float parameter_enable=1 persists per-instance in .als (confirmed by test: 123 survived).
//   Each pattr has parameter_enable=1, parametervisibility=2 (stored only, not visible in Live UI).
//   getvalueof()/setvalueof() driven via pattr middle outlet -> js inlet.
//   "PARAM RESTORE ON LOAD" prefix in log = genuine .als restore (not in-session echo).
//
//   Path type codes:
//     0 = device parameter  "live_set tracks T devices D parameters P"
//     1 = track send        "live_set tracks T mixer_device sends S value"
//     2 = track volume      "live_set tracks T mixer_device volume"
//     3 = track panning     "live_set tracks T mixer_device panning"
//     4 = return send       "live_set return_tracks T mixer_device sends S value"
//     5 = return volume     "live_set return_tracks T mixer_device volume"
//     6 = return panning    "live_set return_tracks T mixer_device panning"
//     7 = master volume     "live_set master_track mixer_device volume"
//     8 = master panning    "live_set master_track mixer_device panning"

autowatch = 0;
inlets  = 27;   // 0=bang, 1=cmd, 2=CC, 3..26=24 pattr middle outlets
outlets = 3;    // 0=row, 1=value, 2=page sel

var PAGE_SIZE = 16;
var NPAGES    = 32;
var NSLOTS    = PAGE_SIZE * NPAGES;
var NPERS     = 8;    // persist slots = abs-slots 0-7
var NFIELDS   = 3;    // fields per slot: cc, path, om

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

// Restore accumulator
var _persData = [];
for (var _i = 0; _i < NPERS; _i++) _persData.push({ cc: null, path: null, om: null });
var _persApplyTimer = null;
var _loading = true;

function log(s) { post("[DF-Master] " + s + "\n"); }

// -------------------------------------------------------------------------
// Encoding
// -------------------------------------------------------------------------
function int(s) { return parseInt(s, 10); }

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

function decodePath(v) {
    v = Math.round(v);
    if (v < 0) return null;
    var type = Math.floor(v / 1e9); var rem = v - type * 1e9;
    var ti   = Math.floor(rem / 1e5); rem -= ti * 1e5;
    var si   = Math.floor(rem / 1e3); rem -= si * 1e3;
    var pi   = rem;
    if (type===0) return "live_set tracks "+ti+" devices "+si+" parameters "+pi;
    if (type===1) return "live_set tracks "+ti+" mixer_device sends "+si+" value";
    if (type===2) return "live_set tracks "+ti+" mixer_device volume";
    if (type===3) return "live_set tracks "+ti+" mixer_device panning";
    if (type===4) return "live_set return_tracks "+ti+" mixer_device sends "+si+" value";
    if (type===5) return "live_set return_tracks "+ti+" mixer_device volume";
    if (type===6) return "live_set return_tracks "+ti+" mixer_device panning";
    if (type===7) return "live_set master_track mixer_device volume";
    if (type===8) return "live_set master_track mixer_device panning";
    return null;
}

function encodeCCH(cc, ch) { return (cc==null||cc<0) ? -1 : cc*16+((ch||1)-1); }
function decodeCCH(v) {
    v = Math.round(v);
    if (v < 0) return { cc:null, ch:null };
    return { cc: Math.floor(v/16), ch: (v%16)+1 };
}

// omin/omax: pack as omin*101 + omax (both 0-100, so max = 100*101+100 = 10200)
function encodeOM(omin, omax) { return Math.round(omin)*101 + Math.round(omax); }
function decodeOM(v) {
    v = Math.round(v);
    if (v < 0) return { omin:0, omax:100 };
    return { omin: Math.floor(v/101), omax: v%101 };
}

// -------------------------------------------------------------------------
// getvalueof / setvalueof
// -------------------------------------------------------------------------
function getvalueof() {
    var idx = inlet - 3;
    if (idx < 0 || idx >= NPERS*NFIELDS) return -1;
    var pi = Math.floor(idx / NFIELDS);
    var fi = idx % NFIELDS;
    var s  = SLOTS[pi];
    if (!s || (s.cc==null && s.path==null)) return -1;
    if (fi===0) return encodeCCH(s.cc, s.ch);
    if (fi===1) return encodePath(s.path);
    if (fi===2) return encodeOM(OUTMIN[pi], OUTMAX[pi]);
    return -1;
}

function setvalueof(v) {
    var idx = inlet - 3;
    if (idx < 0 || idx >= NPERS*NFIELDS) return;
    var pi = Math.floor(idx / NFIELDS);
    var fi = idx % NFIELDS;
    var fn = ["cc","path","om"][fi];
    log("PARAM RESTORE ON LOAD: pi="+pi+" fi="+fi+"("+fn+") v="+v);
    _persData[pi][fn] = v;
    if (_persApplyTimer) { _persApplyTimer.cancel(); _persApplyTimer = null; }
    _persApplyTimer = new Task(function() { applyPersistedData(); }, this);
    _persApplyTimer.schedule(400);
}

function applyPersistedData() {
    _persApplyTimer = null;
    var n = 0;
    for (var pi = 0; pi < NPERS; pi++) {
        var d = _persData[pi];
        var pathV = (d.path != null) ? d.path : -1;
        var ccV   = (d.cc   != null) ? d.cc   : -1;
        if (pathV < 0 && ccV < 0) continue;
        var s = SLOTS[pi];
        if (!s) { SLOTS[pi] = newSlot(); s = SLOTS[pi]; }
        var cch = decodeCCH(ccV);
        s.cc = cch.cc;  s.ch = cch.ch;
        s.path = decodePath(pathV);
        var om = decodeOM((d.om != null) ? d.om : -1);
        OUTMIN[pi] = om.omin;  OUTMAX[pi] = om.omax;
        // pmin/pmax will be read from LiveAPI during resolve below
        n++;
    }
    log("applyPersistedData: "+n+" slot(s), resolve in 400ms");
    var task = new Task(function() {
        for (var i = 0; i < NPERS; i++) {
            var b = SLOTS[i];
            if (!b || !b.path) continue;
            var api = new LiveAPI(null, b.path);
            if (api && api.id > 0) {
                b.name   = api.get("name") + "";
                b.pmin   = parseFloat(api.get("min")); if (isNaN(b.pmin)) b.pmin = 0;
                b.pmax   = parseFloat(api.get("max")); if (isNaN(b.pmax)) b.pmax = 1;
                b.target = api;
                b.cur    = normValue(b);
                b.anchorP = b.cur;
            } else {
                b.name = "slot"+i+"?"; b.target = null;
            }
        }
        renderCurrentPage();
        renderPageSel();
        log("applyPersistedData Task: done, _loading cleared");
        _loading = false;
    }, this);
    task.schedule(400);
}

// -------------------------------------------------------------------------
// pushState
// -------------------------------------------------------------------------
function pushState() {
    if (_loading) return;
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
    if (inlet >= 3 && inlet <= 26) { var a = arrayfromargs(arguments); if (a.length>0) setvalueof(a[0]); return; }
}
function msg_int(v) {
    if (inlet === 1) { handleCmd([v]); return; }
    if (inlet >= 3 && inlet <= 26) { setvalueof(v); return; }
}
function anything() {
    if (inlet === 1) handleCmd(arrayfromargs(messagename, arguments));
}

// -------------------------------------------------------------------------
// CC handling
// -------------------------------------------------------------------------
function handleCC(a) {
    if (a.length < 3) return;
    var val=a[0], cc=a[1], ch=a[2];
    if (learnCCSlot >= 0) captureCC(learnCCSlot, cc, ch);
    var v = val / 127.0;
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || b.cc==null || b.cc!==cc || b.ch!==ch || !b.target) continue;
        drive(i, b, v);
        var vr = slotToVisRow(i);
        if (vr >= 0) renderValueRow(vr, i);
    }
}

// -------------------------------------------------------------------------
// Commands
// -------------------------------------------------------------------------
function page(n) { var pg=parseInt(n,10); if (!isNaN(pg)&&pg>=0&&pg<NPAGES) setPage(pg); }

function handleCmd(a) {
    if (a.length < 2) return;
    var first=a[0], cmd=a[1];
    if (first==="page") { var pg=parseInt(cmd,10); if (!isNaN(pg)) setPage(pg); return; }
    var visRow = first;
    if (visRow<0||visRow>=PAGE_SIZE) return;
    var absSlot = currentPage*PAGE_SIZE + visRow;
    if      (cmd==="mapcc")    armCC(absSlot);
    else if (cmd==="mapparam") armParam(absSlot);
    else if (cmd==="clear")    clearSlot(absSlot);
    else if (cmd==="min") { OUTMIN[absSlot]=clampPct(a[2]); reapply(absSlot); if (slotHasData(absSlot)) pushState(); }
    else if (cmd==="max") { OUTMAX[absSlot]=clampPct(a[2]); reapply(absSlot); if (slotHasData(absSlot)) pushState(); }
}

function slotHasData(i) { var b=SLOTS[i]; return b&&(b.cc!=null||b.path!=null); }
function clampPct(x)    { x=parseFloat(x); if(isNaN(x)) return 0; return Math.max(0,Math.min(100,x)); }

function setPage(pg) {
    if (learnCCSlot>=0&&Math.floor(learnCCSlot/PAGE_SIZE)!==pg) learnCCSlot=-1;
    if (learnPSlot >=0&&Math.floor(learnPSlot /PAGE_SIZE)!==pg) learnPSlot=-1;
    currentPage=pg; renderCurrentPage(); renderPageSel();
}

function slotToVisRow(absSlot) {
    if (Math.floor(absSlot/PAGE_SIZE)!==currentPage) return -1;
    return absSlot-currentPage*PAGE_SIZE;
}

// -------------------------------------------------------------------------
// Arm / capture
// -------------------------------------------------------------------------
function armCC(absSlot) {
    var prev=learnCCSlot; learnCCSlot=absSlot;
    if (prev>=0&&prev!==absSlot) renderAbsSlot(prev);
    renderAbsSlot(absSlot);
}
function armParam(absSlot) {
    var prev=learnPSlot; learnPSlot=absSlot;
    if (prev>=0&&prev!==absSlot) renderAbsSlot(prev);
    renderAbsSlot(absSlot);
    pollSelectedParam();
}
function pollSelectedParam() {
    if (learnPSlot<0) return;
    var api=new LiveAPI(null,"live_set view");
    var sp=api.get("selected_parameter");
    if (!sp||sp.length<2||sp[0]!=="id") return;
    var pid=parseInt(sp[1],10); if (pid<=0) return;
    captureParam(learnPSlot,pid);
}
function captureParam(absSlot, pid) {
    var p=new LiveAPI(null,"id "+pid);
    var pname=p.get("name")+"";
    var pmin=parseFloat(p.get("min")); var pmax=parseFloat(p.get("max"));
    var ppath=p.unquotedpath;
    if (!ppath||ppath.length===0) { log("captureParam: empty path -- aborted"); return; }
    if (encodePath(ppath)<0) { log("captureParam: unsupported path '"+ppath+"'"); return; }
    if (!SLOTS[absSlot]) SLOTS[absSlot]=newSlot();
    SLOTS[absSlot].name=pname; SLOTS[absSlot].path=ppath;
    SLOTS[absSlot].pmin=isNaN(pmin)?0:pmin; SLOTS[absSlot].pmax=isNaN(pmax)?1:pmax;
    learnPSlot=-1;
    log("captureParam: absSlot="+absSlot+" name="+pname+" enc="+encodePath(ppath));
    resolveAll(); renderAbsSlot(absSlot); pushState();
}
function captureCC(absSlot, cc, ch) {
    if (!SLOTS[absSlot]) SLOTS[absSlot]=newSlot();
    SLOTS[absSlot].cc=cc; SLOTS[absSlot].ch=ch;
    learnCCSlot=-1; resolveAll(); renderAbsSlot(absSlot); pushState();
}
function onSelectedParam(args) {
    if (learnPSlot<0) return;
    if (!args||args.length<3||args[0]!="selected_parameter") return;
    var pid=parseInt(args[2],10); if (pid<=0) return;
    captureParam(learnPSlot,pid);
}
function newSlot() {
    return {cc:null,ch:null,name:null,path:null,pmin:0,pmax:1,
            target:null,cur:0,anchorC:-1,anchorP:0,engaged:false,lastIncoming:-1};
}
function clearSlot(absSlot) {
    SLOTS[absSlot]=null;
    if (learnCCSlot===absSlot) learnCCSlot=-1;
    if (learnPSlot===absSlot)  learnPSlot=-1;
    renderAbsSlot(absSlot); pushState();
}
function onSelectedTrack(args) {
    if (!args||args[0]!="selected_track") return;
    resolveAll(); renderCurrentPage();
}
function resolveAll() {
    for (var i=0;i<NSLOTS;i++) {
        var b=SLOTS[i]; if (!b||!b.path) continue;
        var api=new LiveAPI(null,b.path);
        b.target=(api&&api.id&&api.id>0)?api:null;
        if (!b.name&&b.target) b.name=b.target.get("name")+"";
        if (b.target&&(b.pmin===0&&b.pmax===1)) {
            var mn=parseFloat(b.target.get("min")); var mx=parseFloat(b.target.get("max"));
            if (!isNaN(mn)) b.pmin=mn; if (!isNaN(mx)) b.pmax=mx;
        }
        b.anchorC=-1; b.engaged=false; b.lastIncoming=-1;
        b.cur=b.target?normValue(b):0; b.anchorP=b.cur;
    }
}
function normValue(b) {
    if (!b.target) return 0;
    var v=parseFloat(b.target.get("value"));
    if (isNaN(v)||b.pmax===b.pmin) return 0;
    return Math.max(0,Math.min(1,(v-b.pmin)/(b.pmax-b.pmin)));
}
function drive(idx,b,v) {
    var p;
    if (b.engaged) p=v;
    else if (b.anchorC<0) { b.anchorC=v; b.lastIncoming=v; return; }
    else if (v>=b.anchorC) p=b.anchorP+((b.anchorC<1)?(v-b.anchorC)/(1-b.anchorC):1)*(1-b.anchorP);
    else p=(b.anchorC>0)?b.anchorP*(v/b.anchorC):0;
    if (!b.engaged&&Math.abs(p-v)<PICKUP_EPS) b.engaged=true;
    b.lastIncoming=v; b.cur=p;
    var frac=Math.max(0,Math.min(1,OUTMIN[idx]/100+p*(OUTMAX[idx]-OUTMIN[idx])/100));
    b.target.set("value",b.pmin+frac*(b.pmax-b.pmin));
}
function reapply(absSlot) {
    var b=SLOTS[absSlot]; if (!b||!b.target) return;
    drive(absSlot,b,b.lastIncoming>=0?b.lastIncoming:b.cur);
}

// -------------------------------------------------------------------------
// Render
// -------------------------------------------------------------------------
function ccLabel(i)    { var b=SLOTS[i]; return (b&&b.cc!=null)?"CC "+b.cc:"Map CC"; }
function paramLabel(i) { var b=SLOTS[i]; if (!b||b.name==null) return "Map Param"; return b.target?b.name:b.name+" ?"; }
function ccArm(i)      { return learnCCSlot===i?1:0; }
function paramArm(i)   { return learnPSlot===i?1:0; }
function slotMapped(i) { var b=SLOTS[i]; return (b&&b.name!=null)?1:0; }

function renderVisRow(vr) {
    var s=currentPage*PAGE_SIZE+vr;
    outlet(0,vr,ccLabel(s),paramLabel(s),OUTMIN[s],OUTMAX[s],slotMapped(s),ccArm(s),paramArm(s));
}
function renderValueRow(vr,s) { var b=SLOTS[s]; outlet(1,vr,(b&&b.target)?Math.round(b.cur*100):0); }
function renderAbsSlot(s) { var vr=slotToVisRow(s); if(vr<0) return; renderVisRow(vr); renderValueRow(vr,s); }
function renderCurrentPage() { for(var r=0;r<PAGE_SIZE;r++){var s=currentPage*PAGE_SIZE+r; renderVisRow(r); renderValueRow(r,s);} }
function renderPageSel() { for(var pg=0;pg<NPAGES;pg++) outlet(2,pg,pg===currentPage?1:0); }
