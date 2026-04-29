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

            soloStates[trackId] = newVal;

            if (newVal === 1) {
                soloCount++;
            } else {
                soloCount = Math.max(0, soloCount - 1);
            }

            scheduleApply(currentDesiredSolo());
        } catch (e) {}
    };
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

        ownTrackApi.set("solo", v);
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

    if (applyTask) {
        try {
            applyTask.cancel();
        } catch (e) {}
        applyTask = null;
    }

    initialized = 0;
    rebuilding = 0;
    ownTrackApi = null;
    ownTrackId = 0;
}
