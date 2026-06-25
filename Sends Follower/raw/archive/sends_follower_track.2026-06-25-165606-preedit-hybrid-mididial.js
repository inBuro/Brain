// sends_follower_track.js
// Track-вариант Sends Follower. Живёт на ОБЫЧНОМ треке и следит за ОДНИМ
// собственным send-параметром этого трека (его посылкой в выбранный return),
// а не за суммой по всем трекам сета.
//
// Источник значения: this_device canonical_parent (хост-трек) → mixer_device
//   → sends <k>, где k — индекс выбранного return-трека (= индекс пункта меню).
// Никакого обхода всех треков и никакой агрегации Peak/Total: значение одно.
//
// Входящие сообщения (из патча, inlet один — все именованные):
//   select <menuIdx>    — выбрать пункт меню: 0=None (инертно), i≥1=send (i−1)
//   restoreidx <k>      — восстановить выбор из параметра на загрузке (тот же menuIdx)
//   bang                — опросить выбранный send и вывести значение (метка "max")
//   arm <slot> <0|1>    — взвести/снять map-режим для слота N (кнопка Map строки N)
//   unmap <slot>        — очистить захваченную цель слота N и освободить его live.remote~
//   restorepath <slot> <tokens...> — восстановить путь цели слота N из pattr на загрузке
//
// Меню send'ов наполняется РАНТАЙМ из JS (outlet 1 → live.menu): имена берём
// из live_set return_tracks. Наблюдатель за "return_tracks" перенаполняет меню
// и переустанавливает выбранный ref при add/del/reorder return-треков.
//
// Если девайс стоит НЕ на обычном треке (return / master) — целиться не на что:
//   выдаём value 0 (N/A) и просим патч спрятать меню (outlet 1 "menu hide").
//
// 8-слотовый маппер (собственный сигнал → произвольные параметры Live) перенесён
// 1:1 из return-версии: arm/captureTarget/persist/unmap/restorepath + observer за
// "live_set view selected_parameter". Не зависит от источника follow-значения.

inlets  = 1;
outlets = 3;   // 0 = значение слежения ("max" <v>); 1 = управление меню + map-слотами;
               // 2 = "knobset <0..1>" — обновить ГЛАВНУЮ ручку под текущий send (тихо, без output)

var NSLOTS         = 8;    // число слотов маппера (как у return-версии)

var sendRef        = null; // ОДНА LiveAPI-ссылка на выбранный send-параметр
// selectedSend = индекс return-трека (0=A,1=B,…). СПЕЦ-ЗНАЧЕНИЕ -1 = "None":
// цели нет, ручка инертна (не пишет/не читает send, mapper-выход = 0).
// Меню: item 0 = "None", item i (i≥1) = return-индекс (i−1). Т.е.
//   menuIndex = selectedSend + 1  и  selectedSend = menuIndex − 1.
var NONE           = -1;
var selectedSend   = NONE; // дефолт при свежей вставке = None (НЕ хватаем Send A)
var onTrack        = false;// стоит ли девайс на обычном треке (иначе N/A)
var returnCountSnap = -1;  // сколько return'ов было на момент последнего наполнения меню

// ---- двусторонняя главная ручка (mappable live.dial) ----------------------
// Ручка одновременно ОТРАЖАЕТ уровень выбранного send'а (чтение из bang) и
// ПИШЕТ в него (userval <v> от движения ручки: мышь / замапленный энкодер /
// автоматизация параметра ручки). Гард read↔write рвёт петлю:
//   • при записи запоминаем lastWritten — следующий read с тем же значением
//     (в пределах EPS) НЕ толкает ручку обратно (нет эха/дрожания);
//   • ручку из read обновляем ТОЛЬКО когда значение реально отличается на EPS
//     от того, что на ручке сейчас (knobShown) — внешняя правка подхватится,
//     микро-джиттер LiveAPI/автоматизации не вызовет борьбы.
var KNOB_EPS       = 0.0009; // порог различия (send value 0..1; ~1/1024)
var lastWritten    = -1;     // последнее значение, записанное В send ОТ ручки
var knobShown      = -1;     // последнее значение, ВЫСТАВЛЕННОЕ на ручку (knobset)

// Наблюдатели LiveAPI (живут всё время работы устройства)
var devPathObs     = null; // за путём this_device canonical_parent (перемещение девайса)
var returnsObs     = null; // за live_set "return_tracks" (add/del/reorder return-ов)
var rebuilding     = false; // защита от реентерабельности колбэков

