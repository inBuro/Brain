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
//   build <N>   — перестроить ссылки для return-трека с индексом N (подсказка от патча)
//   mode <0|1>  — выставить режим слежения (0=Max, 1=Sum)
//   bang        — опросить все ссылки и вывести значение слежения
//
// «Живое» определение цели (фикс «застывшего» индекса):
//   JS сам определяет return-индекс через LiveAPI "this_device canonical_parent"
//   и держит набор sendRefs синхронным с сетом за счёт property-observers:
//     - наблюдатель за путём устройства  → ловит ПЕРЕМЕЩЕНИЕ девайса на другой return;
//     - наблюдатель live_set "return_tracks" → ловит ДОБАВЛЕНИЕ/УДАЛЕНИЕ/ПЕРЕУПОРЯДОЧИВАНИЕ
//       return-треков (наш индекс мог сдвинуться);
//     - наблюдатель live_set "tracks"        → ловит ДОБАВЛЕНИЕ/УДАЛЕНИЕ обычных треков
//       (у них появляются/исчезают посылы на наш return — sendRefs надо пересобрать).
//   Сообщение "build N" из патча — лишь начальная подсказка; источник истины = autoDetect().
//   Анти-race: на холодной загрузке наблюдатели/путь могут встать не сразу, поэтому
//   bang() раз в RESYNC_MS дёшево сверяет индекс и счётчик треков и чинит расхождение.

inlets  = 1;
outlets = 1;

var sendRefs       = [];   // массив LiveAPI-ссылок на параметры sends
var returnIndex    = -1;   // индекс return-трека, на котором сидит устройство
var trackCountSnap = -1;   // сколько треков было на момент последней сборки sendRefs
var followMode     = 0;    // режим слежения: 0=Max (дефолт), 1=Sum

// Наблюдатели LiveAPI (живут всё время работы устройства)
var devPathObs     = null; // за путём this_device canonical_parent (перемещение девайса)
var returnsObs     = null; // за live_set "return_tracks" (add/del/reorder return-ов)
var tracksObs      = null; // за live_set "tracks" (add/del обычных треков)
var rebuilding     = false; // защита от реентерабельности колбэков

var RESYNC_MS      = 500;  // как часто bang() дёшево сверяет цель (анти-race)
var lastResyncAt   = 0;    // timestamp последней дешёвой сверки

function now() {
    return (new Date()).getTime();
}

// ---- определение return-индекса ------------------------------------------

// Возвращает индекс return-трека под устройством, или -1 если девайс
// стоит не на return (обычный трек / мастер) либо путь ещё не разрешён.
function detectReturnIndex() {
    try {
        var parent = new LiveAPI("this_device canonical_parent");
        if (!parent || parent.id == 0) return -1;

        // parent.unquotedpath бывает вида:
        //   "live_set return_tracks 4"   — если на return-треке
        //   "live_set tracks 3"          — если на обычном треке
        //   "live_set master_track"      — если на мастере
        var p = parent.unquotedpath;
        if (!p) return -1;

        var m = p.match(/return_tracks\s+(\d+)/);
        if (m) return parseInt(m[1], 10);

        return -1; // не на return — целиться не на что
    } catch (e) {
        return -1;
    }
}

// Сколько сейчас треков в сете (по ним строится sendRefs).
function liveTrackCount() {
    try {
        var liveSet = new LiveAPI("live_set");
        return liveSet.getcount("tracks");
    } catch (e) {
        return -1;
    }
}

// ---- сборка ссылок --------------------------------------------------------

function clearRefs() {
    sendRefs = [];
}

