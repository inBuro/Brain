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

## 2026-04-29 — Solo Follower зафиксирован как неотъемлемая часть XL_Performance

По просьбе пользователя усилена связь [[Solo Follower]] ↔ [[XL_Performance — как это работает]]: Solo Follower — не один из равноправных слоёв, а условие работоспособности устройства (без него router-трек XL_Performance глохнет под чужим solo, рифф-перформанс ломается).

- `wiki/entities/Solo Follower.md` — в Summary добавлено явное «Неотъемлемая часть [[XL_Performance — как это работает|XL_Performance]]» с обоснованием.
- `wiki/XL_Performance — как это работает.md` — в абзац «Идея» вшита фраза про встроенный Solo Follower как неотъемлемую часть; в таблицу слоёв добавлена пометка *(integral)* и абзац-ремарка про `sf_active` (по умолчанию on, в продакшене не выключается).
- `wiki/index.md` — в строке Solo Follower добавлен хвост «**неотъемлемая часть** XL_Performance».
- Обновлены `Last updated` и frontmatter `updated: 2026-04-29` в трёх затронутых страницах.

## 2026-04-29 — топология графа: хаб `Novation XL` + обратные ссылки

Юзер заметил, что в Obsidian Graph View wiki-страницы (Solo Follower, XL_Performance synthesis и др.) не выглядят связанными с корневым проектным хабом — потому что хаб лежал в `Novation/index.md` (узел в графе с лэйблом «index», к тому же конфликтующий с `wiki/index.md`), а внутри wiki никто на него не ссылался.

**Что сделано.**
- `Novation/index.md` → `Novation/Novation XL.md` (переименование). Заголовок `# Novation — XL_Performance` → `# Novation XL`. Узел в графе теперь однозначно опознаётся.
- В блоки `## Related pages` всех wiki-страниц добавлена ссылка `[[Novation XL]] — корневой хаб проекта`: `Solo Follower`, `XL_Performance — как это работает`, `Mixer Layer`, `Instruments Layer`, `CC47 Cross-Mode Transit`, `MIDI Passthrough`, `Custom Modes Model`, `Mode Encoding`, `XL_Performance README`. У некоторых страниц при этом добавлена забытая ссылка на synthesis.
- В `wiki/index.md` Summary добавил «Корневой хаб: [[Novation XL]]».
- В `Novation/log.md` исходную битую ссылку `[[index]]` заменил на `[[Novation XL]]` с пометкой о переименовании.

**Эффект.** Теперь `Novation XL` — реальный hub-узел: ~9 рёбер из всех wiki-страниц + исходные out-links самого хаба → симметричный кластер в графе. `Solo Follower` помимо явной фразы «неотъемлемая часть» (запись 2026-04-29 выше) теперь ещё и графически висит на хабе, а не «внутри» wiki-подграфа.

## 2026-04-29 — связь `solo_follower.js` ↔ Solo Follower (граф)

Добавлены явные wiki-link'и на сам JS-файл, чтобы код стал узлом графа рядом с доками — по аналогии с уже залинкованными `raw/XL_Performance.amxd` и `raw/XL_Performance.README`.

- `wiki/entities/Solo Follower.md`: в строке `**Sources**` `solo_follower.js` → `[[solo_follower.js]]`; первое упоминание в теле страницы (`JS-скрипт solo_follower.js, грузится...`) тоже стало wiki-link'ом. Внутренние упоминания в коде/объекте `[js solo_follower.js]` оставлены в backticks как технический литерал.
- `Novation XL.md`: добавлена строка `JS-скрипт фолловера: [[solo_follower.js]]` рядом с `[[raw/XL_Performance.amxd]]` и `[[raw/XL_Performance.README]]`.

В графе `solo_follower.js` теперь — non-md узел («призрак», без рендера контента в Obsidian), связанный с `Solo Follower` и `Novation XL`. Петля «доки ↔ код» закрыта.

## 2026-04-29 — lint pass (фиксы 1–4)

