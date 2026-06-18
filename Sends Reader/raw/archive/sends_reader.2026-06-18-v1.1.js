// sends_reader.js
// Sends Reader — обратная семантика к Sends Follower.
//
// Sends Follower сидит на RETURN-треке и собирает «сколько со всего сета шлют
// на этот return» (агрегат Peak/Total). Sends Reader сидит на ОБЫЧНОМ
// audio/MIDI/group-треке и читает ОДИН send-кноб СВОЕГО трека (значение посыла
// этого трека на выбранный return), отдавая его как сигнал-модулятор в маппер.
//
// Источник значения:
//   this_device canonical_parent  → резолв СВОЕГО трека
//   → mixer_device sends <M> value (0..1), где M — индекс выбранного return-а.
//   Значение читается по бангу (тот же poller, что в SF) и публикуется как
//   outlet(0,"max",value) → route max → send ---max_send (та же шина, что
//   downstream-маппер/диал/процент уже слушают). Слово-метка "max" сохранена
//   ради совместимости с патчем (route max).
//
// Авто-детект типа хоста:
//   обычный трек / group-трек  → рабочий режим Send Reader (доступны посылы);
//   return-трек / мастер       → недоступно (у них нет своих посылов на returns):
//                                outlet(2,"status", ...) с пояснением, диал = 0.
//
// Выбор Send:
//   umenu на лице наполняется БУКВАМИ (A,B,C…) — по одной на каждый return
//   (наблюдатель за live_set "return_tracks"), плюс последний пункт «All».
//   Буква = порядковый номер return-а, независимо от его имени.
//   Выбор хранится НЕ по индексу, а по ИДЕНТИЧНОСТИ return-трека (его LiveAPI
//   id + имя) — при add/remove/reorder return-ов индекс пере-резолвится по
//   сохранённому id (self-healing-паттерн). «All» хранится отдельным сентинелом.
//   Выбор переживает reload через pattr.
//
// Режим агрегации (Sum / Max), переключатель на лице:
//   одиночная буква выбрана  → читается ровно этот один send (Sum/Max игнор);
//   «All» выбран             → агрегируются ВСЕ посылы своего трека:
//                              Sum = сумма всех (clamp до 1.0), Max = максимум.
//
// Анти-feedback:
//   если пользователь смапит ЧИТАЕМЫЙ нами send на параметр СВОЕГО же трека
//   (на сам этот send или другой send того же трека), получится петля
//   (читаем значение → модулируем его → меняем значение → читаем …). Маппинг
//   слотов идёт через стоковый live.map в патче (JS его не видит), поэтому
//   здесь мы лишь ОТСЛЕЖИВАЕМ выбранный параметр и, если это send нашего трека,
//   шлём предупреждение outlet(2,"warn", ...). Жёстко запретить клик нельзя
//   (live.map нативный), но пользователь будет предупреждён.
//
// Сообщения из патча (inlet 0):
//   bang                — прочитать выбранный send/агрегат и выдать значение
//   selectsend <i>      — пользователь выбрал пункт меню i (0-based; i==N → «All»)
//   aggmode <0|1>       — режим агрегации для «All»: 0=Sum, 1=Max
//   refreshmenu         — перестроить пункты меню из текущих return-треков
//   restoresel <id|all|none> <name...> — восстановить выбор из pattr на загрузке
//   init                — инициализация (ставит наблюдателей)

inlets  = 1;
outlets = 3;   // 0 = значение ("max" <v>); 1 = persist (store id/name);
               // 2 = меню/статус (menu …, status …, warn …, select …)

var TYPE_NORMAL = 0;  // обычный / group-трек — рабочий режим
var TYPE_RETURN = 1;  // return-трек — недоступно
var TYPE_MASTER = 2;  // master — недоступно
var TYPE_NONE   = -1; // ещё не разрешено

// Сентинел выбора «All» (агрегировать ВСЕ посылы своего трека).
// Хранится в selReturnId вместо реального id return-а.
var SEL_ALL     = -2;

// Режим агрегации (актуален ТОЛЬКО когда выбран «All»):
var AGG_SUM     = 0;  // сумма всех send-кнобов трека (clamp до 1.0)
var AGG_MAX     = 1;  // максимум всех send-кнобов трека

var hostType    = TYPE_NONE;  // тип трека-хоста
var trackPath   = "";         // канонический путь СВОЕГО трека (live_set tracks N)

var selReturnId = -1;         // LiveAPI id выбранного return-трека (источник истины);
                              //   SEL_ALL = выбран пункт «All»
