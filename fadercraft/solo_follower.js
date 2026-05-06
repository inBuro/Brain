autowatch = 1;
inlets = 1;
outlets = 1;

var TOPOLOGY_CHECK_MS = 3000;
var INIT_RETRY_MS = 400;
var INIT_MAX_RETRIES = 40;

var enabled = 1;
var initialized = 0;
var rebuilding = 0;
var applyScheduled = 0;
var initRetries = 0;

var ownTrackApi = null;
var ownTrackId = 0;

var observers = [];
var soloStates = {};
var trackPaths = {};
var soloCount = 0;

var cachedTrackCount = -1;
var cachedReturnCount = -1;

var topologyTask = null;
var applyTask = null;
var initTask = null;

var pendingDesiredSolo = 0;

var viewObserver = null;
var lastUserSelectedId = 0;
var pendingFocusRestore = 0;
var savedSelectionForRestore = 0;
var inSoloEvent = 0;
var soloEventTask = null;
var lastSoloedExternalId = 0;

function bang() {
    safeInit();
}

function anything() {
    if (messagename === "refresh") {
        safeInit();
    }
}

function msg_int(v) {
    enabled = v ? 1 : 0;

    if (!enabled) {
        scheduleApply(0);
        return;
    }

    if (!initialized) {
        safeInit();
    } else {
        scheduleApply(currentDesiredSolo());
    }
}

function safeInit() {
    if (rebuilding) return;
    cancelInitTask();
    initialized = 0;
    initRetries = 0;
    scheduleInit(1);
}

function scheduleInit(delayMs) {
    cancelInitTask();

    initTask = new Task(function () {
        tryInit();
    }, this);

    initTask.schedule(delayMs);
}

function cancelInitTask() {
    if (initTask) {
        try {
            initTask.cancel();
        } catch (e) {}
        initTask = null;
    }
}

function tryInit() {
    if (!enabled) return;
    if (rebuilding) return;

    rebuilding = 1;

    try {
        var dev = new LiveAPI("this_device");
        if (!isValidApi(dev)) {
            rebuildFailed();
            return;
        }

        ownTrackApi = new LiveAPI("this_device");
        if (!isValidApi(ownTrackApi)) {
            rebuildFailed();
            return;
        }

        ownTrackApi.goto("canonical_parent");

        if (!isValidApi(ownTrackApi)) {
            rebuildFailed();
            return;
        }

        ownTrackId = parseIntSafe(ownTrackApi.id);

        rebuild();
        startTopologyTask();
        installViewObserver();

        initialized = 1;
        rebuilding = 0;
        initRetries = 0;

        scheduleApply(currentDesiredSolo());
    } catch (e) {
        rebuildFailed();
    }
}

function rebuildFailed() {
    rebuilding = 0;
    initialized = 0;
    ownTrackApi = null;
    ownTrackId = 0;

    initRetries++;

    if (initRetries <= INIT_MAX_RETRIES) {
        scheduleInit(INIT_RETRY_MS);
    }
}

function rebuild() {
    clearObservers();

    var setApi = new LiveAPI("live_set");
    if (!isValidApi(setApi)) return;

    var trackCount = parseCount(setApi.getcount("tracks"));
    var returnCount = parseCount(setApi.getcount("return_tracks"));

    cachedTrackCount = trackCount;
    cachedReturnCount = returnCount;

    for (var i = 0; i < trackCount; i++) {
        addObserver("live_set tracks " + i);
    }

    for (var j = 0; j < returnCount; j++) {
        addObserver("live_set return_tracks " + j);
    }
}

function clearObservers() {
    for (var i = 0; i < observers.length; i++) {
        try {
            observers[i].property = "";
        } catch (e) {}
    }

    observers = [];
    soloStates = {};
    trackPaths = {};
    soloCount = 0;
}

function addObserver(path) {
    try {
        var probe = new LiveAPI(path);
        if (!isValidApi(probe)) return;

        var id = parseIntSafe(probe.id);
        if (id === ownTrackId) return;

        var currentSolo = safeGetInt(probe, "solo", 0);

        soloStates[id] = currentSolo;
        trackPaths[id] = path;

        if (currentSolo === 1) {
            soloCount++;
        }

        var cb = makeSoloCallback(id);
        var obs = new LiveAPI(cb, path);
        if (!isValidApi(obs)) return;

        obs.property = "solo";
        observers.push(obs);
    } catch (e) {}
}

