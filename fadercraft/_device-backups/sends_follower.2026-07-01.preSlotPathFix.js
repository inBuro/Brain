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
//   build <N>          — перестроить ссылки для return-трека с индексом N (подсказка от патча)
//   mode <0|1>         — выставить режим слежения (0=Peak, 1=Total)
//   bang               — опросить все ссылки и вывести значение слежения
//   arm <slot> <0|1>   — взвести/снять map-режим для слота N (кнопка Map строки N)
//   unmap <slot>       — очистить захваченную цель слота N и освободить его live.remote~
//   restorepath <slot> <tokens...> — восстановить путь цели слота N из pattr на загрузке
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
// 8-слотовый маппер (собственный сигнал SF → произвольные параметры Live, в обход LFO):
//   Воспроизводит список маппинга стокового LFO прямо на лице устройства: 8 строк,
//   каждая со своей целью, диапазоном Min/Max и собственным live.remote~.
//   Клик по Map строки N взводит map-режим ИМЕННО этого слота (только ОДИН слот за раз —
//   арм нового снимает арм предыдущего). Во взведённом состоянии наблюдатель за
//   "live_set view selected_parameter" ловит СЛЕДУЮЩИЙ параметр, на который кликнул
//   пользователь в Live, берёт его канонический путь, выходит из арма и шлёт путь в патч
//   (outlet 1, с индексом слота) → live.path слота → правый вход live.remote~ слота.
//   Левый вход каждого remote — отвод того же сигнала слежения SF (0..1), масштабированный
//   в [Min/100 .. Max/100] этого слота. Так SF своим follow-значением модулирует выбранные
//   параметры напрямую, ПАРАЛЛЕЛЬНО ветке LFO (LFO не трогаем).
//   Пути целей хранятся в pattr (по одному на слот, переживают reload); на загрузке
//   pattr слота → restorepath <slot> → повторный resolve через live.path с тем же
//   defer/retry, что у return-индекса. Unmap слота очищает его путь и шлёт "id 0" в его
//   remote (цель освобождается в Live).

inlets  = 1;
outlets = 3;   // 0 = значение слежения ("max" <v>); 1 = управление map-слотами;
               // 2 = ПРОГРАММНЫЙ маппинг: список "<slot> <id>" в multimap inlet 1
               //     (id-инъекция в live.remote~ выбранного MapButton).

var NSLOTS         = 8;    // число слотов маппера (как у стокового LFO)

var sendRefs       = [];   // массив LiveAPI-ссылок на параметры sends
var returnIndex    = -1;   // индекс return-трека, на котором сидит устройство
var trackCountSnap = -1;   // сколько треков было на момент последней сборки sendRefs
var followMode     = 0;    // режим слежения: 0=Peak (дефолт), 1=Total

// Наблюдатели LiveAPI (живут всё время работы устройства)
var devPathObs     = null; // за путём this_device canonical_parent (перемещение девайса)
var returnsObs     = null; // за live_set "return_tracks" (add/del/reorder return-ов)
var tracksObs      = null; // за live_set "tracks" (add/del обычных треков)
var rebuilding     = false; // защита от реентерабельности колбэков

// Анти-feedback WARNING: следим за выбранным в Live параметром. Если выбран send,
// кормящий watched-шину (его id ∈ sendRefs), значит маппинг выхода на него создаст
// петлю → шлём warn=1 в патч (горит «Feedback loop» в version_link). id-membership
// надёжен (не зависит от индекса). Цель НЕ исключаем (маппинг идёт мимо JS), только
// предупреждаем. Снятие выбора с опасного send → warn=0 (вернуть update-статус).
var selParamObs    = null; // live_set view selected_parameter
var warnState      = -1;   // -1 ещё не слали, 0 нет петли, 1 опасный выбор

