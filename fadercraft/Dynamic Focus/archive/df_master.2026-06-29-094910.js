// df_master.js — DYNAMIC FOCUS "MASTER" engine (by-path mapping, 512 slots, 32 pages x 16 rows).
//
// ONE master device on a MIDI track that receives the controller. 512 slots across 32 pages;
// each page shows 16 rows: rows 0..7 = left column (vis indices 0..7),
//                          rows 8..15 = right column (vis indices 8..15).
//
// Each row:
//   * "Map CC"  button  -> arm, then twist an encoder        -> captures the CC (MIDI)
//   * "Map Parameter" button -> arm, then click a parameter  -> captures its PATH + name + range
//   * Min / Max numboxes -> the % of the param's range the encoder sweeps between
// A slot drives once it has BOTH a CC and a parameter path, accessed directly by path on every
// resolve -- works for device params, sends, mixer controls, anything Live exposes.
//
// Button labels update via the patch's `text $1, texton $1` mechanism (NOT setsymbol).
//
// Inlets:
//   0 -- bang from live.thisdevice (init)
//   1 -- row command (list): [row, cmd, ...]
//         row = 0..15 (visual row on current page; 0..7 left col, 8..15 right col)
//         cmd = mapcc | mapparam | clear | min <v> | max <v>
//       OR page command (list): [page, N]  (N = 0-based page index, 0..31)
//       OR named message "page N" from a Max message box (calls function page(N))
//   2 -- CC list from ctlin: [value, cc, channel]
//   3 -- restore list from pattr (flat atom list, written by pushState outlet 3)
//
// Outlets:
//   0 -- full row:  [row, ccLabel, paramLabel, outMin, outMax, mapped(0/1), ccArm(0/1), paramArm(0/1)]
//   1 -- value:     [row, valueInt(0-100)]  row = 0..15           (on drive)
//   2 -- page sel:  [page, active(0/1)]  -- sent for all 32 pages after page change
//   3 -- persist:   flat atom list [i cc ch omin omax pmin pmax name_sym path_sym ...]
//                   9 atoms per non-empty slot. sentinel -1 when no slots mapped.
//                   spaces encoded as __SP__ in both name_sym and path_sym.
//
// Persistence (v4.0, path-based):
//   PUSH: outlet(3) -> t_sw trigger -> pattr df_data (list first) + storagewrite (bang second).
//   PULL: pattrstorage restores -> pattr -> js inlet 3 -> restoreSlots() -> Task(800ms) -> resolveAll.
//   resolveAll: each slot resolved by b.path directly (new LiveAPI(null, b.path)).
//   No name scan needed. Covers: device params, mixer volume/pan, sends, any Live parameter.
//
// Path stability note:
//   b.path = Live API canonical path, e.g. "live_set tracks 0 devices 0 parameters 2".
//   Stable across .als save/reload as long as track/device ORDER does not change.
//   If user reorders tracks or devices, path breaks -> target=null, label shows "? Name".
//   This is an accepted limitation shared by all path-based M4L mappers.

autowatch = 1;
inlets  = 4;   // 0=init, 1=cmd, 2=CC, 3=restore-from-pattr
outlets = 4;   // 0=full row, 1=value, 2=page sel, 3=persist-push-to-pattr

var PAGE_SIZE = 16;
var NPAGES    = 32;
var NSLOTS    = PAGE_SIZE * NPAGES;  // 512

var SP = "__SP__";  // space replacement for Max atom encoding

var currentPage = 0;

// SLOTS[r] = null OR { cc, ch, name, path, pmin, pmax, target, cur, anchorC, anchorP, engaged, lastIncoming }
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

// Guard: prevent pattr feedback loop during pushState.
// When pushState() sends atoms to pattr (outlet 3), pattr immediately echoes them
// back to js inlet 3 -> restoreSlots(). Without this flag, restoreSlots would call
// initSlots() wiping all state mid-push. _pushing=true makes restoreSlots return early.
var _pushing = false;

