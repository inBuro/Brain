---
type: log
project: Novation
created: 2026-04-28
---

# Wiki Log

Append-only журнал операций над вики.

## 2026-08-18 — Обвал брендовой выдачи разобран, два тормоза краула закрыты, roadmap сверен с фактами

Повод: вопрос основателя, почему после работ над производительностью и индексацией показы в отчёте **Generative AI features** упали до нуля.

**Вопрос оказался не про AI.** Отчёт показывал 9 показов за 7 дней — 8 на `/`, 1 на `/updates`. Эти же страницы плюс `/legal` — сайтлинк-набор одного брендового SERP по запросу «fadercraft», где сайт стоял на позиции 1. Запрос шёл 2–10 показов/день весь июль и обрывается 11 августа; AI-обзор показывался именно по нему. Нет брендового SERP → нет AI-показов. **Причинной связи с работами по индексации нет:** `/` — `PASS`, `Submitted and indexed`, fetch успешен, общий поиск не обнулялся (08-11…08-15 = 10, 5, 6, 6, 9). Одновременно просели позиции по всему сайту (`/guides` c p24-26 на p39 → p59 → p76) — форма переоценки после структурных SEO-правок 11 августа, не поломка; 14 августа главная вернулась на p2. Масштаб: 9 AI-показов за неделю — чуть больше одного в день, разница между «7» и «0» равна двум-трём людям.