// id замапленной цели КАЖДОГО слота маппера (0 = слот пуст). Приходит из патча
// сообщением "targetmap <slot> <id>" (multimap → MapButton живой live.observer).
// warn=1 если ЛЮБОЙ targetId слота (!=0) ∈ sendRefs (по id) → выход девайса
// замаплен на send, кормящий watched-шину = реальная петля. Это надёжный детект
// по факту маппинга (не по selected_parameter).
var mapTargetIds   = [0,0,0,0,0,0,0,0];

// bpatcher'ы в multimap.maxpat помечены varname="bpslot0".."bpslot7" по mm_idroute patchlines.
// applySlotRanges() обращается к ним напрямую через getnamed — сортировка не нужна.

var _sfPatcher     = this.patcher; // кэш ссылки на патчер (this.patcher нестабилен в fnc)

var RESYNC_MS      = 500;  // как часто bang() дёшево сверяет цель (анти-race)
var lastResyncAt   = 0;    // timestamp последней дешёвой сверки

var RESULT_EPS     = 5e-4; // порог различия follow-результата (ниже — не шлём downstream)
var lastResult     = -1;   // последнее отправленное значение; -1 = «ещё не слали»

// ---- состояние маппера (8 слотов) -----------------------------------------
var armedSlot      = -1;   // какой слот сейчас взведён (-1 = никто; только один за раз)
var slotPath       = [];   // канонический путь цели каждого слота ("" = нет цели)
var slotRetry      = [];   // счётчик попыток resolve пути для каждого слота
var selParamObs    = null; // наблюдатель live_set view "selected_parameter"
var MAP_RETRY_MS   = 150;  // шаг повторного resolve пути на холодной загрузке
var MAP_RETRY_MAX  = 20;   // максимум попыток resolve (≈3 c) — потом тихо сдаёмся

for (var _s = 0; _s < NSLOTS; _s++) {
    slotPath[_s]  = "";
    slotRetry[_s] = 0;
}

// ---- ПРОГРАММНЫЙ маппинг ("Map All" без GUI-кликов) -----------------------
// Claude/MCP пишут per-slot ИНДЕКСЫ цели в скрытые Live-параметры (Stored Only):
//   SF_TIdx<N> / SF_DIdx<N> / SF_PIdx<N>  (track / device / parameter индексы).
// Патч эхо-роутит их значения в JS как "tidx <slot> <v>" / "didx ..." / "pidx ...",
// а JS кэширует в этих массивах. По "mapall" JS для каждого валидного слота строит
// путь "live_set tracks <t> devices <d> parameters <p>" (или return_tracks), резолвит
// его в Live-объект id и шлёт "<slot> <id>" в outlet 2 → multimap inlet 1 →
// route <slot> → MapButton[slot] правый вход live.remote~ ("id <N>"). Это ТОЧНО тот
// же механизм, что и ручной Map-клик (id → live.remote~), только цель приходит из
// индексов, а не из selected_parameter. -1 = слот не задан (пропускаем).
var tIdx = [-1,-1,-1,-1,-1,-1,-1,-1];
var dIdx = [-1,-1,-1,-1,-1,-1,-1,-1];
var pIdx = [-1,-1,-1,-1,-1,-1,-1,-1];

// Тип хоста для трек-индекса: false = обычный трек ("live_set tracks N"),
// true = return-трек ("live_set return_tracks N"). По умолчанию обычный трек;
// если нужен return-трек как источник цели — Claude кодирует его отрицательным
// t-индексом: t < 0 → return_tracks (-t - 1). Так один параметр покрывает оба
// пространства без доп. параметра. (t = -1 → return_tracks 0, t = -2 → rt 1, …)

function now() {
    return (new Date()).getTime();
}