var RESYNC_MS      = 500;  // как часто bang() дёшево сверяет цель (анти-race)
var lastResyncAt   = 0;    // timestamp последней дешёвой сверки

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

// Max вызывает loadbang() автоматически при загрузке патча — дублирует init-kick
// из патча на случай, если патч-триггер не дойдёт (надёжность важнее).
function loadbang() {
    init();
}

// Буква посылки по индексу, как маркирует Live: 0→A … 25→Z, 26→AA, 27→AB …
function sendLetter(k) {
    k = parseInt(k, 10);
    if (isNaN(k) || k < 0) return "?";
    var s = "";
    k = k + 1;                       // 1-based для bijective base-26
    while (k > 0) {
        var r = (k - 1) % 26;
        s = String.fromCharCode(65 + r) + s;
        k = Math.floor((k - 1) / 26);
    }
    return s;
}

function now() {
    return (new Date()).getTime();
}

function validSlot(n) {
    n = parseInt(n, 10);
    return (n >= 0 && n < NSLOTS) ? n : -1;
}

// ---- определение хост-трека и его send'ов ---------------------------------

// true, если девайс стоит на обычном треке (live_set tracks N), иначе false
// (return / master / путь ещё не разрешён).
function detectOnTrack() {
    try {
        var parent = new LiveAPI("this_device canonical_parent");
        if (!parent || parent.id == 0) return false;
        var p = parent.unquotedpath;
        if (!p) return false;
        // "live_set tracks N" = обычный трек; "return_tracks"/"master_track" — нет
        return /(^|\s)tracks\s+\d+/.test(p) && !/return_tracks/.test(p);
    } catch (e) {
        return false;
    }
}

// Сколько return-треков в сете (по ним строится меню send'ов).
function liveReturnCount() {
    try {
        var liveSet = new LiveAPI("live_set");
        return liveSet.getcount("return_tracks");
    } catch (e) {
        return -1;
    }
}

// Наполнить меню именами return-треков (outlet 1 → live.menu: clear + append...).
// Перед наполнением просим патч показать меню (мы на треке); если не на треке —
// прячем меню и выходим.
function rebuildMenu() {
    onTrack = detectOnTrack();
    if (!onTrack) {
        outlet(1, "menu", "hide");
        returnCountSnap = -1;
        return;
    }
    outlet(1, "menu", "show");

    var n = liveReturnCount();
    returnCountSnap = n;
    outlet(1, "menu", "clear");
    outlet(1, "menu", "append", "None");       // item 0 = None (инертно, без цели)
    for (var k = 0; k < n; k++) {
        // Лейбл = буква посылки, как в Live (0→A, 1→B, …, 26→AA …),
        // а НЕ имя return-трека. item (k+1) ↔ return-индекс k.
        outlet(1, "menu", "append", sendLetter(k));
    }
    // Кламп выбранного: если return пропал — не уезжаем за предел; None (-1) валиден всегда.
    if (selectedSend >= n) selectedSend = (n > 0) ? n - 1 : NONE;
    outlet(1, "menu", "set", selectedSend + 1); // menuIndex = selectedSend+1 (None=0)
    buildRef();
}

// ---- сборка ОДНОЙ ссылки на выбранный send --------------------------------

function buildRef() {
    sendRef = null;
    if (!onTrack) return;
    if (selectedSend < 0) return;              // None — цели нет, ручка инертна
    var path = "this_device canonical_parent mixer_device sends " + selectedSend;
    try {
        var api = new LiveAPI(path);
        if (api && api.id != 0) {
            sendRef = api;
        }
    } catch (e) {
        sendRef = null;
    }
}

// Дёшево синхронизировать: пересобрать меню/ref при смене хост-статуса
// или числа return'ов. Защищена от реентерабельности.
function resync(force) {
    if (rebuilding) return;
    rebuilding = true;
    try {
        var nowOnTrack = detectOnTrack();
        var count      = liveReturnCount();
        // !sendRef считаем "изменением" ТОЛЬКО когда выбрана реальная цель
        // (selectedSend>=0): в None sendRef всегда null — это норма, не триггер.
        var missingRef = (selectedSend >= 0 && !sendRef);
        var changed = (nowOnTrack !== onTrack) || (count !== returnCountSnap) || missingRef;
        if (force || changed) {
            rebuildMenu();
        }
    } catch (e) {
        // не валим устройство из-за временной гонки LiveAPI
    } finally {
        rebuilding = false;
    }
}

// ---- наблюдатели LiveAPI ---------------------------------------------------

function onLiveChange(args) {
    if (args && args[0] === "id") return; // инициализационное id-уведомление
    resync(false);
}