// Load guard: block pushState during device init / restore phase.
// ROOT CAUSE of the "sentinel -1 spam on load" bug:
//   live.numbox objects in bpatcher rows (nbox_min/nbox_max) have parameter_initial_enable=1.
//   On .als load, Live initializes every numbox to its initial value (0 for min, 100 for max).
//   Each initialization fires the numbox outlet -> mmin/mmax message -> js inlet 1 -> handleCmd
//   -> pushState() with EMPTY slots (restore hasn't happened yet). 16 rows x 2 numboxes = up to
//   32 pushState calls, each writing sentinel -1 to pattr, overwriting the saved 9-atom payload.
//   The page encoder numbox adds more. Live's parameter init fires BEFORE pattrstorage restore.
// SOLUTION: _loading=true blocks pushState until restoreSlots Task completes.
// _loading starts true, cleared only at the end of the 800ms Task in restoreSlots.
// If no restore data exists (first load / empty set), bang() sets _loading=false after render.
var _loading = true;

function log(s) { post("[DF-Master] " + s + "\n"); }

// -- Init -------------------------------------------------------------
function bang() {
    if (inlet !== 0) return;
    setupFocus();
    renderCurrentPage();
    renderPageSel();
    // If no restoreSlots() fired (no saved data in .als), clear _loading here so that
    // subsequent user interactions (mapcc, mapparam, min, max) can push state normally.
    // If restoreSlots() DID fire, it will clear _loading at the end of its Task.
    // We defer this slightly so that any in-flight pattr restore (arriving just after bang)
    // still gets to set _loading=false inside its own Task path.
    var t = new Task(function() {
        if (_loading) {
            log("bang: no restoreSlots fired, clearing _loading");
            _loading = false;
        }
    }, this);
    t.schedule(100);
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

// -- Inlet 1: row/page command . Inlet 2: CC . Inlet 3: restore ------
function list() {
    if (inlet === 1) { handleCmd(arrayfromargs(arguments)); return; }
    if (inlet === 2) { handleCC(arrayfromargs(arguments)); return; }
    if (inlet === 3) { restoreSlots(arrayfromargs(arguments)); return; }
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

// Named message handler: "page N" from message box calls this directly (not list()).
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
    else if (cmd === "min")    { OUTMIN[absSlot] = clampPct(a[2]); reapply(absSlot); pushState(); }
    else if (cmd === "max")    { OUTMAX[absSlot] = clampPct(a[2]); reapply(absSlot); pushState(); }
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
    // Immediate poll: capture the parameter that is ALREADY selected in Live right now.
    // The LiveAPI observer only fires when selected_parameter CHANGES. If the user had
    // already clicked the target before pressing Map Param, the observer stays silent.
    // pollSelectedParam() covers that case.
    pollSelectedParam();
}

// Read live_set view selected_parameter right now and capture it.
function pollSelectedParam() {
    if (learnPSlot < 0) return;
    var api = new LiveAPI(null, "live_set view");
    var sp = api.get("selected_parameter");
    // sp = ['id', <pid>] when a parameter is selected, or [] / ['id', 0] when none
    if (!sp || sp.length < 2 || sp[0] !== "id") return;
    var pid = parseInt(sp[1], 10);
    if (pid <= 0) return;
    captureParam(learnPSlot, pid);
}

// Shared capture logic. Stores name (display), path (stable address), pmin/pmax (scale).
// Works for device parameters, mixer volume/pan, sends -- any parameter Live exposes.
function captureParam(absSlot, pid) {
    var p = new LiveAPI(null, "id " + pid);
    var pname = p.get("name") + "";
    var pmin  = parseFloat(p.get("min"));
    var pmax  = parseFloat(p.get("max"));
    // unquotedpath: canonical Live API address string.
    // Examples:
    //   device param:   "live_set tracks 0 devices 0 parameters 2"
    //   send A:         "live_set tracks 0 mixer_device sends 0 value"
    //   mixer volume:   "live_set tracks 0 mixer_device volume"
    // Stable across .als reload (as long as track/device structure unchanged).
    var ppath = p.unquotedpath;

    if (!ppath || ppath.length === 0) {
        log("captureParam: WARNING -- empty path for id " + pid + " name=" + pname + ". Aborted.");
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
    pushState();
}

function captureCC(absSlot, cc, ch) {
    log("captureCC: absSlot=" + absSlot + " cc=" + cc + " ch=" + ch);
    if (!SLOTS[absSlot]) SLOTS[absSlot] = newSlot();
    SLOTS[absSlot].cc = cc; SLOTS[absSlot].ch = ch;
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
    return { cc: null, ch: null, name: null, path: null, pmin: 0, pmax: 1,
             target: null, cur: 0, anchorC: -1, anchorP: 0, engaged: false, lastIncoming: -1 };
}

function clearSlot(absSlot) {
    SLOTS[absSlot] = null;
    if (learnCCSlot === absSlot) learnCCSlot = -1;
    if (learnPSlot  === absSlot) learnPSlot  = -1;
    renderAbsSlot(absSlot);
    pushState();
}

// -- Focus -> re-resolve every slot's target by path ------------------
// v4.0: uses b.path directly. No name scan. O(slots) not O(slots*devices*params).
// Covers: device params, mixer, sends, any Live parameter.
function onSelectedTrack(args) {
    if (!args || args[0] != "selected_track") return;
    resolveAll();
    renderCurrentPage();
}

function resolveAll() {
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || !b.path) continue;
        // Resolve by stored canonical path -- creates fresh LiveAPI (runtime handle always current).
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

// -- Drive: Value-Scaling takeover, then map into the [min%,max%] window -
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

// -- Persistence: push-pull flat atom list via pattr df_data ----------
// NOTE: resolveAll() is intentionally NOT called from bang() path during _loading=true.
// It IS called from inside the restoreSlots Task (after 800ms) and from onSelectedTrack.
//
// FORMAT v4.0 (9 atoms per non-empty slot):
//   [i, cc, ch, omin, omax, pmin, pmax, name_sym, path_sym]
//   i        = absolute slot index (int, 0..511)
//   cc       = CC number (int, 0..127) or -1 if not set
//   ch       = MIDI channel (int, 1..16) or 0 if not set
//   omin     = OUTMIN[i] (int, 0..100)
//   omax     = OUTMAX[i] (int, 0..100)
//   pmin     = parameter min value (float)
//   pmax     = parameter max value (float)
//   name_sym = display name (spaces->__SP__, or 'null')
//   path_sym = Live API canonical path (spaces->__SP__, or 'null')
//              e.g. live_set__SP__tracks__SP__0__SP__devices__SP__0__SP__parameters__SP__2
//
// Sentinel: -1 (int) when no slots mapped.
//
// PUSH: outlet(3) -> t_sw -> pattr (list first) + storagewrite (bang second).
// PULL: pattrstorage -> pattr -> js inlet 3 -> restoreSlots() -> Task(800ms) -> resolveAll.
//
function pushState() {
    // Block during device load/restore phase to prevent numbox init spam from
    // overwriting pattr with sentinel -1 before restoreSlots() has applied saved data.
    if (_loading) { return; }

    var atoms = [];
    for (var i = 0; i < NSLOTS; i++) {
        var b = SLOTS[i];
        if (!b || (b.cc == null && b.name == null)) continue;
        atoms.push(i);
        atoms.push(b.cc != null ? b.cc : -1);
        atoms.push(b.ch != null ? b.ch : 0);
        atoms.push(Math.round(OUTMIN[i]));
        atoms.push(Math.round(OUTMAX[i]));
        atoms.push(isNaN(b.pmin) ? 0.0 : b.pmin);
        atoms.push(isNaN(b.pmax) ? 1.0 : b.pmax);
        atoms.push(b.name != null ? b.name.split(" ").join(SP) : "null");
        atoms.push(b.path != null ? b.path.split(" ").join(SP) : "null");
    }
    var nSlots = atoms.length / 9;
    _pushing = true;
    if (atoms.length === 0) {
        log("pushState: 0 non-empty slots -> pattr (sentinel -1)");
        outlet(3, -1);
    } else {
        log("pushState: " + nSlots + " non-empty slots -> pattr (" + atoms.length + " atoms)");
        outlet.apply(this, [3].concat(atoms));
    }
    _pushing = false;
}

function restoreSlots(a) {
    // Guard: ignore pattr echo during pushState.
    if (_pushing) { return; }

    // DIAGNOSTIC: log how many atoms arrived from pattr FIRST THING on load.
    // This distinguishes two failure modes:
    //   (a) atoms arrived but were overwritten by subsequent pushState calls -> _loading guard fixes this
    //   (b) atoms never arrived (pattr got -1 because .als never saved them) -> different problem
    log("restoreSlots: received " + a.length + " atoms from pattr (first atom: " + a[0] + ")");

    // Sentinel -1 or legacy 'empty' symbol: nothing to restore.
    if (a.length === 1 && (a[0] === -1 || ("" + a[0]) === "empty" || ("" + a[0]) === "-1")) {
        log("restoreSlots: sentinel, nothing to restore -- clearing _loading");
        _loading = false;
        return;
    }
    // Old JSON string format (v2.x): ignore gracefully.
    if (a.length === 1 && ("" + a[0]).charAt(0) === "[") {
        log("restoreSlots: old JSON format, ignoring -- clearing _loading");
        _loading = false;
        return;
    }

    // Detect atom format: v4.0 = 9 atoms/slot, v3.x = 8 atoms/slot.
    var n = a.length;
    var aps = 9;  // atoms per slot
    if (n % 9 !== 0) {
        if (n % 8 === 0) {
            log("restoreSlots: v3.x format (8 atoms/slot), path=null -- target will not resolve");
            aps = 8;
        } else {
            // Try best fit
            if (n % 9 < n % 8) { aps = 9; n = n - (n % 9); }
            else                { aps = 8; n = n - (n % 8); }
            log("restoreSlots: non-standard atom count, truncating to " + n + " (aps=" + aps + ")");
        }
    }
    if (n === 0) { _loading = false; return; }

    initSlots();
    for (var k = 0; k < n; k += aps) {
        var i    = parseInt(a[k], 10);
        var cc_v = parseInt(a[k+1], 10);
        var ch_v = parseInt(a[k+2], 10);
        var omin = parseInt(a[k+3], 10);
        var omax = parseInt(a[k+4], 10);
        var pmin = parseFloat(a[k+5]);
        var pmax = parseFloat(a[k+6]);
        var nsym = "" + a[k+7];
        var psym = (aps === 9) ? ("" + a[k+8]) : "null";

        if (isNaN(i) || i < 0 || i >= NSLOTS) continue;

        SLOTS[i] = newSlot();
        SLOTS[i].cc   = (cc_v >= 0) ? cc_v : null;
        SLOTS[i].ch   = (ch_v > 0)  ? ch_v : null;
        SLOTS[i].name = (nsym === "null") ? null : nsym.split(SP).join(" ");
        SLOTS[i].path = (psym === "null") ? null : psym.split(SP).join(" ");
        SLOTS[i].pmin = isNaN(pmin) ? 0.0 : pmin;
        SLOTS[i].pmax = isNaN(pmax) ? 1.0 : pmax;
        OUTMIN[i] = isNaN(omin) ? 0   : Math.max(0, Math.min(100, omin));
        OUTMAX[i] = isNaN(omax) ? 100 : Math.max(0, Math.min(100, omax));
    }
    log("restoreSlots: populated " + (n/aps) + " slots (" + aps + " atoms/slot), resolveAll in 800ms");

    // Defer resolveAll -- pattrstorage restores BEFORE live.thisdevice bang,
    // LiveAPI paths not yet available. 800ms gives Live time to finish device init.
    // _loading is cleared AFTER resolveAll so that any late numbox inits
    // (which may arrive after our Task) still can't corrupt pattr.
    var task = new Task(function() {
        resolveAll();
        renderCurrentPage();
        renderPageSel();
        // Now it is safe to allow pushState again.
        // All saved slots are in place, all targets resolved.
        log("restoreSlots Task: resolveAll done, _loading cleared");
        _loading = false;
    }, this);
    task.schedule(800);
}
