# Правила схемы Directus — правильное поле под каждый формат

Главный принцип: **каждое смысловое значение — отдельное поле с правильным типом и интерфейсом.** Тогда редактор в админке видит нормальные контролы (редактор текста, загрузку картинки, календарь, выпадающий список), а не сырой JSON. Структурный контент одним json-полем — запрещено.

## Маппинг: формат контента → тип + интерфейс

| Контент | Тип поля | Интерфейс | Заметки |
|---|---|---|---|
| Короткий текст (заголовок, имя) | string | input | |
| Длинный текст без форматирования | text | textarea | |
| Форматированный текст (статья, описание) | text | WYSIWYG (input-rich-text-html) | или markdown-редактор, если продукт рендерит markdown |
| Картинка | file (uuid) | image | одна картинка = file, не строка с URL |
| Галерея картинок | files (M2M к directus_files) | files | |
| Дата / дата-время | date / timestamp | datetime | не строка |
| Число (количество, порядок) | integer | input | |
| Цена | decimal | input | не float-строка |
| Да/нет (показывать, в наличии) | boolean | toggle | |
| Выбор одного из списка (категория, уровень) | string | select-dropdown + choices | фиксированный список — в choices |
| Теги | json (массив строк) | tags | единственный оправданный json |
| Слаг для URL | string | input | заполняется из заголовка, уникальный |
| Ссылка на одну запись (статья → автор) | M2O relation | select-dropdown-m2o | настоящая связь, не текстовое поле с именем |
| Список дочерних (тариф → его фичи) | O2M relation | list-o2m | |
| Многие-ко-многим (статьи ↔ теги-коллекция) | M2M relation | list-m2m | |

## Служебные поля контентной коллекции

Каждой коллекции, которую редактируют люди:

- `status` — string, select-dropdown: published / draft / archived, дефолт **draft**. Продукт запрашивает только published (`filter[status][_eq]=published`).
- `sort` — integer, для ручного порядка (включи как sort-поле коллекции).
- `date_created`, `date_updated` — системные (special: date-created / date-updated), заполняются сами.

## Именование

- Коллекции: snake_case, множественное число (`articles`, `pricing_plans`, `reviews`).
- Поля: snake_case (`title`, `cover_image`, `published_at`).
- Имена смысловые на английском — по ним продукт обращается к API.

## Чтение с продукта

- Список: `GET {URL}/items/articles?filter[status][_eq]=published&sort=sort&fields=*`
- Одна запись по слагу: `GET {URL}/items/articles?filter[slug][_eq]=<slug>&limit=1`
- Связи разворачиваются через `fields=*,author.*`
- Картинки: `{URL}/assets/<file-id>?width=1200&format=webp` — Directus сам ресайзит и конвертирует.