function installObservers() {
    // Путь устройства: ловит перемещение девайса на другой трек/return.
    try {
        if (devPathObs) { devPathObs.property = ""; devPathObs = null; }
        devPathObs = new LiveAPI(onLiveChange, "this_device canonical_parent");
        devPathObs.property = "name";
    } catch (e) {}

    // Список return-треков: add/del/reorder/переименование меняет меню send'ов.
    try {
        if (returnsObs) { returnsObs.property = ""; returnsObs = null; }
        returnsObs = new LiveAPI(onLiveChange, "live_set");
        returnsObs.property = "return_tracks";
    } catch (e) {}
}

// ---- инициализация на загрузке --------------------------------------------

// "init" из патча (loadbang/live.thisdevice → deferlow → delay → init).
// Надёжный kick, НЕ завязанный на return-detect-цепочку: ставит наблюдатели,
// наполняет меню (None + буквы) и пересобирает ref.
// ВАЖНО: НЕ форсим выбор здесь. Дефолт selectedSend=None (свежая вставка). Если
// umenu-параметр восстановил сохранённый выбор (select() уже отработал на load),
// selectedSend держит его — init его НЕ перетирает (персист сохранён).
// После этого qmetro дёргает bang() для поллинга.
function init() {
    installObservers();
    if (!selParamObs) installSelParamObserver();
    rebuildMenu();                              // clear + append None+буквы + show/hide + set + buildRef
}

// ---- сообщения из патча: выбор send'а -------------------------------------

// "select <menuIndex>" из патча (umenu выбор) — menuIndex 0 = None, i≥1 = send (i−1).
function select(menuIndex) {
    if (menuIndex === undefined || menuIndex === null) return;
    var mi = parseInt(menuIndex, 10);
    if (isNaN(mi) || mi < 0) return;
    selectedSend = mi - 1;        // 0(None)→-1, 1→A(0), 2→B(1)…
    buildRef();                   // None → sendRef=null (инертно)
    // Выбор сменился — форсируем ресинк ручки под значение новой цели (или 0 для None):
    // сбрасываем гард/последнее-показанное, чтобы СЛЕДУЮЩИЙ bang сразу выставил ручку.
    lastWritten = -1;
    knobShown   = -1;
}

// "restoreidx <k>" из патча на загрузке — восстановить выбор из параметра.
function restoreidx(k) {
    select(k);
}

// ---- запись в send от ГЛАВНОЙ ручки ---------------------------------------
// "userval <v>" из патча: ручку подвигали (мышь / замапленный HW-энкодер или
// фейдер / автоматизация параметра ручки). Пишем 1:1 в выбранный send.
// Шкала: live.dial настроен 0..1 линейно == диапазон send value (0..1),
// поэтому масштаб не нужен — только кламп.
function clamp01(x) {
    if (x < 0) return 0.0;
    if (x > 1) return 1.0;
    return x;
}

function userval(v) {
    if (v === undefined || v === null) return;
    var val = parseFloat(v);
    if (isNaN(val)) return;
    val = clamp01(val);
    if (!sendRef || sendRef.id == 0) return;   // не на треке / ещё не готово
    lastWritten = val;                         // гард: следующий read это значение не толкнёт назад
    knobShown   = val;                         // ручка уже стоит на этом значении (юзер её сам туда привёл)
    try {
        sendRef.set("value", val);
    } catch (e) {}
}

// ---- маппер: арм, захват цели, persist, unmap (по слотам) ------------------
// (перенесено 1:1 из return-версии — не зависит от источника follow-значения)

function installSelParamObserver() {
    try {
        if (selParamObs) { selParamObs.property = ""; selParamObs = null; }
        selParamObs = new LiveAPI(onSelParamChange, "live_set view");
        selParamObs.property = "selected_parameter";
    } catch (e) {}
}

function onSelParamChange(args) {
    if (armedSlot < 0) return;
    if (args && args[0] === "id" && (args[1] === 0 || args[1] === "0")) return;
    try {
        var sel = new LiveAPI("live_set view selected_parameter");
        if (!sel || sel.id == 0) return;
        var path = sel.unquotedpath;
        if (!path) return;
        captureTarget(armedSlot, path);
    } catch (e) {}
}

function captureTarget(slot, path) {
    slot = validSlot(slot);
    if (slot < 0) return;
    slotPath[slot]  = path;
    armedSlot       = -1;
    persistPath(slot, path);
    outlet(1, slot, "arm", 0);
    emitTargetName(slot, path);
    slotRetry[slot] = 0;
    resolveAndConnect(slot);
}