По запросу `lint`. Применены фиксы из отчёта.

**Fix 1 — противоречие 14 vs 16 modes устранено.**
- `wiki/concepts/Custom Modes Model.md` — Summary: «16» → «14», совпадает с телом и warning-блоком. `Last updated`/`updated:` подняты до 2026-04-29.
- `wiki/index.md` — описание Custom Modes Model: «16» → «14».

**Fix 2 — двусмысленный `[[log]]` в `Novation XL.md` снят.**
- `[[log]]` → `[[Novation/log|Project log]]` + добавлен явный `[[wiki/log|Wiki log]]`. Теперь оба журнала достижимы из хаба без коллизий.

**Fix 3 — `wiki/index.md` больше не orphan.**
- В блок `## Meta` хаба добавлена ссылка `[[wiki/index|Wiki TOC]]`. Удалять не стал — TOC дублирует таблицы хаба, но даёт второй путь поиска и не мешает.

**Fix 4 — стиль ссылок в хабе нормализован к basename.**
- `[[wiki/sources/XL_Performance README]]` → `[[XL_Performance README]]`, аналогично для всех 5 entities и 2 concepts. Соответствует решению lint-pass'а 2026-04-28 (тогда хаб не существовал и не попал под нормализацию). Все имена уникальны, Obsidian резолвит однозначно.

**Не правил.**
- Fix 5 (frontmatter в `Novation XL.md`) — пользователь не подтвердил отдельно.
- Fix 6 (frontmatter в root `Novation/log.md`) — лог явно отметил как «не править».
- Fix 7–8 — расхождений и пропущенных концептов нет.

## 2026-05-01 — Solo Follower: фокус на «изменённый» трек, без восстановления saved

Запрос пользователя: после un-solo фокус должен оставаться на треке, который только что вышел из solo, а не возвращаться на сохранённую пользовательскую позицию.

**Что изменилось в `solo_follower.js`.**

- Переменная `lastSoloedExternalId` → `lastChangedExternalId`. Обновляется в solo-callback'е независимо от направления (1→0 или 0→1).
- `forceOwnSolo(v)`:
  - всегда (при наличии валидного `lastChangedExternalId !== ownTrackId`) делает один `view.set("selected_track", "id " + lastChangedExternalId)`, без двухшаговой логики;
  - не пропускает view-set, даже если `current === v` (зеркалирование solo уже отработало) — фокус всё равно переводится на изменённый трек.
- Снят весь focus-restore state machine: `pendingFocusRestore`, `savedSelectionForRestore`, `lastUserSelectedId`, `clearPendingTask`, `scheduleClearPendingFocus`/`cancelClearPendingFocus`, `readTrackSolo`. View-observer оставлен **только** для snap-back из router-трека во время `inSoloEvent`-окна — это единственная защита от Live-побочки `set("solo")`, которая иногда асинхронно прыгает на router.
- Константа `SOLO_EVENT_WINDOW_MS = 500` вынесена явно (раньше 500 был магическим литералом в `markSoloEvent`).

**Поведение по сценариям.**

1. Solo трека A → фокус на A. Live минимально подскроллит viewport, чтобы A стал виден; если был в кадре — без скролла.
2. A солирован, юзер солирует B (Live в exclusive-mode снимает A) → два callback'а, последний с B → фокус на B.
3. Юзер снимает solo с B (последнего соло-трека) → callback `B/0` → `lastChangedExternalId = B` → фокус остаётся на B даже после `forceOwnSolo(0)`.
4. Юзер во время активного solo кликает на трек C (не солируя) → viewObserver видит ручной клик, в окне `inSoloEvent` фильтр — только snap-back из router; клик на C проходит свободно, фокус на C, пока пользователь сам не сменит solo.

**Trade-off.** Прежнее поведение «после un-solo вернуться на тот трек, где ты работал до solo» больше не реализуется. Если потребуется — добавится одной строкой по запросу. Текущая логика проще, симметричнее (заход и выход из solo обрабатываются одинаково) и не требует state machine.

