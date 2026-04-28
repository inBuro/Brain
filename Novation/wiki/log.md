---
type: log
project: Novation
created: 2026-04-28
---

# Wiki Log

Append-only журнал операций над вики.

---

## 2026-04-28 — ingest `raw/XL_Performance — как это работает.md`

- Прочитан новый source-файл (synthesis-документ, frontmatter `type: synthesis`).
- Создана synthesis-страница `wiki/XL_Performance — как это работает.md` со сквозным обзором, таблицей слоёв, потоком из 6 событий, видимыми параметрами и точками расширения. Цитаты `(source: …)` проставлены.
- Создан `wiki/index.md` — TOC по synthesis / sources / concepts / entities (ранее отсутствовал).
- Создан `wiki/log.md` (этот файл).
- Существующие entity- и concept-страницы не модифицированы — синтез согласуется с ними; правок не потребовалось.

## 2026-04-28 — lint pass

Источник правок — отчёт линта.

- **Format compliance.** Все 8 страниц вики (источник, оба concept-а, 5 entity, synthesis) приведены к формату CLAUDE.md: `**Summary**` / `**Sources**` / `**Last updated**` + `---` + контент + `## Related pages`. YAML-frontmatter сохранён, цитаты `(source: …)` проставлены.
- **Mixer Layer:** добавлены индикаторы `mix_obj-mode11-btn`..`mode14-btn` в раздел «Состояние» (восполнен гэп относительно README).
- **CC47 Cross-Mode Transit:** переформулирован save-point — явно отмечено, что отдельной save-переменной нет, `v instruments_mode` работает и как «текущий», и как save-point. Согласовано с Instruments Layer.
- **Solo Follower:** добавлены исходящие wiki-links (synthesis, README, MIDI Passthrough) — больше не semi-orphan.
- **`raw/XL_Performance — как это работает.md` удалён** из `raw/` — это был synthesis-черновик пользователя, его содержимое полностью переехало в `wiki/XL_Performance — как это работает.md`. В `raw/` теперь только истинно immutable-источники: `XL_Performance.README.md` и бинарь `XL_Performance.amxd`.
- **Wiki-links нормализованы по basename** (`[[Page Name]]` вместо `[[wiki/path/Page Name]]`) — Obsidian резолвит однозначно, читать проще.
- **`index.md`** обновлён под basename-стиль.

## 2026-04-28 — корректировка ёмкости LCXL: 14, не 16

Пользователь уточнил: LCXL MK3 фактически хранит **14** custom-modes, а не 16, как утверждает README v1.5.

- `wiki/concepts/Custom Modes Model.md` — изменено «до 16» → «до 14», удалена строка «15–16 свободно», добавлен явный блок «Расхождение с источником» с пометкой, что README ошибается.
- `wiki/XL_Performance — как это работает.md` — «16» → «14» в идее-абзаце, добавлено упоминание ошибки README.
- `wiki/sources/XL_Performance README.md` — добавлен предупреждающий пункт о расхождении и ссылка на Custom Modes Model.
- `raw/XL_Performance.README.md` **не правился** (раздел `raw/` immutable per CLAUDE.md).

## 2026-04-28 — feature-request: Solo Follower без смены фокуса

Пользователь сообщил, что во время рифф-перформанса фокус Live сбивается на заSOLOенный трек, что мешает играть. Желаемое поведение: solo-зеркалирование собственного трека сохранить, но фокус (`selected_track`) больше **не** менять.

- `wiki/entities/Solo Follower.md` — добавлен раздел «Запланированные изменения» с описанием запроса, точкой правки в `solo_follower.js` (`selectTrackById` в `scheduleApply`), вариантами реализации (удалить совсем vs UI-toggle `sf_focus`) и открытым вопросом, какой вариант выбрать.
- Сам `solo_follower.js` пока не правлен — файл живёт рядом с `XL_Performance.amxd` (вне отслеживаемой `raw/`/`wiki/`-структуры) и в текущем рабочем каталоге не найден.

## 2026-04-28 — Solo Follower: реализация защиты фокуса и viewport (prod)

Реализовано и принято в prod после нескольких итераций. `Novation/solo_follower.js` переписан, wiki-страница приведена к актуальному коду.