function resolveAndConnect(slot) {
    slot = validSlot(slot);
    if (slot < 0 || !slotPath[slot]) return;
    var parts = slotPath[slot].split(" ");
    var msg = [slot, "path"];
    for (var i = 0; i < parts.length; i++) msg.push(parts[i]);
    outlet(1, msg);
}

function restorepath() {
    if (arguments.length === 0) return;
    var slot = validSlot(arguments[0]);
    if (slot < 0) return;
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
            resolveAndConnect(slot);
            return;
        }
    } catch (e) {}
    if (slotRetry[slot] < MAP_RETRY_MAX) {
        slotRetry[slot]++;
        var task = new Task(retryResolve, this, slot);
        task.schedule(MAP_RETRY_MS);
    }
}

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

function shortPath(path) {
    var p = path.replace(/^live_set\s*/, "");
    if (p.length > 24) p = p.substring(p.length - 24);
    return p;
}

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
    if (msg.length === 2) msg.push("none");
    outlet(1, msg);
}

function arm(slot, a) {
    slot = validSlot(slot);
    if (slot < 0) return;
    var v = (parseInt(a, 10) === 1) ? 1 : 0;
    if (v) {
        if (armedSlot >= 0 && armedSlot !== slot) {
            outlet(1, armedSlot, "arm", 0);
        }
        armedSlot = slot;
        if (!selParamObs) installSelParamObserver();
    } else {
        if (armedSlot === slot) armedSlot = -1;
    }
    outlet(1, slot, "arm", v);
}

function unmap(slot) {
    slot = validSlot(slot);
    if (slot < 0) return;
    if (armedSlot === slot) armedSlot = -1;
    slotPath[slot]  = "";
    slotRetry[slot] = 0;
    persistPath(slot, "");
    outlet(1, slot, "release");
    outlet(1, slot, "arm", 0);
    outlet(1, slot, "name", "—");
}

// ---- поллинг значения -----------------------------------------------------

// Банг от qmetro — опрос выбранного send + дешёвая периодическая сверка цели.
function bang() {
    var t = now();
    // Ресинк: в None ОТСУТСТВИЕ sendRef — НОРМА (не повод дёргать rebuild каждый
    // тик). Поэтому форс-ресинк по !sendRef только когда выбрана РЕАЛЬНАЯ цель
    // (selectedSend>=0). Периодический дешёвый ресинк (RESYNC_MS) идёт всегда —
    // ловит add/del return-треков и в None тоже (меню перестроится).
    var needResync = ((selectedSend >= 0 && !sendRef) || (t - lastResyncAt) >= RESYNC_MS);
    if (needResync) {
        lastResyncAt = t;
        if (!devPathObs && !returnsObs) {
            installObservers();
        }
        if (!selParamObs) {
            installSelParamObserver();
        }
        resync(false);
    }

    // None — ручка ИНЕРТНА: не читаем send, ручку сами НЕ двигаем, mapper-выход
    // выдаём 0 (замапленные через mapper параметры в None не дёргаются).
    if (selectedSend < 0) {
        outlet(0, "max", 0.0);
        return;
    }

    // Не на треке или ещё не готово — выдаём 0 (N/A), метку "max" сохраняем.
    if (!sendRef || sendRef.id == 0) {
        outlet(0, "max", 0.0);
        return;
    }

    var result = 0.0;
    var v = sendRef.get("value");
    if (v && v.length > 0) {
        var val = parseFloat(v[0]);
        if (!isNaN(val)) result = val;
    }
    if (result > 1.0) result = 1.0;
    if (result < 0.0) result = 0.0;

    // Метка "max" сохранена: downstream (route max, ---max_send, percent) общий с return-версией.
    outlet(0, "max", result);

    // --- двусторонняя ручка: подтянуть ГЛАВНУЮ ручку под текущий send ----------
    // Гард от петли: если только что писали в send ОТ ручки и значение почти
    // совпало (read == lastWritten в пределах EPS) — это наше же эхо, ручку НЕ
    // трогаем. Иначе обновляем ручку, только когда она реально расходится с
    // send'ом (внешняя правка в микшере / автоматизация) — без джиттера/борьбы.
    if (lastWritten >= 0 && Math.abs(result - lastWritten) <= KNOB_EPS) {
        lastWritten = -1;             // эхо поглощено, снимаем гард
        knobShown   = result;         // ручка и send согласованы
    } else if (Math.abs(result - knobShown) > KNOB_EPS) {
        knobShown   = result;
        outlet(2, "knobset", result); // "set <v>" на live.dial — тихо, без output (петли нет)
    }
}
