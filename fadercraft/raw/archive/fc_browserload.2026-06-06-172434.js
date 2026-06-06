autowatch = 1;
inlets = 1;
outlets = 0;

// browser_load.js — Control XL (Fadercraft)
// Trigger: CC51 (any channel) from LCXL → bang/int into this js.
// Action:
//   1) find the item currently selected in Live's left browser library
//      (walk the BrowserItem tree following is_selected, depth-limited)
//   2) load it onto the currently selected track via Browser.load_item
//   3) advance Session view to the next scene (selected_scene + 1)
//   4) bring focus back to the Browser
// All Live API work is deferred off the high-priority thread via Task.
//
// DIAGNOSTIC BUILD 2026-06-06: verbose post() logging at every stage so we can
// see in the Max Console exactly where the chain breaks. Remove DBG once fixed.

var DBG = 1;                 // set to 0 to silence diagnostics
var MAX_DEPTH = 12;          // safety cap on browser-tree recursion
var loadTask = null;

// In the LOM the Browser is the Application.browser PROPERTY (not a navigable
// path child) — which is why "live_app browser" path navigation fails with
// `component 'browser' is not an object` on this Live version.
//
// PRIMARY method (probed FIRST): read the property off Application as an object
// reference — new LiveAPI("live_app").get("browser") returns an id, then
// new LiveAPI("id N") is the real Browser object. This is the textbook way.
// FALLBACK methods: path-navigation forms, kept for Live builds where they work.
// First candidate with a non-zero id wins; the winning form prints in console.
var BROWSER_PATHS = [
    "live_set browser",   // path form, common in recent Live (11/12)
    "live_app browser",   // legacy path form (failing here)
    "browser"             // bare root path, some builds accept it
];

// Resolved root used to build child category paths (set by getBrowser()).
// Empty string means "browser was obtained by id" → build children via
// property access / unquotedpath instead of string concatenation.
var BROWSER_ROOT = "live_set browser";

// True when the winning browser handle came from the id property method, in
// which case category paths must be built off browser.unquotedpath (or via
// per-category property access), not off a BROWSER_ROOT string literal.
var BROWSER_BY_ID = false;

function log() {
    if (!DBG) return;
    var s = "[browser_load]";
    for (var i = 0; i < arguments.length; i++) s += " " + arguments[i];
    post(s + "\n");
}

// Top-level browser categories to scan. is_selected prunes to a single
// path, so listing the full set is cheap — we only descend selected branches.
var ROOT_CATEGORIES = [
    "sounds",
    "drums",
    "instruments",
    "audio_effects",
    "midi_effects",
    "max_for_live",
    "plugins",
    "clips",
    "samples",
    "packs",
    "user_library",
    "current_project"
];

function bang() {
    log("bang received");
    scheduleLoad();
}

function msg_int(v) {
    log("int received:", v);
    // accept any non-zero (button press); ignore release (0)
    if (v) scheduleLoad();
    else log("ignoring 0 (release)");
}

function anything() {
    log("anything received: messagename =", messagename);
    if (messagename === "load") scheduleLoad();
}

function scheduleLoad() {
    if (loadTask) {
        try { loadTask.cancel(); } catch (e) {}
        loadTask = null;
    }
    // deferlow-equivalent: run on the low-priority thread next tick
    loadTask = new Task(function () {
        loadTask = null;
        doLoad();
    }, this);
    loadTask.schedule(1);
    log("load scheduled");
}

// Log the running Live version so we know which API surface is available.
function logLiveVersion() {
    try {
        var app = new LiveAPI("live_app");
        if (!isValidApi(app)) { log("Live version = ? (live_app invalid)"); return; }
        var maj = getStr(app, "major_version");
        var min = getStr(app, "minor_version");
        var bug = getStr(app, "bugfix_version");
        log("Live version =", maj + "." + min + "." + bug);
        // get_version is the documented fallback form
        try { log("Live get_version =", "" + app.call("get_version")); } catch (e) {}
    } catch (e) {
        log("Live version = ? threw:", e.message || e);
    }
}

