autowatch = 1;
inlets = 1;
outlets = 0;

// browser_load.js — Control XL (Fadercraft)
// Trigger: CC51 / ch15 from LCXL → bang into this js.
// Action:
//   1) find the item currently selected in Live's left browser library
//      (walk the BrowserItem tree following is_selected, depth-limited)
//   2) load it onto the currently selected track via Browser.load_item
//   3) advance Session view to the next scene (selected_scene + 1)
//   4) bring focus back to the Browser
// All Live API work is deferred off the high-priority thread via Task.

var MAX_DEPTH = 12;          // safety cap on browser-tree recursion
var loadTask = null;

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
    scheduleLoad();
}

function msg_int(v) {
    // accept any non-zero (button press); ignore release (0)
    if (v) scheduleLoad();
}

function anything() {
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
}

function doLoad() {
    try {
        var browser = new LiveAPI("live_app browser");
        if (!isValidApi(browser)) return;

        var item = findSelectedLoadable(browser);
        if (!item) {
            // nothing selected / nothing loadable — do nothing, stay silent
            return;
        }

        browser.call("load_item", "id", item.id);

        advanceScene();
        focusBrowser();
    } catch (e) {}
}

// Walk the browser tree following only is_selected branches.
// Returns a LiveAPI handle to the deepest is_selected && is_loadable item,
// or null if none found.
function findSelectedLoadable(browser) {
    var best = null;

    for (var c = 0; c < ROOT_CATEGORIES.length; c++) {
        var cat = null;
        try {
            cat = new LiveAPI("live_app browser " + ROOT_CATEGORIES[c]);
        } catch (e) {
            cat = null;
        }
        if (!isValidApi(cat)) continue;

        var found = descend(cat, 0);
        if (found) {
            best = found;
            break; // selection is unique across the browser
        }
    }

    return best;
}

// Recursively descend into children that are is_selected.
// Returns the deepest selected+loadable item handle, or the deepest
// selected item if none below it is loadable.
function descend(item, depth) {
    if (depth > MAX_DEPTH) return null;
    if (!isValidApi(item)) return null;

    var selected = getInt(item, "is_selected", 0);
    if (selected !== 1) return null;

    var loadable = getInt(item, "is_loadable", 0);

    // Try to find a deeper selected child first (more specific selection).
    var childCount = 0;
    try {
        childCount = parseCount(item.getcount("children"));
    } catch (e) {
        childCount = 0;
    }

    for (var i = 0; i < childCount; i++) {
        var child = null;
        try {
            child = new LiveAPI(item.unquotedpath + " children " + i);
        } catch (e) {
            child = null;
        }
        if (!isValidApi(child)) continue;

        if (getInt(child, "is_selected", 0) === 1) {
            var deeper = descend(child, depth + 1);
            if (deeper) return deeper;
        }
    }

    // No deeper selected+loadable descendant — return this if loadable.
    if (loadable === 1) {
        return new LiveAPI(item.unquotedpath);
    }
    return null;
}

function advanceScene() {
    try {
        var view = new LiveAPI("live_set view");
        if (!isValidApi(view)) return;

        var cur = getInt(view, "selected_scene_index", -1);
        if (cur < 0) {
            // fall back to resolving the scene index from selected_scene id
            cur = resolveSelectedSceneIndex();
        }
        if (cur < 0) return;

        var setApi = new LiveAPI("live_set");
        if (!isValidApi(setApi)) return;
        var sceneCount = parseCount(setApi.getcount("scenes"));
        if (sceneCount <= 0) return;

        var next = cur + 1;
        if (next >= sceneCount) next = sceneCount - 1; // clamp at last scene
        if (next === cur) return;

        view.set("selected_scene", "id " + sceneIdAt(next));
    } catch (e) {}
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
        if (!isValidApi(app)) return;
        app.call("focus_view", "Browser");
    } catch (e) {}
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
        return api && api.id && api.id !== 0;
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
