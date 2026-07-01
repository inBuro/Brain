// sends_follower_track.js
// Track-вариант Sends Follower. Живёт на ОБЫЧНОМ треке или RETURN-треке и
// следит за ОДНИМ собственным send-параметром этого трека (его посылкой в
// выбранный return), а не за суммой по всем трекам сета.
// На return-треке N доступны только посылки в return-треки N+1, N+2, …
// (Live-ограничение: return не может посылать в себя или предыдущие).
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
// Если девайс стоит на master-треке или путь не разрешён — целиться не на что:
//   выдаём value 0 (N/A) и просим патч спрятать меню (outlet 1 "menu hide").
//
// 8-слотовый маппер (собственный сигнал → произвольные параметры Live) перенесён
// 1:1 из return-версии: arm/captureTarget/persist/unmap/restorepath + observer за
// "live_set view selected_parameter". Не зависит от источника follow-значения.

inlets  = 1;
outlets = 4;   // 0 = выход девайса ("max" <v>) → mm_sig → 8-слот мэппер;
               // 1 = меню + map-слоты + "barvis 0/1" (видимость бара «for MIDI map»);
               // 2 = "knobset <0..1>"     — обновить БОЛЬШОЙ круг (plain dial, UI-зеркало);
               // 3 = "mididialset <0..1>" — обновить бар live.slider (MIDI-параметр).
               //
               // ДВА РЕЖИМА (выбор «Source»):
               //   • A/B/C/D: выход = уровень выбранного трек-send; большой круг ↔ send
               //     (двусторонне+гард). Бар «for MIDI map» СПРЯТАН.
               //   • None: выход = РУЧНОЙ источник manualVal (бар live.slider, 0..1) →
               //     мэппер; сенд НЕ трогается. Большой круг ↔ бар (двусторонне+гард).
               //     Бар + подпись ПОКАЗАНЫ.
               // Контролы: БОЛЬШОЙ круг (plain dial obj-3, parameter_enable:0) = визуал+мышь,
               // по MIDI не мапится; бар live.slider (midi_dial, parameter_enable:1) =
               // ЕДИНСТВЕННЫЙ Live-параметр → его пользователь мапит на хардвер/MIDI.

var NSLOTS         = 8;    // число слотов маппера (как у return-версии)

var sendRef        = null; // ОДНА LiveAPI-ссылка на выбранный send-параметр
// selectedSend = индекс return-трека (0=A,1=B,…). СПЕЦ-ЗНАЧЕНИЕ -1 = "Manual":
// сенд не трогается, источник = ручной (бар live.slider → выход).
// Меню: item 0 = "Manual" (лейбл; маркер -1), item i (i≥1) = return-индекс (i−1). Т.е.
//   menuIndex = selectedSend + 1  и  selectedSend = menuIndex − 1.
var NONE           = -1;   // числовой маркер ручного режима (имя var историческое, не лейбл)
var selectedSend   = 0;    // дефолт при свежей вставке = Send A (menuIndex 1); параметр-initial тоже =1
var onTrack        = false;// стоит ли девайс на подходящем треке (обычный ИЛИ return)
var returnCountSnap = -1;  // сколько send-слотов показано в меню на момент наполнения
// _hostIsReturn: true если девайс стоит на return-треке, false если на обычном.
// Влияет на liveReturnCount (сколько send'ов доступно) и sendLetter (смещение лейблов).
var _hostIsReturn  = false;
// _hostReturnIdx: индекс return-трека-хоста в live_set.return_tracks (0-based), -1 если не return.
// Return с индексом N может посылать только в return-треки N+1, N+2, … (Live-ограничение).
// Кол-во доступных send'ов = total_returns - N - 1.
var _hostReturnIdx = -1;

// ---- два контрола одного send'а (гибрид: большой круг + live.dial) ---------
// Оба контрола ОТРАЖАЮТ уровень выбранного send'а (чтение из bang) и ПИШУТ в
// него (userval <src> <v> от движения: мышь по кругу / MIDI-энкодер по live.dial
// / автоматизация параметра live.dial). Гард read↔write (детали ниже у bang).
// ГАРД read↔write для ГИБРИДА (два контрола + send):
//   • lastWritten — значение, ТОЛЬКО ЧТО записанное в send от любого контрола;
//     следующий read с тем же значением (в пределах EPS) = наше эхо → не толкаем.
//   • bigShown / midiShown — последнее значение, ВЫСТАВЛЕННОЕ на каждый контрол.
//     Контрол обновляем из send ТОЛЬКО когда его текущее показанное расходится с
//     send'ом на EPS. Это и рвёт пинг-понг между двумя ручками: контрол, который
//     сам сдвинул send, уже имеет bigShown/midiShown == send → его не дёргаем;
//     ВТОРОЙ контрол расходится → подтягивается к send (один проход, без борьбы).
var KNOB_EPS       = 0.0009; // порог различия (send value 0..1; ~1/1024)
var lastWritten    = -1;     // последнее значение, записанное В send ОТ контрола
var bigShown       = -1;     // последнее значение на БОЛЬШОМ круге (knobset)
var midiShown      = -1;     // последнее значение на баре live.slider (mididialset)

