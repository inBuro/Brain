# Vocabulary Gap Analysis — FinchGuard Case (2026-08-15)

Источник: артборд Figma "FinchGuard Case", node 1251:19609, файл Ficnhtrade-portfolio (c1xBZrSIkUcGgsgEjSVsB7). Анализ: два независимых агента — hiring-manager (резюме + имеющийся датасет вакансий) и analyst (WebSearch по реальным JD: Checkr, Ramp, Spendesk, Finom). Этот документ — синтез без дублирования; где агенты давали разные рекомендации на один узел, выбрана сильнее обоснованная (с внешними источниками — приоритет аналитика).

Правило `>` то же, что в `additions.md`: формулировка решена и зафиксирована, не обязательно уже внесена в артборд. Пункт без `>` — ждёт решения автора.

**Статус внесения (2026-08-15, вечер):** автор проставил «+» на части комментариев в Figma → внесено напрямую в артборд через Plugin API, см. отметки ✅/⛔/⏭ по каждому пункту ниже.

---

## ⚠ Вопрос к автору — решено

**resume.md строка 43:** "onboarding time reduced **79%** vs v1"
**Артборд node 1444:4875:** "Admin panel reduced onboarding time by **80%**"

> Ответ автора (в Figma, реплай на комментарий): «79, admin panel, activation time. "Redesigned" не верно, потому что создал с нуля и дополнил» — верная цифра 79%, термин **activation time**, объект — admin panel.

✅ **Внесено**: `1444:4875` — "Admin panel reduced onboarding time by 80%" → "Admin panel reduced activation time by 79%". Минимальная правка (только цифра+термин), полный ребрендинг блока метрик (POV/NPS/paperwork) НЕ внесён — на него не было отдельного «+».

---

## Артборд "FinchGuard Case" — node 1251:19609

### Дефекты — чинить всегда, независимо от вакансийного голоса

> **D1 — Node 1444:4874: опечатка в домене (критично — кликабельный элемент)**
> Было: `www.FinchGaurd.com`
> Стало: `www.FinchGuard.com`
> ⛔ **Не внесено**: текст набран шрифтом «TT Firs Neue», которого нет в доступном через API каталоге (0 из 8927). Нужно либо поставить шрифт локально, либо править руками.

> **D2 — Node 1444:4407 и 1444:4522: двойные пробелы**
> Было: `I demonstrate all  artefacts...  if needed.`
> Стало: убрать оба двойных пробела.
> ✅ **Внесено** вместе с В7 (см. ниже) — оба узла переписаны целиком.

> **D3 — Node 1444:4546: двойной пробел перед "dynamic"**
> Было: `...collected as  dynamic prototypes...`
> Стало: один пробел.
> ⛔ **Не внесено**: тот же блокер шрифта «TT Firs Neue», что и D1.

> **D4 — USM-диаграмма: опечатка**
> Было: `Linkein`
> Стало: `LinkedIn`
> ⛔ **Не найдено**: не обнаружено ни как TEXT, ни как SHAPE_WITH_TEXT узел в скоупе артборда через Plugin API — похоже, эта карточка USM растровая (картинка), не живой текст.

> **D5 — USM: опечатка**
> Было: `Recomendations` (на скриншоте визуально ломалось переносом на «Recomendati ons» — сам исходный текст оказался одним словом без пробела)
> Стало: `Recommendations`
> ✅ **Внесено**: узел найден как `1444:4422` (SHAPE_WITH_TEXT).

> **D6 — USM (×2 вхождения): грамматика**
> Было: `Meet the his type of use case...`
> Стало: `Meet this type of use case...`
> Почему: "the his" — невозможная конструкция, немедленно читается как non-native.
> ⛔ **Не найдено**: та же причина, что D4 — вероятно растровая картинка.

---

### Приоритет 1 — структурное позиционирование кейса и ядро метрик