// Probe browser-access methods in order; return the first valid Browser handle,
// or null. PRIMARY = property access off Application (id reference). FALLBACK =
// path-navigation forms. Sets BROWSER_ROOT / BROWSER_BY_ID so category/child
// paths are built off the winning method.
function getBrowser() {
    // --- PRIMARY: live_app.get("browser") -> id N -> new LiveAPI("id N") ---
    try {
        var app = new LiveAPI("live_app");
        if (isValidApi(app)) {
            var bid = idFrom(app.get("browser"));
            log("try 'live_app.get(browser)' -> id", bid);
            if (bid > 0) {
                var byId = new LiveAPI("id " + bid);
                if (isValidApi(byId)) {
                    BROWSER_BY_ID = true;
                    BROWSER_ROOT = "";  // path-string building disabled
                    log("using browser root 'live_app.get(browser)' (id", bid + ")");
                    return byId;
                }
                log("try 'live_app.get(browser)' -> id" , bid, "but new LiveAPI('id " + bid + "') invalid");
            }
        } else {
            log("try 'live_app.get(browser)' -> live_app invalid");
        }
    } catch (e) {
        log("try 'live_app.get(browser)' -> threw:", e.message || e);
    }

    // --- FALLBACK: path-navigation forms ---
    for (var i = 0; i < BROWSER_PATHS.length; i++) {
        var p = BROWSER_PATHS[i];
        var api = null;
        try {
            api = new LiveAPI(p);
        } catch (e) {
            log("try '" + p + "' -> threw:", e.message || e);
            continue;
        }
        var id = safeId(api);
        log("try '" + p + "' -> id", id);
        if (isValidApi(api)) {
            BROWSER_BY_ID = false;
            BROWSER_ROOT = p;
            log("using browser root '" + p + "' (id", id + ")");
            return api;
        }
    }
    return null;
}

function doLoad() {
    log("doLoad start");
    try {
        logLiveVersion();
        var browser = getBrowser();
        if (!browser) {
            log("ERROR: no browser path resolved — tried", BROWSER_PATHS.join(" / "), "— aborting");
            return;
        }
        log("browser api id =", safeId(browser), "path =", safePath(browser));
        if (!isValidApi(browser)) {
            log("ERROR: browser api invalid — aborting");
            return;
        }

        var item = findSelectedLoadable(browser);
        if (!item) {
            log("RESULT: no selected+loadable item found — nothing to load");
            return;
        }
        log("FOUND item id =", safeId(item),
            "path =", safePath(item),
            "name =", getStr(item, "name"),
            "is_loadable =", getInt(item, "is_loadable", -1),
            "is_selected =", getInt(item, "is_selected", -1));

        // load_item takes a BrowserItem object, passed by id reference.
        try {
            browser.call("load_item", "id", item.id);
            log("load_item called OK on id", item.id);
        } catch (e) {
            log("ERROR load_item threw:", e.message || e);
        }

        advanceScene();
        focusBrowser();
        log("doLoad done");
    } catch (e) {
        log("ERROR doLoad threw:", e.message || e);
    }
}

