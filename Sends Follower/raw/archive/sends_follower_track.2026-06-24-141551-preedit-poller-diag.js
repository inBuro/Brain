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
//   select <k>          — выбрать send-слот (return-индекс), за которым следим
//   restoreidx <k>      — восстановить выбор из параметра на загрузке
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
outlets = 2;   // 0 = значение слежения ("max" <v>); 1 = управление меню + map-слотами

var NSLOTS         = 8;    // число слотов маппера (как у return-версии)

var sendRef        = null; // ОДНА LiveAPI-ссылка на выбранный send-параметр
var selectedSend   = 0;    // индекс выбранного send'а (= индекс return-трека)
var onTrack        = false;// стоит ли девайс на обычном треке (иначе N/A)
var returnCountSnap = -1;  // сколько return'ов было на момент последнего наполнения меню

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
    for (var k = 0; k < n; k++) {
        // Лейбл = буква посылки, как в Live (0→A, 1→B, …, 26→AA …),
        // а НЕ имя return-трека. Выбор по-прежнему по индексу.
        outlet(1, "menu", "append", sendLetter(k));
    }
    // переустановить ref на выбранный send (индекс мог уехать за пределы)
    if (selectedSend >= n) selectedSend = (n > 0) ? n - 1 : 0;
    outlet(1, "menu", "set", selectedSend);   // вернуть выбор в меню
    buildRef();
}

// ---- сборка ОДНОЙ ссылки на выбранный send --------------------------------

function buildRef() {
    sendRef = null;
    if (!onTrack) return;
    try {
        var api = new LiveAPI(
            "this_device canonical_parent mixer_device sends " + selectedSend
        );
        if (api && api.id != 0) {
            sendRef = api;
            post("sends_follower_track: tracking own send " + selectedSend + "\n");
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
        var changed = (nowOnTrack !== onTrack) || (count !== returnCountSnap) || !sendRef;
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

// ---- сообщения из патча: выбор send'а -------------------------------------

// "select <k>" из патча (live.menu выбор) — следить за return-индексом k.
function select(k) {
    if (k === undefined || k === null) return;
    var idx = parseInt(k, 10);
    if (isNaN(idx) || idx < 0) return;
    selectedSend = idx;
    buildRef();
}

// "restoreidx <k>" из патча на загрузке — восстановить выбор из параметра.
function restoreidx(k) {
    select(k);
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
    if (!sendRef || (t - lastResyncAt) >= RESYNC_MS) {
        lastResyncAt = t;
        if (!devPathObs && !returnsObs) {
            installObservers();
        }
        if (!selParamObs) {
            installSelParamObserver();
        }
        resync(false);
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
}