> **В1 — Node 1350:5896/5897: от продуктового питча к дизайн-задаче**
> Было: `Out-of-the-box AML & KYC solution for blockchain businesses`
> Стало: `Compliance onboarding design for a multi-role, highly regulated fintech platform`
> Почему (источник: аналитик × JD Checkr/Finom/Ramp): текущая формулировка — язык продуктового маркетинга ("out-of-the-box solution"), не дизайн-фрейминг. Рынок ищет "translating regulatory requirements into clear user flows" и "complex/regulated domains" — это именно то, что в кейсе есть, но не названо. Hiring-manager предлагал "plug-and-play crypto-native businesses" — слабее: по-прежнему про продукт, а не задачу дизайнера.
> ⏭ **Пропущено**: на этом комментарии в Figma не было «+» от автора — по правилу «без плюса не вносить» правка не применена, формулировка остаётся предложением на будущее.

**В2 — Node 1444:4875: блок метрик — требует переписывания (ЖДЁТ ответа на вопрос к автору)**

Текущие проблемы (аналитик × Gartner/CMSWire + JD Spendesk/Ramp/Checkr):
- NPS=87% — слабая первичная метрика для B2B compliance в 2026: Spendesk/Ramp/Checkr называют метриками success completion rate, activation time, straight-through processing rate, cost per manual case, drop-off reduction. NPS → понизить до parenthetical, не держать как hero-метрику.
- "manager's paperwork" — звучит до-цифровой эпохой; рынок говорит "manual rework reduction" / "straight-through processing rate".
- Смешение POV: "I designed" / "Admin panel reduced" — разные субъекты в одном буллете.
- Двойной "reduced...reduced" в одном абзаце.
- 80% onboarding — сильнейшая метрика кейса (именно это ищут Checkr/Finom/Ramp), но без baseline и downstream outcome звучит как произвольное число.

✅ **Частично внесено**: минимальная фактическая правка — "onboarding time by 80%" → "activation time by 79%" (ответ автора: 79% верно, объект admin panel, термин activation time; "Redesigned" отклонено автором как неточное — не создавали редизайн, а строили с нуля и дополняли).
⏭ **Не внесено**: полный ребрендинг абзаца (NPS→сноска, "paperwork"→"manual rework", единый POV) — на это не было отдельного «+», только точечный ответ на вопрос выше. Шаблон ниже остаётся предложением на будущее, если решат делать полный проход:

*Шаблон (не применён):*
`Built the admin panel onboarding flow from scratch and extended it, cutting activation time by 79% and eliminating [X]% of manual rework — reducing cost per onboarded entity without adding review headcount. (NPS 87%.)`

---

### Приоритет 2 — восприятие живым рекрутером

> **В3 — Node 1444:4548, предложение 1: findings-синтез**
> Было: `The gained experience is discussed within the product team, formulated as a list of improvements in design or architecture, and prioritized by severity.`
> Стало: `Findings are synthesized with the product team into a prioritized list of design and architecture improvements.`
> Почему: "gained experience is discussed" — пассивно и неточно; "synthesized into" — стандартный глагол для UX debriefs.

> **В4 — Node 1444:4548, предложение 2: метрики**
> Было: `the time spent on some tasks decreased by 45%, and the completion rates equaled 100%`
> Стало: `task completion time decreased by 45%; task completion rate reached 100%`
> Почему: "equaled" — не метрический глагол; "some tasks" — неопределённость снижает вес цифры; точка с запятой даёт нужный ритм.

> **В5 — Node 1444:4548, предложение 3: satisfaction score**
> Было: `The satisfaction rate of the most complex part of the process (new addresses whitelisting) became 90%.`
> Стало: `User satisfaction score for the most complex flow (address whitelisting) reached 90%.`
> Почему: "satisfaction rate" → "satisfaction score" (измеримый термин); "became" → "reached"; "new" убрано как избыточное.
> ⛔ **В3–В5 не внесены**: узел 1444:4548 набран шрифтом «TT Firs Neue», тот же блокер, что D1/D3.

> **В6 — Node 1444:4546: участники тестирования**
> Было: `collected as dynamic prototypes and tested on groups of 5-7 people`
> Стало: `prototyped and tested with groups of 5–7 participants`
> Почему: "participants" — стандарт usability-отчётов; en dash вместо дефиса в диапазоне чисел; "tested on" → "tested with" (предлог "on" со stakeholder-группами читается как эксперимент над ними).
> ⛔ **Не внесено**: узел 1444:4546 тоже на «TT Firs Neue».

---

### Приоритет 3 — позиционирование без срочности