**Итоговое поведение.**

1. Solo-зеркалирование собственного трека (`forceOwnSolo`) — на месте, без изменений.
2. Фокус (`selected_track`) **не уезжает**: ни на router-трек, ни на засоленный, ни на какой-либо «соседний» из-за побочки `set("solo")`. Пользователь может **сам** перевыделить любой не-засоленный трек, и сохранённое значение `savedSelectionForRestore` обновится.
3. Viewport старается **удержать в кадре оба трека** — засоленный и сохранённый. Если они близко — оба видны и фокус на сохранённом. Если далеко — viewport уезжает к сохранённому (фокус всё равно правильный). Полностью подавить scroll невозможно — Live API не даёт управлять scroll-позицией.

**Ключевые механизмы:**

- `LiveAPI` observer на `live_set view → selected_track` с двумя режимами (обычный / `pendingFocusRestore`).
- **`readTrackSolo(id)`** — прямое чтение `solo` свойства трека через свежий `LiveAPI("id <id>")`, чтобы определять «этот sweep — Live-побочка или пользовательский клик» в обход устаревшего кэша `soloStates`. Это решает race между `selected_track`-callback'ом и `solo`-callback'ом.
- **Двухшаговый view-set** в `forceOwnSolo`: сначала `set("selected_track", lastSoloedExternalId)` (Live скроллит на засоленный), затем `set("selected_track", savedSelectionForRestore)` (если сохранённый виден — Live не скроллит ещё раз → оба видны).
- 500 мс `inSoloEvent`-окно после внешнего solo-callback'а блокирует обновление `lastUserSelectedId`; 800 мс `clearPendingTask`-хвост после `forceOwnSolo(0)` ловит поздние Live-sweep'ы.

**Эволюция решения по итерациям (для ретроспективы):**

1. Synchronous read+restore вокруг `set("solo")` — ломал зеркалирование. Откат.
2. Async restore через `Task.schedule(1ms)`, потом 50ms — фокус возвращался, но Live делал второй sweep позже окна.
3. Observer на `selected_track` без таймаута — фиксировал зависание `pendingFocusRestore`. Сбрасывал только в `forceOwnSolo(0)`.
4. Окно `SHIFT_WINDOW_MS = 300ms` для различения Live-побочки и user-click — работало для одиночного solo, но при multi-solo (1, 2, 3, 4) `forceOwnSolo` выходил рано (`current === v`) и observer ловил sweep вне окна.
5. Замена окна на `readTrackSolo(currentId) === 1` — стабильно различает Live-побочку от пользовательского клика безотносительно времени.
6. Двухшаговый view-set с `lastSoloedExternalId` — попытка минимизировать viewport-jerk: при близких треках получается удержать оба в кадре.

**Найденные по пути баги:**

- **Type mismatch `LiveAPI.id`** — приходит в смешанных формах (string/number/array). `ownTrackId = ownTrackApi.id` давал строку, `readSelectedTrackId()` число; `===` стабильно возвращал false, защита молча ломалась. Лечение — `parseIntSafe(...)` для всех id (`ownTrackId`, `id` в `addObserver`). Задокументировано в entity-странице.
- **Race view-cb / solo-cb** — Live переводит `selected_track` на засоленный трек **до** того, как присылает solo-callback. View-observer успевал записать его в `lastUserSelectedId` до того, как сработает фильтр `inSoloEvent`. Лечение — `readTrackSolo(idx)` прямо в view-observer.

**Production hygiene.** Отладочные `post("[SF] ...")` удалены. Удалены неиспользуемые `SHIFT_WINDOW_MS` / `lastForceOwnSoloTime`, оставшиеся от итерации с временным окном. Все error-handler'ы — silent `try/catch {}` без шумных логов в Max Console.

**Известные ограничения.** Live API не даёт управлять scroll-позицией session/arrangement viewport напрямую — только `selected_track` влияет на видимую область. Двухшаговый view-set минимизирует дёрганье для близких треков; для далёких — viewport уезжает к сохранённому. Альтернатив без переработки архитектуры устройства (например, mute остальных треков вместо solo на router) нет.

