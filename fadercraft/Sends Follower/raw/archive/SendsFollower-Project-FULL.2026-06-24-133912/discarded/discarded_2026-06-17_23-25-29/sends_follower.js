// send_follower.js
// Собирает ссылки на все send-параметры сета, идущие на return-трек,
// на котором сидит это устройство, и по бангу выдаёт значение слежения.
//
// Режим слежения (Follow Mode), переключается из патча:
//   Max (0) — максимум среди всех send-значений на этот return (поведение по умолчанию);
//   Sum (1) — сумма всех send-значений на этот return, с клампом к 1.0
//             (downstream ждёт диапазон 0..1; процент-монитор/бас не превышает 100%).
//
// Входящие сообщения (из патча, inlet один — все именованные):
//   build <N>   — перестроить ссылки для return-трека с индексом N
//   mode <0|1>  — выставить режим слежения (0=Max, 1=Sum)
//   bang        — опросить все ссылки и вывести значение слежения
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
var followMode     = 0;    // режим слежения: 0=Max (дефолт), 1=Sum

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

// Вызывается сообщением "mode <0|1>" из патча (live.tab: 0=Max, 1=Sum)
function mode(m) {
    if (m === undefined || m === null) {
        post("send_follower: mode() called without argument\n");
        return;
    }
    followMode = (parseInt(m, 10) === 1) ? 1 : 0;
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

    // Аккумулятор: при Max — максимум, при Sum — сумма с клампом к 1.0.
    var result = 0.0;
    for (var i = 0; i < sendRefs.length; i++) {
        var ref = sendRefs[i];
        if (ref && ref.id != 0) {
            var v = ref.get("value");
            if (v && v.length > 0) {
                var val = parseFloat(v[0]);
                if (followMode === 1) {
                    result += val;            // Sum: накапливаем
                } else if (val > result) {
                    result = val;             // Max: как раньше
                }
            }
        }
    }

    // Sum: кламп сверху на 1.0, чтобы остаться в диапазоне 0..1,
    // который ждёт downstream (scale 0. 1. ...), и percent ≤ 100%.
    if (followMode === 1 && result > 1.0) result = 1.0;

    // Слово-метка "max" сохраняется: downstream-роутинг (route max,
    // ---max_send, percent monitor) завязан на неё — меняем только значение.
    outlet(0, "max", result);
}
