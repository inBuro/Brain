# DS Source

**Источник:** своя ДС, встроена в файл продукта
**Figma-файл:** https://www.figma.com/design/OdPRdjodGO3WiR6tgSP7AA/Fadercraft
**Дата сканирования:** 2026-06-19
**Локаль продукта:** en

## Структура файла

16 страниц в файле. DS-страницы:

| Страница | ID | Назначение |
|---|---|---|
| `Tokens` | `0:1` | Reference-фреймы для переменных (нет компонентов) |
| `Atoms` | `25:2` | Базовые атомы: Button, Badge, ModeButton, Input и др. |
| `Icons` | `2310:18598` | Системные иконки + KitIcons + лого-компоненты |
| `Molecules` | `63:2` | Составные блоки: карточки, FAQ, Newsletter и др. |
| `Organisms` | `63:3` | Секции лендинга: Hero, Header, Footer, FeatureSplit и др. |
| `Logo` | `2310:18568` | Пустая (лого-компоненты на странице Icons) |

Не-DS страницы: Product (макеты), Content, Illustrations, Brand exports, Channel art, Gumroad covers, OG image, Free Custom Modes, Images, Hub.

## Variables

3 коллекции, 168 переменных:
- `Colors` — 130+ COLOR vars: Primitives (Neutral/Mint/Lavender/Amber/Red/Citron/Hue) + Semantic
- `Typography` — 5 STRING vars: Weight/Regular/Medium/SemiBold/Bold
- `Density` — 34 FLOAT vars: spacing scale (4px grid, имена = rem-like, значения = px)

## Замечания

- Hue/03 отсутствует в коллекции (пропущен)
- Hue/10 и Hue/11 оба = #808080 (серый-заглушка, слоты не назначены)
- Logo-страница пустая; лого-компоненты живут на странице Icons
- `WhyChooseNovation` на Organisms — устаревшее имя (осталось от предыдущего продукта)
- Единственный компонент с описанием в Figma: `FeatureBeat` ("Two-line feature beat...")