// ---- РУЧНОЙ источник (режим None) -----------------------------------------
// В None бар live.slider = РУЧНОЙ источник модуляции 0..1: его значение идёт в
// выход девайса (outlet(0,"max",manualVal) → mm_sig → мэппер). Сенд НЕ трогается.
// Большой круг ↔ бар синхронны (гард). manualVal — хранимое ручное значение.
//
// ПЕРСИСТ manualVal: сам `manualVal` — обычная JS-переменная (на загрузке = 0).
// НО бар `midi_dial` (live.slider, parameter_enable:1) = НАСТОЯЩИЙ Live-параметр →
// Live сохраняет/восстанавливает его значение в .als ПЕР-ИНСТАНС. На загрузке
// восстановленное значение слайдера приходит в JS через `userval("midi", v)`
// (см. проводку midi_dial[1]→prepend userval midi). Мы кэшируем КАЖДОЕ значение
// слайдера в `lastSliderVal` (независимо от режима), и при входе в None
// (`select()` / restore) засеваем `manualVal = lastSliderVal`. Так ручное значение
// переживает save/reload без отдельного hidden-параметра: каналом персиста служит
// сам видимый бар. (Порядок на загрузке: слайдер-restore эмитит РАНЬШЕ menu-restore,
// поэтому lastSliderVal уже наполнен к моменту select(None) → manualVal корректен.)
var manualVal      = 0.0;
var lastSliderVal  = -1;     // последнее значение бара live.slider (канал персиста manualVal); -1=ещё не видели
var barVisShown    = -1;     // последнее посланное состояние видимости бара (0/1; -1=не слали)

// Наблюдатели LiveAPI (живут всё время работы устройства)
var devPathObs     = null; // за путём this_device canonical_parent (перемещение девайса)
var returnsObs     = null; // за live_set "return_tracks" (add/del/reorder return-ов)
var rebuilding     = false; // защита от реентерабельности колбэков

var RESYNC_MS      = 500;  // как часто bang() дёшево сверяет цель (анти-race)
var lastResyncAt   = 0;    // timestamp последней дешёвой сверки

var RESULT_EPS     = 5e-4; // порог различия follow-результата (ниже — не шлём downstream)
var lastResult     = -1;   // последнее отправленное значение; -1 = «ещё не слали»

// ---- гард автоматизации: защита от «set» в бар-параметр на загрузке ----------
// ПРОБЛЕМА: syncControls() шлёт `set <v>` в midi_dial (live.slider, parameter_enable:1)
// через outlet 3 → mididialset → prepend set → midi_dial[0].
// В Live 12 даже `set`-сообщение (display-only, без output из объекта) в live.*-параметр
// с активной автоматизацией может поднять флаг automation-override → огибающая
// становится «overridden» (серая/пунктир) до нажатия «Re-Enable Automation».
// РЕШЕНИЕ: RESTORE_GATE_MS после init() НЕ шлём mididialset в midi_dial.
// В это окно Live сам позиционирует параметр по восстановленному значению.
// После окна — нормальная работа syncControls; параметр под автоматизацией — Live
// двигает бар сам, огибающая не нарушается, JS только ЧИТАЕТ через userval.
var RESTORE_GATE_MS = 800; // мс: перекрывает delay 400 (menu-restore) + 2-3 тика qmetro 33
var _restoreUntil  = 0;    // timestamp конца restore-окна; 0 = вне окна (нормальная работа)

// ---- CC-learn (кнопка «CC» в углу) ----------------------------------------
// Одиночный Learn CC для ручного источника (manualVal = бар live.slider).
// Вместо Live-native MIDI map: нажать кнопку → покрутить энкодер/фейдер →
// CC номер захвачен → все последующие CC с этим номером управляют manualVal.
// ПЕРСИСТ: learned CC# в hidden Live-параметре learned_cc (Stored Only).
// ARM-DEBOUNCE: первые 300мс после клика игнорируем входящий CC (защита от
// случайного захвата CC от самой кнопки или предыдущего движения).
var _learnedCC   = -1;     // выученный CC номер (0..127); -1 = не выучен
var _ccArmed     = false;  // true = ждём следующего CC для захвата
var _ccArmAt     = 0;      // timestamp когда взвели (для debounce 300мс)

