# DS Contract — правила работы с дизайн-системой в этом проекте

**Источник ДС:** `ds_scan` (дублированная Community-библиотека — v2.4 Beefy Finance Design System)
**Figma-файл (DS):** https://www.figma.com/design/vBAfvod9AWpHeyJi2yu2Eh/v2.4-Beefy-Design-System (ключ `vBAfvod9AWpHeyJi2yu2Eh`)
**Figma-файл (продукт):** https://www.figma.com/design/fLrH3120KL4aNrtSBwi2rT/ (ключ `fLrH3120KL4aNrtSBwi2rT`)
**Дата сканирования:** 2026-06-19

---

## Главное правило

При любом задании, которое касается интерфейса Bifi (новый экран, форма, карточка, доработка существующего), агент работает строго через эту ДС. Сборка = композиция существующих компонентов из `ds/components.md` + Variables из `ds/foundation.md`. Прибитые цвета, размеры, радиусы и шрифты в обход Variables запрещены.

---

## Что значит «через ДС»

1. **Компоненты — только из каталога.** При сборке читаем `ds/components.md`, выбираем компонент по описанию и матрице вариантов, вставляем инстанс через `use_figma` по Node ID. Не рисуем похожее с нуля.
2. **Цвета — только через Semantic Variables.** Никаких прибитых hex. Путь: `figma.variables.setBoundVariableForPaint(paint, "color", semVar)`. Если hex попал в заливку — это баг, переделать через Variable.
3. **Типографика — через CSS Variables.** Beefy DS не использует Figma Text Styles. На каждый текстовый узел 5 CSS-переменных: `--fontfamily/*`, `--fontweight/*`, `--fontsizes/*`, `--lineheight/*`, `--letterspacing/*`. `setTextStyleIdAsync` **не применять**.
4. **Радиусы и отступы — через Variables.** Прибитые числа запрещены, если в ДС есть соответствующая переменная.
5. **Auto Layout везде.** Любая секция экрана — Auto Layout.

---

## Специфика Beefy DS

- **Шрифт:** DM Sans (variable font, `opsz`-axis). Поддерживает латиницу. Кириллица — не проверена (продукт en).
- **Тема:** только тёмная (Dark mode). Светлой темы нет — `accordion on light` является исключением только для этого компонента.
- **Иконки:** 110 иконок, сгруппированы по типу (Token, Chain, Platform, Wallet, Curators, UI, Social). При подборе иконки смотреть раздел «Иконки» в `ds/components.md`, брать по Node ID.
- **Нет Figma Text Styles** — не звать `setTextStyleIdAsync`. Текст = 5 CSS Variables на ноду.
- **Semantic ↔ Primitive:** все цветовые токены — алиасы. Работать только через Semantic-слой; Primitive — внутренняя реализация.
- **vaultTints / graphTints / lightBlue / navy:** не попали в сканирование. При необходимости дополнить `ds/foundation.md` отдельным `use_figma`-скриптом.

---

## Краткая шпаргалка токенов

| Место | Semantic-токен |
|---|---|
| Фон всего сайта | `backgrounds/sitebg` → `darkBlue/90` |
| Хедер / футер | `backgrounds/siteHeader&Footer` → `darkBlue/100` |
| Шапка карточки | `backgrounds/cardHead` → `darkBlue/80` |
| Тело карточки | `backgrounds/cardBody` → `darkBlue/70` |
| Контент карточки | `backgrounds/cardContent` → `darkBlue/60` |
| Основной текст | `txt/primary/primary - default` → `white/100` |
| Вторичный текст | `txt/secondary/secondary - default` → `white/90` |
| Подписи / метки | `txt/tertiary/tertiary - default` → `white/70` |
| Текст на светлом фоне | `txt/fourth/fourth - default` → `darkBlue/90` |
| Primary CTA (зелёный) | `cta/primary - default` → `green/40` |
| Secondary CTA (золотой) | `cta/secondary - default` → `gold/50` |
| Обводка (тёмный фон) | `strokes/light-default` → `darkBlue/70` |
| Разделитель | `strokes/divider_ondark` → `darkBlue/70` |
| Ошибка (фон) | `notifications/alert-error-bg` → `red/40-12a` |
| Подтверждение (текст) | `notifications/confirmation-fg` → `green/30` |

---

## Что делать, если нужного нет

Источник — дублированная Community-библиотека. Правки в Figma-файле ДС разрешены.

**Нет компонента:**
1. Добавить в Figma DS-файл (страница Accordion или Icons; или создать новую страницу).
2. Оформить как ComponentSet с матрицей вариантов и описанием.
3. Записать строкой в `ds/components.md`: имя, назначение, варианты, Node ID.
4. Только после этого использовать на экране продукта.

**Нет смыслового токена:**
1. Добавить Variable в коллекцию `Semantic` DS-файла с привязкой к существующему примитиву.
2. Дописать в `ds/foundation.md`.
3. Использовать на экране.

**Нет паттерна композиции:**
1. Завести `ds/patterns.md`.
2. Описать: имя, из каких компонентов и токенов собирается, Node ID примера в Figma.

---

## Синхронизация Figma ↔ ds/*.md

`ds/foundation.md` и `ds/components.md` — индекс, по которому агент работает. Расхождение ломает следующие сборки.

- DS в Figma поменялась → перезапустить `ds_scan`, перезаписать `ds/foundation.md` и `ds/components.md`.
- Не редактировать индекс руками без сверки с Figma. Если правки руками — пометить дату и причину.
- Рекомендуемый ритм обновления: раз в 4-6 недель.

---

## Что запрещено

- Прибитые цвета, размеры, радиусы, отступы — везде, где есть подходящий Variable.
- `setTextStyleIdAsync` — Beefy DS не использует Figma Text Styles.
- Создание компонента «на лету» в составе экрана, если можно собрать из существующих.
- Параллельная своя ДС в этой же папке.

## Когда правила можно нарушить

Только при явной команде «здесь без ДС, ad-hoc». Тогда отдельный фрейм вне рабочего канваса, явно помеченный «ad-hoc, не часть продукта».