> **В7 — Node 1444:4407 / 1444:4522: "deliverables" вместо "artefacts"**
> Было: `I demonstrate all artefacts on a demo call if needed.`
> Стало: `I walk stakeholders through all deliverables on a sync call if needed.`
> Почему: "artefacts" — британский академизм, редко встречается в US/EU JD; "deliverables" — рыночный стандарт; "demo call" → "sync call" нейтральнее.
> ✅ **Внесено** на оба узла (шрифт Inter, без блокеров).

> **В8 — USM-диаграмма: навигационная подсказка**
> Было: `See the section about how one tool replaces 5 and which one`
> Стало: `See how one compliance tool replaces 5`
> Почему: "and which one" — незаконченная мысль; "compliance tool" добавляет контекст домена.
> ⛔ **Не найдено** — та же причина, что D4/D6: похоже, растровая картинка.

---

## Не трогать (подтверждено аналитиком)

**Стейкхолдер-список (CCO, MLRO, AML officer):** MLRO — реальная регуляторная роль; её присутствие сигнализирует глубину domain knowledge. Checkr в своих JD явно упоминает "collaboration with Compliance/Legal". Оставить как есть.

**Хедлайн FinchTrade AG ("institutional-grade liquidity"):** описание клиента от третьего лица, не саморепрезентация дизайнера. Оставить как есть.

---

## Раунд 3 (вечер 2026-08-15) — полный аудит Research-фрейма (node 1444:4366)

По прямому запросу автора: грамматика, логические нестыковки, приближение к голосу вакансий.

✅ **Внесено (живой текст):**
- «    Analysing product details» → убраны 4 лишних пробела в начале (1444:4412)
- «Contact with customer support» → «Contact customer support» — во всех 4 местах (Research + CJM CEO/Compliance/Product)

⚠ **Найдено, но НЕ внесено — растровые картинки (текст не редактируется):**

*«User personas» — сравнительная таблица CEO/Product/Compliance (секция 01):*
- «Meet the requirements of a regulator Bug-free» — нет разделителя между мыслями
- Незакрытая/не туда закрытая скобка: «(ideally, no monthly fixed payments; 3) billing dependant on the actual usage)» — скобка открыта в п.2, закрыта в конце п.3
- «dependant» → «dependent» (не та часть речи)
- «when changes where made» → «were» (were/where)
- «transaction monoring» → «monitoring»
- «limited sources (personnel)» → «resources»
- «Not being able to monitoring KYC» → «to monitor» (форма глагола после to)
- «in the nearest future» → «in the near future» (калька с русского)
- «Get the feelings of the product» → грубее нормы, лучше «Get a feel for the product»
- Product-колонка в pains/fears не согласована по форме с CEO/Compliance (там «Fear of…», тут потеряно «Fear»)
- Последняя строка Compliance-колонки не строится как предложение: «…so in that sense daily work covered» — не хватает глагола

*«User interviews» (секция 03):*
- «Show me how built your daily workflow» → «Show me how you built your daily workflow» (пропущено you)

*«Information architecture» — sitemap (секция 05):*
- «Realise notes» / «Realise notes page» → «Release notes» (×2, не то слово)
- «See how one tool replaces 5 and wich one» → «which»
- «Calendy link» → «Calendly»

Полный текст — в комментарии на артборде (node 1444:4366).

---

## Раунд 4 (вечер 2026-08-15) — таблица персон FinchTrade (отдельная доска)

Отдельный файл, НЕ FinchGuard: FigJam-доска «FT research» (fileKey `LvtPoSamuHIpXKXCBK6TJI`, node 2001:1064) — персоны CEO/Managers для клиентов-трейдеров FinchTrade (ликвидность), не для покупателей AML-инструмента FinchGuard. Изначально принял их за один и тот же контент — автор поправил, слияние отменено.

