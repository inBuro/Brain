---
name: controlxl-bundle-zips
description: Рецепт и инварианты пересборки Control XL bundle-зипов (Demo + Starter) в ~/Brain/Fadercraft/Control XL/dist/
metadata:
  type: project
---

Два релизных зипа Control XL живут в `~/Brain/Fadercraft/Control XL/dist/`:
`Fadercraft Control XL v1.0 - Demo.zip` (~193 MB, с Samples) и `... - Starter.zip` (~180 KB, без Samples).

**Целевое дерево бандла** (root = `Fadercraft Control XL v1.0 - <Demo|Starter>/`):
- `Control XL.amxd` (root, device, md5 `44aa142b198b6001613db3b29c36cc38` = чистый канон)
- `Router.als` (root, ссылка на sibling `Control XL.amxd`)
- `15 Custom Modes/` (15 `.syx`, имя С ПРОБЕЛАМИ — НЕ `custom-modes`)
- `Quickstart.pdf`
- `Control XL <Demo|Starter> Project/`: `Control XL <X>.als` + `Max Devices/Control XL.amxd` + `Ableton Project Info/Cache.cfg` (+ `Samples/` только в Demo)
- README в зип НЕ кладём.

**Источник сборки (ЕДИНСТВЕННЫЙ, с 2026-06-10):** `~/Brain/Fadercraft/Control XL/dist/`. Из `~/Projects/Claude/Fadercraft/` больше НИЧЕГО не брать (старый custom-modes мастер юзер снёс).
- Моды: `Control XL/dist/15 Custom Modes/` (15 `.syx`, эталон). Папка УЖЕ с правильным именем — в зип кладётся как есть, БЕЗ переименования. `15.syx` len 670, **byte574 = 0x6e**.
- Девайс/Router/проект/Quickstart.pdf: из `Control XL/dist/`. Root `Control XL.amxd` берётся из `Control XL/dist/Control XL <X> Project/Control XL.amxd`.
- README в зип НЕ класть.

**Рецепт сборки (собираем дерево заново из dist, не из старого зипа):** для каждого KIND (Demo|Starter) staging-root = `Fadercraft Control XL v1.0 - <KIND>/`; копируем: root `Control XL.amxd`, `Router.als` (починенный), `Quickstart.pdf`, `15 Custom Modes/`; внутрь `<Проект>/`: `Control XL <KIND>.als`, `Max Devices/Control XL.amxd`, `Ableton Project Info/*.cfg`, + `Samples/` только Demo. Затем scrub: `.DS_Store`, `Icon`, `._*`, `__MACOSX`, папки `Backup/`. Дисковая папка `Control XL <X> Project/` — ГИБРИД (содержит и Router.als, и root-style amxd, и Backup/Icon), НЕ паковать как root напрямую — собирать выборочно.

**Инварианты проверки (всегда гонять с НОВОГО зипа):**
- папка `15 Custom Modes` есть, `custom-modes` = 0 вхождений, 15 `.syx`, `15.syx` byte574=0x6e
- корень = ровно {Control XL.amxd, Router.als, 15 Custom Modes/, Quickstart.pdf, <Проект>/}, README нет
- все `.als`: `SelectedDocumentViewInMainWindow Value="1"` = **Session** (семантика 1=Session, 0=Arrangement — в этом проекте инверсии больше нет, юзер исправил 2026-06-10)
- Router.als (ОБА бандла): девайс грузится через `PatchSlot > MxPatchRef > FileRef`. ОБА FileRef-а (этот + `OriginalFileRef` в BranchSourceContext) ДОЛЖНЫ быть `RelativePathType=1` (RelativeToDocument), `RelativePath="Control XL.amxd"`, sibling рядом с .als. Абсолютный `Path` = свой бандл (Demo→Demo Project, Starter→Starter Project), НЕ чужой. `BrowserContentPath Value=""` (пустой). 0 вхождений `User Library`/`userfolder`. **Баг 2026-06-10:** оба Router.als были байт-идентичны, PatchSlot указывал на ЧУЖОЙ Starter-проект (type=3), а OriginalFileRef держал хардкод User-Library (type=6) → у покупателя без User Library девайс не находился. Починено: type→1, sibling, свой бандл.
- главный сет: `RelativePath Value="Max Devices/Control XL.amxd"`
- amxd md5 = `44aa142b...` (root и Max Devices); 0 файлов/ссылок с именем `XL_Performance`
- нет Icon/Backup/.DS_Store/._*/__MACOSX

**Бэкап перед перезаписью:** `cp -p` старых зипов в `Control XL/raw/archive/` с дата-меткой `YYYY-MM-DD-HHMMSS`.
**Упаковка:** `cd <stage> && zip -r -X -q <out>.zip "<bundle root>" -x "*.DS_Store" -x "*/__MACOSX/*" -x "*/._*"`.