// Walk the browser tree following only is_selected branches.
// Returns a LiveAPI handle to the deepest is_selected && is_loadable item,
// or null if none found.
function findSelectedLoadable(browser) {
    var best = null;
    var scanned = 0;

    // Decide how to reach the top-level categories. If the working browser has a
    // usable unquotedpath, build category paths as strings off it (robust across
    // both path- and id-obtained handles). Otherwise (id handle with no path),
    // get each category as an object property: browser.get(category) -> id.
    var rootPath = "";
    try { rootPath = "" + browser.unquotedpath; } catch (e) { rootPath = ""; }
    if (rootPath === "undefined" || rootPath === "null") rootPath = "";
    // Prefer the path-string method whenever a concrete root path exists; this
    // covers BROWSER_BY_ID handles too, since the id object usually still
    // reports a valid unquotedpath ("live_app browser" / "live_set browser").
    var usePathStrings = (rootPath !== "");
    log("category traversal via", usePathStrings ? ("path strings off '" + rootPath + "'") : "property access (browser.get(category))");

    for (var c = 0; c < ROOT_CATEGORIES.length; c++) {
        var cat = null;
        try {
            if (usePathStrings) {
                cat = new LiveAPI(rootPath + " " + ROOT_CATEGORIES[c]);
            } else {
                var cid = idFrom(browser.get(ROOT_CATEGORIES[c]));
                cat = (cid > 0) ? new LiveAPI("id " + cid) : null;
            }
        } catch (e) {
            log("category", ROOT_CATEGORIES[c], "threw:", e.message || e);
            cat = null;
        }
        if (!isValidApi(cat)) {
            log("category", ROOT_CATEGORIES[c], "invalid — skip");
            continue;
        }
        scanned++;
        var sel = getInt(cat, "is_selected", 0);
        log("category", ROOT_CATEGORIES[c], "is_selected =", sel);

        // NOTE: do NOT gate on the root's own is_selected — descend always,
        // some Live versions don't flag the top category as ancestor-of-selection.
        var found = descend(cat, 0, ROOT_CATEGORIES[c]);
        if (found) {
            log("category", ROOT_CATEGORIES[c], "yielded a loadable selection");
            best = found;
            break; // selection is unique across the browser
        }
    }

    log("findSelectedLoadable: scanned", scanned, "categories, best =", best ? "found" : "none");
    return best;
}

// Recursively descend into children that are is_selected.
// Returns the deepest selected+loadable item handle, or null.
function descend(item, depth, label) {
    if (depth > MAX_DEPTH) return null;
    if (!isValidApi(item)) return null;

    var loadable = getInt(item, "is_loadable", 0);

    // Determine child-access strategy: by path string if this item exposes a
    // usable unquotedpath, otherwise by the children id list (id-obtained items).
    var itemPath = "";
    try { itemPath = "" + item.unquotedpath; } catch (e) { itemPath = ""; }
    if (itemPath === "undefined" || itemPath === "null") itemPath = "";
    var childIds = null;
    if (itemPath === "") {
        try { childIds = item.get("children"); } catch (e) { childIds = null; }
    }

    var childCount = 0;
    try {
        childCount = parseCount(item.getcount("children"));
    } catch (e) {
        childCount = 0;
    }

    // Find a deeper selected child first (more specific selection).
    for (var i = 0; i < childCount; i++) {
        var child = null;
        try {
            if (itemPath !== "") {
                child = new LiveAPI(itemPath + " children " + i);
            } else {
                var ccid = childIdAt(childIds, i);
                child = (ccid > 0) ? new LiveAPI("id " + ccid) : null;
            }
        } catch (e) {
            child = null;
        }
        if (!isValidApi(child)) continue;

        if (getInt(child, "is_selected", 0) === 1) {
            if (DBG && depth < 4) {
                log("  ".substring(0) + "descend[" + depth + "] " + label +
                    " -> selected child", i, getStr(child, "name"),
                    "loadable", getInt(child, "is_loadable", -1));
            }
            var deeper = descend(child, depth + 1, getStr(child, "name"));
            if (deeper) return deeper;
        }
    }

    // No deeper selected+loadable descendant — return this if loadable AND selected.
    if (loadable === 1 && getInt(item, "is_selected", 0) === 1) {
        // Re-resolve by path when available (stable handle); else return the
        // existing (already valid) handle, which for id-obtained items works too.
        if (itemPath !== "") {
            try { return new LiveAPI(itemPath); } catch (e) { return item; }
        }
        return item;
    }
    return null;
}

