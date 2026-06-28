// send_follower.js
// Собирает ссылки на все send-параметры сета, идущие на return-трек,
// на котором сидит это устройство, и по бангу выдаёт значение слежения.
//
// Режим слежения (Follow Mode), переключается из патча:
//   Peak (0) — максимум среди всех send-значений на этот return (поведение по умолчанию);
//   Total (1) — сумма всех send-значений на этот return, с клампом к 1.0
//             (downstream ждёт диапазон 0..1; процент-монитор/бас не превышает 100%).
//
// Входящие сообщения (из патча, inlet один — все именованные):
//   build <N>      — перестроить ссылки для return-трека с индексом N (подсказка от патча)
//   mode <0|1>     — выставить режим слежения (0=Peak, 1=Total)
//   bang           — опросить все ссылки и вывести значение слежения
//   arm <0|1>      — взвести/снять map-режим (кнопка Map на лице устройства)
//   unmap          — очистить захваченную цель и освободить map live.remote~
//   restorepath <s> — восстановить путь цели из pattr на загрузке сета
//
// «Живое» определение цели слежения (фикс «застывшего» индекса):
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
//
// Map-кнопка (собственный сигнал SF → произвольный параметр Live, в обход LFO):
//   Клик по Map взводит map-режим (arm 1). В взведённом состоянии наблюдатель за
//   "live_set view selected_parameter" ловит СЛЕДУЮЩИЙ параметр, на который кликнул
//   пользователь в Live, берёт его канонический путь, выходит из map-режима и шлёт путь
//   в патч (outlet 1) → live.path → правый вход второго live.remote~. Левый вход того
//   remote — отвод того же биполярного сигнала −100..100, что идёт в LFO. Так SF своим
//   сигналом модулирует выбранный параметр напрямую, ПАРАЛЛЕЛЬНО ветке LFO (LFO не трогаем).
//   Путь цели хранится в pattr (переживает reload); на загрузке pattr → restorepath →
//   повторный resolve через live.path с тем же defer/retry, что у return-индекса.
//   Unmap очищает путь и шлёт "id 0" во второй remote (цель освобождается в Live).

inlets  = 1;
outlets = 2;   // 0 = значение слежения ("max" <v>); 1 = управление map-веткой

var sendRefs       = [];   // массив LiveAPI-ссылок на параметры sends
var returnIndex    = -1;   // индекс return-трека, на котором сидит устройство
var trackCountSnap = -1;   // сколько треков было на момент последней сборки sendRefs
var followMode     = 0;    // режим слежения: 0=Peak (дефолт), 1=Total

// Наблюдатели LiveAPI (живут всё время работы устройства)
var devPathObs     = null; // за путём this_device canonical_parent (перемещение девайса)
var returnsObs     = null; // за live_set "return_tracks" (add/del/reorder return-ов)
var tracksObs      = null; // за live_set "tracks" (add/del обычных треков)
var rebuilding     = false; // защита от реентерабельности колбэков

var RESYNC_MS      = 500;  // как часто bang() дёшево сверяет цель (анти-race)
var lastResyncAt   = 0;    // timestamp последней дешёвой сверки

// ---- состояние map-ветки ---------------------------------------------------
var mapArmed       = 0;    // взведён ли map-режим (ждём клик пользователя по параметру)
var mapTargetPath  = "";   // канонический путь захваченной цели ("" = нет цели)
var selParamObs    = null; // наблюдатель live_set view "selected_parameter"
var MAP_RETRY_MS   = 150;  // шаг повторного resolve пути на холодной загрузке
var MAP_RETRY_MAX  = 20;   // максимум попыток resolve (≈3 c) — потом тихо сдаёмся
var mapRetryCount  = 0;    // счётчик попыток resolve текущего пути

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

// ---- map-ветка: арм, захват цели, persist, unmap ---------------------------

// Наблюдатель за выбранным параметром в Live. Стоит постоянно, но реагирует
// только когда mapArmed == 1 (иначе клики пользователя по параметрам игнорируем).
function installSelParamObserver() {
    try {
        if (selParamObs) { selParamObs.property = ""; selParamObs = null; }
        // Song.View: "selected_parameter" — параметр, выбранный в Live кликом.
        selParamObs = new LiveAPI(onSelParamChange, "live_set view");
        selParamObs.property = "selected_parameter";
    } catch (e) {}
}

// Колбэк смены выбранного параметра. Захватываем цель только во взведённом
// map-режиме; обычные клики пользователя по параметрам вне арма игнорируем.
function onSelParamChange(args) {
    if (!mapArmed) return;
    if (args && args[0] === "id" && (args[1] === 0 || args[1] === "0")) return; // снят выбор
    try {
        var sel = new LiveAPI("live_set view selected_parameter");
        if (!sel || sel.id == 0) return;
        var path = sel.unquotedpath;
        if (!path) return;
        // Сам наш девайс/служебные параметры выбирать целью бессмысленно,
        // но это редкий кейс — берём как есть: пользователь сам кликнул.
        captureTarget(path);
    } catch (e) {}
}

// Зафиксировать цель: сохранить путь, выйти из арма, резолвить и подключить.
function captureTarget(path) {
    mapTargetPath = path;
    mapArmed = 0;
    persistPath(path);          // в pattr — переживёт reload
    outlet(1, "armstate", 0);   // подсветка кнопки Map: снять
    emitTargetName(path);       // лейбл рядом с кнопкой
    mapRetryCount = 0;
    resolveAndConnect();        // путь → live.path → правый вход map-remote
}

