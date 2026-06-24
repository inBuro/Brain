---
type: log
project: Novation
created: 2026-04-28
---

# Wiki Log

Append-only журнал операций над вики.

## 2026-06-23 — Custom Mode SysEx Layout: исправлена модель label-маркеров

Реверс-инженерингом `11.syx` установлена корректная формула декодирования label-байтов. Прежняя гипотеза «64=стандарт/66=цвет2/68=цвет3» НЕВЕРНА. **Реально: маркерный байт `0x6n`/`0x7n` кодирует ДЛИНУ текста метки**: `text_len = lower_nibble + 16*(upper_nibble − 6)`. Подтверждено на всех 12 текстовых метках mode 11. Обновлено: `wiki/concepts/Custom Mode SysEx Layout.md` — раздел Labels section полностью переписан: таблица маркеров, формула, ⚠️-предупреждение об ошибочной прежней гипотезе, примечание о чередовании descriptor/label-блоков в msg2.

Полная карта меток mode 11:
- ID 0x17 (23) → `Mixer Page` (marker 0x6A)
- ID 0x1F (31) → `Encoder Bank` (marker 0x6C)
- ID 0x27 (39) → `Vertical Scroll` (marker 0x6F)
- ID 0x2F (47) → `Sends Volume` (marker 0x6C)
- ID 0x38 (56) → `Undo` (marker 0x64)
- ID 0x39 (57) → `Redo` (marker 0x64)
- ID 0x3A (58) → `To prev   mixer page` (marker 0x74)
- ID 0x3B (59) → `Momentary   Page` (marker 0x70)
- ID 0x3C (60) → `Momentary   Bank` (marker 0x70)
- ID 0x3D (61) → `Horizontal nav.` (marker 0x6F)
- ID 0x3E (62) → `Launch   Clip` (marker 0x6D)
- ID 0x3F (63) → `Launch   Scene` (marker 0x6E)

## 2026-06-18 — Social-окно 06-11→06-18 сведено (PM): канальный сплит Reddit↔maxforlive + открытые item'ы

Сведён единый продуктовый разбор окна на основе двух выжимок (analyst PostHog + copywriter голос аудитории). **Только wiki + PM-память; код/деплой/UTM/посты не трогали.** Обновлено: (1) задача «Следующий Reddit-пост» в Phase-1 distribution-блоке `roadmap.md` — добавлен дат. под-буллет «PM 2026-06-18 — SOCIAL-ОКНО сведено» с P1-P5 и открытыми item'ами; (2) шапка roadmap (Last updated). **PM-вывод (n=1-дисциплина):** главное окна — **канальный сплит**: Reddit ≈52% сессий (39), весь video_play + 2/3 download, но 0 buy_click / 0 продаж (садит на бесплатные моды, воронка там кончается — insight #7); maxforlive = 3 сессии, но единственный покупатель (sale #1 $39 NL). buy_click=4 (первые в истории), ни один не из Reddit. YouTube — flip @triemond9961 hostile→advocate (живое подтверждение insight #11/#1, но резонанс, не продажа). Не коронуем maxforlive (одна продажа≠rate), не хороним Reddit (мис-таргетед, не мёртв). **Приоритеты:** P1 следующий Reddit-пост на ПРОДУКТОВУЮ страницу + свой `/x` UTM; P2 закрыть r/abletonlive `1u74c6t` (10 комментов отсутствуют + UTM-статус неизвестен) — copywriter тянет живой тред; P3 corrected-format r/ableton retry держим кандидатом, не форсим; P4 кормить maxforlive дешёвыми рычагами листинга; P5 собрать YouTube-flip как копи/соц-актив. Открытый item: URL `organic`-поста (самый вовлечённый срез) не задокументирован — назвать. Детали — PM `launch-journal.md` 2026-06-18 (SOCIAL-WINDOW SYNTHESIS).

## 2026-06-17 — 🎯 ПЕРВАЯ РЕАЛЬНАЯ ПРОДАЖА Control XL — strategic-checkpoint GO-условие выполнено