var selReturnNm = "";         // имя выбранного return (для восстановления); "" при All
var sendIndex   = -1;         // текущий индекс send (резолвится из selReturnId); -1 при All
var sendRef     = null;       // LiveAPI на mixer_device sends <sendIndex>
var aggMode     = AGG_SUM;    // режим агрегации для «All»

var returnIds   = [];         // id всех return-треков (в порядке списка)
var returnNms   = [];         // имена всех return-треков (в порядке списка)

// Наблюдатели LiveAPI
var devPathObs  = null;       // путь устройства (перемещение девайса между треками)
var returnsObs  = null;       // live_set return_tracks (add/del/reorder return-ов)
var selParamObs = null;       // live_set view selected_parameter (анти-feedback)
var rebuilding  = false;      // защита от реентерабельности

var RESYNC_MS   = 500;
var lastResyncAt = 0;

function now() { return (new Date()).getTime(); }

// ---- детект хоста ----------------------------------------------------------

// Определяет тип трека-хоста и его путь. Возвращает один из TYPE_*.
function detectHost() {
    try {
        var parent = new LiveAPI("this_device canonical_parent");
        if (!parent || parent.id == 0) { hostType = TYPE_NONE; trackPath = ""; return TYPE_NONE; }
        var p = parent.unquotedpath;
        if (!p)                          { hostType = TYPE_NONE; trackPath = ""; return TYPE_NONE; }

        if (/return_tracks\s+\d+/.test(p)) { hostType = TYPE_RETURN; trackPath = p; return TYPE_RETURN; }
        if (/master_track/.test(p))        { hostType = TYPE_MASTER; trackPath = p; return TYPE_MASTER; }
        if (/(^|\s)tracks\s+\d+/.test(p))  { hostType = TYPE_NORMAL; trackPath = p; return TYPE_NORMAL; }

        hostType = TYPE_NONE; trackPath = ""; return TYPE_NONE;
    } catch (e) {
        hostType = TYPE_NONE; trackPath = ""; return TYPE_NONE;
    }
}

// ---- список return-треков (для меню) --------------------------------------

// Буква пункта меню по порядковому индексу return-а:
//   0→A, 1→B, … 25→Z, 26→AA, 27→AB, … (на случай >26 return-ов).
function idxToLetter(i) {
    var s = "";
    i = i | 0;
    do {
        s = String.fromCharCode(65 + (i % 26)) + s;
        i = Math.floor(i / 26) - 1;
    } while (i >= 0);
    return s;
}

// Перечитать имена и id всех return-треков, отправить пункты меню в патч.
// В UI выводятся БУКВЫ (A,B,C…) — по одной на return, плюс последний пункт «All».
// Внутренняя привязка выбора по-прежнему по id/имени return-а (self-healing).
function rebuildReturnList() {
    returnIds = [];
    returnNms = [];
    try {
        var liveSet = new LiveAPI("live_set");
        var n = liveSet.getcount("return_tracks");
        for (var i = 0; i < n; i++) {
            var r = new LiveAPI("live_set return_tracks " + i);
            if (r && r.id != 0) {
                returnIds.push(parseInt(r.id, 10));
                var nm = r.get("name");
                returnNms.push((nm && nm.length > 0) ? String(nm[0]) : ("Return " + i));
            }
        }
    } catch (e) {}

    // Перестроить меню: clear + по букве на каждый return + пункт «All».
    outlet(2, "menu", "clear");
    for (var k = 0; k < returnIds.length; k++) {
        outlet(2, "menu", "append", idxToLetter(k));
    }
    outlet(2, "menu", "append", "All");   // последний пункт — агрегат всех посылов

    // Пере-резолвить выбранный send по сохранённому id (self-healing).
    resolveSelection();
}

// Индекс пункта «All» в меню = число букв (после всех return-ов).
function allMenuIndex() { return returnIds.length; }

