// send_follower.js
// Собирает ссылки на все send-параметры сета, идущие на return-трек,
// на котором сидит это устройство, и по бангу выдаёт максимум среди них.
//
// Входящие сообщения (из патча):
//   build <N>   — перестроить ссылки для return-трека с индексом N
//   bang        — опросить все ссылки и вывести max
//
// Self-healing: если build от патча не пришёл (например, из-за гонки
// при холодной загрузке сета), JS сам периодически пытается определить
// свой return-индекс через LiveAPI "this_device canonical_parent".

inlets  = 1;
outlets = 1;

var sendRefs       = [];   // массив LiveAPI-ссылок на параметры sends
var returnIndex    = -1;   // индекс return-трека, на котором сидит устройство
var lastAutoTryAt  = 0;    // timestamp последней попытки autoDetect
var AUTO_RETRY_MS  = 400;  // не пытаться чаще чем раз в 400 мс

function now() {
    return (new Date()).getTime();
}

function cleanup() {
    sendRefs = [];
}

// Пытается определить индекс return-трека самостоятельно,
// через LiveAPI this_device → canonical_parent → path
function autoDetect() {
    try {
        var parent = new LiveAPI("this_device canonical_parent");
        if (!parent || parent.id == 0) return -1;

        // parent.unquotedpath будет вида:
        //   "live_set return_tracks 4"   — если на return-треке
        //   "live_set tracks 3"          — если на обычном треке
        //   "live_set master_track"      — если на мастере
        var p = parent.unquotedpath;
        if (!p) return -1;

        var m = p.match(/return_tracks\s+(\d+)/);
        if (m) return parseInt(m[1], 10);

        return -1;
    } catch (e) {
        return -1;
    }
}

// Построить ссылки для конкретного return-индекса
function buildRefs(returnIdx) {
    cleanup();
    returnIndex = returnIdx;

    if (returnIdx < 0) return;

    var liveSet    = new LiveAPI("live_set");
    var trackCount = liveSet.getcount("tracks");

    for (var i = 0; i < trackCount; i++) {
        var sendApi = new LiveAPI(
            "live_set tracks " + i + " mixer_device sends " + returnIdx
        );
        if (sendApi.id != 0) {
            sendRefs.push(sendApi);
        }
    }

    post("send_follower: built " + sendRefs.length +
         " send refs for return " + returnIdx + "\n");
}

// Вызывается сообщением "build <N>" из патча
function build(returnIdx) {
    if (returnIdx === undefined || returnIdx === null) {
        post("send_follower: build() called without argument\n");
        return;
    }
    buildRefs(returnIdx);
}

// Вызывается бангом от qmetro 33 — поллинг
function bang() {
    // Self-heal: если ссылок нет — пытаемся определить индекс сами,
    // но не чаще чем раз в AUTO_RETRY_MS
    if (sendRefs.length === 0) {
        var t = now();
        if (t - lastAutoTryAt >= AUTO_RETRY_MS) {
            lastAutoTryAt = t;
            var idx = autoDetect();
            if (idx >= 0) {
                buildRefs(idx);
            }
        }
        if (sendRefs.length === 0) return;
    }

    var maxVal = 0.0;
    for (var i = 0; i < sendRefs.length; i++) {
        var ref = sendRefs[i];
        if (ref && ref.id != 0) {
            var v = ref.get("value");
            if (v && v.length > 0) {
                var val = parseFloat(v[0]);
                if (val > maxVal) maxVal = val;
            }
        }
    }

    outlet(0, "max", maxVal);
}