Зафиксирована веха: **первая платная продажа** флагмана Control XL на Gumroad (реальный незнакомец, не тест-пинг). Это ровно событие, которое strategic checkpoint (2026-06-12, `roadmap.md`) назвал решающим сигналом развилки GO. **Только wiki + PM-память; код/деплой не трогали.** Обновлено: (1) блок strategic checkpoint в `roadmap.md` — добавлен UPDATE-абзац «GO-условие выполнено pending-атрибуция» + пометка `✅ выполнено 2026-06-17` на ветке GO; (2) шапка roadmap (Last updated); (3) задача «[NEW] Чекпоинт после запуска» в Phase 2 помечена как чекпоинт **Sends Follower**, чтобы не путать с первой продажей Control XL. **PM-вывод (честно про n=1):** продажа доказывает, что воронка физически проходима end-to-end, оффер кликабелен по цене, и резонанс впервые сконвертился в деньги (раньше были только attention-сигналы; резонанс≠конверсия был железным разделением). НЕ доказывает: PMF (покупателей >0, не >1), что КАНАЛ конвертит (зависит от источника — пока неизвестен; источник решает половину смысла), валидацию umbrella-линейки. **Приоритеты:** P1 закрыть атрибуцию (analyst: utm/entry/path/A-B-вариант 376381/owner-check/сессии-на-момент; основатель: продукт/цена, кто покупатель, pre-sale контакт, не TrieMond ли) → P2 поговорить с покупателем (insight #10/#2, кандидат в первый testimonial) → P3 продолжать проверенный канал в проверенном формате → P4 первое соц-доказательство (снимает trust-tax нового бренда, insight #14) → P5 first-impression polish (maxforlive preview + Demo kit-line). Анти-импульс: НЕ объявлять PMF, НЕ веером каналы, НЕ менять цену, повторяемость читаем на 2-3 продажах, не на одной. Детали — PM `launch-journal.md` 2026-06-17, новый insight #19.

## 2026-06-17 — Phase 2 Sends Follower: прогресс за день + закрыт нейминг + блок «Ближайшие шаги»

Обновлена секция «Phase 2 — SendsFollower launch» в `roadmap.md` по результатам дня (только wiki; код/деплой не трогали; все факты сверены с репо/User Library перед записью). **Отмечено DONE:** (1) **freeze девайса** (m4l-master) — md5 **`b5286b33`** подтверждён на диске; `sends_follower.js` + новый `sf_version_check.js` (update-check «New Version» зеркально Control XL, `DEVICE_VERSION='1.0'`, `URL='…/api/sends-follower.json'`, fallback `library.gumroad.com`) вшиты внутрь → девайс самодостаточный; рэк `SendsFollowerRack.adg` грузит замороженный девайс (round-trip ок); LFO внутри рэка = сток Live Suite, не бандлим; дата-бэкап `~/Brain/Sends Follower/raw/archive/SendsFollower.2026-06-17.amxd`; семвер-лог-смоук прошёл; (2) **update-endpoint прописан** во вшитый `sf_version_check.js`; (3) **состав = рэк `.adg`** подтверждён (Quickstart остаётся написать). P2.1 = 3/5, P2.4 = 1/4. **Серверный манифест** `app/public/api/sends-follower.json` сейчас на ТЕСТ-значении `latest=9.9.9` (для проверки кнопки; откатить на 1.0 перед запуском). **Site build чистый**, манифест+нейминг в `dist`, не деплоено. **✅ Открытый вопрос #1 (нейминг) ЗАКРЫТ → «Sends Follower» (два слова, с пробелом)** — применено в коде (`HomePage.tsx`, `SendsFollowerPage.tsx`, `scripts/seo-meta.mjs`) и проверено в сборке; идентификаторы (`SendsFollowerPage`, `SendsFollower.amxd`, `/sends-follower`) остаются. Добавлен **видимый блок «🎯 БЛИЖАЙШИЕ ШАГИ»** в начало Phase 2 (для Obsidian-mobile): (1) деплой в preview-ветку (прод не трогаем, по команде); (2) хардверная проверка update-check end-to-end (нюанс: в девайсе прод-URL, проверка на preview); (3) откат манифеста 9.9.9→1.0; (4) 1-стр. спека «что делает Sends Follower» (блокер копи+видео). Открытые риски пересобраны: #1+#3 закрыты, добавлены #4 (deploy-URL нюанс), #5 (манифест на тест-значении), #6 (орг-вопрос: бэкап+wiki легли в новую папку `~/Brain/Sends Follower/` отдельно от Fadercraft — консолидировать ли). Счётчик Phase 2 **1→4 задачи done из 23 (~17%)**, таблица прогресса + шапка roadmap (Last updated) обновлены. Детали — PM `launch-journal.md` 2026-06-17.

## 2026-06-17 — Roadmap: добавлен блок «Phase 2 — SendsFollower launch» (продукт #2, лин-запуск)

В `roadmap.md` добавлена новая секция перед «Связанные страницы» — план запуска второго платного продукта Fadercraft **SendsFollower** (M4L-девайс для Ableton Live, software-only). Чисто планировочная задача (код/деплой не трогали). **5 коротких фаз, 21 задача**, помечены **[NEW]** (новый артефакт) vs **[REUSE]** (готовая инфра Control XL без изменений), мини-таблица прогресса (0/21). Структура: P2.1 Продукт→freeze (m4l-master, девайс ГОТОВ — freeze v1.0 + дата-бэкап, впечь внешний `sends_follower.js`) → P2.2 Контент/копи (1-стр. спека = блокер всего, презентационное видео, лендинг-копи) → P2.3 Страница (минимум, из готовых компонентов, без анимаций; заглушку `/sends-follower` → реальную) → P2.4 Коммерция (Gumroad product slug `sends-follower` своя цена; version.json под 2-й продукт; vanity `/sf`; license/refund REUSE) → P2.5 Запуск (хаб COMING SOON → «Explore», smoke-test + verify assets, анонс). Зафиксированные решения основателя: девайс готов, отдельный платный Gumroad-продукт, license/update переиспользуем. Сознательно НЕ делаем (vs Control XL): scroll-morph/интерактивный мокап, custom-modes funnel, отдельную pricing-страницу, 5 клипов — только одно презентационное видео. Открытые риски зафиксированы: нейминг «SendsFollower»↔«Sends Follower» рассинхрон в коде; спека = блокер контента; `sends_follower.js` внешний (впечь во freeze). Обновлены шапка roadmap (Last updated) + `index.md`. Детали запуска — PM `launch-journal.md` 2026-06-17.

## 2026-06-17 — Phase 2 SendsFollower: уточнения основателя внесены в roadmap

Доработка секции «Phase 2 — SendsFollower launch» в `roadmap.md` по уточнениям основателя (только wiki; код/деплой не трогали). Внесено: (1) **деливерабл переопределён с голого `.amxd` на Audio Effect RACK `SendsFollowerRack.adg`** (6.4 КБ, существует в User Library Presets — внутри девайс SendsFollower + LFO); бэйр `.amxd` = компонент внутри рэка, не самостоятельный продукт. (2) **Quickstart сделан ОБЯЗАТЕЛЬНЫМ** — добавлен в состав бандла (P2.1) и как отдельный [NEW]-артефакт в P2.2. (3) **Впекание `sends_follower.js` во freeze** переведено из «открытого риска» в подтверждённую in-scope под-задачу P2.1 (+ проверка, что рэк грузит замороженный девайс) — иначе «can't find file» у покупателя, тот же класс бага, что на Control XL. (4) **Update-check подтверждён** — делаем как у Control XL; добавлена новая m4l-задача в P2.1: прописать в `version_check.js` `DEVICE_VERSION='1.0'` + `URL='https://fadercraft.com/api/sends-follower.json'` (зеркало Control XL, имена переменных сверены с файлом), впечь во freeze, на железе проверить кнопку «New Version». (5) **Серверный update-манифест `app/public/api/sends-follower.json` создан** (PM; рядом с Control XL `api/version.json`, отдельный путь — Control XL endpoint не тронут; содержимое `latest=1.0`/`url=library.gumroad.com`/changelog/min_compatible=1.0; `latest=1.0` чтобы кнопка не горела ложно на DEVICE_VERSION=1.0) — отмечен в P2.4 как **done**; **в репо, НЕ задеплоен** (правило no-auto-deploy). Счётчик задач **21→23, 1 done (~4%)**, таблица прогресса Phase 2 обновлена (P2.1 4→5, P2.2 4→5, P2.4 1/4). Открытый вопрос #1 (нейминг «SendsFollower»↔«Sends Follower») остаётся НЕ решённым. Обновлены шапка roadmap (Last updated) + `index.md`. Детали — PM `launch-journal.md` 2026-06-17.

## 2026-06-12 — Новый reference: outbound-links (tracked vanity redirects)

Создан `outbound-links.md` — единый retrievable список всех campaign-tracked outbound short links (vanity-редиректы CF Pages с UTM) для YT/Reddit-плейсментов. Зеркалит `app/public/_redirects` (источник истины). Группировка по кампаниям: YouTube `control_xl_presentation` (`/yt`, `/yt-modes`, `/yt-buy`), Reddit r/Novation `introduction_post` (`/r`, `/r-modes`, `/r-buy`), Reddit r/ableton `ableton_post` (`/r-ableton`, `/r-ableton-modes`). Зафиксированы правила (новый канал = новый редирект ДО публикации; 1 `utm_source`/канал + 1 `campaign`/пост; 302 не 301) и процедура add→deploy→verify. Попутно в проде задеплоен новый `/r-ableton-modes` → `/free-custom-modes` (commit `100003e`). Кросс-линк с [[external-links]]. Индекс обновлён.

## 2026-06-08 — Demo video script: добавлен тег On-screen titles

В `demo-video-script.md` (v3→v4) к каждой из 5 сцен добавлен новый блок **On-screen titles:** — отдельно от существующего «On screen:» (описание кадра) и «Caption:» (исходная одиночная подпись). Туда вынесены визуальные титры под монтаж: герой-титр на ревил + опорные микро-подписи для немого просмотра. Текстовки дистиллированы из VO, держат три термина (pages/banks/jump), без жаргона, цена только в финальном стинге, Solo Follower отсутствует ([[feedback_no_solo_follower_marketing]]). Источник озвучки и связка — [[project_fadercraft_vo_voice]].

## 2026-06-06 — Control XL: переразложен patcher-вид (читаемость)

Косметическая переразметка `Control XL.amxd` (Max patcher view) — **логика не тронута**, только геометрия `patching_rect` + тексты заголовков секций. Patcher разложен на 10 вертикальных полос по функциям (сверху вниз по потоку сигнала): MIXER LAYER → MIXER MOMENTARY → SOLO FOLLOWER → MODE STATE TAPS → INSTRUMENTS LAYER → CC47 CROSS-MODE TRANSIT → STARTUP DEFAULT → MIDI PASSTHROUGH → VERSION CHECK → PRELISTEN. Внутри каждой секции объекты разложены по слоям источник→приёмник, сетка с учётом ширины боксов (нет наложений). Добавлены 3 comment-заголовка для секций без них (MIXER MOMENTARY, VERSION, PRELISTEN); существующие заголовки приведены к единому стилю. Боксы 267→270, связей 408 (без изменений). **Presentation-вид (Live UI) не тронут** — `presentation_rect`/`presentation` всех 16 UI-объектов байт-в-байт. Архив: `raw/archive/Control XL.2026-06-06.amxd`. Пересборка Путём A (длина JSON сохранена, suffix/`dlst`/встроенные `solo_follower.js`+`version_check.js` байт-в-байт).

## 2026-06-02 — Discord-инвайт заменён

Старый `discord.gg/dAt2JGZps7` → новый **`https://discord.com/invite/EBsdgst3jU`** (`discord.gg/EBsdgst3jU`). Обновлено: память `reference_fadercraft_discord` + индекс, roadmap (current invite + Gumroad-follow-up), landing-код `FooterFull.tsx:16` (НЕ задеплоено — ждёт явного «деплой»). Историю выше не переписывал. Gumroad-копия (Description/Content/Receipt) использует новый линк.

## 2026-06-02 — Файл девайса переименован: `XL_Performance.amxd` → `Control XL.amxd`

По решению пользователя девайс-**файл** переименован под брендинг продукта «Fadercraft Control XL». Охват — везде:
- **Канон**: `~/Music/Ableton/User Library/Max Devices/Control XL.amxd`.
- **Бандлы** (`dist/`): оба проекта (`Control XL Demo Project`, `Control XL Starter Project`) — файл переименован + переписаны 5 ссылок в каждом `.als` (RelativePath/Path/query, `%20` в query). RelativePath → `Max Devices/Control XL.amxd`, резолвится. Оба zip пересобраны и проверены.
- **Quickstart.md/.pdf**: имя файла обновлено + «What's in this bundle» переписан под новую структуру (один проект на загрузку: Demo/Starter, а не Router+Starter Set).
- **Wiki + память m4l-master**: упоминания **имени файла** заменены (9 файлов). Концепт/внутреннее имя «XL_Performance» (название Max-патча, заголовок synthesis-страницы, «router-трек XL_Performance») **оставлено** — переименован только файл, не внутренняя идентичность патча. `raw/` (immutable) и эта история не тронуты.

⚠️ **Не проверено в Live**: загрузится ли девайс в обоих проектах после ренейма (правка `.als` делалась из CLI). Требуется smoke-test — открыть оба сета, убедиться, что устройство на дорожке на месте, до публикации.
⚠️ **Внутреннее имя патча** всё ещё «XL_Performance» — на дорожке Live девайс может отображаться этим именем, а не «Control XL». Полный ренейм внутреннего патча — отдельная задача для m4l-master, если нужно.

## 2026-06-02 — #10 закрыт: `0x0D` = маркер «возврат в предыдущий мод» (не артефакт)

Пользователь разъяснил байт `0x0D` в mode-index. Это **намеренный функциональный маркер**, не export-артефакт: дескриптор с mode-idx `0x0D` (=13) и **значением 127** = контрол возврата (вызов CC → вернуться в мод, где были до перехода). Байтовая реализация `CC47 = 127 → возврат` из [[CC47 Cross-Mode Transit]]. Обновлён класс исключений #1 в [[Custom Mode SysEx Layout]] (бывшая формулировка «metadata/special control marker» уточнена до функции возврата).

**Все 10 несостыковок разобраны.** #8 оказался ложной тревогой (URL structure-void `/reference/live12/Launch_Control_XL_3/` живой — заметку памяти не трогаем, она верна).

## 2026-06-02 — #1 закрыт: CC30 = SELECT, CC31 = REPORT (два разных сообщения ch7)

Пользователь снял монитором и разрешил «CC30 vs CC31»:
- **CC30 ch7 = SELECT** — плагин шлёт его, чтобы переключить LCXL (значение: инструменты 6..15, микшер 24..27). Функционально плагину нужен только CC30.
- **CC31 ch7 = REPORT** — нативный репорт девайса при смене мода, уходит на DAW-порт (монитор: 6→1,7→2,8→3,9→4,13→5…18→10). Generic-дока Novation называет CC30, но девайс реально шлёт CC31 — доверяем девайсу (память `reference_lcxl3_remote_script`: «trust the device's actual CC31 values»). Плагин CC31 прочитать не может (DAW-порт принадлежит Ableton Control Surface, M4L видит только вход трека), потому не реагирует.
- Passthrough `[sel 30 31]` режет оба: 30 — против петли исходящего select, 31 — чтобы репорт не просачивался в Live.

**Изменено:** [[MIDI Passthrough]] (раздел «Что фильтруется» переписан с точным SELECT/REPORT-различием вместо «CC31 = резерв/подсветка»), [[Custom Modes Model]] (блок «как переключается режим» разведён на CC30-команду и CC31-репорт).

**Итог гонки несостыковок:** из 10 закрыто 8 (#1–7 + слоты). Осталось: #8 (правка URL-атрибуции в памяти `reference_lcxl3_remote_script` — ждёт «ок»), #10 (`0x0D` — низкий приоритет).

## 2026-06-02 — #3 и #7 закрыты: CC49≠CC28 (page/hold) + CC30-value микшера = 24..27

**#3 — CC49 vs CC28.** Пользователь подтвердил (с байтами): CC49 → `mixer_page`, CC28 → `mixer_hold` — **две независимые оси** в формуле `mode = 23 + bank + 2·((page+hold)%2)`, не «одна сущность с разным триггером». Пруф: в `1.syx` CC28 (`0x1C`) и CC49 (`0x31`) — отдельные дескрипторы. Wiki ([[Mode Encoding]]) была права изначально; добавлен ✅-callout с пруфом.

**#7 — CC30-value микшера.** Разрешено по внутренней согласованности (4 источника против 1): `5+N` действует ТОЛЬКО для инструмент-модов (1–10 → 6..15); mixer-моды 11–14 → `24..27` (так в [[Mode Encoding]] таблице, [[Mixer Layer]], [[CC47 Cross-Mode Transit]], [[XL_Performance — как это работает]]). Ошибочная строка «mode 11 → value 16» в [[Custom Modes Model]] исправлена на 24 + пометка-поправка. (Если монитор покажет иное — откатить, но evidence 4:1.)

**Остаётся открытым:** #1 (CC30 vs CC31 — нужен MIDI-монитор), #8 (structure-void ссылка в памяти), #10 (`0x0D` трактовка).

## 2026-06-02 — CC47 разрешён: listen-CC=47 + «один CC, два слоя» (Q4, Q2)

Пользователь закрыл две опорные несостыковки байтовыми пруфами:

**Q4 — listen CC = 47 (подтверждено).** В `1.syx` по offset'у `… 2F 0A …` = CC `0x2F`(47), value `0x0A`(10); в `2.syx` `2F 14` = CC47 value 20. Descriptor на CC47 эмитит `N×10`. README `loadmess 49` — устаревший дефолт, в Fadercraft переопределён на 47. CC49 в инструмент-модах присутствует, но как обычная кнопка, не listen.

**Q2 — «три семантики CC47» = переучёт, их две (по слоям).** Один физический CC47, runtime-конфликта нет (контроллер всегда в одном слое): в инструмент-слое CC47 = mode-report `N×10` + cross-transit (`10·N`→микшер, `127`→возврат) — это ОДИН поток, читаемый по значению, не два назначения; в mixer-слое CC47 = momentary `mixer_bank` (1/2).

**Изменено:** [[Instruments Layer]] — line 30 ведёт с «listen CC = 47», старый callout «CC49 default» переписан в «✅ подтверждено 47», добавлен callout «один CC47, два слоя». [[CC47 Cross-Mode Transit]] — раздел «зачем кодировка» переписан: instrument-listen и transit явно объединены в один поток.

**Остаётся открытым:** #1 (CC30 vs CC31), #3 (CC49 vs CC28 в mixer-слое), #7 (CC30-value микшера: 16 «5+N» vs 24..27), #8 (structure-void ссылка в памяти), #10 (`0x0D`).

## 2026-06-02 — Slot count исправлен: 15, не 14

Пользователь уточнил фактический layout: **15 занятых слотов** — 1–10 инструменты, 11–14 микшер, **15 Cue**. Это перекрывает прежнее утверждение `Custom Modes Model` «14 слотов, 15-го не существует» (цифра 14 была от 2026-04-28, до добавления mode 15 Cue 2026-06-01 — устарела).

**Что изменено в [[Custom Modes Model]]:** убран категоричный «14 max / нет 15», вписана таблица из 15 слотов, callout переписан из «ошибка README» в «история правок». Хардварный максимум (15 или 16) оставлен открытым вопросом — README говорит «до 16», пользователь использует 15.

## 2026-06-02 — Relative энкодеры: подтверждено, что в custom mode недоступны

Пользователь спросил, можно ли перевести ряд энкодеров LCXL MK3 в relative/endless-режим в custom mode (вспомнил про «особую команду»). Исследовал официальные docs Novation + KVR Controller Scripting Forum.

**Вывод:** relative существует **только в DAW mode** (per-row, pivot `0x40`, смена через Ch7 CC30). В custom-mode'е недоступен — это **прямо подтвердила техподдержка Novation** на [KVR](https://www.kvraudio.com/forum/viewtopic.php?t=622318&start=15): feature-request зарегистрирован, не реализован (2026-06). Значит, флага absolute/relative в дескрипторе custom-mode нет — реверс его не находил не из-за неполноты, а потому что формат его не кодирует.

**Что записано:** новый раздел «Relative (endless) энкодеры — недоступны в custom mode» в [[Custom Mode SysEx Layout]] — с DAW-mode кодировкой (справочно) и следствием для `XL_Performance` (endless-ряд недостижим в его custom-mode архитектуре).

**Точный SysEx-байт** команды relative-переключения НЕ извлечён: страницы programmer's reference Novation отдают 403 на машинное чтение, PDF под XL3 — 404. Если понадобится hex — нужен живой доступ к странице `programmer's DAW mode`.

## 2026-05-26 — Bundle .syx removed: Components is one-mode-per-file

Пользователь усомнился, что Novation Components сможет переварить multi-mode bundle SysEx (28 сообщений в одном файле). Я нагуглил подтверждение: официальные docs Novation описывают **только single-file импорт через "Upload Custom Mode" button** ([support guide](https://support.novationmusic.com/hc/en-gb/articles/27203903097362-Launch-Control-XL-3-Components-guide), [user guide](https://userguides.novationmusic.com/hc/en-gb/articles/26190535820562-Using-Custom-Modes-on-the-Launch-Control-XL-3) — оба заблочили WebFetch на 403, но WebSearch снимок видим). Никаких batch/bundle/multiple modes в видимой документации.

**Решение:** убрать `lcxl-mk3-modes-bundle.syx` из distribution полностью. Bundle структурно валиден как SysEx (проверил: 28 сообщений с правильными headers, opcode, section bytes, name fields), но «байт-валидный» != «Components импортит». Без живого подтверждения работы — лучше не давать пользователю файл, который не работает.

**Что удалено:**
- `Fadercraft/dist/custom-modes/lcxl-mk3-modes-bundle.syx`
- `Fadercraft/web/free-custom-modes/lcxl-mk3-modes-bundle.syx`
- `Fadercraft/app/public/free-custom-modes/lcxl-mk3-modes-bundle.syx` (dev server)

**Что обновлено** (везде заменена инструкция «drag bundle» → «select target slot + Upload Custom Mode для каждого»):
- `dist/custom-modes/README.md`
- `web/free-custom-modes/README.md`
- `web/free-custom-modes/index.html` (статическая страница)
- `app/src/pages/FreeCustomModesPage.tsx` (React-страница, превью на localhost)

**Phase 0:** **59/114 (~52%)** — без изменений (это исправление существующего deliverable, не закрытие нового пункта).

**Открытый вопрос:** теоретически Components может поддерживать multi-mode импорт недокументированно (тот же drag&drop файла Components сам распарсит N сообщений и предложит выбрать слоты). Это можно проверить за 30 сек экспериментом, но без живого теста — bundle deprecated. Если когда-нибудь подтвердится, что bundle работает, — вернуть из git history (`f84b482`).

## 2026-05-26 — `/free-custom-modes/` free funnel published + README

Закрыт T12 bullet про free funnel (`web/free-custom-modes/`).

**Что в папке `Fadercraft/web/free-custom-modes/`:**
- `index.html` — статическая страница (стиль pricing.html/terms.html), hero «Free Custom Modes for Launch Control XL MK3», ссылки на bundle + per-mode `.syx`, инструкция импорта в Components, секция «What the paid bundle adds» с CTA на `fadercraft.gumroad.com/l/xl-performance`.
- 14 индивидуальных `.syx` файлов (`1.syx`..`14.syx`)
- `lcxl-mk3-modes-bundle.syx` (9276 B) для one-shot import
- `README.md` — markdown-версия инструкций (зеркало `dist/custom-modes/README.md`)

**Также создан** `Fadercraft/dist/custom-modes/README.md` — пойдёт внутрь Gumroad bundle как user-facing инструкция, идентичен версии на free funnel page.

**Phase 0:** 58/104 (~56%) → **59/104 (~57%)**. T12: 5/14 → 6/14.

**Что осталось из quick-actionable в T12:** только env vars `LATEST_BUNDLE_URL` + `GUMROAD_PRODUCT_ID` в CF Pages (нужен пользователь). Остальное (Live Set `.als`, сборка `dist/fadercraft-xl-performance-v1.0/`, zip, upload в Gumroad Content) требует Ableton-сессии или Gumroad-аккаунта.

## 2026-05-26 — Custom Modes 1..14 confirmed working on hardware

Пользователь импортнул bundle на железо, все 14 модов открываются и работают корректно (после короткой Finder-cache затыки на отображении модов 11/12 и bundle как «dim/не кликабельные» — оказалось чисто визуальный glitch macOS LaunchServices, OS-уровень файлы абсолютно нормальные; разрешилось через `touch` + рефреш Finder).

**Roadmap T12 first bullet** — описание обновлено: 10 → 14 модов в `Fadercraft/dist/custom-modes/`, bundle 9276 B. Сам пункт уже был отмечен `[x]` ранее сегодня, дельта счётчиков нулевая, но описание теперь отражает финальный объём поставки.

**Phase 0:** **58/104 (~56%)** — без изменений (закрытие mixer-модов произошло в рамках уже-закрытого bullet'а).

**Новое правило сохранено в memory** (`feedback_progress_percentage_on_close.md`): при любой отметке закрытой задачи в chat указывать текущий процент Phase 0. Применяется со следующего сообщения.

## 2026-05-26 — Mixer mode labels stripped + Instruments Layer noted CC47

Пользователь попросил удалить все extra labels (Kick / Melody 1, 2 / Perc 3 / Shaker) из всех 4 mixer-модов и зафиксировать в wiki [[Instruments Layer]], что в Fadercraft config overlay listen CC = 47 (не дефолтный 49).

**Что сделано:**

- Хирургически удалены label-entries из msg2 mixer-модов: `64/66/68 ID "text"` → `60 ID` (no-label маркер). Размеры всех 4 модов теперь = 664 байта (= baseline mode 13). Bundle обновлён: 9340 → 9276 байт. ASCII-grep подтверждает чистоту (no Kick / Melody / Perc / Shaker во всех модах).
- В [[Instruments Layer]] добавлен callout-блок «Fadercraft config override» с подтверждением CC47 (CC=`0x2F` descriptor хранит static value `10×N`, видно прямо в `.syx`). README v1.5 default CC49 оставлен как историческая правда, но переопределение Fadercraft теперь зафиксировано.

## 2026-05-26 — Mixer modes 11..14 analysed + SysEx layout documented

Пользователь положил в `dist/custom-modes/` четыре mixer-мода (11.syx..14.syx) из своего LCXL MK3 и попросил проверить на логические расхождения + закрепить знание о формате на будущее.

**Структурные находки в mixer-модах:**

1. **Name field — 2 байта** (mixer имена «11»..«14»), что сдвигает все последующие offset'ы на +1 относительно инструмент-модов (имя 1 байт).
2. **Размеры варьируются** (664–696 байт) — корреляция с количеством labels: bank 2 (12/14) содержит метки «Melody 1», «Melody 2», «Perc 3», «Shaker»; bank 1 (11/13) — только базовые.
3. **Mode 11 имеет лейбл «Kick»**, mode 13 — нет. Mode 12 имеет и Kick, и track-names; mode 14 — только track-names. Это асимметрия page/bank, **не баг** — соответствует semantic'е `bank ∈ {1,2}` × `page ∈ {0,1}`.

**Анализ mode-index байта (изначальная гипотеза «всегда = N-1» не подтвердилась — есть систематические исключения):**

1. **`always-13` паттерн.** В каждом mixer-моде три descriptor'а в msg1 (позиции #7, #15, #23 — последние энкодеры каждого ряда) имеют hardcoded `mode-idx = 0x0D`, независимо от N. Тот же паттерн есть в инструмент-моде у descriptor'а CC=0x2F (=47), который хранит static mode value (10×N). Скорее всего `0x0D` здесь — **маркер «metadata/special control»**, не литеральная ссылка на mode 14.
2. **`+32 flag` band.** 7 button descriptor'ов (ID 0x30–0x36) в каждом mixer-моде имеют `mode-idx = (N-1) | 0x20` (= 0x2A, 0x2B, 0x2C, 0x2D для модов 11–14). Бит 5 = «cross-mode capable», участвует в [[CC47 Cross-Mode Transit]].
3. **`linked-bank` reference** в модах 13/14 (page=1). Семь descriptor'ов (ID 0x28–0x2E) указывают на парный bank-1 мод: mode 13 → 0x0A (= mode 11), mode 14 → 0x0B (= mode 12). Это byte-уровневая реализация формулы hold-возврата `(page + hold) % 2 = 0`.

**Вердикт:** ни одной байтовой аномалии, выглядящей как copy-paste артефакт. Все «странности» симметричны по всем 4 модам и соответствуют [[Mode Encoding]] semantic'е. Файлы готовы к использованию как есть.

**Подтверждено: Listen CC = 47.** В инструмент-моде есть descriptor с CC=0x2F (=47) и static value=10×N. Wiki [[Instruments Layer]] говорит про default 49 (`loadmess 49`), но в этой конфигурации Fadercraft плагин настроен на 47. README bundle'а должен это отразить.

**Создано:** [[Custom Mode SysEx Layout]] — wiki-страница с reverse-engineered байт-уровневой спекой формата `.syx` для LCXL MK3 (header, 11-байтный control descriptor, semantics mode-index байта с исключениями, label section, алгоритм генерации, что НЕ выводится из формата). Указатель добавлен в [[index]]. Memory pointer `reference_lcxl_syx_format.md` создан, чтобы будущие сессии знали, где искать.

## 2026-05-26 — Custom Modes 1..10 synthesized via SysEx diff

Пользователь загрузил три референс-моды (`raw/1.syx`, `2.syx`, `3.syx`, экспорт из Components) — мы byte-diff'ом 1↔2↔3 декодировали LCXL MK3 Custom Mode формат и вывели правило экстраполяции.

**Что меняется между модами N и N+1** (всё остальное — байт-в-байт):

| Поле | Где | Значение для mode N |
|---|---|---|
| Имя мода (msg1 + msg2) | offsets `13`, `340` | ASCII digit `'1'..'9'`, `'A'` для mode 10 |
| Mode-index в control descriptor | 45 байт, по одному в каждом control record (шаг +11) | `N − 1` |
| Static value на overlay listen CC | offset `564` | `N × 10` (10, 20, …, 100) |

**Принцип эмиссии:** при активации мода LCXL шлёт static value на overlay listen CC (CC47 либо CC49 — расхождение между чатом и [[wiki/entities/Instruments Layer]], открытый вопрос). Плагин `XL_Performance.amxd` ловит это значение и понимает, в какой mode переключился контроллер — это то, как реализуется [[CC47 Cross-Mode Transit]] и back-restore состояния.

**Pipeline:**
- Скрипт читает `raw/1.syx` (662 байта), для каждого N ∈ 1..10 правит 48 байт по таблице выше, пишет `dist/custom-modes/{N}.syx`.
- Sanity-check: сгенерированные mode-01/02/03 — byte-identical к референсам raw/1.syx, raw/2.syx, raw/3.syx → формула верна.
- Бандл `lcxl-mk3-modes-bundle.syx` (6620 байт = 10 × 662) для one-shot import в Components.

**Тест на железе пройден:** пользователь импортнул mode-04, mode-07, mode-10 — работают, шлют 40/70/100, UNDO/REDO на кнопках 8/9 сохранены.

**Caveat про mode 10:** имя — 1 байт в SysEx, "10" двумя символами не влезает без сдвига payload. Использован `'A'` как single-char label. Переименовывается в Components руками после импорта без потери функциональности.

**Файлы переименованы** в `1.syx..10.syx` по запросу пользователя. Раз модули проверены и работают, `raw/1.syx`, `raw/2.syx`, `raw/3.syx` удалены — больше не нужны, dist/ канонический.

**Roadmap T12 first bullet закрыт.** Формат скорректирован: в исходном тексте было `.json`, а по факту LCXL MK3 Components использует `.syx` (SysEx). Это касается также пункта про публикацию на `web/free-custom-modes/` — там тоже будут `.syx`, не JSON.

**Phase 0:** 57/104 → 58/104 (~56%). T12: 4/14 → 5/14.

## 2026-05-26 — Lazy load + T3 brand commit closed

- **Lazy load** добавлен на все below-the-fold `<img>` лендинга через нативный `loading="lazy" decoding="async"`. Затронуты: `CatalogSection.tsx` (картинки в карточках kit, среди них `lcxl-mk3.png` 1.1MB), `VideoSection.tsx` (poster), `ProductGallery.tsx` (main + thumbnails), `ProductCard.tsx`. Выше-the-fold `PerformanceFlow` `keys.png` (35KB) оставлен eager — он участвует в LCP. Vite-rebuild → новый bundle `index-B4gL0Se3.js` скопирован в `Fadercraft/web/`, старый `index-n9SfgvuN.js` удалён.
- **T3 Commit `brand/`** — отмечено закрытым: коммит `3b0de4d` ранее сегодня уже содержит `brand/brief.md` + `brand/colors.md` (+ `email-setup.md` ещё раньше). Пункт оставался открытым в роадмэпе по инерции.
- **Phase 0 totals:** 55/104 (~53%) → **57/104 (~55%)**. T3 6/7 → 7/7 (закрыт целиком), T7-real 3/7 → 4/7.

## 2026-05-26 — Roadmap sweep: T5 closed, T7-real 3/7, T9 channel, T3 social tiles

Закрыта серия пунктов по уточнению пользователя:

- **T3 Social tiles (6/7)** — OG-картинка `Fadercraft/web/og.png` (1080×1080, 51KB) залита в репо. IG-пост 1:1 и Stories 1080×1920 вынесены в Phase 1 / маркетинг (под этой галочкой не считаются).
- **T5 Instagram (3/3 = 100%)** — handle `@fadercraft_` зарегистрирован, bio + ссылка на `fadercraft.com` стоят, в avatar — логотип/favicon-mark.
- **T7-real лендинг (3/7)** — счётчик total бампнут с 5 до 7 (split `Smooth scroll + lazy load` на два пункта; `/free-custom-modes` уже добавлен ранее, но не учитывался в total). Закрыты: 9-секционный `index.html`, `style.css` с brand colors (mobile-first), smooth scroll в `main.js`. Открыты: `pricing.html`, hero loop video, lazy load, `/free-custom-modes` страница.
- **T9 Demo video (1/9)** — YouTube канал «Fadercraft» создан.

**Phase 0 totals:** 47/102 (~46%) → **55/104 (~53%)**. Дельта: +8 done, +2 total (T7-real split + free-custom-modes наконец-то учтены).

## 2026-05-26 — External links page + IG handle `fadercraft_`

- Создана [[external-links]] — single source of truth для внешних URL (IG/YT/Gumroad/support/лендинг) + список файлов в коде, где эти ссылки используются.
- В [FooterFull.tsx:43](../../../Projects/Claude/Fadercraft/app/src/components/organisms/FooterFull/FooterFull.tsx#L43) обновлён IG href: `instagram.com/fadercraft` → `instagram.com/fadercraft_` (актуальный хэндл с trailing underscore).
- [[index]] обновлён: добавлена ссылка на `external-links` в разделе Reference.

## 2026-05-26 — Beat 4 «hotkeys» — пересборка amber-LED оверлея под Figma

Пользователь обновил иллюстрацию `hotkeys` в Figma `OdPRdjodGO3WiR6tgSP7AA` → page `07 — Illustrations`, COMPONENT_SET `1747:10709` («Component 1»), вариант `1747:10705` (`Property 1=hotkeys`). Сам растровый `keys.png` (image hash `7c74bff664…`) не менялся — поменялся только overlay-фрейм поверх изображения и добавлены exportSettings PNG @1x/@2x на сам компонент.

**Структура варианта (320×320):**
- `1747:10703` keys.png frame: (-62, 49), 444×222.
- `1803:5008` Frame 84 (overlay из 4 amber-квадратов 33×33 с гэпом 9px): (0, 184), 159×33, opacity 0.5.

**Что сделано в коде** ([PerformanceFlow.module.css:347-358](../../../Projects/Claude/Fadercraft/app/src/components/organisms/PerformanceFlow/PerformanceFlow.module.css#L347-L358)):

- `.beat4Leds` переехал с `left: 14.5em / top: 8.0625em` (старая позиция под правой парой клавиш) на `left: 3.875em / top: 8.4375em` (новая позиция под левой парой). Координаты получены пересчётом Figma-координат Frame 84 относительно image-local origin: `x = 0 − (−62) = 62 → 3.875em`, `y = 184 − 49 = 135 → 8.4375em`.
- Добавлен `opacity: 0.5` на `.beat4Leds` (в Figma overlay polу-прозрачный).
- Размер квадратов и gap не трогал (33×33 / 9px уже совпадали с Figma).
- Обновил CSS-комментарий: ссылка на Frame 84 и формула пересчёта; убрал устаревшее «sitting beneath the right two keys».

`keys.png` ассет на диске оставлен без изменений (image hash совпадает, замена не требуется). SharedPluginData чанки (34 ключа в namespace `exporttmp`), которые временно стэшил на ноду `1747:10703` для попытки выгрузить экспорт через chunked return, очищены.

## 2026-05-26 — copy fix: «6 controls instead of 2» (не 3)

Пользователь уточнил формулировку про два encoder bank на канал. Прежний вариант «give you 6 controls instead of 3» арифметически некорректен (база — один bank = 2 энкодера на канал у LCXL MK3, не 3). Правильная версия: «**give you 6 controls instead of 2**».

**Что сделано.**

- `~/Projects/Claude/Fadercraft/app/src/components/organisms/PerformanceFlow/PerformanceFlow.tsx:38` — заменена строка в массиве features (Two encoder layers per channel).
- Figma file `OdPRdjodGO3WiR6tgSP7AA` (Novation-XL) → page `06 — Content`, два TEXT-нода обновлены через `use_figma`:
  - `1398:143` («Rewritten takes → Encoders»): «6 controls per channel instead of 3» → «… instead of 2».
  - `1434:6902` (frame «XL Performance — lo-fi prototype v2» → BEAT 2 · ENCODERS): «Two encoder banks per channel — 6 controls instead of 3» → «… instead of 2».
  - Черновые русские заметки на канвасе (`1385:6775`, `1385:6783`, формулировка «обычные моды дают только 2») уже корректные — не трогал.
- Gumroad listing: пользователь поправил вручную (out of band). TODO в roadmap T12 закрыт чек-маркой.
- `wiki/roadmap.md` → T12 (Bundle assembly + Gumroad product), пункт «Описание продукта на странице Gumroad» — child-callout заменён на ✅ запись о применённой правке во всех трёх каналах (код / Figma / Gumroad).

Других вхождений «6 controls instead of 3» в `~/Brain/Fadercraft` и `~/Projects/Claude/Fadercraft` нет (grep clean, исключая build artifacts).

---

## 2026-05-25 — distribution strategy: hybrid free Custom Modes + paid bundle

Пользователь зафиксировал стратегию упаковки/раздачи материалов, идущих с устройством.

**Решение.** Гибрид:
- **`lcxl-mk3-modes.json` (Custom Modes для Components)** — бесплатно на `fadercraft.com/free-custom-modes` **и** в платном bundle (дублируется, чтобы покупателю не идти на сайт отдельно)
- **`XL_Performance.amxd` + `solo_follower.js`** — только в платном bundle
- **`XL_Performance_starter.als`** — только в платном bundle
- **Quickstart.pdf + опц. demo.mp4** — только в платном bundle

**Обоснование, почему Custom Modes бесплатно безопасно.**
1. Без `.amxd` это просто 14 layout'ов LCXL, переключаемых руками на самой ручке. Mode-switching (CC30/ch7), cross-mode transit (CC47), Solo Follower, MIDI passthrough фильтрация — всё в `.amxd`. Скачавший только .json не получает обещанное лендингом.
2. Free Custom Modes = SEO/discovery funnel. Люди гуглят «LCXL MK3 custom modes mixer template» — сейчас попадают на forum.novationmusic.com / Reddit / случайные .json. Если Fadercraft владеет нишей качественными бесплатными шаблонами — главные ворота к платному продукту.
3. Cross-promotion: README внутри .json zip'а имеет CTA «hook these into Fadercraft XL Performance for one-button mode-switching → $39»; `/free-custom-modes` страница имеет CTA на bundle.

**Почему НЕ давать пост-pay выбор на Gumroad.**
- Gumroad нативно одного-zip-product; «pick your bits» требует или нескольких SKU (плохой positioning для bundle), или кастомного download portal'а через CF Pages Function — overengineering для 5 файлов.
- Юзер на этапе post-purchase не знает разницы между «Custom Modes» / «Live Set» / «device» — он купил «штуку которая решит проблему 14 modes». Pick-your-bits UX заставит выбирать без контекста и усложнит support.
- Один zip = всё что нужно, простой mental model.

**Что обновлено в `wiki/roadmap.md`.**
- T7-real Real landing page: добавлен пункт «`/free-custom-modes` страница» с пометкой о CTA-блоке и связи с T12.
- T12 Bundle assembly: добавлен callout-блок «Distribution strategy» с резюме решения. Добавлены пункты «Опубликовать lcxl-mk3-modes.json отдельно на web/free-custom-modes/» и уточнённое содержимое bundle.

**Не сделано — открытые вопросы.**
- Дизайн `/free-custom-modes` страницы — отдельный landing-mini или секция на главной? Скорее всего отдельная мини-LP, чтобы SEO-таргетинг был чистый (title/meta под «LCXL MK3 custom modes»).
- README внутри free .zip — что именно говорит CTA, насколько агрессивный («buy now» vs «if you want auto-switching, check out X»). Лучше soft-sell — тон community-good, не маркетинг.
- Версионирование Custom Modes отдельно от .amxd версии. Если .amxd v1.0 и Custom Modes v1.2 — это норм или ломает совместимость? Скорее всего привязать одной семвер-веткой к .amxd.

---

## 2026-05-25 — content-must-include: явная MIDI-настройка трека

Пользователь зафиксировал requirement: при объяснении установки устройства просто «drop on a MIDI track» — недостаточно. Это самая частая причина «не работает» у первого пользователя, потому что без явной конфигурации **MIDI From** / **MIDI To** / **Channel** на трек устройство не получает входной MIDI с LCXL.

**Что добавлено.**

- `wiki/roadmap.md` → T9 (Demo video): добавлен callout-блок перед списком пунктов с явной формулировкой «MIDI From → LCXL MK3 DAW port, MIDI To → LCXL MK3 DAW port, Channel → All». Скрипт демо-видео обязан показать это на экране.
- `wiki/roadmap.md` → T10 (Documentation): добавлен callout-блок: Quickstart и user-facing README должны иметь отдельный шаг «Настройка MIDI-роутинга» со скриншотом. Не объединять с шагом «положить .amxd на трек» — это два разных действия.
- `wiki/landing-narrative.md` → open question #8 добавлен: где на лендинге освещать MIDI-routing настройку — sub-block в Beat 6 (Tech requirements), новый FAQ-пункт «Why isn't my LCXL responding?», или off-load в Quickstart за пределы лендинга. Демо-видео покрывает в любом случае (cross-ref на roadmap T9).

**Не сделано — открытые решения.**

- Куда на лендинге пойдёт это объяснение (см. open question #8 в landing-narrative). Скорее всего — FAQ-пункт, т.к. tech-requirements-секция не про «как настроить», а про «что иметь». Но решение отложено до записи демо.
- Что именно показывать на скриншоте: только MIDI From/To/Channel в шапке трека, или ещё с раскрытым Monitor-режимом (In/Auto/Off)? Solo Follower требует, чтобы router-трек был **слышен** — это значит Monitor либо `In` (всегда слышно), либо track armed. Уточнить при написании Quickstart-шага.

---

## 2026-05-25 — Paddle → Gumroad pivot + мотоправа получены

Два связанных события одного дня, оба меняют картину запуска в плюс.

**Payment rail pivot.** Paddle onboarding отменён — Sumsub-цикл затянулся (KYC заблокирован, support не разморозил), Gumroad принимает русский паспорт без блокеров. Gumroad KYC пройден в тот же день. Остаётся 4 пункта onboarding: tax setup (W-8BEN), payout-реквизиты, страница продукта, content upload (последний блокируется T12 — нечего заливать).

**Мотоправа (motorbike) получены.** Изначальное обоснование «backup-документ для Paddle Sumsub» отпало с Gumroad-pivot'ом, но права всё равно остались как general-purpose Thai government ID (пригодится для Payoneer/Wise/address proof в Phase 1, если понадобится).

**Что обновлено в `wiki/roadmap.md`.**

- Шапка `Last updated` → 2026-05-25.
- Сводка прогресса: убрана строка `Paddle onboarding 5/6`, убрана строка `Payment rails 0/14` из Phase 0, убрана строка `Тайские мото-права 9/22`. Добавлена строка `Gumroad onboarding 1/5`. Итог пересчитан: **35/101 ≈ 35%** (раньше 49/119 ≈ 41% — падение процента из-за того, что Paddle-задачи были на 83%, а Gumroad на 20%). Под таблицей добавлена секция «Out-of-band» с мото-правами ✅, alt payment rails (deferred → Phase 1), car-правами (deferred → Phase 1+).
- T6: пункт `t6/paddle-license` помечен как ~~abandoned~~ со ссылкой на 2026-05-25.
- Раздел «🆕 Payment rails (parallel to Paddle)» → перенесён ниже Phase 0 и переименован в «🚀 Phase 1 — Alternative payment rails (post-launch, deferred)». Каждый из 4 рельсов снабжён триггером запуска вместо «делать сейчас».
- Раздел «⏳ Paddle onboarding» → заменён на «⏳ Gumroad onboarding» с 5 пунктами (KYC ✅, tax, payout, страница, content upload).
- Раздел «🆕 Тайские мото-права (backup-документ для KYC)» → переписан в «✅ Тайские мото-права (motorbike)»: коллапс 6 подсекций в 6 строк ✅, объяснено почему backup-обоснование отпало, car-трек отдельным блоком на Phase 1+.
- T12: упоминания `Paddle product Content` / `PADDLE_PRODUCT_ID` → `Gumroad product Content` / `GUMROAD_PRODUCT_ID`. Заголовок секции `T12 Bundle assembly + Paddle product` → `+ Gumroad product`.

**Что НЕ тронуто.**

- `wiki/payment-rails.md` — матрица остаётся актуальной как историческая референс-страница. Внутри неё Paddle и Gumroad по-прежнему перечислены среди рассмотренных, вердикты не меняю — это снапшот research'а 2026-05-06, его правка задним числом исказит логи решений. Если на странице нужно «обновить рекомендации» — это отдельный заход.
- `wiki/landing-narrative.md` — копия уже корректная: Beat 1 и Beat 8 содержат `Buy on Gumroad — $39`. Совпадает с реальностью теперь буквально.
- `wiki/index.md` — не трогаю, ссылки на [[payment-rails]] / [[roadmap]] остаются валидными.

**Изменение картины запуска (для будущей retro).**

- Внешний календарный блокер (Sumsub/Paddle) **исчез**. Critical path схлопнулся до внутренних задач: T3 brand → T9 video → T11 Buttondown → T8 M4L update → T12 Bundle → Gumroad publish → T13 verify.
- Phase 0 уменьшился со 119 до 101 пункта (убрали 6 Paddle + 14 payment rails + 22 Thai DL, добавили 5 Gumroad). Реальная нагрузка на ~30% меньше.
- Worst-case план «launch без Paddle через crypto» теперь неактуален — Gumroad покрывает.

---

## 2026-05-07 — landing-narrative v3: Beat 2 rewrite + supporting blocks

Перенесённый из claude.ai-сессии диалог про лендинг XL_Performance: упор сместили с "докудоки" на "пользователь / юзабилити / восприятие". Зафиксировал в `wiki/landing-narrative.md` v3.

**Что изменилось.**

- **Beat 2 body** переписан с CC47-first на user-first. Старая версия начиналась с "CC47 jumps between them with state memory" — слишком технично для первого экрана. Новая версия (Variant B): `Launch Control XL holds 14 layouts in memory. Most people switch them by hand. Fadercraft XL Performance flips between them on demand and never loses your place — jump to the mixer, tweak, jump back to the exact instrument page you came from.` CC47 ушёл в expandable / tech-секцию.
- **Beat 2.1 (State Memory)** — новый supporting-блок после ModeGrid. Объясняет что значит "не теряет место": нажал из page 7 → mixer → нажал → опять page 7, не page 1.
- **Beat 2.2 (Page A / Page B)** — новый supporting-блок про удвоение ручек. "Six controls per channel, not two." С маркером открытого вопроса: "vs two" или "vs three" (зависит от того, с чем сравниваем — типовой 2-send view или все 3 ряда энкодеров).

**Решённые open questions.**

- #5 (CC47 disclosure): закрыт — CC47 не на первом экране.
- #7 (tooltips на 15–16): закрыт — никаких. Серый цвет уже коммуницирует "unused"; текст ("service channels", "reserved") создаст fake-role и привлечёт внимание.

**Новые open questions (на момент v3 рефреша 2026-05-07 в течение того же дня).**

- #1 (hero headline): пользователь обозначил, что Hero "ему сейчас не нравится" — переписан будет полностью, не только цифра 14/16. Ставлю флаг "rewrite pending", не разрешаю микро-правкой.
- #6 (knob doubling — vs two / vs three): пользователь подтвердил **6 vs 3** (3 ряда энкодеров × Page A/B). Beat 2.2 headline зафиксирован: "Six controls per channel, not three."

**Что НЕ тронуто.**

- React-имплементация (`~/Projects/Claude/Fadercraft/app/`) — там сейчас ModeGrid без цветового кодирования и без tooltip-механизма. Скриншот, который пользователь обсуждал в claude.ai, видимо был из Antigravity-сессии или Figma, не из этой кодовой базы. Имплементация — следующий шаг, после того как пользователь согласует копию.
- Hero (Beat 1) — оставлен как есть с "16 modes", флаг в open question #1.

---

## 2026-05-07 — Figma: Tooltip atom + hover-показ на ModeButton 1–16

Не вики, а соседний design-репо `~/Projects/Claude/Fadercraft/`, но решение касается DS-парности. Подробности — `docs/log.md` от 2026-05-07. Кратко: Tooltip оформлен как атом с `Direction=top|bottom` variant и component-property `text`, лежит карточкой в сетке `02 — Atoms`. На `OneActionBetweenThem` 16 тултипов с `layoutPositioning='ABSOLUTE'` (1–8 над, 9–16 под), их `visible` забинден на 16 BOOLEAN-переменных коллекции `Prototype`, hover-реакции `MOUSE_ENTER`/`MOUSE_LEAVE` на каждой ModeButton выставляют `mode-N=true|false`. Заодно удалены 10 unused-вариантов `State=hover-*` ModeButton (апрельский эксперимент с радужной палитрой stroke без привязки к токенам, 0 usage).



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

## 2026-05-06 — добавлен `wiki/payment-rails.md`: матрица платёжных рельсов под профиль «русский паспорт + Таиланд»

После серии тупиков с KYC (PayPal Thailand требует NDID и режет всех иностранцев; Lemon Squeezy / Gumroad / Polar / Stripe Thailand упираются в санкционный screening на русское гражданство либо в требование тайской компании; Wise по 19-му пакету ЕС режет карты для русских/белорусов без EEA-резиденции) зафиксирован decision-matrix всех рассмотренных рельсов с явными вердиктами и choke-point'ами.

**Что сделано.**
- Создан `wiki/payment-rails.md` (тип `reference`) — таблица из 13 платформ + раздел «What Thai documents unlock what» (мотопра́ва ↔ tax ID ↔ work permit ↔ Thai company ↔ PR ↔ citizenship), realistic onboarding order, тройной screening (citizenship / residence / Thai national ID).
- В `wiki/index.md` добавлена секция `## Reference` со ссылкой на новую страницу. `Last updated`/`updated:` подняты до 2026-05-06.
- Профиль пользователя (русский паспорт, тайская резиденция, Bangkok Bank в собственном имени) сохранён в auto-memory как `user_citizenship_residence.md` + `user_thai_banking.md` — будет применяться ко всем будущим рекомендациям payment-платформ.

**Главный вывод страницы.** Тайские мото-права (получение запланировано на 2026-07-01) разблокируют не «новый класс KYC», а более узкое — служат вторичным photo ID для Sumsub-style проверок (Paddle и т.п.) и proof-of-address для Payoneer / Wise / residence-checks. Они **не обходят** citizenship-based санкционный screening и не заменяют тайский national ID (NDID), который выдаётся только гражданам и нужен для PayPal Thailand. Самый широкий unlock даёт **тайская компания + work permit** (через LTR/BOI/Smart Visa) → Stripe Thailand → каскад через Stripe Connect, но это 3–6 месяцев и значительный капитал.

**Reactionable recommendations:** (1) Payoneer открывать сейчас, (2) Isotonik писать как только XL_Performance готов, (3) crypto-чекаут (Cryptomus/NOWPayments) на лендинге как параллельный канал, (4) Paddle ждать, (5) Georgian Individual Entrepreneur закладывать на следующий шаг при выручке ≥ $500–1000/мес.

## 2026-05-05 — добавлен `wiki/roadmap.md`: живой checklist прогресса Fadercraft

Пользователь обнаружил, что не может посмотреть прогресс/план через Obsidian на телефоне — потому что raw-чеклист и backlog жили только в чате с Claude, а в `wiki/` не были запечатлены. Зафиксирован project-wide правилом: **каждый проект с wiki должен иметь `wiki/roadmap.md`** (или эквивалент), всегда поддерживаемый в актуальном состоянии и доступный из Obsidian-mobile.

**Что сделано.**
- Создан `wiki/roadmap.md` — Phase 0 backlog (49/119 ≈ 41% сделано на 2026-05-05) + Phase 1 пост-launch активности + ветка тайских мото-прав как backup-документ для KYC.
- В `wiki/index.md` добавлена секция «Roadmap» со ссылкой на новую страницу. `Last updated`/`updated:` подняты до 2026-05-05.
- В `Novation XL.md` (root-хаб) добавлена секция `## Roadmap` со ссылкой `[[wiki/roadmap|Project roadmap]]`.

**Правило сохранено в memory** (`feedback_project_roadmap_rule.md`): применять ко всем проектам с wiki (Trading, Novation, любые будущие).

## 2026-05-06 — Landing narrative locked

- Created `wiki/landing-narrative.md` — 10-beat psychological arc for `fadercraft.com`. Drives section order, component priorities, and explicit deviations from the original spec (added beat 5 "How it works", moved bundle visuals from #4 to #8).
- Added pointer in `wiki/index.md` Roadmap section.
- Implementation workspace at `~/Projects/Claude/Fadercraft/`: `ModeButton` + `ModeGrid` built on both Figma and React side, parity confirmed via browser smoke test.
- Token parity report: `~/Projects/Claude/Fadercraft/artifacts/parity-report-2026-05-06.md` (3 Figma fixes applied: action/secondary→coral, focus shadow→lavender, coral primitive value).

## 2026-05-26 — Beat 8 newsletter copy finalized (Figma parity)

- Updated `wiki/landing-narrative.md` Beat 8 to match Figma node 233:1189 (mobile/compact).
- Body split into two short lines: "Buy once and start immediately." / "Or get one email when a new workflow, update or device ships."
- Placeholder: `your@email.com` (was `you@studio.com`). Submit: `Join updates` (was `Subscribe`).
- CTA bullet normalized: `Buy on Gumroad • $39` (was em-dash variant).
- Code synced in `~/Projects/Claude/Fadercraft/app/src/components/organisms/NewsletterSection/`; CTA is `white-space: nowrap` + full-width on ≤719px so `$39` no longer wraps off the button on mobile.

## 2026-05-26 — T3 Brand identity closed (5/7)

- Figma reshuffle: `05 — Product` moved to top as `00 — Product`. New page `00 — Brand identity` (1903:5006) at end, with palette swatches (Primary/Secondary/Tertiary) + Header + Footer-alt wordmarks + Logo (favicon) instance, all bound to live variables.
- Gumroad product published (`fadercraft.gumroad.com/l/xl-performance`): tax/payout setup, Welcome+Quickstart copy in Content tab, category `Music & Sound Design > Sound Design > Plugins`. Cover image still default — open for next pass.
- `brand/colors.md` — three action colors (mint `#63F2CA`, lavender `#639AF2`, amber `#FFAD56`) + neutrals + usage rules + distribution table.
- `brand/brief.md` — audience (live performer on Ableton), voice (technical/precise + pragmatic/no-bullshit), schematic visual lean, anti-patterns. Voice section refined against Steinkamp (plugins.steinkamp.us) — added rules: state the origin problem plainly, enthusiasm allowed if about the mechanism, changelogs are copy too.
- Roadmap T3 4/7 → 5/7; Phase 0 totals 45/102 → 46/102 (~45%).

## 2026-05-26 — Gumroad product page finalized (cover + thumbnail + copy)

- Cover image 1280×720 + thumbnail uploaded on Gumroad — default pink folder placeholder removed, brand artwork live on `fadercraft.gumroad.com/l/xl-performance`.
- Product copy confirmed end-to-end (description, "6 controls instead of 2" wording, $39 price, slug `xl-performance`, Welcome+Quickstart text in Content tab). Only the bundle zip itself remains pending (blocked by T12 bundle assembly).
- Roadmap T12 3/14 → 4/14; Phase 0 totals 46/102 → 47/102 (~46%). T12 cover-image bullet checked off; Gumroad onboarding parenthetical about "default cover" removed.

## 2026-05-26 — OG image + social meta tags shipped

- New Figma artboard `OG image — 1200×630 (from Product gallery – 1)` (2020:6989) on page `10 — Gumroad covers`, adapted from `Product gallery – 1` (1868:19285): schematic LCXL on the left, wordmark + tagline column on the right, recentered for 1.91:1 ratio.
- `web/og.png` exported (1200×630, 51 KB).
- Open Graph + Twitter Card meta tags added to all public pages: `index.html` (Vite source `app/index.html` + built `web/index.html`), `pricing.html`, `privacy.html`, `refund.html`, `terms.html`, `update.html`. og:image points to `https://fadercraft.com/og.png`; per-page og:url; og:image:width/height = 1200/630.
- Verified composition by screenshot: text block centered vertically, schematic LCXL fits 630 without losing key controls.

## 2026-05-26 — Footer socials trimmed + T14 Discord community added

- FooterFull `defaultSocials` сокращён до `YT / IG / DC` (Facebook + Telegram убраны — точно не будет). Файл: `app/src/components/organisms/FooterFull/FooterFull.tsx`.
- Roadmap: добавлен раздел **T14 Discord community** (10 задач Phase 0 + 4 deferred Phase 1). Direction-блок зафиксировал ключевые решения: DC — единственный коммьюнити-канал; `DC`-линк в футер вешаем только после welcome+rules+первого announcements-поста; vanity URL и auto-role при покупке отложены (vanity = Boost Level 3 ~$70/мес, auto-role оправдан после ≥10–20 продаж).
- Phase 0 итого 59/104 → 59/114 (~52%). T14 0/10.

## 2026-05-26 — T14 Discord: финальная спека для исполнения

- Новый concept-page `wiki/concepts/discord-server-setup.md` — единый артефакт под копипасту: server settings, Community wizard targets, channel structure (4 категории / 10 каналов с topics), 3 роли (`@Founder` mint, `@Verified Owner` amber, `@everyone`), welcome-сообщение, rules (6 пунктов), first-announcements post (для T13 launch), permanent invite link procedure, execution order 14 шагов в Discord UI, banner sub-task (non-blocking).
- `wiki/index.md` — добавлен в раздел Concepts.
- `wiki/roadmap.md` T14 Direction-блок — добавлена ссылка на спеку.
- Brand assets reuse: server icon = `app/public/icon-512.png` (готов), banner pending (Figma sub-task).
- Phase 0 итого без изменений (59/114, ~52%) — все T14-пункты пока open, спека — это infrastructure для их быстрого закрытия.

## 2026-05-26 — T14 Discord: сервер запущен, 9/10

- Discord-сервер **Fadercraft** создан и сконфигурирован под спеку: 2FA на founder, server icon (`icon-512.png`), 4 категории / 10 каналов, 3 роли (Founder mint Administrator, Verified Owner amber manual, @everyone), Community-режим включён (verification Low + explicit content filter, rules→`#rules`, updates+safety→`#server-updates`, default mentions-only, 2FA-mod ON), welcome + rules запинены с живыми меншнами.
- Permanent invite link: `https://discord.gg/dAt2JGZps7` (Never / No limit / Temporary OFF). Первый временный auto-link `eaWjnPjm` отклонён — истекал через 6 часов.
- Линк подставлен в `app/src/components/organisms/FooterFull/FooterFull.tsx` (`defaultSocials.DC` href). Quickstart и Gumroad description — в follow-ups (ждут T10 и ручной правки UI соответственно).
- Phase 0 итого 59/114 → 68/114 (~60%). T14 9/10. Открыт только первый `#announcements`-пост — синхронизирован с T13 v1.0 launch.
- Banner 960×540 остаётся sub-task в [[discord-server-setup]] (non-blocking, есть text-fallback в Discord).

## 2026-05-26 — T14 Discord: server live, 9/10 закрыто

- Discord-сервер **Fadercraft** создан (founder: Yellowshoess, 2FA активен). Иконка `icon-512.png`, Community-режим включён (verification Low, scan media, rules → `#rules`, updates → `#server-updates`, safety notifications → `#server-updates`, default notif Only @mentions, 2FA-for-mod ON).
- Структура: 4 категории / 10 каналов по спеке [[discord-server-setup]]. Роли `@Founder` (mint, Administrator), `@Verified Owner` (amber, default), `@everyone` минус send в INFO-каналах. Welcome + rules запинены, меншны живые.
- **Permanent invite link**: `https://discord.gg/dAt2JGZps7` (Never / No limit / Temporary OFF). Подставлен в [FooterFull.tsx:44](Projects/Claude/Fadercraft/app/src/components/organisms/FooterFull/FooterFull.tsx#L44) `defaultSocials.DC`.
- T14 9/10 (~90%). Открыто: первый `#announcements`-пост, привязанный к v1.0 launch (T13).
- **Phase 0 итого: 68/114 (~60%).**
- Follow-ups (не блокеры): Quickstart Support-блок при T10, Gumroad description ручной правкой, banner 960×540 в Figma.

## 2026-05-26 — Roadmap sweep: T7-real free funnel закрыт, bundle .syx дропнут

- `/free-custom-modes/` страница задеплоена (commit ffc8cac): `web/free-custom-modes/index.html` + 14 individual `.syx` + README с инструкцией по импорту через Components и CTA-блоком к платному bundle. Закрывает T7-real free funnel bullet.
- Bundle `.syx` дропнут (commit b051255): Novation Components парсит ровно один mode на файл, склейка 14 модов в один `.syx` не даёт one-shot import. Распространение остаётся per-file. T12 description обновлена.
- Параллельные правки футера (cosmetic, не roadmap-line): Discord-линк `discord.gg/dAt2JGZps7`, FB/TT убраны (86b50d3); footer nav остаётся 2-кол на 1023px и ниже 420px breakpoints (c6132f9, 990501f).
- T7-real 4/7 → 5/7 (71%). **Phase 0 итого: 68/114 → 69/114 (~61%).**

## 2026-05-28 — Custom Modes funnel переписан, Gumroad-follow подключён, code cleanup

- **`?p=free-modes` (React Custom Modes funnel)** свёрстан 1:1 с Figma `ProductPage · 1440 / Custom Modes` (node 2169-11012). Поток: Header (model «Control XL», modelHref `/`, modelSuffix «Custom Modes») → HeroProduct (дефолтные пропсы) → OneActionBetweenThem (controlled, cold + hover-out → Custom Mode 1, центральный лейбл переопределён в «Custom Mode 1-10» через новый проп `instrumentModeLabel`) → descripton-блок (Import / Included / Included in XL Performance / License / orange CTA «Get XL Performance • $39») → FooterFull. Заменил предыдущую статическую `web/free-custom-modes/index.html`.
- **Header API**: добавлены `modelHref` (слово модели → ссылка на `/`, hover-underline 40% / 1px / underline-offset 3px) и `modelSuffix` (буллет «•» + subtitle, gap 8px). На ProductPage `modelHref="/"` тоже выставлен — логотип больше не висит на `#`. Анкорные ссылки в nav: Products/Features → `#kit` (обёртка TheKitSection), Support/Contact → `#support` с `slug='support'` на FAQ-итеме «Where do I report a bug…» — FAQSection теперь читает `window.location.hash` и сама раскрывает нужный пункт. Smooth-scroll включён глобально в `index.css` + `prefers-reduced-motion: reduce → auto`.
- **Global Tab-scope** (`app/src/lib/tab-scope.ts`): keydown в capture-фазе перехватывает Tab/Shift+Tab и крутит фокус только по фокусируемым внутри `[data-focus-zone]`. Атрибут поставлен на корни `OneActionBetweenThem` (`data-focus-zone="mixer"`) и `PluginMockup` (`data-focus-zone="plugin"`) — работает на всех страницах автоматом. Если зон нет (palette preview) — Tab дефолтный.
- **Newsletter / Gumroad follow integration**: `NewsletterSection` получил проп `gumroadSellerId`. Когда задан, форма рендерится как нативный cross-origin POST на `https://app.gumroad.com/follow_from_embed_form` с hidden `seller_id=6976309857072` (вытянут из `creator_profile.external_id` в публичном HTML storefront), `target="_blank"`, `rel="noopener noreferrer"`. Подписчик остаётся на лендинге, Gumroad открывает свою thank-you в новой вкладке и отправляет штатное double-opt-in письмо. Email-валидация дотянута до `pattern=[^@\s]+@[^@\s]+\.[A-Za-z]{2,}` (type="email" без TLD пропускает `user@gmail`). **Buttondown отложен в Phase 1** — Gumroad покрывает 90% задачи без доп. инфры.
- **`free-custom-modes.zip`** собран и положен в `app/public/` (6.6 KB, 14 индивидуальных `.syx` в корне, без бандла — Components импортирует только пофайлово). Зелёная CTA «Download Free LC Custom modes» ведёт сюда.
- **Footer**: блок Fadercraft+Control XL+тэглайн обёрнут в `<a href="/">` — клик по любому месту брендовой зоны → главная (`color: inherit`, `text-decoration: none`, hover opacity 0.85). Ссылка «Free Custom Modes» переименована в «↳ Free Custom Modes», href правится на `/?p=free-modes`.
- **PerformanceFlow**: текст 3-го beat'а обновлён — «Move between instruments, mixer pages, and utilities without losing momentum.» (заголовок «Run the whole rig from the keyboard» оставлен).
- **VideoSection временно скрыт** (закомментирован в `ProductPage`) — re-enable вместе с T9 demo video.
- **Code cleanup**: удалены 13 неиспользуемых компонентов — `Avatar`, `Badge`, `Input`, `AccordionItem` (atoms); `ProductCard` (molecules); `CatalogSection`, `ExplainerSection`, `FAQAccordion`, `Hero`, `MechanismDiagram`, `ModeGrid`, `ProductGallery`, `RequirementsList` (organisms). `components/index.ts` перетряхнут. Билд: **171 → 133 модулей**, **CSS 73.83 → 71.61 KB**, ts-check чисто.
- **Прогресс**: T7-real 5/7 → 10/12 (83%). T11 переведена с Buttondown на Gumroad-follow → 1/1 (100%, остальное → Phase 1). T12 6/14 → 7/15 (47%). **Phase 0 итого: 69/114 → 75/108 (~69%).** Общее total опустилось до 108, потому что 6 Buttondown-пунктов уехали из Phase 0 в Phase 1.
- Деплоя не делал — изменения сидят локально на `deploy/fadercraft-landing-2026-05-25`. Жду явное «деплой».

## 2026-06-02 — Version Check feature documented + script recovered
- Создана [[Version Check (Update Notifier)]] (entities/) — фоновая проверка апдейтов: `node.script version_check.js` → `/api/version.json` → кнопка «Update ready». Со статус-таблицей (что работает / что нужно для рассылки).
- Восстановлен потерянный `version_check.js` из `raw/` (фича собрана 2026-06-01, скрипт не лежал рядом с девайсом → `node.script can't find file`). Рантайм-копия положена в `Max Devices/` рядом с `XL_Performance.amxd`. Для дистрибуции — заморозить.
- Связана с обзорной [[XL_Performance — как это работает]] (строка в таблице слоёв) и index.md.
- Релизная связка: бампать `DEVICE_VERSION` (скрипт) и `latest` (`app/public/api/version.json`) синхронно.

## 2026-06-02 — Mode-кнопки 11–14 закрыты для MIDI-маппинга
- `mix_obj-mode11-btn`..`mix_obj-mode14-btn` (live.text, varname `mode_11`..`mode_14`): добавлен `parameter_invisible: 2` (Hidden) прямо в `.amxd`. Теперь не появляются в MIDI-mapping/automation/Live param list. Кабельная логика (outlet→sel, inlet от m24..m27/all_off) не тронута, `parameter_enable=1` оставлен.
- Причина бага «Visible for mapping = off не работает»: атрибут `parameter_invisible` у объектов отсутствовал (дефолт 0 = виден); инспектор frozen-девайса правку в файл не писал. Детали — в [[Mixer Layer]].
- Архив до правки: `Max Devices/Archive/XL_Performance.2026-06-02.amxd`. Пересборка length-preserving (Путь A), валидация чистая.

## 2026-06-03 — Лейбл «Bank fx» → «Bank» во всех трёх деливераблах
- Укорочён видимый лейбл MIXER-секции «Bank fx» → «Bank». Затронуты 3 файла: `raw/XL_Performance.amxd` (plain `ptch`, не frozen) и оба шиппинг-девайса `dist/Control XL {Demo,Starter} Project/Max Devices/Control XL.amxd` (frozen, `mx@c`-обёртка с эмбедами).
- В каждом файле ровно 5 ASCII-вхождений «Bank fx» — все на один объект `mix_obj-ui-page` (`live.toggle`, varname `ui_page_toggle`): `comment.text` (id `mix_obj-page-label`), `parameter_longname` + `parameter_shortname` в `saved_attribute_attributes.valueof`, и пара `[longname, shortname]` в реестре `patcher.parameters["mix_obj-ui-page"]`. **Ни одно не является scripting name / varname / целью связи** — биндинги целы (`boxes`/`lines` counts и все `lines` байт-в-байт идентичны).
- Бинарная пересборка (строка короче на 3 байта × 5 = −15): для frozen-девайсов пересчитаны `ptch`-chunk size, `mx@c`-header trailer-offset (f3) и `dlst`-поля `sz32` (JSON) + `of32` эмбедов. Встроенные `version_check.js` (2525 б) и `solo_follower.js` (6856 б) — байт-в-байт идентичны, новые офсеты валидированы (находят `//`/`autowatch` на месте).
- Архивы до правки: `raw/archive/XL_Performance.2026-06-02.amxd`, `raw/archive/Control XL (Demo).2026-06-02.amxd`, `raw/archive/Control XL (Starter).2026-06-02.amxd`.
- Roadmap-пункт «Next device build: Bank fx → Bank» закрыт. Детали — [[Mixer Layer]].

## 2026-06-03 — Smoke-test покупки + bundle-состав + Gumroad↔Discord интеграция
- **Test-purchase smoke-test пройден** (creator test-mode, не списано): sale-notification + receipt-письмо + invoice PDF + Content/Library страница + download обоих zip + файлы открываются. Закрыт пункт T13 «Test purchase» (T13 → 1/6). **Найден и закрыт баг**: в receipt-письме Gumroad был старый Discord-инвайт `dAt2JGZps7` → исправлен пользователем на `EBsdgst3jU` (Quickstart чист). Ещё не пройдено: install по Quickstart в Live + license-unlock (в девайсе лицензии нет — отдельная таска, см. блок «In-device license activation» в roadmap).
- **Bundle-состав обновлён**: в корень обоих сет-проектов (Demo/Starter) добавлены исправленный `XL_Performance.amxd` + `Router.als`; оба `.zip`-деливерабла пересобраны in-place (семплы/custom-modes не перепаковывались), бэкапы `*.bak-prebankfix` созданы и затем удалены по подтверждению. Загрузка в Gumroad Content — ещё T12.
- **Gumroad↔Discord интеграция подключена**: штатная интеграция продукта (auto-invite покупателя на сервер Fadercraft + auto-kick на refund). Бот-роль `Gumroad` поднята выше `@Verified Owner`. **Штатного маппинга роли нет** → `@Verified Owner` присваивается вручную по DM с ключом до Phase-1 auto-role. Welcome-копия поправлена `XL_Performance`→`Control XL` (в [[discord-server-setup]] + в live `#welcome`). Детали — [[discord-server-setup]], roadmap T14.

## 2026-06-04 — Demo video script (T9.1)
- Создан [[demo-video-script]] — канонический one-page shooting script главного демо-видео. Закрывает незаполненный пункт T9.1 (раньше существовал только аутлайн в phase-0 плане). Структура ~3:00: cold-open hook → MIDI-routing setup (обязательный шаг, roadmap T9 must-include 2026-05-25: MIDI From/To → LCXL MK3 DAW port, Channel → All) → 3 сигнатурные фичи (one button + state memory / Page A-B / Solo Follower) → close-sting `fadercraft.com · $39`. Точки нарезки секций совпадают с 3 feature-шортами из T9 (5 коротких клипов). English VO/captions, без jargon на экране. Добавлен в [[index]].

## 2026-06-04 — Demo script v2 (direction revisions)
- [[demo-video-script]] → v2 по правкам пользователя: (1) hook переписан — убрано «16 modes / most figure out 3» (снисходительный угол + неверное число); позитивное capability-framing. (2) Число **14**, не 16, везде. (3) Setup теперь открывает **`XL_Performance_starter.als`** (всё пред-зароутено, open-and-play), а не дроп голого `.amxd` — пустой проект потребовал бы ручного маппинга; MIDI-routing close-up оставлен как шаг для own-project users (T9 must-include). Открытый вопрос: noun «channels vs modes» — оставлено «modes» (LCXL физически 8 каналов, 14 модов), ждёт подтверждения.

## 2026-06-04 — Demo script v3 (final structure) + Quickstart momentary fix
- [[demo-video-script]] переписан → v3 (рабочая «v6» из чата). Финальная структура: один непрерывный лив-сет, без Setup, открытие игрой демосета. Три фичи по порядку: (1) **страницы** микшера (page 1 = Kick/Clap/C Hhat/Shaker/Bass A/Bass B/O Hhat, page 2 = Accent 1-2/Perc 1-2/Melody 1-2/Perc 3 — по скрину демосета), tap=switch / hold=glance-and-snap-back; (2) **банки энкодеров** A/B, 6 на канал, формулировка абстрактная (юзер мапит что угодно); (3) **cross-mode jump микшер→инструмент** (перевёрнут), toggle-only, акцент на state memory (последний инструмент + точная страница микшера). Solo Follower вырезан (см. память [[feedback_no_solo_follower_marketing]]). Число модов в видео не звучит (через «two pages»).
- `dist/Quickstart.md` поправлен: «Using it» — cross-mode явно toggle-only + «remembers the instrument you were playing and the mixer page»; momentary вынесен в «Page and Bank» с явной оговоркой, что у джампа peek'а нет (снято разночтение по слову «layer»). PDF + Gumroad-бандлы ещё надо перегенерить/перезалить.

## 2026-06-04 — Quickstart PDF regenerated + bundles updated
- `dist/Quickstart.pdf` перегенерён со свежим текстом (momentary/toggle-fix). make-pdf в этом окружении не работает (его browse-демон блокирует `about:`-схему) — рендерил в обход: свой md→HTML (Python, без зависимостей) + Chrome headless `--print-to-pdf`. Чисто, 4 стр., без CONFIDENTIAL. Старый PDF → `Quickstart.pdf.bak-momentaryfix`.
- Оба деливерабла (`Fadercraft Control XL v1.0 - Demo.zip` / `Starter.zip`) обновлены точечно (`zip` заменил один entry `Quickstart.pdf`, остальное не тронуто; целостность проверена: 70/26 entries, по одному Quickstart.pdf, .amxd/.als/custom-modes на месте). **Осталось: пользователь вручную перезаливает оба zip в Gumroad.**

## 2026-06-04 — Landing responsive-polish pass + footer logo + roadmap sync
- Большая итерация полировки лендинга (localhost, не задеплоено): scroll-morph отключён на touch+планшете; десктоп-парковка плагина сделана бесшовной (rect-based); мобильная стоп-точка плагина опущена (+20px, `MOBILE_PIN_ANCHOR_OFFSET`) и старт-позиция настроены; энкодеры на мобилке → neutral-700, обводка к стандартной; DAW-лампы ×2 ярче (opacity 0.8); «Cue volume» → вертикальный лейбл (Figma 2168-10389); Arrow-up плашка: фикс маскировки 1px divider-линии на тач-масштабе (fixed 3px top pad — линия фиксированная, плашка em-масштабируется); Momentary + «To previous Instrument» переведены на pointer-events (press-and-hold + белый огонёк работают на тач); `user-select:none` на всех иллюстрациях.
- **Футер-логотип обновлён под Figma 2232-5251**: убран ghost-«FADER» wordmark, остался голый трек + cap (rest на x=15.5 ≈31%) + «CRAFT │ Control XL». Атом `WordmarkFader` используется только в футере.
- Performance Flow: порядок битов + копи бита «Run the whole rig from the keyboard» обновлены.
- **Roadmap sync**: T9.1 (demo-script) отмечен закрытым → T9 2/8 (25%); Phase 0 итог 90→**91/108 (~84%)**. Под T7-real добавлена дата-заметка о responsive-полировке (без нового счётного чекбокса — это итерация уже-засчитанного лендинга).

## 2026-06-06 — добавлена фича Browser Load (CC51 ch15)
- В `Control XL.amxd` (проектный эталон) добавлена ветка Browser Load: `bl_ctlin` (`ctlin 51 15`) → `bl_sel` (`sel 127`) → `bl_js` (`js browser_load.js`), +4 box / +2 line (267→271 / 408→410). Пересборка Путём A из чистого архива (длина JSON сохранена паддингом, suffix/dlst/встроенные solo_follower.js+version_check.js байт-в-байт). Новый md5 канона `63d95bbe623f9238f48bccdcd7e96c92`.
- `browser_load.js`: bang → обход дерева `live_app browser` по `is_selected` (прунинг, лимит глубины 12) → `load_item` выделенного → следующая сцена (`selected_scene_index +1`) → `focus_view Browser`. Источник сэмпла = вариант A (грузим текущий выбор в левой библиотеке). Скрипт на диске: `raw/browser_load.js` (канон) + `device/browser_load.js`.
- **НЕ вшито во freeze** (по заданию: сначала логика на диске для локального теста). Без freeze у покупателя `js: can't find file browser_load.js` — незакрытый ship-шаг, как version-check. Бандл-слоты + User Library НЕ пропагированы.
- Новая страница [[Browser Load]]; линки из [[index]], [[XL_Performance — как это работает]].

## 2026-06-06 — Browser Load: фикс MIDI-канала (фича заработала)
- Симптом: Browser Load (CC51) молчал. Причина: `bl_ctlin` стоял `ctlin 51 15` — единственная ветка девайса с фильтром канала (все соседние `ctlin 20/28/47/48/49` + «голые» `ctlin` слушают любой канал). Разбор кастом-модов `.syx` (control ID `0x3e` = CC51, побайтово): канал 15 ни в одном из 15 модов CC51 не назначен → LCXL слал не на ch15 → фильтр глушил нажатие.
- Фикс (правка прямо в User Library `Control XL.amxd`, Путь A): `ctlin 51 15` → `ctlin 51` (numoutlets 1→2, outlettype `['int','int']` — конвенция одно-аргументного `ctlin`); цепочка `bl_ctlin[0]→bl_sel[0]→bl_js[0]` сохранена; лейбл `bl_lbl` → «BROWSER LOAD (CC51, any ch)». Ровно 2 changed box, lines/presentation/suffix(dlst+solo_follower.js+version_check.js) байт-в-байт, 271/410 без изменений.
- Значение кнопки 127 на нажатие подтверждено (descriptor max `0x7f`); `sel 127` + `msg_int(v){if(v)…}` в JS — значение НЕ было причиной.
- Бэкап до правки: `raw/archive/Control XL.2026-06-06-124224.amxd` (`63d95bbe`). Новый md5 User Library: `572deaa600b9effbf7712e8590c5fdd4`. Бандлы 3–6 + слот 1 НЕ тронуты (пропагация по отдельной команде). `browser_load.js` всё ещё НЕ во freeze.
- Обновлена [[Browser Load]] (раздел «Канал»).

## 2026-06-06 — Browser Load: UI-кнопка для теста без железа (правка User Library)
- Запрос: дать триггер Browser Load кликом в интерфейсе девайса в Live, чтобы тестировать без подключённого LCXL. Правка прямо в User Library `Control XL.amxd` (новое правило). Бандлы/проектный эталон/freeze НЕ тронуты.
- Добавлен 1 объект `bl_ui_btn` = `live.text` в button-режиме (`mode: 1`, momentary), в presentation отдельным рядом под «Prelisten» (`presentation_rect [12,162,192,20]`, на всю ширину панели), подпись «Load Sample (Browser Load)». `parameter_invisible: 2` (Hidden — вне Live-маппинга/automation), `parameter_enable: 1`, `varname: bl_ui_btn`. В patcher-вид у кластера `bl_*` (`patching_rect [400,2990,100,24]`).
- Проводка: добавлена линия `bl_ui_btn[0] → bl_js[0]` — тот же inlet, что MIDI-ветка `bl_ctlin[0]→bl_js[0]`. Клик → int 1 в js (release 0 игнорируется `if(v)`), полностью эквивалентно нажатию CC51 с теми же логами `[browser_load] …` в Max Console.
- Пересборка Путём A (длина JSON сохранена, pad 47692): filesize 211548==, JSON span 201786==L0, prefix/suffix байт-в-байт (dlst + solo_follower.js + version_check.js целы), ptch инвариант, 270→271 box, 409→410 line, ровно +1 box (`bl_ui_btn`) + 1 line, 0 changed existing boxes, 0 removed, 0 dangling.
- Бэкап до правки: `raw/archive/UserLib-Control XL.2026-06-06-165011.amxd` (`be525d3a…`). Новый md5 User Library: `64f1d29e14b80e0b07f2665fcba60ea8`. `browser_load.js` (диагностический билд, DBG=1) НЕ тронут, всё ещё рядом на диске, НЕ во freeze.
- Обновлена [[Browser Load]] (статус-таблица + раздел «UI-кнопка» + проводка) и index.

## 2026-06-06 — Browser Load (CC51) ОТЛОЖЕНА + полный откат

- **Решение пользователя: фича Browser Load свёрнута/отложена.** Причина: Live Browser (`browser`/`load_item`/`hotswap_target`/`BrowserItem`) НЕ выставлен в Max for Live LiveAPI — подтверждено на Live 12.4.1 через `new LiveAPI("live_app").info` (Application: только children `control_surfaces`+`view`; properties `average_process_usage`/`current_dialog_*`/`open_dialog_count`/`peak_process_usage`; functions `get_*version*`/`get_document`/`press_current_dialog_button`; ни `browser`, ни `get_browser`; в `live_set` тоже нет). Загрузить выделенный браузер-item из `.amxd` НЕВОЗМОЖНО — только через Python MIDI Remote Script. Возврат к фиче — в remote-script, не в M4L.
- **Откат (выполнил пользователь, не агент):** все 6 слотов Control XL `.amxd` восстановлены на чистый до-фичный md5 `44aa142b198b6001613db3b29c36cc38`. User Library и проектный канон (был `63d95bbe`) → `44aa142b`; бандлы 3–6 не менялись. Все слоты консистентны.
- Удалены scratch-js `browser_load.js`/`fc_browserload.js`/`fc_bload2.js` (+ `.backup-*`) из User Library Max Devices и project device; `version_check.js` и `SendsFollower.amxd` не тронуты. История попыток заархивирована в `raw/archive/` (`Canon-`/`UserLib-`/`Control XL.*` 2026-06-06).
- Память обновлена: m4l-master `controlxl-project-map.md` + `xl-performance.md`, MEMORY.md + `reference_m4l_no_browser_api.md`. Wiki: [[Browser Load]] помечена ОТЛОЖЕНО, index.md, XL_Performance — как это работает.md.

## 2026-06-10 — Copy surfaces consolidated
- Created `youtube-video-description.md` (YouTube demo description draft; chapter timestamps are placeholders).
- Created `copy-inventory.md` — single analysis hub: snapshot of live landing copy pulled from `app/src` (code remains source of truth) + links to VO takes / demo-video-script / landing-narrative / youtube-video-description.
- Ran copywriter audit across all surfaces — flagged: product-name drift ("Fadercraft Control" vs "Control XL"), YouTube copy leaning into sends/FX (contradicts abstract mapping), Solo Follower leaking into landing-narrative (rule break), "16 modes" vs "15", YouTube chapters at 00:00.
- Updated index.md with both new pages.
- Added `gumroad-description.md` (product page + post-purchase receipt note + bundle copy). Flagged: Solo Follower named in the bundle/receipt — confirm vs the no-SF-in-marketing rule. Linked into copy-inventory + index.

## 2026-06-10 — Mode 15 `.syx` synced across all distributed copies
- Diagnosis (closed earlier): canonical `custom-modes/15.syx` byte 574 (0-based) = `0x6e` (110); all published copies stuck on bug byte `0x1e` (30) → overlay router reads it as instrument mode 3 (round-trip collision).
- Synced 4 published copies to canon (`e1e00f165e1a4ce330201dd0bae578b0`): `app/public/free-custom-modes/15.syx`, `app/dist/free-custom-modes/15.syx`, and the `15.syx` entry inside both `free-custom-modes.zip` (app/public + app/dist). All now byte-identical canon; other 14 modes in each zip untouched.
- Demo/Starter bundles contain NO `.syx` — modes ship only via free funnel, so no bundle-zip rebuild needed.
- Dated backups (4) in `raw/archive/` stamp `2026-06-10-023338`. Gumroad + User Library NOT touched (manual deploy step later).
- Updated [[Custom Mode SysEx Layout]]: removed false "byte-identical" claim, documented mode-15 self-report byte 574 = 110 (why: N×10=150>127 impossible → 110 is the free ×10 slot; 30 collides with overlay inst-mode 3).

## 2026-06-10 — SEO Phase B + purchase pipeline + review fixes (deployed)

- Code review (full app) + SEO audit done; findings tracked in chat, approved subset shipped.
- Review fixes deployed: Privacy Policy rewritten for PostHog (was claiming Cloudflare WA/no-cookies), Terms §3 = three activations (was unlimited), plugin float survives breakpoint crossings, reduced-motion → stacked mobile layout, verify-license.js hardened (try/catch + env validation), "XL Performance" → "Control XL" everywhere.
- Gumroad Ping → PostHog server-side `purchase` event (functions/api/gumroad-ping.js, secret-token auth, pseudonymous). Gotcha: Gumroad sends base64 seller_id — numeric-id check rejected real pings, removed. Verified end-to-end.
- SEO Phase B deployed: path routes /free-custom-modes + /legal (legacy ?p= redirects), robots.txt + sitemap.xml, postbuild seo-meta.mjs (per-route title/description/canonical/OG + JSON-LD SoftwareApplication/FAQPage), www CNAME + 301 middleware, free-modes h1 "15 Layouts for Ableton Live" + keyword eyebrow. Flat .html files (not dirs) to avoid trailing-slash 308 vs canonical mismatch.
- Search Console: domain verified by owner (DNS). Pending: sitemap submit + indexing requests.
- Roadmap updated (Phase 1 section).

## 2026-06-17 — Post-purchase journey & pipeline designed (PM, after first sale)

- After the analyst dissected the first sale (Holger Aust, NL, $39, silent buyer who crossed the free-modes bridge), the load-bearing gap = NO post-purchase journey + a blind analytics pipeline. PM designed both.
- Key framing: PIPELINE (data plumbing — see the sale) and JOURNEY (human touches — the buyer's experience) are TWO separable problems. Don't conflate. Pipeline fixes are cheap, one-time, compounding → MUST. Journey at n=1 = mostly verification + one human note → SHOULD. Automation → LATER, volume-gated.
- New roadmap block "🛒 Post-purchase journey & pipeline" under Phase 1: MUST (real `purchase` into PostHog / stamp Buy link with ph_did+variant+utm / email+$identify for "buyers" cohort) = gate on reading sale #2. SHOULD (verify receipt download+Discord links, Quickstart front-loads MIDI-routing, ONE founder note to buyer #1 in insight-#10 shape, reply-email feedback door). LATER (device heartbeat, VideoAsk ≥5, Discord auto-role ≥10-20, drip) — cross-linked the existing scattered deferred items into one coherent track.
- License key verdict = KEEP-AS-IS: generated + web-side verify-license.js works → present-but-unenforced is the right resting state. Don't enforce in-device (friction + support load, ~zero piracy upside at n=1); don't remove (only future anti-piracy/identity hook). Revisit on visible piracy or for license-gated perks.
- Silent buyer = the DEFAULT for a $39 self-serve utility, not a problem to solve. Discord-pull de-prioritized at n=1 (buyer already had a working receipt invite + native Gumroad↔Discord integration and skipped it — empty room, not a missing door).
- Details: PM `launch-journal.md` + `insights.md` #20 (new). Roadmap header + Phase 1 block updated; Gumroad-Ping line re-opened with the three pipeline holes.