function advanceScene() {
    try {
        var view = new LiveAPI("live_set view");
        if (!isValidApi(view)) { log("advanceScene: view invalid"); return; }

        var cur = getInt(view, "selected_scene_index", -1);
        if (cur < 0) cur = resolveSelectedSceneIndex();
        if (cur < 0) { log("advanceScene: could not resolve current scene"); return; }

        var setApi = new LiveAPI("live_set");
        if (!isValidApi(setApi)) return;
        var sceneCount = parseCount(setApi.getcount("scenes"));
        if (sceneCount <= 0) return;

        var next = cur + 1;
        if (next >= sceneCount) next = sceneCount - 1; // clamp at last scene
        if (next === cur) { log("advanceScene: already at last scene"); return; }

        view.set("selected_scene", "id " + sceneIdAt(next));
        log("advanceScene:", cur, "->", next);
    } catch (e) {
        log("ERROR advanceScene:", e.message || e);
    }
}

function resolveSelectedSceneIndex() {
    try {
        var view = new LiveAPI("live_set view");
        if (!isValidApi(view)) return -1;
        var selId = idFrom(view.get("selected_scene"));
        if (selId <= 0) return -1;

        var setApi = new LiveAPI("live_set");
        var sceneCount = parseCount(setApi.getcount("scenes"));
        for (var i = 0; i < sceneCount; i++) {
            if (sceneIdAt(i) === selId) return i;
        }
    } catch (e) {}
    return -1;
}

function sceneIdAt(i) {
    try {
        var s = new LiveAPI("live_set scenes " + i);
        return parseIntSafe(s.id);
    } catch (e) {
        return 0;
    }
}

function focusBrowser() {
    try {
        var app = new LiveAPI("live_app view");
        if (!isValidApi(app)) { log("focusBrowser: app view invalid"); return; }
        app.call("focus_view", "Browser");
        log("focusBrowser OK");
    } catch (e) {
        log("ERROR focusBrowser:", e.message || e);
    }
}

// ---- helpers ----

function getInt(api, prop, fallback) {
    if (!isValidApi(api)) return fallback;
    try {
        return parseIntSafe(api.get(prop));
    } catch (e) {
        return fallback;
    }
}

function getStr(api, prop) {
    if (!isValidApi(api)) return "?";
    try {
        var v = api.get(prop);
        if (v instanceof Array) return v.join(" ");
        return "" + v;
    } catch (e) {
        return "?";
    }
}

function safeId(api) {
    try { return api.id; } catch (e) { return "?"; }
}

function safePath(api) {
    try { return api.unquotedpath; } catch (e) { return "?"; }
}

function idFrom(raw) {
    if (raw instanceof Array) {
        for (var i = 0; i < raw.length; i++) {
            var n = parseInt(raw[i], 10);
            if (n > 0) return n;
        }
        return 0;
    }
    return parseInt(raw, 10) || 0;
}

// Extract the id of the i-th child from a children property value. Live returns
// the children list as a flat array, typically ["id", N, "id", M, ...] (2 slots
// per entry) but sometimes a bare [N, M, ...]. Handle both.
function childIdAt(children, i) {
    if (!(children instanceof Array)) return 0;
    // Detect "id"-tagged flat form by presence of the literal "id" token.
    var tagged = false;
    for (var k = 0; k < children.length; k++) {
        if (children[k] === "id") { tagged = true; break; }
    }
    if (tagged) {
        // entries are pairs: ["id", N, "id", M, ...] → value at 2*i + 1
        var idx = 2 * i + 1;
        if (idx < children.length) return parseInt(children[idx], 10) || 0;
        return 0;
    }
    if (i < children.length) return parseInt(children[i], 10) || 0;
    return 0;
}

function parseCount(v) {
    if (typeof v === "number") return v;
    if (v instanceof Array && v.length > 0) return parseInt(v[0], 10) || 0;
    return parseInt(v, 10) || 0;
}

function parseIntSafe(v) {
    if (typeof v === "number") return v | 0;
    if (v instanceof Array && v.length > 0) return parseInt(v[0], 10) || 0;
    return parseInt(v, 10) || 0;
}

function isValidApi(api) {
    try {
        return api && api.id && api.id !== 0 && api.id !== "0";
    } catch (e) {
        return false;
    }
}

function freebang() {
    if (loadTask) {
        try { loadTask.cancel(); } catch (e) {}
        loadTask = null;
    }
}
