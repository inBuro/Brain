---
name: panel-anatomy-debt
description: Pre-existing raw-hex долг в мастер-компоненте "Control XL" device mockup, обнаруженный при сборке секции PanelAnatomy 2026-07-04 — ждёт product decision, не закрыт
metadata:
  type: project
---

При сборке секции PanelAnatomy (см. [[panel-anatomy]]) обнаружено: мастер-компонент **"Control XL"** (device mockup, Molecules page, component set `1958:5290`, variants State=cold/11/12/13/14; также напрямую используется как hero-инстанс на Hub) целиком построен на raw hex fills/strokes, НЕ на переменных: bg `#423732`, titlebar `#534842`, текст `#d6cbc0`, wells `#241d17`, borders `#16110e`, divider `#2d2522`, active-tab `#ffad56` (единственный, что совпадает с существующим semantic amber-токеном, но всё равно не bound).

**Why not fixed now:** это отдельная, уже сознательно иная визуальная система ("device skin", тёплая мокка-палитра для скриншотов самого железного/софт-панельного устройства) — отдельная от app-chrome тёмной палитры Semantic/OnDark. Компонент уже используется в проде (существующий Hub hero + product-фрейм «123»), правка мастера — это retint всей палитры устройства, требует product/brand sign-off (сколько именно оттенков мокки нужно как отдельная semantic-группа: `Device/Bg`, `Device/Titlebar`, `Device/Text`, `Device/Well`, `Device/Border`?), это выходит за рамки задачи «собрать/поправить одну секцию».

**How to apply / план возобновления:**
1. Продукт подтверждает: нужна ли отдельная переменная-группа `Device/*` (5-6 токенов) для device-skin палитры, или это разовый визуальный выбор, не подлежащий токенизации (skeuomorphic screenshot, а не UI).
2. Если да — создать группу переменных `Device/Bg`, `Device/Titlebar`, `Device/Text`, `Device/Well`, `Device/Border`, `Device/Divider` в коллекции Colors, привязать один раз в мастер-компоненте `1958:5290` (все variants), проверить что все инстансы (hero, PanelAnatomy в обоих местах) не сломались визуально.
3. Не трогать до явного продуктового решения — компонент используется в живых секциях, любая правка мастера рискует визуальной регрессией без review.

Статус: ждёт product decision. Не в работе.