// Найти текущий индекс выбранного return-трека по сохранённому id; обновить меню.
function resolveSelection() {
    // Выбран «All» — подсветить последний пункт, send-индекса нет (читаем все).
    if (selReturnId === SEL_ALL) {
        sendIndex = -1; sendRef = null; selReturnNm = "";
        outlet(2, "select", allMenuIndex());
        return;
    }
    if (selReturnId < 0) {
        // ничего не выбрано — по умолчанию первый return, если он есть
        if (returnIds.length > 0) {
            selReturnId = returnIds[0];
            selReturnNm = returnNms[0];
        } else {
            // нет return-ов вовсе — fallback на «All» (пункт всегда есть)
            selReturnId = SEL_ALL; selReturnNm = "";
            sendIndex = -1; sendRef = null;
            outlet(2, "select", allMenuIndex());
            return;
        }
    }
    // ищем индекс по id
    var idx = -1;
    for (var i = 0; i < returnIds.length; i++) {
        if (returnIds[i] === selReturnId) { idx = i; break; }
    }
    if (idx < 0) {
        // выбранный return пропал (удалён) — пробуем по имени
        for (var j = 0; j < returnNms.length; j++) {
            if (returnNms[j] === selReturnNm) { idx = j; selReturnId = returnIds[j]; break; }
        }
    }
    if (idx < 0) {
        // совсем пропал — откатываемся к первому, а если return-ов нет — к «All»
        if (returnIds.length > 0) {
            idx = 0; selReturnId = returnIds[0]; selReturnNm = returnNms[0];
        } else {
            selReturnId = SEL_ALL; selReturnNm = "";
            sendIndex = -1; sendRef = null; outlet(2, "select", allMenuIndex()); return;
        }
    }
    selReturnNm = returnNms[idx];
    sendIndex = idx;
    outlet(2, "select", idx);          // подсветить нужный пункт меню (без bang в обратку)
    bindSendRef();
}

// Привязать sendRef к mixer_device sends <sendIndex> СВОЕГО трека.
function bindSendRef() {
    sendRef = null;
    if (hostType !== TYPE_NORMAL || sendIndex < 0 || !trackPath) return;
    try {
        var s = new LiveAPI(trackPath + " mixer_device sends " + sendIndex);
        if (s && s.id != 0) sendRef = s;
    } catch (e) { sendRef = null; }
}

// ---- наблюдатели -----------------------------------------------------------

function installObservers() {
    try {
        if (devPathObs) { devPathObs.property = ""; devPathObs = null; }
        devPathObs = new LiveAPI(onHostChange, "this_device canonical_parent");
        devPathObs.property = "name";
    } catch (e) {}
    try {
        if (returnsObs) { returnsObs.property = ""; returnsObs = null; }
        returnsObs = new LiveAPI(onReturnsChange, "live_set");
        returnsObs.property = "return_tracks";
    } catch (e) {}
    try {
        if (selParamObs) { selParamObs.property = ""; selParamObs = null; }
        selParamObs = new LiveAPI(onSelParamChange, "live_set view");
        selParamObs.property = "selected_parameter";
    } catch (e) {}
}

// Девайс переместили на другой трек → пере-детект хоста + статус.
function onHostChange(args) {
    if (args && args[0] === "id") return;
    resync(true);
}

// Список return-ов изменился (add/del/reorder) → перестроить меню + пере-резолв.
function onReturnsChange(args) {
    if (args && args[0] === "id") return;
    rebuildReturnList();
}

// Анти-feedback: следим за выбранным параметром. Если пользователь выбрал send
// СВОЕГО трека (любой send этого трека), предупреждаем — маппинг на него создаст
// петлю обратной связи.
function onSelParamChange(args) {
    if (args && args[0] === "id" && (args[1] === 0 || args[1] === "0")) return;
    if (hostType !== TYPE_NORMAL || !trackPath) return;
    try {
        var sel = new LiveAPI("live_set view selected_parameter");
        if (!sel || sel.id == 0) return;
        var pp = sel.unquotedpath || "";
        // путь параметра send выглядит как "<trackPath> mixer_device sends <k>"
        if (pp.indexOf(trackPath + " mixer_device sends ") === 0) {
            outlet(2, "warn", 1);    // включить предупреждение о петле
        } else {
            outlet(2, "warn", 0);    // обычный параметр — погасить предупреждение
        }
    } catch (e) {}
}

// ---- синхронизация ---------------------------------------------------------

// Пере-детект хоста + обновление статуса. force=true перестраивает всё.
function resync(force) {
    if (rebuilding) return;
    rebuilding = true;
    try {
        var prevType = hostType;
        var prevPath = trackPath;
        detectHost();
        emitStatus();
        if (force || hostType !== prevType || trackPath !== prevPath) {
            rebuildReturnList();   // включает resolveSelection + bindSendRef
        } else if (!sendRef) {
            bindSendRef();
        }
    } catch (e) {
    } finally {
        rebuilding = false;
    }
}

// Отправить статус хоста в патч (outlet 2).
function emitStatus() {
    if (hostType === TYPE_NORMAL) {
        outlet(2, "status", "ok");
    } else if (hostType === TYPE_RETURN) {
        outlet(2, "status", "na", "On a return track — no sends to read");
    } else if (hostType === TYPE_MASTER) {
        outlet(2, "status", "na", "On the master track — no sends to read");
    } else {
        outlet(2, "status", "wait", "Resolving track…");
    }
}

// ---- сообщения из патча ----------------------------------------------------

function init() {
    installObservers();
    resync(true);
}

