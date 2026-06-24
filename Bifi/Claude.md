# Agent Environment

Трёхуровневая агентская среда. Модель вероятностна, а логику проекта нужно держать предсказуемой — три слоя разводят это.

## Три уровня

**Уровень 1 — Директивы (`directives/`)**
SOP в Markdown: цель, входы, инструменты, выход, краевые случаи. Инструкции, как мид-сотруднику.

**Уровень 2 — Оркестрация (это агент)**
Принятие решений: читает директивы, вызывает инструменты в нужном порядке, обрабатывает ошибки, уточняет, обновляет директивы по ходу.

**Уровень 3 — Execution (`execution/`)**
Детерминированные скрипты, на которых работает приложение. Ключи и токены — в `.env`, в шеринг не попадают.

## Структура
- `directives/` — SOP (одна директива = одна задача)
- `execution/` — скрипты (появятся, когда дойдём до приложения)
- `ds/` — индекс дизайн-системы (см. ниже)
- `.tmp/` — временные файлы, периодически чистим

## Как работать в этой среде

- Делай только то, что просит запущенная директива из `directives/`. По своей инициативе ничего не собирай, Figma не сканируй, `ds/` не заполняй.
- Не выдумывай и не создавай директивы. Нужного файла нет в `directives/` — скажи об этом, не пиши свой.
- При развёртывании среды только создай недостающие служебные папки (`execution/`, `.tmp/`). `ds/` и `directives/` уже на месте — их содержимое не трогай.
- К Figma обращайся ТОЛЬКО когда пользователь явно запустил директиву, которая этого требует, и дал ссылку. Подключение/авторизацию Figma инициирует пользователь, не ты.

## Дизайн-система

В проекте стоит дизайн-система. Все правила работы с интерфейсом — в `ds/CONTRACT.md`. При задачах с экранами, формами, компонентами:

1. Прочитай `ds/CONTRACT.md` целиком.
2. Прочитай `ds/foundation.md` и `ds/components.md` — текущие токены и UI-кит.
3. Действуй строго по контракту: компоненты — из каталога, цвета/размеры/радиусы — через Variables, без прибитых значений.

Источник истины — Figma + папка `ds/`. Индекс ссылается на конкретный Figma-файл. Если работаешь с **копией** этого файла, индекс надо переподвязать — но это делает пользователь, запустив директиву `ds_rebind`. Сам переподвязку не инициируй.



## Purpose

  

This wiki is a structured, interlinked knowledge base for a team chat.

Claude maintains the wiki. The human curates sources, asks questions, and guides the analysis.

  
  

## Folder structure
  

```

raw/ -- source documents (immutable -- never modify these)

wiki/ -- markdown pages maintained by Claude

wiki/index.md -- table of contents for the entire wiki

wiki/log.md -- append-only record of all operations

```

  
  

## Ingest workflow

  
  

When the user adds a new source to `raw/` and asks you to ingest it:

  

1. Read the full source document

2. Discuss key takeaways with the user before writing anything

3. Create a summary page in `wiki/` named after the source

4. Create or update concept pages for each major idea or entity

5. Add wiki-links ([[page-name]]) to connect related pages

6. Update `wiki/index.md` with new pages and one-line descriptions

7. Append an entry to `wiki/log.md` with the date, source name, and what changed

  

A single source may touch 10-15 wiki pages. That is normal.

  

## Page format

  

Every wiki page should follow this structure:

  

```markdown

# Page Title

  
  

**Summary**: One to two sentences describing this page.

  
  

**Sources**: List of raw source files this page draws from.

  
  

**Last updated**: Date of most recent update.

  
  

---

  
  

Main content goes here. Use clear headings and short paragraphs.

  
  

Link to related concepts using [[wiki-links]] throughout the text.

  
  

## Related pages

  
  

- [[related-concept-1]]

- [[related-concept-2]]

```

  
  

## Citation rules

  
  

- Every factual claim should reference its source file

- Use the format (source: filename.pdf) after the claim

- If two sources disagree, note the contradiction explicitly

- If a claim has no source, mark it as needing verification

  
  

## Question answering

  

When the user asks a question:

  
  

1. Read `wiki/index.md` first to find relevant pages

2. Read those pages and synthesize an answer

3. Cite specific wiki pages in your response

4. If the answer is not in the wiki, say so clearly

5. If the answer is valuable, offer to save it as a new wiki page

  

Good answers should be filed back into the wiki so they compound over time.

  
  

## Lint

  

When the user asks you to lint or audit the wiki:

- Check for contradictions between pages

- Find orphan pages (no inbound links from other pages)

- Identify concepts mentioned in pages that lack their own page

- Flag claims that may be outdated based on newer sources

- Check that all pages follow the page format above

- Report findings as a numbered list with suggested fixes

  
  

## Rules

  

- Never modify anything in the `raw/` folder

- Always update `wiki/index.md` and `wiki/log.md` after changes

- Keep page names lowercase with hyphens (e.g. `machine-learning.md`)

- Write in clear, plain language

- When uncertain about how to categorize something, ask the user