function makeSoloCallback(trackId) {
    return function(args) {
        if (!enabled) return;
        if (!initialized) return;

        try {
            var newVal = extractSoloValue(args);
            var prev = soloStates[trackId] || 0;

            if (prev === newVal) return;

            markSoloEvent();

            soloStates[trackId] = newVal;

            if (newVal === 1) {
                soloCount++;
                lastSoloedExternalId = trackId;
            } else {
                soloCount = Math.max(0, soloCount - 1);
            }

            scheduleApply(currentDesiredSolo());
        } catch (e) {}
    };
}

function markSoloEvent() {
    inSoloEvent = 1;
    if (soloEventTask) {
        try { soloEventTask.cancel(); } catch (e) {}
    }
    soloEventTask = new Task(function () {
        inSoloEvent = 0;
        soloEventTask = null;
    }, this);
    soloEventTask.schedule(500);
}

function currentDesiredSolo() {
    return soloCount > 0 ? 1 : 0;
}

function scheduleApply(desiredSolo) {
    pendingDesiredSolo = desiredSolo;

    if (applyScheduled) return;
    applyScheduled = 1;

    if (applyTask) {
        try {
            applyTask.cancel();
        } catch (e) {}
    }

    applyTask = new Task(function () {
        applyScheduled = 0;
        applyStateDeferred();
    }, this);

    applyTask.schedule(1);
}

function applyStateDeferred() {
    if (!initialized) return;
    if (!enabled) return;
    if (!isValidApi(ownTrackApi)) return;

    forceOwnSolo(pendingDesiredSolo);
}

function forceOwnSolo(v) {
    if (!isValidApi(ownTrackApi)) return;

    try {
        var current = safeGetInt(ownTrackApi, "solo", 0);
        if (current === v) return;

        var savedId = lastUserSelectedId;
        if (savedId <= 0 || savedId === ownTrackId) {
            savedId = readSelectedTrackId();
        }

        if (v === 1 && savedId > 0 && savedId !== ownTrackId) {
            savedSelectionForRestore = savedId;
            pendingFocusRestore = 1;
            cancelClearPendingFocus();
        } else if (v === 0) {
            cancelClearPendingFocus();
            pendingFocusRestore = 0;
            savedSelectionForRestore = 0;
        }

        ownTrackApi.set("solo", v);

        if (savedSelectionForRestore > 0 && savedSelectionForRestore !== ownTrackId) {
            try {
                var view = new LiveAPI("live_set view");
                if (isValidApi(view)) {
                    if (v === 1 && lastSoloedExternalId > 0 && lastSoloedExternalId !== savedSelectionForRestore && lastSoloedExternalId !== ownTrackId) {
                        view.set("selected_track", "id " + lastSoloedExternalId);
                    }
                    view.set("selected_track", "id " + savedSelectionForRestore);
                }
            } catch (eSync) {}
        }

        if (v === 0) {
            scheduleClearPendingFocus();
        }
    } catch (e) {}
}

function readTrackSolo(trackId) {
    try {
        var api = new LiveAPI("id " + trackId);
        if (!isValidApi(api)) return 0;
        return safeGetInt(api, "solo", 0);
    } catch (e) {
        return 0;
    }
}

function readSelectedTrackId() {
    try {
        var view = new LiveAPI("live_set view");
        if (!isValidApi(view)) return 0;

        var raw = view.get("selected_track");
        if (raw instanceof Array) {
            for (var i = 0; i < raw.length; i++) {
                var n = parseInt(raw[i], 10);
                if (n > 0) return n;
            }
            return 0;
        }
        return parseInt(raw, 10) || 0;
    } catch (e) {
        return 0;
    }
}

var clearPendingTask = null;

function scheduleClearPendingFocus() {
    cancelClearPendingFocus();
    clearPendingTask = new Task(function () {
        pendingFocusRestore = 0;
        savedSelectionForRestore = 0;
        clearPendingTask = null;
    }, this);
    clearPendingTask.schedule(800);
}