// "learncc <0|1>" из патча (toggle в патче → prepend learncc → JS inlet)
// При arm (v=1): взводим _ccArmed и эмитим cc_armed 1 (для надёжности — blink уже
//   запускается прямым шнуром toggle→bpatcher in1, но JS тоже сигнализирует).
// При disarm (v=0): сбрасываем _ccArmed; cc_armed 0 при capture эмитит ccin().
function learncc(v) {
    var armed = (parseInt(v, 10) === 1);
    if (armed === _ccArmed) return;       // нет смены состояния → НЕ переэмитим cc_armed
                                          // (рвёт петлю: cc_armed→obj-64→obj-68 toggle→learncc→…)
    _ccArmed = armed;
    _ccArmAt = armed ? now() : 0;
    outlet(1, "cc_armed", armed ? 1 : 0); // → obj-64 route cc_armed → obj-17 in1 (blink on/off)
}

// "learnedcc <k>" — восстановить выученный CC# из hidden Live-параметра на загрузке
function learnedcc(k) {
    var cc = parseInt(k, 10);
    _learnedCC = (isNaN(cc) || cc < 0 || cc > 127) ? -1 : cc;
}

// "ccin <val> <cc> <ch>" — входящий CC от ctlin (pack i i i → prepend ccin → JS)
function ccin() {
    var val = parseInt(arguments[0], 10);
    var cc  = parseInt(arguments[1], 10);
    var ch  = parseInt(arguments[2], 10);
    if (isNaN(val) || isNaN(cc)) return;

    // === Arm mode: захватываем следующий CC ===
    if (_ccArmed) {
        if (now() - _ccArmAt < 300) return;   // debounce: игнорим первые 300мс
        _learnedCC = cc;
        _ccArmed   = false;
        // Сброс кнопки в unarmed (set 0)
        outlet(1, "cc_armed", 0);
        // Сохранить выученный CC# в hidden-параметре (undo-safe через Task)
        var capturedCC = cc;
        var t = new Task(function() {
            outlet(1, "cc_learned", capturedCC);
        }, this);
        t.execute();
        return;
    }

    // === Follow mode: управляем manualVal если CC совпадает ===
    if (_learnedCC < 0 || cc !== _learnedCC) return;   // не наш CC
    if (selectedSend >= 0) return;                      // не в Manual-режиме: игнорим

    // Нормализуем MIDI CC 0..127 → 0..1
    var normalized = clamp01(val / 127.0);
    // Обновляем как пользовательский жест через midi-источник (бар live.slider ↔ manualVal)
    userval("cc", normalized);
}

// ---- состояние маппера (8 слотов) -----------------------------------------
var armedSlot      = -1;   // какой слот сейчас взведён (-1 = никто; только один за раз)
var slotPath       = [];   // канонический путь цели каждого слота ("" = нет цели)
var slotRetry      = [];   // счётчик попыток resolve пути для каждого слота
var selParamObs    = null; // наблюдатель live_set view "selected_parameter"
var MAP_RETRY_MS   = 150;  // шаг повторного resolve пути на холодной загрузке
var MAP_RETRY_MAX  = 20;   // максимум попыток resolve (≈3 c) — потом тихо сдаёмся

// ---- сброс multimap-слотов при смене хост-трека ---------------------------
// ПРОБЛЕМА: MapButton сохраняет визуальный стейт Map[N]-переключателя (live.text,
// parameter_type:2) как Live-параметр. При переносе или КОПИРОВАНИИ девайса на
// ДРУГОЙ трек live.remote~ теряет цель (ID пропал), но Map[N]-тогглы остаются в
// состоянии «замаплено» (filled/yellow) — кнопки показывают «замаплено», хотя
// реальной цели нет.
// FIX A (move): при смене canonical_parent (= девайс переехал на другой трек) →
// сбросить все Map[N]-параметры в 0. live.remote~ уже не имеет цели, Map[N]=0
// возвращает кнопки в состояние «Map me».
// FIX B (copy): при Cmd/Alt-drag-копировании JS рестартует с нуля (_hostTrackId=0,
// savedHostIdx=-1). Определяем «другой трек» через персистный ИНДЕКС трека:
// rebuildMenu() сохраняет индекс хост-трека в hidden Live-параметре host_track_idx.
// На загрузке init() ждёт 50мс (restore-окно), потом сравнивает savedHostIdx с
// currentTrackIndex() — несовпадение = копия на другом треке → сброс.
// ИНВАРИАНТ (same-track reload): savedHostIdx восстановился (тот же трек) → match
// → без сброса. Свежая вставка: host_track_idx = -1 (initial) → нет сохранённого
// → без сброса (нет маппингов = нет необходимости). Reorder треков меняет индекс —
// это edge-case с ложным сбросом; принимаем (лучше сбросить, чем держать осиротев.
// слоты). ТОЛЬКО Track-девайс.
var _hostTrackId   = 0;    // Live object ID хост-трека (рантайм; 0 = не известен)
var _mapParamIdxs  = null; // кэш: массив индексов параметров с shortname="Map" на this_device
var _savedHostIdx  = -1;   // последний сохранённый индекс трека (restore через host_track_idx param)
                           // -1 = никогда не сохранялся (свежая вставка)