По прямому запросу автора («перепиши контент таблицы с исправлениями») — 15 живых ячеек поправлены напрямую (это настоящая FigJam-таблица, не картинка):
- «Crypto payment processings» → «processors» (2 места)
- «Higher education  (economics...» → убран двойной пробел
- «High internet usage skills» → «High» (параллельная форма с «Above average»)
- «Linkedin» → «LinkedIn», «medium» → «Medium» (проперные имена)
- «Desktop\n//Mobile» → убран артефакт «//»
- «What criteria IS important» → «ARE important» (согласование числа: criteria — множественное)
- «Have an instant settlements» → «Instant settlements»; «Various settlements options» → «settlement options»; «big size order» → «large orders»
- «Easily to pass KYC/KYB» → «Easy KYC/KYB» (×2 колонки); «it's exports» → «its export» (×2); «teammates activity» → «teammates' activity»; «settlements reports» → «settlement reports»
- «Get the convenient tool» → «Get a convenient tool», убран двойной пробел
- «1) Setup, 2)» → «1) Setup; 2)» — пунктуация
- Переразбил склеенные в одну строку буллеты (criteria/functionality) на отдельные строки

Не трогал: местоимение «he» для персон (используется последовательно по всему документу, не ошибка, а стиль — не менял без отдельного запроса).

---

## Раунд 5 (вечер 2026-08-15) — таблица User Personas FinchGuard пересобрана как живая

Растровая таблица «User personas» (CEO/Product/Compliance) из секции 01 Research-фрейма пересобрана как новая живая FigJam-таблица (10 строк × 4 колонки, id `2003:1142`) на доске «FT research» (`LvtPoSamuHIpXKXCBK6TJI`), рядом с существующей FinchTrade-таблицей — временное решение, «пока что в FigJam» по указанию автора.

Все правки из раунда 3 применены при переносе (dependant→dependent, where→were, monoring→monitoring, незакрытая скобка исправлена, параллельная структура восстановлена, calques убраны). Точечные комментарии на местах правок — только там, где решение было редакторским (не механическая опечатка): скобка/пунктуация в целях CEO, параллельная структура Compliance-функциональности, и отдельно помечено предложение-реконструкция в последней строке Compliance (было нечитаемо в оригинале — сформулировано заново, смысл сохранён, но не дословно).

**Правило с этого раунда:** комментарии на местах правок ставятся по одному на каждую конкретную точку (через `client_meta: {x,y}`, т.к. id ячеек таблицы REST API для пина не принимает), не сводным комментарием.

---

## Раунд 6 (вечер 2026-08-15) — полный повторный проход по всему артборду

Полный текстовый дамп артборда 1251:19609 (176 живых текстовых узлов) — нашёл и внёс 11 новых правок в разделе Design System / Storybook (раньше не проверялся):

✅ Внесено (индивидуальный комментарий на месте каждой правки):
- «Moleculses» → «Molecules» (опечатка)
- «Every element – from widgets  to pictures and typography based  on 4×4 module» → «Every element — from widgets to pictures and typography — is based on a 4×4 module» (двойные пробелы + пропущенный глагол)
- «Maintance at 23 of march» → «Maintenance on 23 March» (опечатка + порядок даты)
- «To start real trade you should pass KYC check, dont waste your moneys, do it now!» → «To start trading, pass the KYC check — don't waste your money, do it now!» (dont→don't, moneys→money)
- «4×4 px  module» → «4×4 px module» (двойной пробел)
- «Icons template with  visual compensation» → «...optical compensation» (термин; предположительно неточный перевод «оптической компенсации»)
- «Contrast  » → «Contrast» ×4 (двойной пробел, повторяется в 4 цветовых карточках)
- «Checbox» → «Checkbox» (опечатка в названии компонента)

⏭ Замечено, не тронул (вероятно вендорский boilerplate текст плагина Storybook, не авторский текст кейса): «Number of content per page can also be selected by the user» — грамматически неверно («content» неисчисляемое), лучше «The number of items per page can also be selected by the user», но неясно, стоит ли редактировать текст, который генерирует сам плагин, а не автор.

Разделы с телефон-моками (admin/02-06) текста не содержат — там либо изображения, либо пустые Faq-подписи, при повторном скане не найдено ничего для правки.

---

## Источники

Hiring-manager agent: node-level правки по резюме + имеющийся датасет вакансий.
Analyst agent: WebSearch по реальным JD — Checkr (Truework Senior Product Designer), Ramp (Senior PM KYC & Compliance), Spendesk (Senior PM KYC), Finom (Senior Product Designer B2B fintech); дополнительно: Medium "2026's UX Portfolio Wake-Up Call", Phenomenon Studio (fintech product design), CMSWire (NPS critique), Gartner.