function cancelClearPendingFocus() {
    if (clearPendingTask) {
        try { clearPendingTask.cancel(); } catch (e) {}
        clearPendingTask = null;
    }
}

function installViewObserver() {
    uninstallViewObserver();
    try {
        var initialId = readSelectedTrackId();
        if (initialId > 0 && initialId !== ownTrackId) {
            lastUserSelectedId = initialId;
        }

        viewObserver = new LiveAPI(viewObserverCallback, "live_set view");
        if (!isValidApi(viewObserver)) {
            viewObserver = null;
            return;
        }
        viewObserver.property = "selected_track";
    } catch (e) {
        viewObserver = null;
    }
}

function uninstallViewObserver() {
    if (viewObserver) {
        try { viewObserver.property = ""; } catch (e) {}
        viewObserver = null;
    }
}

function viewObserverCallback(args) {
    if (!enabled) return;
    if (!initialized) return;

    if (pendingFocusRestore) {
        try {
            var currentId = readSelectedTrackId();
            if (currentId <= 0) return;
            if (savedSelectionForRestore <= 0) return;
            if (currentId === savedSelectionForRestore) return;

            var liveSolo = readTrackSolo(currentId);
            var isAutoShift = (currentId === ownTrackId) || (liveSolo === 1) || (soloStates[currentId] === 1);

            if (isAutoShift) {
                var view = new LiveAPI("live_set view");
                if (!isValidApi(view)) return;
                view.set("selected_track", "id " + savedSelectionForRestore);
            } else {
                savedSelectionForRestore = currentId;
                lastUserSelectedId = currentId;
            }
        } catch (e) {}
        return;
    }

    if (inSoloEvent) return;

    try {
        var idx = readSelectedTrackId();
        if (idx <= 0 || idx === ownTrackId) return;

        var liveSoloOnIdx = readTrackSolo(idx);
        if (liveSoloOnIdx === 1 || soloStates[idx] === 1) return;

        lastUserSelectedId = idx;
    } catch (e) {}
}

function startTopologyTask() {
    stopTopologyTask();

    topologyTask = new Task(function () {
        topologyCheck();
    }, this);

    topologyTask.interval = TOPOLOGY_CHECK_MS;
    topologyTask.repeat();
}

function stopTopologyTask() {
    if (topologyTask) {
        try {
            topologyTask.cancel();
        } catch (e) {}
        topologyTask = null;
    }
}

function topologyCheck() {
    if (!enabled) return;
    if (!initialized) return;
    if (rebuilding) return;

    try {
        var setApi = new LiveAPI("live_set");
        if (!isValidApi(setApi)) return;

        var trackCount = parseCount(setApi.getcount("tracks"));
        var returnCount = parseCount(setApi.getcount("return_tracks"));

        if (trackCount !== cachedTrackCount || returnCount !== cachedReturnCount) {
            rebuild();
            scheduleApply(currentDesiredSolo());
        }
    } catch (e) {}
}

function extractSoloValue(args) {
    if (args instanceof Array) {
        if (args.length > 1) return parseIntSafe(args[1]);
        if (args.length > 0) return parseIntSafe(args[0]);
    }
    return parseIntSafe(args);
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

function safeGetInt(api, prop, fallback) {
    if (!isValidApi(api)) return fallback;

    try {
        var v = api.get(prop);
        return parseIntSafe(v);
    } catch (e) {
        return fallback;
    }
}

function freebang() {
    stopTopologyTask();
    clearObservers();
    cancelInitTask();
    uninstallViewObserver();

    if (applyTask) {
        try {
            applyTask.cancel();
        } catch (e) {}
        applyTask = null;
    }

    if (clearPendingTask) {
        try { clearPendingTask.cancel(); } catch (e) {}
        clearPendingTask = null;
    }

    if (soloEventTask) {
        try { soloEventTask.cancel(); } catch (e) {}
        soloEventTask = null;
    }

    pendingFocusRestore = 0;
    savedSelectionForRestore = 0;
    lastUserSelectedId = 0;
    inSoloEvent = 0;
    lastSoloedExternalId = 0;

    initialized = 0;
    rebuilding = 0;
    ownTrackApi = null;
    ownTrackId = 0;
}