## 2026-04-28 — Solo Follower: умный prescroll по дистанции треков (откачено 2026-04-29)

Доработка viewport-логики. Раньше двухшаговый view-set (`set("selected_track", lastSoloedExternalId)` → `set("selected_track", savedSelectionForRestore)`) выполнялся всегда, что давало два скролла даже для треков, которые заведомо не помещаются в кадр одновременно.

**Что изменилось.** В `forceOwnSolo` перед двухшаговым set'ом:
1. Читаем `currentSel = readSelectedTrackId()` после `set("solo")`. Если уже равно `savedSelectionForRestore` — никаких view-set'ов вообще, ноль скроллов.
2. Шаг 1 (prescroll к засоленному) делаем **только** если `shouldDoSoloedPrescroll()` вернул `true`: оба трека main (а не return), и дельта индексов в `live_set tracks` ≤ `VIEWPORT_NEIGHBOR_SPAN = 8`.
3. Иначе делаем сразу финальный шаг — один скролл к сохранённому, без лишнего дёрганья.

**Почему 8.** Live API не отдаёт ширину viewport, она зависит от размера окна. 8 — компромисс между «типично видимое число main-треков» и точностью эвристики. Константа вынесена в `VIEWPORT_NEIGHBOR_SPAN` и затюнима.

**Edge cases.** Return-tracks (path `live_set return_tracks N`) автоматически дают `tryGetMainIndex(...) == -1`, и `shouldDoSoloedPrescroll` возвращает `false` — для них prescroll бессмыслен, индексы main и return нельзя сравнивать линейно.

## 2026-04-29 — Solo Follower: откат к безусловному двухшаговому view-set

Эвристика `VIEWPORT_NEIGHBOR_SPAN = 8` + `shouldDoSoloedPrescroll()` не оправдала себя: на практике поведение между **первым** solo и **последующими** оказывалось несимметричным — при 1-м solo Live часто вообще не двигал viewport (saved уже виден после `set("solo")`), и наш view-set был двумя no-op'ами; при 2-м/3-м/4-м solo Live перебрасывал viewport к новому засоленному, и наш одношаговый restore (когда `forceOwnSolo` выходил рано через `current === v`) скроллил к saved → saved упирался в край. Юзер с этим жил неудобно, разница раздражала больше, чем сама необходимость скролла.

Попытка вынести view-policy в общую функцию `applyViewPolicy()` и вызывать её и из `forceOwnSolo`, и из view-observer'а тоже не решила: динамика Live при повторных `set("selected_track")` на близких/дальних треках непредсказуема без знания реальной ширины viewport, а Live Object Model её не отдаёт.

**Решение.** Откат к **безусловному** двухшаговому view-set'у в `forceOwnSolo` (как было после prod-версии 2026-04-28). Step 1 (`set selected_track = lastSoloedExternalId`) делается всегда при `v == 1` и `lastSoloedExternalId !== savedSelectionForRestore && !== ownTrackId`. Поведение полагается на встроенную логику Live «не скроллить уже видимый трек»: на широком viewport step 1 — невидимый no-op; на узком — даёт шанс уместить оба или честно показывает один.

Удалены: `VIEWPORT_NEIGHBOR_SPAN`, `tryGetMainIndex`, `shouldDoSoloedPrescroll`, `applyViewPolicy`, `lastViewPolicyTime`, `VIEW_POLICY_REENTRY_MS`. View observer в режиме `pendingFocusRestore` снова делает простой одношаговый restore (`set selected_track = saved`) — он работает как fallback от поздних Live-sweep'ов и не пытается дублировать prescroll.

**Источник правды.** Файл, к которому юзер вернулся, — `~/Music/Ableton/User Library/Max Devices/solo_follower.js`. Содержимое скопировано в `Novation/solo_follower.js` 1:1 (verified `diff` exit 0).

**Известные ограничения остаются.** Live API не управляет scroll-позицией session/arrangement viewport напрямую; точное «уместить оба трека в кадре» возможно только если они помещаются по факту, и единственный регулятор — `selected_track`. Альтернативы (mute остальных вместо solo на router; UI-numbox с пользовательским значением span) не реализованы.