function validSlot(n) {
    n = parseInt(n, 10);
    return (n >= 0 && n < NSLOTS) ? n : -1;
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
    lastResult = -1;   // сброс гейта: при смене сета/трека первую посылку не блокируем

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
    // sendRefs пересобраны (add/del треков сменил набор) → пересчитать warn
    // по реальным map-целям (sendRefs уже непуст здесь — без рекурсии).
    recomputeWarn();
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

// ---- маппер: арм, захват цели, persist, unmap (по слотам) ------------------

// Наблюдатель за выбранным параметром в Live. Стоит постоянно, но реагирует
// только когда взведён какой-то слот (armedSlot >= 0); иначе обычные клики
// пользователя по параметрам игнорируем.
function installSelParamObserver() {
    try {
        if (selParamObs) { selParamObs.property = ""; selParamObs = null; }
        // Song.View: "selected_parameter" — параметр, выбранный в Live кликом.
        selParamObs = new LiveAPI(onSelParamChange, "live_set view");
        selParamObs.property = "selected_parameter";
    } catch (e) {}
}

// Колбэк смены выбранного параметра. Две задачи:
//  (1) mapper-арм (если взведён слот) — захват цели (в Return маппинг идёт мимо
//      JS, так что эта ветка тут обычно не срабатывает, но оставлена);
//  (2) анти-feedback WARNING — если выбран send, кормящий watched-шину
//      (его id ∈ sendRefs), горит «Feedback loop» в version_link.
function onSelParamChange(args) {
    // (2) WARNING-детект по id-membership — независимо от mapper-арма.
    updateFeedbackWarning(args);

    // (1) mapper-арм (legacy, в Return неактивен).
    if (armedSlot < 0) return;
    if (args && args[0] === "id" && (args[1] === 0 || args[1] === "0")) return; // снят выбор
    try {
        var sel = new LiveAPI("live_set view selected_parameter");
        if (!sel || sel.id == 0) return;
        var path = sel.unquotedpath;
        if (!path) return;
        captureTarget(armedSlot, path);
    } catch (e) {}
}

// ---- ПРОГРАММНЫЙ маппинг: приём индексов + Map All -------------------------

// "tidx <slot> <v>" / "didx ..." / "pidx ..." — эхо значения скрытого Live-параметра
// индекса из патча. Кэшируем; на load live.numbox эмитит сохранённое значение →
// массивы наполняются к моменту "mapall". Числа < -64 клампим к -1 (не задано).
function tidx(slot, v) { _setIdx(tIdx, slot, v); }
function didx(slot, v) { _setIdx(dIdx, slot, v); }
function pidx(slot, v) { _setIdx(pIdx, slot, v); }
function _setIdx(arr, slot, v) {
    var s = validSlot(slot);
    if (s < 0) return;
    var n = parseInt(v, 10);
    arr[s] = isNaN(n) ? -1 : n;
}

// Построить канонический путь цели для слота из индексов. Возвращает "" если слот
// не задан (нет валидных device+parameter). t >= 0 → "tracks t"; t < 0 → return_tracks.
function slotPathFromIdx(slot) {
    var t = tIdx[slot], dv = dIdx[slot], pv = pIdx[slot];
    if (dv < 0 || pv < 0) return "";           // без device+parameter слот пуст
    var trackTok;
    if (t >= 0)      trackTok = "tracks " + t;
    else             trackTok = "return_tracks " + (-t - 1);   // -1→rt0, -2→rt1, …
    return "live_set " + trackTok + " devices " + dv + " parameters " + pv;
}

// "mapall" — для каждого слота с валидными индексами: построить путь, резолвить в
// Live-объект id, отправить "<slot> <id>" в outlet 2 → multimap → live.remote~.
// Пустые слоты пропускаем (их существующий маппинг НЕ трогаем — Map All только
// добавляет/переустанавливает заданные Claude слоты). Также запоминаем путь в
// slotPath[slot] и id в mapTargetIds[slot] (для лейблов и warn-детекта).
// Direct patcher navigation: getnamed("mb_map_id").message(id) fires full mb_ididmsg
// chain → RangeAndName (label update) + live.remote~ inlet 1 (parameter mapping).
function mapall() {
    var mmBox = null, mmSub = null;
    try {
        mmBox = _sfPatcher.getnamed("multimap_panel");
        if (mmBox) mmSub = mmBox.subpatcher();
    } catch(e) {}

    for (var s = 0; s < NSLOTS; s++) {
        var path = slotPathFromIdx(s);
        if (!path) continue;
        var id = 0;
        try {
            var api = new LiveAPI(path);
            if (api && api.id != 0) id = parseInt(api.id, 10);
        } catch(e) { id = 0; }
        if (!id) continue;
        slotPath[s]     = path;
        mapTargetIds[s] = id;

        if (mmSub) {
            try {
                var bp = mmSub.getnamed("bpslot" + s);
                if (bp) {
                    var slotSub = bp.subpatcher();
                    if (slotSub) {
                        var mmsg = slotSub.getnamed("mb_map_id");
                        if (mmsg) mmsg.message(id);
                    }
                }
            } catch(e) {}
        }

        emitTargetName(s, path);               // лейбл строки слота
    }
    recomputeWarn();                           // пересчёт анти-feedback после маппинга
    applySlotRanges();
}

// ---- МУЛЬТИМАП ДИАПАЗОНЫ --------------------------------------------------
// applySlotRanges() — после MapAll читает Max/Min из API-параметров [27-34]/[35-42]
// и выставляет TargetMax/TargetMin в каждом MapButton-слоте мультимапа.
// Каждый bpatcher в multimap.maxpat имеет varname="bpslot{s}" (s=0..7),
// что позволяет обращаться напрямую без сортировки по Y.
function applySlotRanges() {
    var devPath = "";
    try {
        var dapi = new LiveAPI("this_device");
        if (!dapi || dapi.id == 0) return;
        devPath = dapi.unquotedpath;
    } catch(e) { return; }
    if (!devPath) return;

    var maxV = [], minV = [];
    for (var s = 0; s < NSLOTS; s++) {
        try {
            var pm = new LiveAPI(devPath + " parameters " + (27 + s));
            maxV[s] = (pm && pm.id != 0) ? pm.get("value")[0] : 100;
        } catch(e) { maxV[s] = 100; }
        try {
            var pn = new LiveAPI(devPath + " parameters " + (35 + s));
            minV[s] = (pn && pn.id != 0) ? pn.get("value")[0] : 0;
        } catch(e) { minV[s] = 0; }
    }

    try {
        var mmBox = _sfPatcher.getnamed("multimap_panel");
        if (!mmBox) return;
        var mmSub = mmBox.subpatcher();
        if (!mmSub) return;

        for (var s = 0; s < NSLOTS; s++) {
            var bp = mmSub.getnamed("bpslot" + s);
            if (!bp) { post("applySlotRanges: bpslot" + s + " not found\n"); continue; }
            var slotSub = bp.subpatcher();
            if (!slotSub) continue;
            var tmax = slotSub.getnamed("TargetMax[7]");
            var tmin = slotSub.getnamed("TargetMin[7]");
            if (tmax) tmax.message(maxV[s]);
            if (tmin) tmin.message(minV[s]);
        }
    } catch(e) {
        post("applySlotRanges error: " + e + "\n");
    }
}

// "targetmap <slot> <id>" из патча — обновить id замапленной цели слота.
// id=0 / unmap → слот очищается. После обновления — пересчёт warn.
function targetmap(slot, id) {
    var s = parseInt(slot, 10);
    if (isNaN(s) || s < 0 || s >= 8) return;
    var v = parseInt(id, 10);
    mapTargetIds[s] = (isNaN(v) || v < 0) ? 0 : v;
    recomputeWarn();
}

// Истинный id ∈ sendRefs? (send кормит watched-шину)
function idInSendRefs(id) {
    if (!id) return false;
    if (sendRefs.length === 0) {
        var idx = detectReturnIndex();
        if (idx >= 0) buildRefs(idx);   // on-demand, чтобы матч сработал СРАЗУ
    }
    for (var i = 0; i < sendRefs.length; i++) {
        if (sendRefs[i] && sendRefs[i].id != 0 &&
            parseInt(sendRefs[i].id, 10) === id) return true;
    }
    return false;
}

// ОСНОВНОЙ детект петли: warn=1 если ЛЮБАЯ замапленная цель слота ∈ sendRefs
// (выход девайса драйвит send, кормящий watched-шину). Пересчитывается при
// смене целей (targetmap) И при пересборке sendRefs (buildRefs).
function recomputeWarn() {
    var w = 0;
    for (var s = 0; s < 8; s++) {
        if (mapTargetIds[s] && idInSendRefs(mapTargetIds[s])) { w = 1; break; }
    }
    if (w !== warnState) {
        warnState = w;
        outlet(1, "warn", w);   // → route warn → version_link логика в патче
    }
}

// Доп-триггер по selected_parameter (best-effort, если пользователь ВЫДЕЛИЛ
// опасный send до маппинга). Не основной — основной = recomputeWarn по map-целям.
function updateFeedbackWarning(args) {
    if (args && args[0] === "id" && (args[1] === 0 || args[1] === "0")) {
        recomputeWarn();   // снят выбор — вернуться к состоянию по map-целям
        return;
    }
    try {
        var sel = new LiveAPI("live_set view selected_parameter");
        if (sel && sel.id != 0 && idInSendRefs(parseInt(sel.id, 10))) {
            if (warnState !== 1) { warnState = 1; outlet(1, "warn", 1); }
            return;
        }
    } catch (e) {}
    recomputeWarn();   // выбор безопасного — флаг по реальным map-целям
}

// Зафиксировать цель слота: сохранить путь, выйти из арма, резолвить и подключить.
function captureTarget(slot, path) {
    slot = validSlot(slot);
    if (slot < 0) return;
    slotPath[slot]  = path;
    armedSlot       = -1;
    persistPath(slot, path);             // в pattr слота — переживёт reload
    outlet(1, slot, "arm", 0);           // подсветка кнопки Map слота: снять
    emitTargetName(slot, path);          // лейбл строки слота
    slotRetry[slot] = 0;
    resolveAndConnect(slot);             // путь → live.path слота → правый вход remote
}

// Отправить путь слота в патч для resolve через live.path (outlet 1).
// live.path принимает "path <...>" и на выходе даёт "id n" → правый вход remote.
function resolveAndConnect(slot) {
    slot = validSlot(slot);
    if (slot < 0 || !slotPath[slot]) return;
    // Шлём как "<slot> path <symbols...>" — route по слоту → live.path слота.
    var parts = slotPath[slot].split(" ");
    var msg = [slot, "path"];
    for (var i = 0; i < parts.length; i++) msg.push(parts[i]);
    outlet(1, msg);
}

// Восстановление пути слота из pattr на загрузке сета. Путь хранится в pattr
// как СПИСОК токенов (не один символ — чтобы не зависеть от квотирования
// пробелов). Первый аргумент — индекс слота, дальше — токены пути. Live API
// может быть ещё не готов — повторяем resolve с шагом MAP_RETRY_MS, тот же
// анти-race, что у return-индекса.
function restorepath() {
    if (arguments.length === 0) return;
    var slot = validSlot(arguments[0]);
    if (slot < 0) return;
    // Сентинел "none" = пустая цель (см. persistPath).
    if (arguments.length === 2 && String(arguments[1]) === "none") {
        slotPath[slot] = "";
        return;
    }
    var toks = [];
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] !== undefined && arguments[i] !== null && arguments[i] !== "") {
            toks.push(String(arguments[i]));
        }
    }
    if (toks.length === 0) { slotPath[slot] = ""; return; }
    slotPath[slot] = toks.join(" ");
    emitTargetName(slot, slotPath[slot]);
    slotRetry[slot] = 0;
    retryResolve(slot);
}