// "selectsend <i>" — пользователь выбрал пункт меню i.
//   i в [0..returnIds.length-1] → одна буква (один конкретный send);
//   i == returnIds.length       → пункт «All» (агрегировать все посылы трека).
function selectsend(i) {
    i = parseInt(i, 10);
    if (isNaN(i) || i < 0) return;
    if (i === allMenuIndex()) {          // выбран «All»
        selReturnId = SEL_ALL;
        selReturnNm = "";
        sendIndex   = -1;
        sendRef     = null;
        persistSelection();
        return;
    }
    if (i >= returnIds.length) return;   // вне диапазона
    selReturnId = returnIds[i];
    selReturnNm = returnNms[i];
    sendIndex   = i;
    bindSendRef();
    persistSelection();
}

// "aggmode <m>" — режим агрегации для «All»: 0 = Sum, 1 = Max.
// Игнорируется в логике, когда выбран одиночный send (читается ровно он).
function aggmode(m) {
    m = parseInt(m, 10);
    aggMode = (m === AGG_MAX) ? AGG_MAX : AGG_SUM;
}

// "refreshmenu" — принудительно перестроить меню.
function refreshmenu() {
    rebuildReturnList();
}

// Сохранить выбор в pattr: id + имя (имя как fallback при смене id),
// либо токен "all" для пункта «All».
function persistSelection() {
    if (selReturnId === SEL_ALL) { outlet(1, "store", "all"); return; }
    if (selReturnId < 0)         { outlet(1, "store", "none"); return; }
    var msg = ["store", selReturnId];
    var parts = String(selReturnNm).split(" ");
    for (var i = 0; i < parts.length; i++) if (parts[i] !== "") msg.push(parts[i]);
    outlet(1, msg);
}

// "restoresel <id|all|none> <name...>" — восстановить выбор из pattr на загрузке.
function restoresel() {
    if (arguments.length === 0) return;
    var head = String(arguments[0]);
    if (head === "all")  { selReturnId = SEL_ALL; selReturnNm = ""; return; }
    if (head === "none") { selReturnId = -1; selReturnNm = ""; return; }
    selReturnId = parseInt(arguments[0], 10);
    if (isNaN(selReturnId)) selReturnId = -1;
    var toks = [];
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] !== undefined && arguments[i] !== "") toks.push(String(arguments[i]));
    }
    selReturnNm = toks.join(" ");
    // меню/референс перерезолвятся на ближайшем rebuildReturnList/resync
}

// Банг от poller — прочитать выбранный send и выдать значение.
function bang() {
    var t = now();
    if (hostType === TYPE_NONE || (t - lastResyncAt) >= RESYNC_MS) {
        lastResyncAt = t;
        if (!devPathObs && !returnsObs) installObservers();
        resync(false);
    }

    if (hostType !== TYPE_NORMAL) { outlet(0, "max", 0.0); return; }

    var result = 0.0;

    if (selReturnId === SEL_ALL) {
        // «All» — агрегируем ВСЕ посылы своего трека (Sum или Max).
        result = readAllSends();
    } else {
        // одиночный send — читаем ровно его (Sum/Max игнорируется).
        if (!sendRef || sendRef.id == 0) { bindSendRef(); if (!sendRef) { outlet(0, "max", 0.0); return; } }
        try {
            var v = sendRef.get("value");
            if (v && v.length > 0) result = parseFloat(v[0]);
        } catch (e) {
            sendRef = null;   // ссылка протухла — пересоберём на следующем банге
        }
    }

    if (isNaN(result)) result = 0.0;
    if (result < 0.0) result = 0.0;
    if (result > 1.0) result = 1.0;

    outlet(0, "max", result);   // метка "max" — совместимость с route max в патче
}

// Прочитать ВСЕ send-кнобы своего трека и агрегировать по aggMode.
//   Sum = сумма всех (clamp до 1.0 делается в вызывающем bang);
//   Max = максимум всех.
function readAllSends() {
    if (hostType !== TYPE_NORMAL || !trackPath) return 0.0;
    var acc = 0.0;
    try {
        var mixer = new LiveAPI(trackPath + " mixer_device");
        if (!mixer || mixer.id == 0) return 0.0;
        var n = mixer.getcount("sends");
        for (var i = 0; i < n; i++) {
            var s = new LiveAPI(trackPath + " mixer_device sends " + i);
            if (!s || s.id == 0) continue;
            var v = s.get("value");
            var f = (v && v.length > 0) ? parseFloat(v[0]) : 0.0;
            if (isNaN(f)) f = 0.0;
            if (aggMode === AGG_MAX) { if (f > acc) acc = f; }
            else                     { acc += f; }
        }
    } catch (e) { return acc; }
    return acc;
}