// Построить ссылки на параметр send->returnIdx у каждого трека сета.
function buildRefs(returnIdx) {
    clearRefs();
    returnIndex = returnIdx;

    if (returnIdx < 0) {
        // девайс не на return — тихо: целиться не на что, без спама в консоль
        trackCountSnap = liveTrackCount();
        return;
    }

    var liveSet    = new LiveAPI("live_set");
    var trackCount = liveSet.getcount("tracks");
    trackCountSnap = trackCount;

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

// Синхронизировать sendRefs с текущим состоянием сета.
// Дёшево решает, нужна ли пересборка: пересобирает при смене индекса
// ИЛИ при изменении числа треков. Защищена от реентерабельности.
function resync(force) {
    if (rebuilding) return;
    rebuilding = true;
    try {
        var idx   = detectReturnIndex();
        var count = liveTrackCount();

        var indexChanged = (idx !== returnIndex);
        var countChanged = (count !== trackCountSnap);

        if (force || indexChanged || countChanged) {
            buildRefs(idx);
        }
    } catch (e) {
        // не валим устройство из-за временной гонки LiveAPI
    } finally {
        rebuilding = false;
    }
}

// ---- наблюдатели LiveAPI ---------------------------------------------------

// Колбэк наблюдателя: любое уведомление о наблюдаемом свойстве → пересинк.
// (Игнорируем сами значения; фильтруем шумовые "id ..." уведомления.)
function onLiveChange(args) {
    // args приходит как ["property", value...] или ["id", n];
    // нам важен сам факт изменения — пересобираем при необходимости.
    if (args && args[0] === "id") return; // инициализационное id-уведомление
    resync(false);
}

function installObservers() {
    // Путь устройства: ловит перемещение девайса на другой трек/return.
    try {
        if (devPathObs) { devPathObs.property = ""; devPathObs = null; }
        devPathObs = new LiveAPI(onLiveChange, "this_device canonical_parent");
        // наблюдаем за самим путём родителя — при перемещении девайса
        // canonical_parent резолвится в другой объект → колбэк сработает
        devPathObs.property = "name";
    } catch (e) {}

    // Список return-треков: add/del/reorder return-ов меняет наш индекс.
    try {
        if (returnsObs) { returnsObs.property = ""; returnsObs = null; }
        returnsObs = new LiveAPI(onLiveChange, "live_set");
        returnsObs.property = "return_tracks";
    } catch (e) {}

    // Список обычных треков: add/del трека меняет набор посылов на наш return.
    try {
        if (tracksObs) { tracksObs.property = ""; tracksObs = null; }
        tracksObs = new LiveAPI(onLiveChange, "live_set");
        tracksObs.property = "tracks";
    } catch (e) {}
}

// ---- сообщения из патча ----------------------------------------------------

// "build <N>" из патча — стартовая подсказка индекса. Источник истины —
// autoDetect, поэтому подсказку лишь подтверждаем через resync, а не
// слепо доверяем (патч-цепочка однострельная и могла «застыть»).
function build(returnIdx) {
    if (returnIdx === undefined || returnIdx === null) {
        post("send_follower: build() called without argument\n");
        return;
    }
    // Гарантируем, что наблюдатели стоят (первый build = инициализация).
    if (!devPathObs && !returnsObs && !tracksObs) {
        installObservers();
    }
    // Доверяем собственному детекту; если он пуст (гонка) — берём подсказку.
    var idx = detectReturnIndex();
    if (idx < 0) idx = parseInt(returnIdx, 10);
    buildRefs(idx);
}

// "mode <0|1>" из патча (live.tab: 0=Max, 1=Sum)
function mode(m) {
    if (m === undefined || m === null) {
        post("send_follower: mode() called without argument\n");
        return;
    }
    followMode = (parseInt(m, 10) === 1) ? 1 : 0;
}

// Банг от qmetro 33 — поллинг значений + дешёвая периодическая сверка цели.
function bang() {
    // Наблюдатели — основной механизм синхронизации. На случай, если на
    // холодной загрузке они ещё не встали (гонка), дёшево сверяем цель раз
    // в RESYNC_MS: один detectReturnIndex + один getcount, без обхода треков.
    var t = now();
    if (sendRefs.length === 0 || (t - lastResyncAt) >= RESYNC_MS) {
        lastResyncAt = t;
        if (!devPathObs && !returnsObs && !tracksObs) {
            installObservers();
        }
        resync(false);
    }

    if (sendRefs.length === 0) return; // не на return или ещё не готово — тихо

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