function retryResolve(slot) {
    slot = validSlot(slot);
    if (slot < 0 || !slotPath[slot]) return;
    try {
        var t = new LiveAPI(slotPath[slot]);
        if (t && t.id != 0) {
            resolveAndConnect(slot);      // путь резолвится — подключаем
            return;
        }
    } catch (e) {}
    // ещё не готово — повторяем до MAP_RETRY_MAX раз
    if (slotRetry[slot] < MAP_RETRY_MAX) {
        slotRetry[slot]++;
        var task = new Task(retryResolve, this, slot);
        task.schedule(MAP_RETRY_MS);
    }
}

// Имя/путь цели слота для лейбла строки (outlet 1, с индексом слота).
function emitTargetName(slot, path) {
    slot = validSlot(slot);
    if (slot < 0) return;
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
    outlet(1, slot, "name", label);
}

// Короткое читаемое представление пути, если имя недоступно.
function shortPath(path) {
    var p = path.replace(/^live_set\s*/, "");
    if (p.length > 24) p = p.substring(p.length - 24);
    return p;
}

// Сохранить путь слота в pattr (outlet 1 → route по слоту → "store" → pattr).
// Путь шлём СПИСКОМ токенов, а не одним символом, чтобы не зависеть от
// квотирования пробелов в Max. Пустой store очищает pattr.
function persistPath(slot, path) {
    slot = validSlot(slot);
    if (slot < 0) return;
    var msg = [slot, "store"];
    if (path && path.length) {
        var parts = path.split(" ");
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] !== "") msg.push(parts[i]);
        }
    }
    // Всегда хотя бы один атом после "store", чтобы route не выдал голый bang
    // в pattr (bang заставил бы pattr выдать значение, а не очистить).
    if (msg.length === 2) msg.push("none");
    outlet(1, msg);
}

