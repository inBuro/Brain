# Открытые вопросы и технический долг

Единое место для всех нерешённых вопросов по дизайн-системе Beefy DS и связанной работе. Сюда стекаются открытые пункты со всех файлов памяти.

**Статусы:**
- 🔴 **OPEN** — требует ответа, можно поднять в любой момент
- 🟡 **DEBT** — осознанно отложено, вернёмся когда понадобится
- ✅ **CLOSED** — решено, оставлено для исторического контекста (с датой)

**Как пользоваться:** при работе над дизайн-задачей сначала прогоняй задачу через активные вопросы — возможно, ответ на один из них разблокирует решение. Когда что-то закрываешь — переноси в раздел Closed с датой и кратким описанием решения.

---

## 🔴 Active — open

### Colors

🟡 **`cta/fifth/{default,hover,disabled}` имеют идентичный hex** (`#111321`, все → `darkBlue/90`).
- Симптом: визуально нет разницы между состояниями.
- Гипотеза: либо баг (забыли разные state-цвета), либо намеренный «static» CTA, где hover не показывается (e.g., disabled-by-default элемент).
- Нужно: понять где используется и каков design intent.

🟡 **`charts/chartC` дублирует hex `charts/chartB`** (оба → `graphTints/20`, `#ABCBE3`).
- Гипотеза: незаконченная пара — `chartC` должен указывать на другой `graphTints/*` step.
- Нужно: входные данные по дизайну графиков (сколько серий, какая палитра).

### Primitives

🔴 **Pre-baked blends с числовыми суффиксами без `a`/`w`** (например `gold/70-20`, `red/40-12a` где alpha=1).
- Что значат числа в суффиксе?
- Гипотеза: «как выглядит N% alpha вариант поверх darkBlue/N2», запечённое в hex (т.е. визуальный результат уже посчитан).
- Нужно: подтверждение от автора DS.

🔴 **`darkBlue/50` биндится напрямую в макетах** (подтверждено через `get_variable_defs` на узле 5935:760), минуя семантический слой.
- Антипаттерн: дизайнер обошёл semantic `cta/tertiary - default` и использовал primitive напрямую.
- Нужно: аудит других мест где primitives используются напрямую; решение — менять на semantic или принять как исключения.

### Density

🔴 **Conventions для sentinel `density.999`** (=9999px) — только для radius (full / pill), или также для max-width / fill?
- Нужно: задокументировать use-cases, при необходимости разделить на несколько sentinel'ов (`999.radius`, `999.maxWidth`).

🔴 **Покрывает ли текущая шкала все нужные случаи?**
- Есть ли частые «не хватает» 36 / 44 / 56?
- Можно ли получить из истории макетов список значений, которые дизайнеры вводят руками вне шкалы?

### Typography

(нет активных)

### Breakpoints

🟡 **Header-only транзишен на ~1041 px** (hamburger → полная desktop-нав) не отражён в Figma breakpoints. Решение: не заводить отдельный канвас, обрабатывать внутри desktop-фрейма. Если в будущем дизайн потребует особого «narrow desktop» состояния — пересмотреть.

🟡 **Max-content cap в коде = 1296 px**, Figma `Desktop` = 1260 (расхождение 36 px). Намеренная разница (Figma рисует чистый layout 1260, остаток до 1296 — padding). Стоит явно прописать в guidelines: «макет 1260, безопасная зона до 1296».

### Process / Architecture

🔴 **Где живут семантические алиасы поверх Density?**
- Density скрыт от публикации (hidden) — значит дизайн использует его через какую-то опубликованную семантику. Через что? Уточнить.

🔴 **MCP `hiddenFromPublishing` setter падает** для свежесозданных переменных («Node not found»).
- Workaround: щёлкать в Variables UI вручную после создания.
- TODO Figma UI: `Density/5,5` остался не помечен hidden — поправить руками.

(MCP не возвращает Text Styles — закрыто: Beefy не использует Text Styles в принципе, см. Closed)

---

## ✅ Closed (history)

