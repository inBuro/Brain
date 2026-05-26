---
type: log
project: Novation
created: 2026-04-28
---

# Wiki Log

Append-only журнал операций над вики.

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