// Отправить путь в патч для resolve через live.path (outlet 1).
// live.path принимает "path <...>" и на выходе даёт "id n" → правый вход remote.
function resolveAndConnect() {
    if (!mapTargetPath) return;
    // Шлём как "path <symbols...>" — live.path сам разрешит в id.
    var parts = mapTargetPath.split(" ");
    var msg = ["target_path"];
    for (var i = 0; i < parts.length; i++) msg.push(parts[i]);
    outlet(1, msg);             // → route target_path → "path ..." → live.path
}

// Восстановление пути из pattr на загрузке сета. Путь хранится в pattr как
// СПИСОК токенов (не один символ — чтобы не зависеть от квотирования пробелов),
// поэтому собираем его из arguments. Live API может быть ещё не готов — повторяем
// resolve с шагом MAP_RETRY_MS, тот же анти-race, что у return-индекса.
function restorepath() {
    if (arguments.length === 0) { mapTargetPath = ""; return; }
    // Сентинел "none" из persistPath = пустая цель (см. persistPath).
    if (arguments.length === 1 && String(arguments[0]) === "none") {
        mapTargetPath = ""; return;
    }
    var toks = [];
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined && arguments[i] !== null && arguments[i] !== "") {
            toks.push(String(arguments[i]));
        }
    }
    if (toks.length === 0) { mapTargetPath = ""; return; }
    mapTargetPath = toks.join(" ");
    emitTargetName(mapTargetPath);
    mapRetryCount = 0;
    retryResolve();
}

function retryResolve() {
    if (!mapTargetPath) return;
    try {
        var t = new LiveAPI(mapTargetPath);
        if (t && t.id != 0) {
            resolveAndConnect();      // путь резолвится — подключаем
            return;
        }
    } catch (e) {}
    // ещё не готово — повторяем до MAP_RETRY_MAX раз
    if (mapRetryCount < MAP_RETRY_MAX) {
        mapRetryCount++;
        var task = new Task(retryResolve);
        task.schedule(MAP_RETRY_MS);
    }
}

// Имя/путь цели для компактного лейбла на лице устройства (outlet 1).
function emitTargetName(path) {
    var label = "—";
    if (path) {
        try {
            var t = new LiveAPI(path);
            if (t && t.id != 0) {
                var nm = t.get("name");
                if (nm && nm.length > 0 && nm[0] !== "") label = String(nm[0]);
                else label = shortPath(path);
            } else {
                label = shortPath(path);
            }
        } catch (e) {
            label = shortPath(path);
        }
    }
    outlet(1, "targetname", label);
}

// Короткое читаемое представление пути, если имя недоступно.
function shortPath(path) {
    var p = path.replace(/^live_set\s*/, "");
    if (p.length > 24) p = p.substring(p.length - 24);
    return p;
}

// Сохранить путь в pattr (outlet 1 → route store → pattr). Путь шлём СПИСКОМ
// токенов, а не одним символом, чтобы не зависеть от квотирования пробелов в
// Max. Пустой store очищает pattr.
function persistPath(path) {
    var msg = ["store"];
    if (path && path.length) {
        var parts = path.split(" ");
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] !== "") msg.push(parts[i]);
        }
    }
    // Всегда хотя бы один атом после "store", чтобы route не выдал голый bang
    // в pattr (bang заставил бы pattr выдать значение, а не очистить).
    if (msg.length === 1) msg.push("none");
    outlet(1, msg);
}

// "arm <0|1>" из патча (кнопка Map). Взвести/снять map-режим.
function arm(a) {
    var v = (parseInt(a, 10) === 1) ? 1 : 0;
    mapArmed = v;
    if (mapArmed && !selParamObs) installSelParamObserver();
    outlet(1, "armstate", mapArmed);   // эхо для подсветки кнопки (синхронизация)
}

// "unmap" из патча. Очистить цель, освободить второй live.remote~ ("id 0").
function unmap() {
    mapArmed = 0;
    mapTargetPath = "";
    mapRetryCount = 0;
    persistPath("");                 // стереть в pattr
    outlet(1, "release");            // → "id 0" в правый вход map-remote
    outlet(1, "armstate", 0);        // снять подсветку
    outlet(1, "targetname", "—");    // очистить лейбл
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
    // Наблюдатель за выбранным параметром тоже ставим при инициализации,
    // чтобы захват цели работал сразу после первого арма.
    if (!selParamObs) {
        installSelParamObserver();
    }
    // Доверяем собственному детекту; если он пуст (гонка) — берём подсказку.
    var idx = detectReturnIndex();
    if (idx < 0) idx = parseInt(returnIdx, 10);
    buildRefs(idx);
}

// "mode <0|1>" из патча (live.tab: 0=Peak, 1=Total)
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
        if (!selParamObs) {
            installSelParamObserver();
        }
        resync(false);
    }

    if (sendRefs.length === 0) return; // не на return или ещё не готово — тихо

    // Аккумулятор: при Peak — максимум, при Total — сумма с клампом к 1.0.
    var result = 0.0;
    for (var i = 0; i < sendRefs.length; i++) {
        var ref = sendRefs[i];
        if (ref && ref.id != 0) {
            var v = ref.get("value");
            if (v && v.length > 0) {
                var val = parseFloat(v[0]);
                if (followMode === 1) {
                    result += val;            // Total: накапливаем
                } else if (val > result) {
                    result = val;             // Peak: как раньше
                }
            }
        }
    }

    // Total: кламп сверху на 1.0, чтобы остаться в диапазоне 0..1,
    // который ждёт downstream (scale 0. 1. ...), и percent ≤ 100%.
    if (followMode === 1 && result > 1.0) result = 1.0;

    // Слово-метка "max" сохраняется: downstream-роутинг (route max,
    // ---max_send, percent monitor) завязан на неё — меняем только значение.
    outlet(0, "max", result);
}