### 2026-05-15 — Text Styles (Beefy не использует)

Пользователь подтвердил: **в Beefy DS Text Styles не существуют как сущность.** Дизайнеры стилизуют текст, биндя Typography-переменные (fontFamily / fontWeight / fontSize / lineHeight / letterSpacing) напрямую на text-узлы. Это и объясняет почему `search_design_system` со `includeStyles=true` возвращал пустой массив — нечего возвращать.

**Импликации для дизайн-задач в Beefy:**
- Не пытаться применить «style h1» как единый объект — такого нет.
- Для каждого текстового узла биндить 5 переменных индивидуально.
- Группы вроде `h1`, `body`, `h4-accent` существуют только как **convention в именах переменных** (в `fontSizes/` и `lineHeight/` есть `h1`, `h1-accent` и т.д. с матчингом lineHeight'ов), но это рукопашная конвенция, не Figma Text Styles.

### 2026-05-15 — Breakpoints

- **Сравнение с реальным сайтом** ([app.beefy.com/vault/...](https://app.beefy.com/vault/aerodrome-cow-base-vvv-diem-v2-vault)) через визуальный обход viewports 360–1920 px. Найдены 3 реальные точки: 960 (mobile→desktop layout), 1041 (header), 1296 (max-content cap).
- **Figma обновлён**: финальные 3 брейкпоинта — Mobile 360, Tablet 960, Desktop 1260. Удалён Desktop S (1128, не соответствовал реальному коду). Desktop 1272→1260 (ближе к канваса-границе 1260+padding=1296).

### 2026-05-15 — большая сессия по DS

- **Миграция `vaultTints-backup` → `vaultTints`** — 25 ссылок `vaultColors/*` переведены на current. Деструктивный шаг: удалены 30 `vaultTints-backup/*` primitives. См. `tokens/colors.md` секцию vaultColors.
- **Фикс аномалии `vaultColors/pool/txtHover`** — указывал на `vaultTints-backup/retired/20` (hex `#D3C9FF`), теперь корректно `vaultTints/pool/20` (`#D2C7FF`). **Визуальный сдвиг оттенка** — мог повлиять на pool-карточки, требует визуальной проверки.
- **`vaultColors/Paused/cardBg` добавлен** — semantic для Paused vault state, alias на `vaultTints/Paused/100` (scope `SHAPE_FILL`).
- **15 опечаток исправлены**:
  - `txt/tertiary/tertiarry → tertiary` (×4)
  - `strokes/dark-defailt → dark-default`
  - `strokes/tabbar__sellected → tabbar__selected`
  - `cta/forth - minor → fourth - minor`
  - `charts/chatB → chartB`
  - group `grpaphs → graphs` (7 vars)
- **Typography привязана к Density через aliases** — 24 vars (12 fontSizes + 12 lineHeight) получили aliases. fontFamily, fontWeight, letterSpacing остались raw осознанно.
- **`Density/5,5` = 22px добавлен** — для покрытия `lineHeight-md` (был единственным outlier из 24 typography-значений).
- **`lineHeight-h{N}accent → -h{N}-accent`** — naming-bug исправлен (Variant A: дефис везде). 4 переменные переименованы.
- **Descriptions проставлены** на 28 Typography vars (12 fontSizes + 12 lineHeight + 4 letterSpacing). Заодно починен copy-paste bug — все 12 lineHeight имели описание «fontWeight variable for regular», теперь корректное «Line-height for hN».

---

## Как поддерживать этот файл

- **Добавление нового вопроса:** добавь в соответствующую категорию в Active. Используй emoji-статус. Опиши коротко: симптом, гипотеза, что нужно для разрешения.
- **Закрытие вопроса:** перенеси в Closed с датой и кратким описанием решения. Не удаляй — оставь для контекста.
- **Группировка:** сначала по категории (Colors / Primitives / Density / Typography / Process). Внутри категории — без особого порядка.
- **Когда читать:** перед началом любой дизайн-задачи. Возможно, ответ на один из вопросов уже есть в твоей голове или в недавнем контексте.