**Два реальных тормоза краула, найденных при разборе, и оба закрыты кодом** (`inBuro/fadercraft-landing@ecef1c7`, апекс проверен curl'ом):
- `lastmod` в sitemap проставлялся руками и протух: главная заявляла `2026-06-25`, `/control-xl` — `2026-07-17`, при том что обе правились в августе. Это же лучшее объяснение, почему `/guide/…mk3-across-live-sets` не пересканировался с `2026-07-04`, а ручной Request Indexing от 14 июля не подействовал. Новый постбилд `app/scripts/sitemap-lastmod.mjs` штампует каждый `<loc>` датой последнего коммита, тронувшего исходники роута; `public/sitemap.xml` теперь держит только URL-набор. Скоуп по-роутный (page-компонент + CSS-модуль, для релиз-нот ещё `lib/changelog.ts`), не полный граф импортов — иначе правка футера переставляла бы все 11 дат разом.
- Все внутренние ссылки на гайды вели на URL-варианты `?from=%2Fcontrol-xl%23kit`, так что канонический `/guide/…` имел **одну** входящую ссылку на весь сайт. Origin кнопки «назад» переехал в `sessionStorage` (`app/src/lib/guide-back.ts`), ссылки стали каноническими, якорь возврата сохранился.

Проверено 25 браузерными проверками против живого прода. Sitemap пересабмичен (`204`), Request Indexing запрошен основателем для обоих застрявших URL уже после деплоя свежих сигналов.

**Roadmap сверен с фактами (задача E1).** Документ отставал на полтора месяца и дезинформировал: Phase 2 значилась 11/24 (~46%) с «БЛОКЕРОМ» на деплое `/sends-follower`, хотя страница жила на проде, была в индексе и продавалась с конца июня. Пересчитано по живому проду: **Phase 2 = 20/24 (~83%)**, закрыто 13 пунктов. Осталось четыре, ни один не блокирует продукт: vanity `/sf` (404), анонс, профиль поддержки, пост-запусковый чекпоинт.

**Закрыты и остальные задачи очереди аудита:** A1 (доступ был всё время), B3 (все 11 роутов чисты по canonical/robots), B4 (роуты проверены), B5 частично (Gumroad отражает v1.1; maxforlive 15522 отдаёт 403 на любой автоматический доступ — только глазами), D1 (выгрузка GSC за 3 месяца, пять CSV в `_Inbox/`), D3, E2, E3.

**Вердикт по локализации (D3) — НЕТ, не начинать.** За 3 месяца весь органик = 382 показа и **7 кликов**. DE — 8 показов / 0 кликов / p9.4; FR — 6 / 1 / p30.2; GB — 9 / 1 / p28. Ни один критерий §1 не выполнен, и не на проценты, а на два порядка. Отдельная находка: топ-страна — Таиланд, 185 показов из 382 (48%) на p4.8, то есть почти наверняка собственные заходы основателя; внешний органик за квартал ≈200 показов. Языкового барьера в данных нет, потому что нет трафика, в котором он мог бы проявиться.

**Найдено попутно.** Живой манифест `api/sends-follower.json` указывает на `/sends-follower/updates`, который отдаёт 404 — роут обязан появиться до бампа версии, иначе кнопка «New Version» уведёт покупателя на пустоту. В `api/versions.json` висит запись `learn_deck` с URL на корень сайта. Устаревшие копии `version_check.js` в `Control XL/raw/` и `dist/` смотрят на удалённый `api/version.json` — исполняемого кода это не касается (вшитые `.amxd` читают `versions.json`, проверено строками внутри файлов), но пересборка из них дала бы молча сломанный update-check.

**Создано:** `wiki/dynamic-focus.md` — синтез-страница продукта #3 (задача E2), закрывает пробел, из-за которого DF существовал в roadmap и коде, но не в вики. `index.md` обновлён: свежие цифры фаз, новая страница в разделе Synthesis.

## 2026-08-16 — SEO-аудит проверен, найденные баги пофикшены и задеплоены

Продолжение записи ниже: исходный внешний аудит был написан без доступа к `~/.config/google/` (сессия в песочнице). Перепроверил его находки против локального GSC-монитора и живого GSC API — часть оказались уже закрытыми, часть неточными, и всплыл один реальный, ранее не пойманный баг.

**Поправки к аудиту.** «Судьба `/free-custom-modes`» и «отправлен ли sitemap» — оба сняты: монитор показывает `/free-custom-modes` в индексе стабильно с ~1 августа, sitemap пересабмичивается автономно каждые 2 дня. «Dynamic Focus отсутствует в базе знаний» — раздуто: `roadmap.md` (Phase 3) знает продукт и обновлён 2026-08-08, не хватает только синтез-страницы. Регрессия `/guide/…mk3-across-live-sets` в noindex — **не новый сбой** (как ошибочно записано в первой правке брифа), а тот же нерешённый с 4 июля кейс: последний краул Google по этому URL всё ещё датирован `2026-07-04`, хотя заголовки на проде чистые уже давно.

**Реальный баг, найденный при перепроверке:** `sitemap.xml` содержал мёртвый `/updates` (давно 301-нится на `/xl-updates`) и не содержал `/df-updates` вообще. GSC URL Inspection подтвердил: **`/xl-updates` — «URL is unknown to Google»**, ни разу не сканировалась, хотя страница живая и есть ссылка в футере — просто не было в sitemap. Это и есть «пропавшая страница» из исходного беспокойства фаундера.

**Фиксы, задеплоены на прод (`inBuro/fadercraft-landing@6ce81c0`, живой билд подтверждён curl'ом):**
- `functions/_middleware.js` — явный `X-Robots-Tag: noindex` на любой хост кроме `fadercraft.com`. Preview-хосты и так получали noindex по умолчанию от Cloudflare Pages (подтверждено curl'ом `x-robots-tag: noindex`) — фикс не решает уже проиндексированный дубль (Google просто ещё не пересканировал), а страхует на случай, если этот CF-дефолт когда-нибудь выключат.
- `public/sitemap.xml` — `/updates` заменён на `/xl-updates` + `/df-updates`. Пересабмичен через GSC API (`204`).

**Осталось только вручную** (у Request Indexing нет публичного API): зайти в Search Console → URL Inspection → «Запросить индексирование» для `/xl-updates` и повторно для `/guide/…mk3-across-live-sets`.

**PR #18 смёржен** (`142744c`) с исправленным брифом.

## 2026-08-16 — Внешний SEO-аудит индексации + бриф задач для агента

Повод: вопрос основателя, стоит ли переводить страницы с гайдами на FR/DE/en-GB ради индекса в этих странах. Ответ по существу — **нет, не сейчас** (аудитория ищет по-английски, en-GB = орфография а не язык, база не готова, переводы протухают); гейт на пересмотр = выгрузка GSC по странам. В ходе проверки вскрылось расхождение вики с реальностью, аудит вынесен в новую страницу `wiki/seo-audit-2026-08-16.md`.

**Метод и его границы:** прод `fadercraft.com`, `maxforlive.com` и preview-хост заблокированы egress-политикой окружения; репо лендинга сессии недоступно (`list_repos` = только `inBuro/Brain`, `inBuro/Chess-Demo`); коннектора GSC нет; писем Gumroad в подключённом ящике нет. Источники — индекс Google через поиск + почта. Поисковая выдача ≠ полный дамп индекса, поэтому отсутствие страницы в результатах фиксировалось как подозрение, не как факт.

**Находки.** ✅ Подтверждено: в индексе четыре страницы (`/`, `/control-xl`, `/sends-follower`, `/dynamic-focus`) с корректными по-роутными title/description; **проиндексирован preview-деплой `3c812ca9.fadercraft-landing.pages.dev`** — всплыл в трёх разных запросах, в одном выше канонической `/control-xl`, заголовок старый → протухшая сборка, полный дубль сайта на чужом хосте; GSC-ресурс подтверждён как **доменный**, онбординг-письмо 2026-07-24 на `YellowShoess@gmail.com`, алертов об ошибках/санкциях за год нет. ❌ Опровергнуто в `roadmap.md`: «деплой `/sends-follower` = блокер» (страница живая и в индексе, `:579`), «SEO-meta для роута не сделана» (`:565`), структура сайта (реально хаб + три продуктовые страницы), линейка продуктов — **есть третий продукт Dynamic Focus $19**, отсутствующий в roadmap и index (исходники в `fadercraft/Dynamic Focus/` от 2026-06-28). ❓ Не проверяемо без доступа: содержимое и сабмит `sitemap.xml` (`:356` открыт с 10 июня), судьба `/free-custom-modes` (не всплыла ни в одном из 4 запросов — высокий вес, это был главный приёмник Reddit-трафика), robots/canonical/redirects, роуты `/sf`/`/update`/`/sends-follower/updates`, раскатка Control XL v1.1, страны покупателей, KVR-листинг.

**Создано:** `wiki/seo-audit-2026-08-16.md` — находки со статусами (подтверждено/опровергнуто/не проверяемо) + очередь задач для агента блоками A→E (доступы → сверка → фиксы → данные под локализацию → гигиена вики), с критериями готовности и анти-листом. Приоритет: `A1 → C1 → B2 → C2`. **Код, прод, GSC и roadmap не трогали** — только новая страница + `index.md` + этот журнал; правка roadmap под факты вынесена в задачу E1.

## 2026-08-11 — Dynamic Focus Slot v1.2 release bundle

## 2026-06-28 — Реорганизация репозитория: Control XL выделен в отдельную папку

**Файлы:**
- `dist/archive/Dynamic Focus Slot v1.2.amxd` md5=`ff0212ea` (847790B)
- `dist/Fadercraft Dynamic Focus v1.2.zip` md5=`443eab62` (145422B)
- Архив base: `_device-backups/Dynamic Focus/Dynamic Focus Slot.2026-08-11-113450.pre-v12-release-build.amxd`

**Что вошло:**
- JS v66 (вычищен): удалены 32 dev-only строки (`[COLOR-RAW]`, `[UMV-DRAG]`, TGT-DBG, ADV-DBG, drag repaint diagnostic). Оставлены 12 холодных production posts. Маркер: `S7-PROD-v1.2 LOADED`
- MapButtonTint v47 (145 boxes/242 lines) — заменил старый v43 (132/227) из v1.2-clean base
- DEVICE_VERSION='1.2' в df_version_check.js (embedded + on disk)

**Функциональные фиксы vs v1.1:** v60 restore-state (mbt_map=0), v61 min/max desync, v62 white text + track repaint, v63 si=7 black text, v65 900ms+1500ms checkParentMove, v66 stale-guard hostTrack

**НЕ опубликован.** Координатор решает дату деплоя на Gumroad. После публикации — обновить `versions.json` (dynamic_focus.latest='1.2').

---

## 2026-08-11 — v63-S7-UNIFIED: si=7 FOLLOW дизайн унифицирован с si<7

**midi_learn_slot.js v63**:
- Редизайн (прямой запрос): si=7 (bpslot7 mirror) теперь показывает track color bg + white text в FOLLOW mode, как и si=0..6. Прежний дизайн dark+amber (v42/v50) отменён.
- `_updateMapBtnVisibility()`: `si < 7` → `si <= 7`; раздельный si===7 FOLLOW block (lnb_lbg_r/g/b + amber) удалён.
- `_s7kaFn()`: keep-alive теперь красит track color + white (не amber); lcdbgcolor тоже обновляется каждые 100ms.
- `checkParentMove()`: добавлены диагностические посты `drag repaint sync/300ms` с track color + hostId для верификации drag repaint chain.
- Архив: `_device-backups/midi_learn_slot.2026-08-11-000038.pre-v63-s7-unified.js`

⚠️ Дизайн si=7 dark+amber ОТМЕНЁН. Не возвращать без явного запроса.

## 2026-08-10 — v60/v47: RESTORE STATE FIX — mbt_map=0 root cause устранён

**midi_learn_slot.js v60** + **MapButtonTint v47**:
- Диагноз: три фактора делают mbt_map=0 после byname-restore: (1) mb_bindtrig sync сброс it_mflag, (2) RangeAndName outlet 4 async сброс, (3) $i4=0 в it_state (arm button не трогали → it_vtrig → $i4 хранит 0 → state=0 всегда)
- MapButtonTint v47: добавлен `varname="it_vtrig"` к объекту `it_vtrig (t b i)`
- JS v60: в `_resolvePanelSlotsOnHostTrack()` — 100ms deferred Task, для каждого restored si<7: `it_mapstore.message(1)` + `it_vtrig.message(1)` → state=2 стабильно
- Архивы: `_device-backups/MapButtonTint.2026-08-10-221456.pre-v47-vtrig-varname.maxpat` + `midi_learn_slot.2026-08-10-221456.pre-v59-restore-state.js`
- Min/Max page1/page2 desync — отдельный баг, задокументирован в STATE-MAP.md §9, ждёт отдельного раунда

## 2026-08-10 — DF Input: удалены диагностические print-объекты (debug spam fix)

**Dynamic Focus Input.amxd** — удалены 4 debug бокса из frozen patcher JSON:
- `dbg-ch` (`print dfi-raw-ch`), `dbg-pack` (`print dfi-pack-out`), `dbg-midiin-ch` (`print dfi-midiparse-cc`), `dbg-midiparse` (midiparse, только для debug-ветки)
- Все три print-а стреляли на каждое CC-сообщение → flood консоли при активном контроллере → перегрузка Max-планировщика → lag в DF Slot
- Path B repack: ΔL=−7548, MD5 `0c486e52` → `6757b0279244a0f87db1918338c387f0`, 31558→24010 B
- Архив: `_device-backups/Dynamic Focus Input.2026-08-10-210359.pre-rm-debug-prints.amxd`
- Embedded JS (dfi_relative.js / df_version_check.js / monitor_init.js) — байт-в-байт целы

## 2026-08-10 — v56/v45: синхронный gate-close + немедленный tint (dark-bg+amber-text fix)

**midi_learn_slot.js** v55 → **v56**: маркер `>>> S7-DEV-v56 LOADED <<<`.
- Немедленный `applyColor()` в `panelmap()` и `_doRebind()` (до deferred 300ms; ранее только для absoluteMode)
- Цель: it_unpk получает track_color ДО async RangeAndName completion → state machine fires state=2 с правильным lcdbgcolor

**MapButtonTint.maxpat** v44 → **v45**: 144/240 → **145 boxes/242 lines**. Маркер `MapButtonTint v45 loaded`.
- Добавлен `it_st2close [== 0]` id="it_st2close" rect=[1550,540]
- Связи: `it_brc → it_st2close → it_dg[in0]`
- Синхронно закрывает it_dg при state=2 (через it_brc, в той же Max event) — блокирует async p setButtonColor callback (lcdbgcolor=dark) после маппинга

**Диагноз root cause (установлен статическим анализом):**
`it_zpak [pak lcdcolor amber]` fires в live.text при loadbang (it_dg открыт via it_load). Затем p setButtonColor async live.colors callback пишет `lcdbgcolor=skin_lcd_bg` (тёмный) через it_dg (ещё открыт, потому что it_dgc2 закрывает async после RangeAndName). Итог: dark lcdbgcolor + amber lcdcolor = тёмный фон + amber текст si=4-6 в FOLLOW mode.

**Архивы:** `MapButtonTint.2026-08-10-174734.pre-v45.maxpat`, `midi_learn_slot.2026-08-10-174734.pre-v56.js` — оба в `Brain/fadercraft/_device-backups/`

---

## 2026-08-10 — MapButtonTint v39: диагностика pack+coeff после сверки с SF

**MapButtonTint.maxpat** обновлён с v38 (`cc4b526a`) до v39 (`a163d8ce`), архив `2026-08-10-032957.pre-v39-pack-coeff-diag.maxpat`.

Сверка с Sends Follower (MapButton.maxpat): post-pak4 цепь ИДЕНТИЧНА в обоих устройствах (те же объект ID, те же соединения). SF не является рабочим эталоном для Max range — у неё та же ограниченность (max идёт только в pak COLD inlet, без тригера). Структурного превосходства нет.

v38 CONFIRMED: pak4 корректно получает max/100 (пользователь подтвердил `dbg-pak4: 0. 0.97 0. 1. → 0. 0.5 0. 1.`). Обрыв строго после pak4.

v39 добавляет диагностические prints: `print dbg-pack` после pack (obj-67) и `print dbg-coeff` после flonum obj-65 (*~ coefficient). Ожидание при Max=50%: `dbg-pack: 0. 0.5` и `dbg-coeff: 0.5`.

## 2026-08-10 — MapButtonTint v38: Max-range fix (четвёртая попытка; explicit pak4 slot routing)

**MapButtonTint.maxpat** обновлён с v37 (`f55c74c8`) до v38 (`cc4b526a`), архив `2026-08-10-031433.pre-v38-pak4-split.maxpat`.

Диагноз: v37 подтвердил (через `ran-pak`), что `pak (obj-55)` корректно получает `[min/100, max/100]`. Но пользователь в Live видит прежний симптом. Полная статическая трассировка цепи pak→pak4→unpack→scale→pack→*~ структурно верна. Выдвинута гипотеза: `pak 0. 1. 0. 1. (obj-49)` при получении LIST `[min/100, max/100]` на inlet 0 берёт только ПЕРВЫЙ элемент для slot 0, slot 1 остаётся дефолтом 1.0 → Max всегда 1.0 → ceiling всегда 100%.

Фикс: добавлен `obj-minmax-split (unpack 0. 1.)` между pak и pak4. unpack стреляет справа налево: outlet 1 (max/100) → pak4[1] COLD сначала, outlet 0 (min/100) → pak4[0] HOT → pak4 стреляет. Явная маршрутизация устраняет dependence на pak list-spreading. Добавлен `print dbg-pak4` для подтверждения. Ожидаемый Console: `ran-pak: 0. 0.5` + `dbg-pak4: 0. 0.5 0. 1.`.

Ожидает теста в Live.

## 2026-08-10 — MapButtonTint v37: Max-range fix (третья попытка; obj-mindiv100)

**MapButtonTint.maxpat** обновлён с v36 (`c00afb75`) до v37 (`f55c74c8`), архив `2026-08-10-024610.pre-v37-maxfix2.maxpat`.

Диагноз: `t b f outlet 0 (bang) → obj-53(flonum, prototypename:"Live") → /100 → pak` — теоретически верная цепь (v34/v36), но Max-параметр в Live не реагировал (три итерации). Гипотеза: Live-прототипный flonum не отвечает на bang в M4L bpatcher-контексте.

Фикс: добавлен `obj-mindiv100` — стандартный flonum (без prototypename) между `/100 (min)` и `pak hot`. Теперь Min-путь обновляет obj-mindiv100 (хранит min/100), а Max-путь банкует obj-mindiv100 напрямую. Устранена зависимость от Live-прототипного flonum. Добавлен диагностический `print ran-pak` (убрать после подтверждения).

Ожидает теста в Live. JS v45 без изменений.

## 2026-07-27 — Dynamic Focus Slot v1.2: фикс learnedChannel persistence

Закрыт баг: два DF Slot с одинаковым CC на разных Custom Mode (ch11/ch12) теряли канал после reload сета. Корень: `LiveAPI.set("value", ch)` обновляет LOM, но не stored value live.numbox → .als сохранял неверное значение.

Изменения в `Dynamic Focus Slot.amxd` (FROZEN, md5 `592e002d` → `8e072d5f`, 778857→718317B):
- `lnb_ch` varname `'live.numbox[1]'` → `'lnb_ch'` (теперь доступен через patcher.getnamed)
- `pattr_ch` restore `[0]` → `[-1]` (дефолт = unlearned sentinel)
- `midi_learn_slot.js` (`9c265566`, 86426B): в Learn/unmap/_resetAllMappings вместо `LiveAPI.set(chParamId, ch)` — `patcher.getnamed("lnb_ch").message(ch)` (raw number → inlet 0 → persists to .als)
- Пересборка через Path B: JSON 213683→152913B (indent=1), dlst of32 все -60770

Архив: `_device-backups/Dynamic Focus Slot.2026-07-27.amxd` (pre-fix, `592e002d`).
Пользователю: в существующих .als нужен 1 re-Learn на каждый Slot.

## 2026-07-13 — Relative-toggle команда извлечена из декомпилированного Live 12 скрипта

Вопрос endless-энкодеров пересмотрен. Из `Launch_Control_XL_3/midi.py` (github.com/gluon/AbletonLive12_MIDIRemoteScripts) извлечены точные байты: per-row relative toggle = CC69/72/73 ch7 val=127 (`SET_RELATIVE_ENCODER_MODES`), connect-handshake `F0 00 20 29 02 15 02 7F F7`, encoder touch enable CC71 ch7 127. Гипотеза 2026-06-23 подтверждена как реальные команды официального скрипта; открытым остаётся только их действие в Custom Mode (hardware-тест, артефакты готовы). Firmware v1.1 (янв 2026) relative в Custom Mode НЕ добавила (acceleration curves, HUI, fader pickup). Обновлён раздел в [[Custom Mode SysEx Layout]]; полное состояние исследования + новый путь «software recenter via CC feedback» — в памяти m4l-master `encoder-relative-research.md`.

`fadercraft/raw/` и `fadercraft/dist/` перемещены в `fadercraft/Control XL/raw/` и `fadercraft/Control XL/dist/` через `git mv` (сохранена история). Все 517 трекаемых файлов получили статус R (rename). Также перемещены: `fadercraft/Novation XL.md` → `Control XL/`, `fadercraft/demo-video-titles.html` → `Control XL/`, `fadercraft/solo_follower.js` → `Control XL/raw/`. Маркетинг-ассеты (`Fadercraft Presentation.mp4`, `.srt`, `Photos/`, `IMG_8046.jpg`, `References/`) переехали автоматически как часть `raw/` → `Control XL/raw/`. `.gitignore` обновлён на новые пути. Wiki, brand, ds, wiki, directives, research, docs — не тронуты. Пути в agent-memory (MEMORY.md, xl-performance.md, controlxl-project-map.md, controlxl-bundle-zips.md) и wiki (Version Check, Browser Load) обновлены.

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
- `fadercraft/dist/custom-modes/lcxl-mk3-modes-bundle.syx`
- `fadercraft/web/free-custom-modes/lcxl-mk3-modes-bundle.syx`
- `fadercraft/app/public/free-custom-modes/lcxl-mk3-modes-bundle.syx` (dev server)

**Что обновлено** (везде заменена инструкция «drag bundle» → «select target slot + Upload Custom Mode для каждого»):
- `dist/custom-modes/README.md`
- `web/free-custom-modes/README.md`
- `web/free-custom-modes/index.html` (статическая страница)
- `app/src/pages/FreeCustomModesPage.tsx` (React-страница, превью на localhost)

**Phase 0:** **59/114 (~52%)** — без изменений (это исправление существующего deliverable, не закрытие нового пункта).

**Открытый вопрос:** теоретически Components может поддерживать multi-mode импорт недокументированно (тот же drag&drop файла Components сам распарсит N сообщений и предложит выбрать слоты). Это можно проверить за 30 сек экспериментом, но без живого теста — bundle deprecated. Если когда-нибудь подтвердится, что bundle работает, — вернуть из git history (`f84b482`).

## 2026-05-26 — `/free-custom-modes/` free funnel published + README

Закрыт T12 bullet про free funnel (`web/free-custom-modes/`).

**Что в папке `fadercraft/web/free-custom-modes/`:**
- `index.html` — статическая страница (стиль pricing.html/terms.html), hero «Free Custom Modes for Launch Control XL MK3», ссылки на bundle + per-mode `.syx`, инструкция импорта в Components, секция «What the paid bundle adds» с CTA на `fadercraft.gumroad.com/l/xl-performance`.
- 14 индивидуальных `.syx` файлов (`1.syx`..`14.syx`)
- `lcxl-mk3-modes-bundle.syx` (9276 B) для one-shot import
- `README.md` — markdown-версия инструкций (зеркало `dist/custom-modes/README.md`)

**Также создан** `fadercraft/dist/custom-modes/README.md` — пойдёт внутрь Gumroad bundle как user-facing инструкция, идентичен версии на free funnel page.

**Phase 0:** 58/104 (~56%) → **59/104 (~57%)**. T12: 5/14 → 6/14.

**Что осталось из quick-actionable в T12:** только env vars `LATEST_BUNDLE_URL` + `GUMROAD_PRODUCT_ID` в CF Pages (нужен пользователь). Остальное (Live Set `.als`, сборка `dist/fadercraft-xl-performance-v1.0/`, zip, upload в Gumroad Content) требует Ableton-сессии или Gumroad-аккаунта.

## 2026-05-26 — Custom Modes 1..14 confirmed working on hardware

Пользователь импортнул bundle на железо, все 14 модов открываются и работают корректно (после короткой Finder-cache затыки на отображении модов 11/12 и bundle как «dim/не кликабельные» — оказалось чисто визуальный glitch macOS LaunchServices, OS-уровень файлы абсолютно нормальные; разрешилось через `touch` + рефреш Finder).

**Roadmap T12 first bullet** — описание обновлено: 10 → 14 модов в `fadercraft/dist/custom-modes/`, bundle 9276 B. Сам пункт уже был отмечен `[x]` ранее сегодня, дельта счётчиков нулевая, но описание теперь отражает финальный объём поставки.

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

- **Lazy load** добавлен на все below-the-fold `<img>` лендинга через нативный `loading="lazy" decoding="async"`. Затронуты: `CatalogSection.tsx` (картинки в карточках kit, среди них `lcxl-mk3.png` 1.1MB), `VideoSection.tsx` (poster), `ProductGallery.tsx` (main + thumbnails), `ProductCard.tsx`. Выше-the-fold `PerformanceFlow` `keys.png` (35KB) оставлен eager — он участвует в LCP. Vite-rebuild → новый bundle `index-B4gL0Se3.js` скопирован в `fadercraft/web/`, старый `index-n9SfgvuN.js` удалён.
- **T3 Commit `brand/`** — отмечено закрытым: коммит `3b0de4d` ранее сегодня уже содержит `brand/brief.md` + `brand/colors.md` (+ `email-setup.md` ещё раньше). Пункт оставался открытым в роадмэпе по инерции.
- **Phase 0 totals:** 55/104 (~53%) → **57/104 (~55%)**. T3 6/7 → 7/7 (закрыт целиком), T7-real 3/7 → 4/7.

## 2026-05-26 — Roadmap sweep: T5 closed, T7-real 3/7, T9 channel, T3 social tiles

Закрыта серия пунктов по уточнению пользователя:

- **T3 Social tiles (6/7)** — OG-картинка `fadercraft/web/og.png` (1080×1080, 51KB) залита в репо. IG-пост 1:1 и Stories 1080×1920 вынесены в Phase 1 / маркетинг (под этой галочкой не считаются).
- **T5 Instagram (3/3 = 100%)** — handle `@fadercraft_` зарегистрирован, bio + ссылка на `fadercraft.com` стоят, в avatar — логотип/favicon-mark.
- **T7-real лендинг (3/7)** — счётчик total бампнут с 5 до 7 (split `Smooth scroll + lazy load` на два пункта; `/free-custom-modes` уже добавлен ранее, но не учитывался в total). Закрыты: 9-секционный `index.html`, `style.css` с brand colors (mobile-first), smooth scroll в `main.js`. Открыты: `pricing.html`, hero loop video, lazy load, `/free-custom-modes` страница.
- **T9 Demo video (1/9)** — YouTube канал «Fadercraft» создан.

**Phase 0 totals:** 47/102 (~46%) → **55/104 (~53%)**. Дельта: +8 done, +2 total (T7-real split + free-custom-modes наконец-то учтены).

## 2026-05-26 — External links page + IG handle `fadercraft_`

- Создана [[external-links]] — single source of truth для внешних URL (IG/YT/Gumroad/support/лендинг) + список файлов в коде, где эти ссылки используются.
- В [FooterFull.tsx:43](../../../Projects/Projects/fadercraft/app/src/components/organisms/FooterFull/FooterFull.tsx#L43) обновлён IG href: `instagram.com/fadercraft` → `instagram.com/fadercraft_` (актуальный хэндл с trailing underscore).
- [[index]] обновлён: добавлена ссылка на `external-links` в разделе Reference.

## 2026-05-26 — Beat 4 «hotkeys» — пересборка amber-LED оверлея под Figma

Пользователь обновил иллюстрацию `hotkeys` в Figma `OdPRdjodGO3WiR6tgSP7AA` → page `07 — Illustrations`, COMPONENT_SET `1747:10709` («Component 1»), вариант `1747:10705` (`Property 1=hotkeys`). Сам растровый `keys.png` (image hash `7c74bff664…`) не менялся — поменялся только overlay-фрейм поверх изображения и добавлены exportSettings PNG @1x/@2x на сам компонент.

**Структура варианта (320×320):**
- `1747:10703` keys.png frame: (-62, 49), 444×222.
- `1803:5008` Frame 84 (overlay из 4 amber-квадратов 33×33 с гэпом 9px): (0, 184), 159×33, opacity 0.5.

**Что сделано в коде** ([PerformanceFlow.module.css:347-358](../../../Projects/Projects/fadercraft/app/src/components/organisms/PerformanceFlow/PerformanceFlow.module.css#L347-L358)):

- `.beat4Leds` переехал с `left: 14.5em / top: 8.0625em` (старая позиция под правой парой клавиш) на `left: 3.875em / top: 8.4375em` (новая позиция под левой парой). Координаты получены пересчётом Figma-координат Frame 84 относительно image-local origin: `x = 0 − (−62) = 62 → 3.875em`, `y = 184 − 49 = 135 → 8.4375em`.
- Добавлен `opacity: 0.5` на `.beat4Leds` (в Figma overlay polу-прозрачный).
- Размер квадратов и gap не трогал (33×33 / 9px уже совпадали с Figma).
- Обновил CSS-комментарий: ссылка на Frame 84 и формула пересчёта; убрал устаревшее «sitting beneath the right two keys».

`keys.png` ассет на диске оставлен без изменений (image hash совпадает, замена не требуется). SharedPluginData чанки (34 ключа в namespace `exporttmp`), которые временно стэшил на ноду `1747:10703` для попытки выгрузить экспорт через chunked return, очищены.

## 2026-05-26 — copy fix: «6 controls instead of 2» (не 3)

Пользователь уточнил формулировку про два encoder bank на канал. Прежний вариант «give you 6 controls instead of 3» арифметически некорректен (база — один bank = 2 энкодера на канал у LCXL MK3, не 3). Правильная версия: «**give you 6 controls instead of 2**».

**Что сделано.**

- `~/Projects/Projects/fadercraft/app/src/components/organisms/PerformanceFlow/PerformanceFlow.tsx:38` — заменена строка в массиве features (Two encoder layers per channel).
- Figma file `OdPRdjodGO3WiR6tgSP7AA` (Novation-XL) → page `06 — Content`, два TEXT-нода обновлены через `use_figma`:
  - `1398:143` («Rewritten takes → Encoders»): «6 controls per channel instead of 3» → «… instead of 2».
  - `1434:6902` (frame «XL Performance — lo-fi prototype v2» → BEAT 2 · ENCODERS): «Two encoder banks per channel — 6 controls instead of 3» → «… instead of 2».
  - Черновые русские заметки на канвасе (`1385:6775`, `1385:6783`, формулировка «обычные моды дают только 2») уже корректные — не трогал.
- Gumroad listing: пользователь поправил вручную (out of band). TODO в roadmap T12 закрыт чек-маркой.
- `wiki/roadmap.md` → T12 (Bundle assembly + Gumroad product), пункт «Описание продукта на странице Gumroad» — child-callout заменён на ✅ запись о применённой правке во всех трёх каналах (код / Figma / Gumroad).

Других вхождений «6 controls instead of 3» в `~/Brain/fadercraft` и `~/Projects/Projects/fadercraft` нет (grep clean, исключая build artifacts).

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

- React-имплементация (`~/Projects/Projects/fadercraft/app/`) — там сейчас ModeGrid без цветового кодирования и без tooltip-механизма. Скриншот, который пользователь обсуждал в claude.ai, видимо был из Antigravity-сессии или Figma, не из этой кодовой базы. Имплементация — следующий шаг, после того как пользователь согласует копию.
- Hero (Beat 1) — оставлен как есть с "16 modes", флаг в open question #1.

---

## 2026-05-07 — Figma: Tooltip atom + hover-показ на ModeButton 1–16

Не вики, а соседний design-репо `~/Projects/Projects/fadercraft/`, но решение касается DS-парности. Подробности — `docs/log.md` от 2026-05-07. Кратко: Tooltip оформлен как атом с `Direction=top|bottom` variant и component-property `text`, лежит карточкой в сетке `02 — Atoms`. На `OneActionBetweenThem` 16 тултипов с `layoutPositioning='ABSOLUTE'` (1–8 над, 9–16 под), их `visible` забинден на 16 BOOLEAN-переменных коллекции `Prototype`, hover-реакции `MOUSE_ENTER`/`MOUSE_LEAVE` на каждой ModeButton выставляют `mode-N=true|false`. Заодно удалены 10 unused-вариантов `State=hover-*` ModeButton (апрельский эксперимент с радужной палитрой stroke без привязки к токенам, 0 usage).



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
- Implementation workspace at `~/Projects/Projects/fadercraft/`: `ModeButton` + `ModeGrid` built on both Figma and React side, parity confirmed via browser smoke test.
- Token parity report: `~/Projects/Projects/fadercraft/artifacts/parity-report-2026-05-06.md` (3 Figma fixes applied: action/secondary→coral, focus shadow→lavender, coral primitive value).

## 2026-05-26 — Beat 8 newsletter copy finalized (Figma parity)

- Updated `wiki/landing-narrative.md` Beat 8 to match Figma node 233:1189 (mobile/compact).
- Body split into two short lines: "Buy once and start immediately." / "Or get one email when a new workflow, update or device ships."
- Placeholder: `your@email.com` (was `you@studio.com`). Submit: `Join updates` (was `Subscribe`).
- CTA bullet normalized: `Buy on Gumroad • $39` (was em-dash variant).
- Code synced in `~/Projects/Projects/fadercraft/app/src/components/organisms/NewsletterSection/`; CTA is `white-space: nowrap` + full-width on ≤719px so `$39` no longer wraps off the button on mobile.

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
- **Permanent invite link**: `https://discord.gg/dAt2JGZps7` (Never / No limit / Temporary OFF). Подставлен в [FooterFull.tsx:44](Projects/Projects/fadercraft/app/src/components/organisms/FooterFull/FooterFull.tsx#L44) `defaultSocials.DC`.
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

## 2026-06-26 — Sends Follower Gumroad listing copy (started)
- Created `wiki/sends-follower-vo-script.md` — final demo VoiceOver narration supplied by Kirill; canonical locked SF voice copy ("Stay in the music." sign-off).
- Created `wiki/gumroad-description-sends-follower.md` — Gumroad listing draft (product page / receipt / bundle short) modeled on [[gumroad-description]] (Control XL). Body mirrored from locked site page (SendsFollowerPage.tsx) + VO script; WHAT IT DOES / Track / Return now aligned to VO wording. Flagged ⚑: WHO IT'S FOR + receipt = synthesis (need copywriter/RU-first pass); licensing terms + exact bundle contents (demo .als?) need confirmation. Receipt corrected to drop stale "LFO" framing — device's own 8-param mapper (multimap) is the modulation source.
- Updated index.md with both new pages.
- Update: Kirill supplied FINAL VO (2026-06-26). Diffs from prior: "converts"→"turns"; Track/Return drop "device —" + use "follows"; Manual line tightened ("switch to Manual for mouse or MIDI control"); key line "Instead of adding more effect, you're shaping its behavior" (was "changing the amount… changing its behavior"). Synced sends-follower-vo-script.md + gumroad-description-sends-follower.md (top bullet, WHAT IT DOES, Track, Return).
- Voice pass (2026-06-26): aligned remaining CXL-inherited sections to VO tone — bundle lists now verb-forward ("follows one track's send… / an entire return bus"), consistent across product page / receipt / short; REFUNDS de-legalized ("Refunds within 14 days if it doesn't work as described… what went wrong"); SUPPORT line made human ("Stuck, or found a bug? … replies within 48 hours"); dropped ⚑ on receipt (now in-voice + grounded). Listing copy publish-ready pending demo video + Vale.

## 2026-06-28 — Repo nesting fix: Sends Follower + Dynamic Focus consolidated under Fadercraft
- Pulled new **`Dynamic Focus/`** folder (5 files: `dynamic_focus.js`, `Dynamic Focus.maxpat/.amxd`, `build_device.py`, `README.md`) from remote branch `claude/dynamic-focus-folder-kwbhti` into `fadercraft/Dynamic Focus/`. It's a track-focus M4L proof-of-concept (device self-activates only while its host track is the selected track; no central manager, event-driven via `live_set view selected_track` observer — idioms mirror `solo_follower.js`). README verdict: architecture sound, recommended as product foundation.
- **Resolved long-open org question (roadmap open-item #6):** moved `~/Brain/Sends Follower/` → **`~/Brain/fadercraft/Sends Follower/`** via `git mv` (266 files, history preserved). Internal `raw/ dist/ wiki/ Sends Follower.md CLAUDE.md` kept verbatim — only the nesting changed, per founder's directive "keep the existing raw/dist distribution system, fix nesting." Sends Follower no longer a top-level sibling of Fadercraft; now sits inside the Fadercraft umbrella next to `Dynamic Focus/`.
- Control XL untouched (its bundles stay in shared `dist/`, deploy-wired). Historical `~/Brain/Sends Follower/...` paths in older log entries left as-is (append-only journal).

## 2026-06-30 — Gumroad SF copy verified live; canon recorded for consistency
Verified the live `l/sends-follower` listing (Kirill paste + browse scrape) against [[gumroad-description-sends-follower]] §1: body matches verbatim → marked as as-published source of truth for cross-surface consistency (VO ↔ site ↔ Gumroad). One delta found: REFUNDS block in the doc is NOT on the live listing — flagged, open decision (add to live or drop). Also surfaced VO↔site drifts (behavior-line, hero verb «Converts/turns», Manual «mouse/manually»); Gumroad confirms VO as canon. Site edits pending founder line-by-line picks.

## 2026-08-09 — Dynamic Focus Slot v1.2-clean: 9 fixes ported to clean frozen base
Assembled `Dynamic Focus Slot.amxd` v1.2-clean (`b3801e5c`, 765748B FROZEN) from scratch: base = released v1.1 frozen (`f2858303`), 9 confirmed fixes from 2026-08-08/09 ported in clean form (no diagnostic post() calls). Fixes include: v23 bang() inlet-11 guard (the actual root cause: X-click sent bang, fell into re-init instead of unmap), v20 lnb_tgt stored-value sync, v19 stale-notification guard in _doRebind(), v18 CcControlDevice byname guard, v16 arm-state guard, v15 unmap() race fix, v14 second-arm blink fix (it_dgc2) + X button on bpslot7, patcher-level live.observer detach (ran_obs_clr in RangeAndName). Placed in User Library as `Dynamic Focus Slot.amxd`. Backup at `_device-backups/Dynamic Focus/Dynamic Focus Slot.2026-08-09-121328.pre-v12-clean-base.amxd`. Pending: new zip bundle, DEVICE_VERSION bump, Gumroad upload. DEV.amxd + external JS/maxpat files unchanged for continued development.

## 2026-07-14 — Buy shortlinks: 302 → tracking bridge pages (analytics gap closed)
Analyst confirmed the Control XL goals (Actions 285962–285965) were healthy, but the six `*-buy` vanity links (`/yt-buy`, `/yt-sf-buy`, `/r-buy`, `/tg-buy`, `/m4l-buy`, `/fb-buy`) were server-side 302s straight to Gumroad — no HTML, no PostHog snippet, so those visits existed in Gumroad analytics but never in PostHog (gap since the 2026-06-12 redirect deploy). Replaced each with a static bridge page (`app/public/<slug>.html`) that fires `buy_click` via sendBeacon ($lib `fc-buy-bridge`, stamps `ph_did`+`cta` for Gumroad Ping attribution) and immediately redirects to the same checkout URL; removed the six lines from `_redirects` (a rule would shadow the asset). Deployed (commit `5a660d2`), E2E-verified on prod: owner-tagged test `buy_click` landed in PostHog with correct props. Same pass: Action 285962 filter widened to `href contains gumroad.com/l/control-xl` — retroactively counts 9 real CXL buy clicks instead of 2. Details in [[outbound-links]] §Buy bridge mechanism.

## 2026-08-09 — Leads-export D1 sync stuck at 1 row (open bug, mid-investigation)
- User got an owner-notification email for a new Free Custom Modes lead (`jumbos_prikstok_0x@icloud.com`, submitted 08:52 UTC), but the PostHog "Leads — Free Custom Modes" widget (data-warehouse source `019fb27d-131b-...`, syncs `fadercraft-leads` D1 via `/api/leads-export`) still showed only the old lead from 2026-07-29 (`jasonlawmakesnoise@gmail.com`).
- Granted a Cloudflare API token (`damp-flower-b028`, existing all-purpose token, not a fresh scoped one) D1 Edit permission so Claude could query `fadercraft-leads` directly via `wrangler d1 execute --remote` (prior token in `~/.config/cloudflare/env` had no D1 scope at all → `code: 7403`).
- **Confirmed via direct D1 query: both leads are actually in the table.** The write path (`functions/api/free-modes-gate.js` → `saveLead()`) works correctly — the owner email only fires after a successful D1 insert, so its arrival is itself proof the row landed.
- **Real bug is on the read/sync side.** Reviewed `functions/api/leads-export.js` — logic looks correct (unfiltered `SELECT ... FROM leads` with no `since` should return all rows; `since` filter is `last_seen >= ?`, which would still include the new row even with a stale cursor). Yet every single scheduled sync job since 2026-07-30 (45+ runs, every 6h) has `rows_synced: 1` — including the run at **10:17 UTC, which started AFTER the 08:52 UTC lead already existed in D1** and still only synced 1 row. This rules out "sync just hasn't caught up yet" — something in the PostHog data-warehouse pipeline (dlt incremental-cursor handling, or Cloudflare edge caching despite `Cache-Control: no-store`) is dropping the new row.
- Manually triggered a fresh sync via `external-data-sources-reload` MCP tool (job `019fe749-...`) — was still `Running` when this entry was written (some historical runs on this source have taken 3+ hours to complete for a trivial 1-2-row payload, itself a smell worth investigating separately). **Not yet resolved** — next step is to check that job's result and, if still stuck at 1, consider reconfiguring the source without `incremental_sync` (force true full_refresh with no `since` param sent at all) since the manifest's `incremental_sync.enabled: true` may be silently overriding the intended full-refresh behavior.
- Source id: `019fb27d-131b-0000-ac8c-a2af8c1def47` (project 458316). D1: `fadercraft-leads` (`e10aabe3-8a67-41a9-a8cb-8e7f5ba68eb7`), binding `LEADS_DB` in `app/wrangler.toml`.
