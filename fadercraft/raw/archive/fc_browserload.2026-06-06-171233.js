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

function doLoad() {
    log("doLoad start");
    try {
        var browser = new LiveAPI("live_app browser");
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

    for (var c = 0; c < ROOT_CATEGORIES.length; c++) {
        var cat = null;
        try {
            cat = new LiveAPI("live_app browser " + ROOT_CATEGORIES[c]);
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
            child = new LiveAPI(item.unquotedpath + " children " + i);
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
        return new LiveAPI(item.unquotedpath);
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