// "arm <slot> <0|1>" из патча (кнопка Map строки). Только ОДИН слот за раз:
// арм нового слота снимает арм предыдущего.
function arm(slot, a) {
    slot = validSlot(slot);
    if (slot < 0) return;
    var v = (parseInt(a, 10) === 1) ? 1 : 0;
    if (v) {
        // снять арм у предыдущего взведённого слота (визуально)
        if (armedSlot >= 0 && armedSlot !== slot) {
            outlet(1, armedSlot, "arm", 0);
        }
        armedSlot = slot;
        if (!selParamObs) installSelParamObserver();
    } else {
        if (armedSlot === slot) armedSlot = -1;
    }
    outlet(1, slot, "arm", v);            // эхо для подсветки кнопки (синхронизация)
}

// "unmap <slot>" из патча. Очистить цель слота, освободить его live.remote~ ("id 0").
function unmap(slot) {
    slot = validSlot(slot);
    if (slot < 0) return;
    if (armedSlot === slot) armedSlot = -1;
    slotPath[slot]  = "";
    slotRetry[slot] = 0;
    persistPath(slot, "");                // стереть в pattr слота
    outlet(1, slot, "release");           // → "id 0" в правый вход remote слота
    outlet(1, slot, "arm", 0);            // снять подсветку
    outlet(1, slot, "name", "—");         // очистить лейбл
}

// ---- сообщения из патча ----------------------------------------------------

// "build <N>" из патча — стартовая подсказка индекса. Источник истины —
// autoDetect, поэтому подсказку лишь подтверждаем через resync, а не
// слепо доверяем (патч-цепочка однострельная и могла «застыть»).
function build(returnIdx) {
    if (returnIdx === undefined || returnIdx === null) {
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

// Max вызывает loadbang() при загрузке патча — ставим наблюдатели СРАЗУ (не ждём
// первый bang/detect-цепочку), чтобы warning срабатывал с ПЕРВОГО выбора send'а.
function loadbang() {
    if (!devPathObs && !returnsObs && !tracksObs) installObservers();
    if (!selParamObs) installSelParamObserver();
    var idx = detectReturnIndex();
    if (idx >= 0) buildRefs(idx);   // собрать sendRefs сразу — id-membership готов
}

// "mode <0|1>" из патча (live.tab: 0=Peak, 1=Total)
function mode(m) {
    if (m === undefined || m === null) {
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
    // Change-gate: шлём downstream только при реальном изменении (снижает нагрузку на 50 Гц).
    if (Math.abs(result - lastResult) > RESULT_EPS) {
        lastResult = result;
        outlet(0, "max", result);
    }
}