var _slotResetDone = false; // guard: copy-reset разово на загрузке

for (var _s = 0; _s < NSLOTS; _s++) {
    slotPath[_s]  = "";
    slotRetry[_s] = 0;
}

// Max вызывает loadbang() при загрузке патча. Init делегируем в патч-цепочку
// (loadbang → deferlow → delay 400 → "init"), которая ждёт готовности LiveAPI.
// НЕ вызываем init() здесь: JS объект грузится ДО live.thisdevice (LiveAPI ещё
// не инициализирован) → вызов приводил к флуду "LiveAPI is not initialized".
function loadbang() {
    /* init deferred via patcher start_delay chain */
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

// Текущий Live object ID хост-трека (0 если не разрешён).
function currentHostTrackId() {
    try {
        var parent = new LiveAPI("this_device canonical_parent");
        return (parent && parent.id != 0) ? parseInt(parent.id, 10) : 0;
    } catch (e) { return 0; }
}

// Разобрать тип и индекс хост-трека из canonical_parent.unquotedpath.
// Возвращает { isReturn: bool, idx: int } или { isReturn: false, idx: -1 } если не разрешён.
// isReturn=true  → девайс на return-треке (live_set return_tracks N)
// isReturn=false → девайс на обычном треке (live_set tracks N); idx=-1 = не на треке
function currentHostInfo() {
    try {
        var parent = new LiveAPI("this_device canonical_parent");
        if (!parent || parent.id == 0) return { isReturn: false, idx: -1 };
        var p = parent.unquotedpath;
        if (!p) return { isReturn: false, idx: -1 };
        var m = p.match(/(?:^|\s)return_tracks\s+(\d+)/);
        if (m) return { isReturn: true, idx: parseInt(m[1], 10) };
        m = p.match(/(?:^|\s)tracks\s+(\d+)/);
        if (m) return { isReturn: false, idx: parseInt(m[1], 10) };
        return { isReturn: false, idx: -1 };
    } catch (e) { return { isReturn: false, idx: -1 }; }
}

// Кодированный «подписанный» индекс хост-трека для сохранения в host_track_idx (hidden param).
// Кодировка collision-free с initial=-1:
//   обычный трек N → N+1   (≥1)
//   return-трек N  → -(N+2)  (≤-2; return 0 = -2, return 1 = -3, …)
//   fresh/unknown  → -1
// Так -1 однозначно означает «свежая вставка», return 0 кодируется как -2.
function currentTrackIndex() {
    var info = currentHostInfo();
    if (info.idx < 0) return -1;
    return info.isReturn ? -(info.idx + 2) : (info.idx + 1);
}

// Сбросить все Map[N] параметры multimap'а в 0 через LiveAPI.
// Map[N] = live.text toggle (parameter_type:2, shortname "Map") внутри MapButton.
// Установка в 0 → кнопка возвращается в состояние «Map me» (unfilled/grey).
// live.remote~ к этому моменту уже потерял цель (ID пропал при смене трека).
//
// UNDO-SAFE: все LiveAPI.set() выполняются через Task.execute() — это выводит
// записи ВНЕ текущего Max-transaction и НЕ создаёт undo-записей в Live.
// (LiveAPI.set() внутри прямого callback создаёт undo-entry; через Task — нет.)
function resetMultimapSlots() {
    try {
        var dev = new LiveAPI("this_device");
        if (!dev || dev.id == 0) return;
        var n = dev.getcount("parameters");
        // Строим/обновляем кэш индексов Map-параметров при первом вызове.
        if (!_mapParamIdxs) {
            _mapParamIdxs = [];
            for (var i = 0; i < n; i++) {
                var papi = new LiveAPI("this_device parameters " + i);
                if (!papi || papi.id == 0) continue;
                var nm = papi.get("name");
                if (nm && String(nm[0]) === "Map") {
                    _mapParamIdxs.push(i);
                }
            }
        }
        // Записать 0 в каждый Map-параметр через Task (undo-safe).
        var idxs = _mapParamIdxs.slice(); // копия, не закрываем кэш
        for (var j = 0; j < idxs.length; j++) {
            (function(idx) {
                var t = new Task(function() {
                    try {
                        var mp = new LiveAPI("this_device parameters " + idx);
                        if (mp && mp.id != 0) mp.set("value", 0);
                    } catch (e2) {}
                }, this);
                t.execute();
            })(idxs[j]);
        }
    } catch (e) {}
}

// ---- определение хост-трека и его send'ов ---------------------------------

// true, если девайс стоит на ОБЫЧНОМ или RETURN-треке (оба поддерживаются).
// false = master-трек, путь не разрешён или другой не-поддерживаемый хост.
function detectOnTrack() {
    try {
        var info = currentHostInfo();
        return info.idx >= 0;   // idx=-1 = не разрешён / master
    } catch (e) {
        return false;
    }
}

// Сколько send-слотов доступно для текущего хост-трека.
//   Обычный трек: все return-треки → live_set.getcount("return_tracks")
//   Return-трек N: только последующие return'ы (N+1, N+2, …) → total - N - 1
//   (Live ограничение: return-трек N может посылать только в return-треки N+1…)
function liveReturnCount() {
    try {
        var liveSet = new LiveAPI("live_set");
        var total = liveSet.getcount("return_tracks");
        if (_hostIsReturn && _hostReturnIdx >= 0) {
            var avail = total - _hostReturnIdx - 1;
            return avail > 0 ? avail : 0;
        }
        return total;
    } catch (e) {
        return -1;
    }
}

// Наполнить меню именами send-слотов (outlet 1 → live.menu: clear + append...).
// Перед наполнением просим патч показать меню (мы на треке); если не на треке —
// прячем меню и выходим.
//
// Поддерживаются два вида хостов:
//   • Обычный трек: все return-треки → пункты A, B, C, …
//   • Return-трек N: только последующие return-треки (N+1, N+2, …) → лейблы
//     соответствуют РЕАЛЬНЫМ буквам возвратного тракта в Live:
//     first_available = N+1 → лейбл sendLetter(N+1), и т.д.
//     Пример: return 0 (A-бас) → доступны B, C, … (посылки в треки B, C).
//             return 1 (B)     → доступны C, D, …
//
// Инвариант меню: item 0 = "Manual", item k+1 (k≥0) = лейбл к-го доступного send'а.
// selectedSend = k (0-based относительно ДОСТУПНЫХ, т.е. смещение уже внутри меню).
// buildRef() путь «mixer_device sends selectedSend» — ПРЯМОЙ индекс send'а в Live
// (Live берёт sends[k] как k-й send ОТНОСИТЕЛЬНО ДОСТУПНЫХ для данного трека).
// Проверено: на return-треке N sends[0] = sends[N+1] глобально (Live автоматически
// скрывает посылки в свои-и-предыдущие return'ы), так что индекс остаётся 0-based.
function rebuildMenu() {
    // Обновить _hostIsReturn / _hostReturnIdx из текущего хоста.
    var info = currentHostInfo();
    _hostIsReturn  = info.isReturn;
    _hostReturnIdx = info.isReturn ? info.idx : -1;

    onTrack = (info.idx >= 0);
    if (!onTrack) {
        outlet(1, "menu", "hide");
        returnCountSnap = -1;
        return;
    }
    // Фиксируем ID хост-трека при первой успешной привязке к треку.
    // (Используется в resync() для детектирования смены трека при live-move.)
    if (_hostTrackId === 0) {
        _hostTrackId = currentHostTrackId();
    }
    // Персистируем кодированный индекс трека в hidden Live-параметр host_track_idx.
    // Кодировка: обычный трек N → N+1 (≥1); return-трек N → -(N+2) (≤-2); fresh=-1.
    // Используется при загрузке для детекта копирования на другой трек.
    var tidx = currentTrackIndex();
    if (tidx !== -1) {
        outlet(1, "host_track_idx", tidx);  // → патч → host_track_idx live.numbox
    }
    outlet(1, "menu", "show");

    // n = количество доступных send-слотов для данного типа хоста.
    var n = liveReturnCount();
    returnCountSnap = n;
    outlet(1, "menu", "clear");
    outlet(1, "menu", "append", "Manual");     // item 0 = Manual (ручной MIDI-источник; selectedSend=-1)
    for (var k = 0; k < n; k++) {
        // Лейбл = РЕАЛЬНАЯ буква return-трека-адресата.
        // Обычный трек:  k → sendLetter(k)  (0→A, 1→B, …)
        // Return-трек N: k → sendLetter(N+1+k) (отображение сдвинуто на own_idx+1)
        var letterIdx = _hostIsReturn ? (_hostReturnIdx + 1 + k) : k;
        outlet(1, "menu", "append", sendLetter(letterIdx));
    }
    // Кламп выбранного: если return пропал — не уезжаем за предел; None (-1) валиден всегда.
    if (n > 0 && selectedSend >= n) selectedSend = n - 1;
    outlet(1, "menu", "set", selectedSend + 1); // menuIndex = selectedSend+1 (None=0)
    buildRef();
}

// ---- сборка ОДНОЙ ссылки на выбранный send --------------------------------

function buildRef() {
    sendRef = null;
    lastResult = -1;   // сброс гейта: при смене цели первую посылку не блокируем
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
// Также детектирует смену хост-трека (canonical_parent переехал на другой трек)
// и сбрасывает Map[N]-слоты multimap'а в «Map me» перед перестройкой.
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

        // Детект смены хост-трека: сравниваем текущий ID с кэшированным.
        // Сброс только когда _hostTrackId уже был зафиксирован (≠ 0) и сменился.
        // При same-track reload: JS инициализируется заново, _hostTrackId=0 → первый
        // resync (force=true из init) → rebuildMenu записывает ID → кэш заполнен.
        // При drag на ДРУГОЙ трек: девайс не перезапускается, _hostTrackId уже стоит →
        // canonical_parent меняется → ID не совпадает → сброс Map-слотов.
        if (nowOnTrack && _hostTrackId !== 0) {
            var newId = currentHostTrackId();
            if (newId !== 0 && newId !== _hostTrackId) {
                // Переезд на другой трек: live.remote~ уже потерял цели,
                // Map[N]-тогглы остались filled → сбрасываем в «Map me».
                _hostTrackId   = newId;   // обновляем сразу, чтобы не сбрасывать дважды
                _mapParamIdxs  = null;    // инвалидируем кэш индексов
                _slotResetDone = true;    // guard: copy-detect в init() Task пропустит сброс
                resetMultimapSlots();
                changed = true;           // перестройка меню обязательна
            }
        }

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

// "hosttrackidx <k>" из патча на загрузке — Live восстановил host_track_idx параметр.
// Кэшируем сохранённый индекс для copy-detection в init().
function hosttrackidx(k) {
    _savedHostIdx = parseInt(k, 10);
    if (isNaN(_savedHostIdx)) _savedHostIdx = -1;
}

// "init" из патча (loadbang/live.thisdevice → deferlow → delay → init).
// Надёжный kick, НЕ завязанный на return-detect-цепочку: ставит наблюдатели,
// наполняет меню (None + буквы) и пересобирает ref.
// ВАЖНО: НЕ форсим выбор здесь. Дефолт selectedSend=None (свежая вставка). Если
// umenu-параметр восстановил сохранённый выбор (select() уже отработал на load),
// selectedSend держит его — init его НЕ перетирает (персист сохранён).
// После этого qmetro дёргает bang() для поллинга.
function init() {
    _restoreUntil = now() + RESTORE_GATE_MS;    // открыть restore-окно: не пишем в midi_dial в этот период
    installObservers();
    if (!selParamObs) installSelParamObserver();
    rebuildMenu();                              // clear + append None+буквы + show/hide + set + buildRef
    barVisShown = -1;                           // форс пере-эмит видимости бара на load
    updateBarVis();                             // None → показать бар+подпись; A/B/C/D → спрятать

    // Copy-to-new-track detection: через 200мс после init (когда Live восстановил
    // host_track_idx параметр и hosttrackidx() уже вызван) — сравниваем сохранённый
    // индекс с текущим. Несовпадение = девайс скопирован/перенесён на другой трек.
    // Задержка 200мс перекрывает порядок restore (host_track_idx приходит до init-kick
    // в штатном restore, но task даёт extra margin).
    // _slotResetDone guard: не сбрасываем дважды (move-detect в resync() может отработать
    // раньше при drag — тогда сброс уже выполнен, копи-детект пропускаем).
    if (!_slotResetDone) {
        var t = new Task(function() {
            if (_slotResetDone) return;
            // _savedHostIdx кодировка: -1 = свежая вставка (не сбрасываем);
            // обычный трек N → N+1 (≥1); return-трек N → -(N+2) (≤-2).
            // -1 = только «никогда не сохранялся» (return 0 кодируется как -2).
            if (_savedHostIdx === -1) return;
            var cur = currentTrackIndex();
            // cur !== -1 = хост известен; cur !== _savedHostIdx = переехал
            if (cur !== -1 && cur !== _savedHostIdx) {
                _slotResetDone = true;
                _mapParamIdxs  = null;
                resetMultimapSlots();
            }
        }, this);
        t.schedule(200);
    }
}

// ---- сообщения из патча: выбор send'а -------------------------------------

// "select <menuIndex>" из патча (umenu выбор) — menuIndex 0 = None, i≥1 = send (i−1).
function select(menuIndex) {
    if (menuIndex === undefined || menuIndex === null) return;
    var mi = parseInt(menuIndex, 10);
    if (isNaN(mi) || mi < 0) return;
    // ⚠️ БЫЛ boot-redirect Manual→A в окне загрузки (clobber'ил СОХРАНЁННЫЙ Manual на
    // reload — не различал «свежая вставка» и «restore сохранённого Manual»). УБРАН.
    // Свежая вставка дефолтит на Send A через сам параметр send_menu
    // (parameter_initial:[1] + parameter_initial_enable:1 = umenu отдаёт index 1 при
    // первой загрузке без сохранённого значения). Сохранённый Manual теперь доживает.
    var prevSel = selectedSend;   // откуда уходим
    var newSel  = mi - 1;         // 0(None)→-1, 1→A(0), 2→B(1)…
    // Вход в Manual (None): засеять manualVal так, чтобы выход приземлился КУДА НАДО,
    // без прыжка в 0:
    //   • из реального сенда (пользователь переключил A/B/C/D→Manual): берём текущее
    //     значение сенда — параметр остаётся там, где был (sendRef ещё на СТАРОЙ цели,
    //     читаем до buildRef());
    //   • на ЗАГРУЗКЕ (restore сохранённого Manual): сенда нет (prevSel тоже Manual или
    //     ещё не готов) — берём ПЕРСИСТНОЕ значение бара live.slider (lastSliderVal),
    //     которое Live уже восстановил и которое пришло в JS раньше menu-restore.
    if (newSel < 0) {
        if (prevSel >= 0 && sendRef && sendRef.id != 0) {
            try { manualVal = clamp01(parseFloat(sendRef.get("value"))); } catch (e) {}
        } else if (lastSliderVal >= 0) {
            manualVal = clamp01(lastSliderVal);   // restore: ручное значение = персистный бар
        }
    }
    selectedSend = newSel;        // 0(None)→-1, 1→A(0), 2→B(1)…
    buildRef();                   // None → sendRef=null (ручной источник)
    // Выбор сменился — форсируем ресинк ОБОИХ контролов под значение новой цели:
    // сбрасываем гард/последнее-показанное, чтобы СЛЕДУЮЩИЙ bang сразу выставил их.
    lastWritten = -1;
    bigShown    = -1;
    midiShown   = -1;
    updateBarVis();               // None → показать бар+подпись; A/B/C/D → спрятать
}

// Видимость бара «for MIDI map» + подписи: видны ТОЛЬКО в None (ручной источник).
// outlet(1,"barvis",0/1) → патч (route barvis → script show/hide). Шлём при смене.
function updateBarVis() {
    var vis = (selectedSend < 0) ? 1 : 0;
    if (vis !== barVisShown) {
        barVisShown = vis;
        outlet(1, "barvis", vis);
    }
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

// "userval <src> <v>" из патча — контрол <src> ("big"|"midi") подвинули.
//   • A/B/C/D: пишем 1:1 в выбранный send (как раньше).
//   • None: НЕ пишем send — обновляем РУЧНОЙ источник manualVal (он идёт в выход).
// Источник уже стоит на val → метим его *Shown=val (его не толкаем назад);
// ВТОРОЙ контрол подтянет следующий bang() к новому значению.
// Шкала: оба контрола 0..1 == диапазон 0..1 (send или ручной), масштаб не нужен.
function userval(src, v) {
    // обратная совместимость: если пришёл один аргумент (старый "userval <v>"),
    // трактуем как big (но патч теперь всегда шлёт src).
    if (v === undefined) { v = src; src = "big"; }
    if (v === undefined || v === null) return;
    var val = parseFloat(v);
    if (isNaN(val)) return;
    val = clamp01(val);

    // источник уже стоит на val — пометить его *Shown (не дёргаем назад)
    if (src === "midi") {
        midiShown     = val;
        lastSliderVal = val;   // КЭШ персистного бара: нужен для seed manualVal на restore
    } else if (src === "cc") {
        // CC-источник не связан напрямую с баром или кругом — не меняем *Shown,
        // но обновляем бар (mididialset) чтобы визуально двигался вслед за CC.
        // lastSliderVal тоже обновляем: при следующем select(None) manualVal будет корректен.
        lastSliderVal = val;
        midiShown     = val;
        outlet(3, "mididialset", val);   // обновить бар (display; не создаёт undo вне trigger)
    } else {
        bigShown  = val;
    }

    if (selectedSend < 0) {
        // None — РУЧНОЙ источник: обновляем manualVal, сенд НЕ трогаем.
        manualVal = val;
        return;                                // выход выдаст bang() (mm_sig → мэппер)
    }

    if (!sendRef || sendRef.id == 0) return;   // не на треке / ещё не готово
    lastWritten = val;                         // гард: следующий read это значение не толкнёт назад
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

// "targetmap <slot> <id>" из патча (multimap_panel out1 → prepend targetmap → JS)
// Вызывается при клике кнопки Map[N] в multimap-панели.
// slot = номер слота (0-7), id = live-object id (unused in Track, but matches Return protocol).
// Устанавливаем armedSlot, запускаем selParamObserver → следующий клик на Live-параметр
// → onSelParamChange → captureTarget → persist (slotPath + live.numbox).
function targetmap(slot, id) {
    slot = validSlot(slot);
    if (slot < 0) return;
    // Снять предыдущий арм если есть
    if (armedSlot >= 0 && armedSlot !== slot) {
        outlet(1, armedSlot, "arm", 0);
    }
    armedSlot = slot;
    if (!selParamObs) installSelParamObserver();
    outlet(1, slot, "arm", 1);    // эхо-подтверждение слоту
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

    // === None — РУЧНОЙ источник: выход = manualVal, оба контрола ↔ manualVal ===
    // Сенд НЕ читаем/НЕ пишем. Выход (mm_sig→мэппер) гонит ручное значение.
    if (selectedSend < 0) {
        // Change-gate: шлём только при реальном изменении ручного значения.
        if (Math.abs(manualVal - lastResult) > RESULT_EPS) {
            lastResult = manualVal;
            outlet(0, "max", manualVal);
        }
        syncControls(manualVal);
        return;
    }


    // === A/B/C/D — следим за выбранным send ===
    // Не на треке или ещё не готово.
    // В restore-окне молчим: mm_sig сохраняет значение 0 (sig~ дефолт), а emit
    // нуля в это время обнулял бы все замапленные параметры через live.remote~.
    // После окна (LiveAPI инициализирован) выдаём 0 как честный N/A.
    if (!sendRef || sendRef.id == 0) {
        if (_restoreUntil > 0 && now() < _restoreUntil) return;
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
    // Change-gate: шлём downstream только при реальном изменении (снижает нагрузку на 50 Гц).
    if (Math.abs(result - lastResult) > RESULT_EPS) {
        lastResult = result;
        outlet(0, "max", result);
    }
    syncControls(result);
}

// Привести ОБА контрола (большой круг + бар) к target с гардом read↔write.
// Эхо-гард: read ≈ lastWritten = наше эхо записи → снимаем гард. Затем КАЖДЫЙ
// контрол подтягиваем НЕЗАВИСИМО, только когда его показанное расходится с target
// на EPS: контрол-источник уже на target (не дёргается), ВТОРОЙ догоняет (рвёт
// пинг-понг); внешняя правка (микшер/MIDI) расходит оба → едут оба. Работает
// одинаково в обоих режимах (target = send value ИЛИ manualVal).
function syncControls(target) {
    if (lastWritten >= 0 && Math.abs(target - lastWritten) <= KNOB_EPS) {
        lastWritten = -1;             // эхо поглощено, снимаем гард
    }
    if (Math.abs(target - bigShown) > KNOB_EPS) {
        bigShown = target;
        outlet(2, "knobset", target);     // → БОЛЬШОЙ круг (prepend set, тихо); parameter_enable:0 — не автоматизируется, писать безопасно
    }
    // ГАРД АВТОМАТИЗАЦИИ: в restore-окне НЕ шлём set в midi_dial (live.slider,
    // parameter_enable:1). Если на параметре есть автоматизация, даже display-set
    // в Live 12 может поднять флаг override. Live сам позиционирует бар из .als.
    // После окна — нормальная работа: midiShown обновляем, чтобы первый post-gate
    // bang не ударил зря.
    if (_restoreUntil > 0 && now() < _restoreUntil) {
        // restore-окно: синхронизируем midiShown с target без записи в параметр;
        // когда окно кончится, midiShown уже будет корректен → не сделаем лишний set.
        midiShown = target;
        return;
    }
    _restoreUntil = 0;                         // окно закрыто — сбрасываем маркер
    if (Math.abs(target - midiShown) > KNOB_EPS) {
        midiShown = target;
        outlet(3, "mididialset", target); // → бар live.slider (set, тихо)
    }
}