**Wiki.** `wiki/entities/Solo Follower.md` переписана: Summary, цели, раздел «Перевод фокуса на изменённый трек», таблица состояния, точки тюнинга, известные ограничения. Раздел «Защита viewport (двухшаговый view-set)» удалён вместе с упоминанием `VIEWPORT_NEIGHBOR_SPAN`/`shouldDoSoloedPrescroll`. `Last updated`/`updated:` подняты до 2026-05-01.

## 2026-05-01 — Solo Follower: эксперимент о синхронности `set("solo")` + минимизация скрипта

Эксперимент с инструментацией `forceOwnSolo` и `viewObserverCallback` (DEBUG-логи `[SF +Nms]`) подтвердил гипотезу о природе viewport-побочки.

**Что показал лог.** Последовательность для одного solo-клика на трек id=8:

```
+0ms   solo-cb track=8 0->1
+10ms  forceOwnSolo v=1 selBefore=8 ownId=2
+15ms  view-cb currentId=2 [== own/router]   ← Live re-entrant шифтнул на router
+19ms  snap-back -> 8                        ← viewObserver сработал re-entrant
+22ms  view-cb currentId=8                   ← наш set перевыделил 8
+23ms  after own.set('solo',1) selAfter=8 [no shift]
+24ms  preemptive view.set -> 8              ← redundant, уже 8
```

**Главный вывод.** `ownTrackApi.set("solo", v)` — **синхронный блокирующий** API-вызов. Внутри него Live: применяет solo на router, делает auto-shift `selected_track` на router, **синхронно re-entrant** дёргает наш JS-callback (viewObserver), тот делает snap-back, всё это завершается, и только потом `set()` возвращает управление. Метка `[no shift]` в строке `after own.set` — иллюзия: shift был, но snap-back починил его внутри того же вызова.

Это означает: **viewObserver был дубликатом post-set view.set'а в `forceOwnSolo`**. Оба механизма перезатирали побочку Live, но oba ровно на одно и то же значение и в одном и том же синхронном кадре.

**Что выкинуто из `solo_follower.js`** (490 → 270 строк):
- `viewObserver`, `viewObserverCallback`, `installViewObserver`, `uninstallViewObserver` — целиком.
- `inSoloEvent`, `markSoloEvent`, `soloEventTask`, `SOLO_EVENT_WINDOW_MS` — нужны были только для гейтинга viewObserver.
- `readSelectedTrackId` — использовался только в viewObserverCallback.
- `trackPaths` — вестигиальное поле (писалось, никогда не читалось).
- Вся debug-инфраструктура (`DEBUG`, `dbg()`, `dbgResetClock()`, `debug N` message handler).

**Что осталось.** `forceOwnSolo` делает `ownTrackApi.set("solo", v)` (если состояние реально меняется) и сразу за ним один `view.set("selected_track", "id " + lastChangedExternalId)`. Этого достаточно: синхронность `set("solo")` гарантирует, что побочка Live уже применилась к моменту нашего view.set.

**Известное ограничение, обнаруженное экспериментом.** В пределах ~5–9 мс между Live'овским shift'ом на router (внутри `set("solo")`) и нашим snap-back'ом Live может успеть отрисовать промежуточный кадр. Если router визуально близок (≤1–2 трека от края viewport) — Live не делает реального скролла, и флик не виден. Если router далеко за краем — viewport на 1 кадр уезжает к router и возвращается. Через Live API это не устранить; обходные пути — держать router рядом с обычно-видимыми треками или сменить архитектуру на mute-схему вместо solo на router (требует большой переделки устройства, не реализовано).

**Источник правды переехал.** По просьбе пользователя `Novation/solo_follower.js` удалён из репозитория. Единственный поддерживаемый файл — `~/Music/Ableton/User Library/Max Devices/solo_follower.js` (рядом с устанавливаемым `XL_Performance.amxd`). Это убирает регулярную необходимость синкать две копии и вики-запись «верни состояние из Live в репо», которая раньше периодически расходилась.

- `wiki/entities/Solo Follower.md` — раздел «Перевод фокуса на изменённый трек» переписан, добавлен раздел «Почему хватает одного post-set view.set», таблица состояния урезана до трёх переменных, точки тюнинга — без `SOLO_EVENT_WINDOW_MS`, в «Известных ограничениях» добавлен абзац про микро-флик. Первая строка тела изменена: `[[solo_follower.js]]` → backtick'и + указание на User Library как место хранения.
- `Novation XL.md` — строка про JS-скрипт фолловера обновлена: убран wiki-link на удалённый файл, добавлено указание на User Library.

## 2026-05-01 — Solo Follower: попытка walk-up для canonical_parent (откат)

После минимизации скрипта пользователь сообщил, что router-трек (с устройством) перестаёт уходить в solo. Гипотеза: `canonical_parent` от `this_device` приводит не к треку, а к chain/rack, если устройство лежит в Drum Rack / Instrument Rack / Audio Effect Rack — у chain нет осмысленного свойства `solo`, set'ится в пустоту.

**Что попробовал.** В `tryInit` после первого `goto("canonical_parent")` — цикл walk-up: пока `ownTrackApi.path` не начинается с `live_set tracks` или `live_set return_tracks`, делаем ещё `goto("canonical_parent")`, до 4 хопов.

**Почему откатил.** После цикла `ownTrackApi.path` оказался **пустым**, а `jsliveapi` начал валить ошибки `get/set: no valid object set`. То есть `goto("canonical_parent")` от track-уровня уходит в `live_set`, потом дальше — и обнуляет объект, при этом `isValidApi` (проверка `id !== 0`) этот переход не ловит. Loop выходит уже из мёртвого состояния, путь пустой, set'ы летят в никуда.

**Итог.** Walk-up откачен. Логика `tryInit` снова: один `goto("canonical_parent")`, без проверки типа результата. У пользователя устройство фактически лежит **на треке** (не в раке), поэтому одного `goto` достаточно, и проблема «router не уходит в solo» в другом месте — вероятно, был кэш-эффект от незавершённой перезагрузки JS либо визуальная путаница.

**Что осталось не сделанным.** Корректный walk-up (если когда-нибудь устройство кладут в рак): нужна проверка `path.indexOf("live_set tracks ") === 0` **с пробелом и числом после**, чтобы отличать `live_set tracks 21` от голого `live_set`, плюс ранний выход при пустом пути или паттерне-`live_set` без хвоста. Сейчас некритично — добавим, если кейс возникнет.

Финальная минимальная версия: 270 строк, debug-инфраструктура снята (включая `dbg/DEBUG/refresh-debug-handler/diagnostic posts в tryInit/forceOwnSolo/makeSoloCallback`).

## 2026-05-05 — добавлен `wiki/roadmap.md`: живой checklist прогресса Fadercraft

Пользователь обнаружил, что не может посмотреть прогресс/план через Obsidian на телефоне — потому что raw-чеклист и backlog жили только в чате с Claude, а в `wiki/` не были запечатлены. Зафиксирован project-wide правилом: **каждый проект с wiki должен иметь `wiki/roadmap.md`** (или эквивалент), всегда поддерживаемый в актуальном состоянии и доступный из Obsidian-mobile.

**Что сделано.**
- Создан `wiki/roadmap.md` — Phase 0 backlog (49/119 ≈ 41% сделано на 2026-05-05) + Phase 1 пост-launch активности + ветка тайских мото-прав как backup-документ для KYC.
- В `wiki/index.md` добавлена секция «Roadmap» со ссылкой на новую страницу. `Last updated`/`updated:` подняты до 2026-05-05.
- В `Novation XL.md` (root-хаб) добавлена секция `## Roadmap` со ссылкой `[[wiki/roadmap|Project roadmap]]`.

**Правило сохранено в memory** (`feedback_project_roadmap_rule.md`): применять ко всем проектам с wiki (Trading, Novation, любые будущие).
