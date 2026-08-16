---
name: density-full-scan
description: Полный список имён variable collection "Density" в Fadercraft Figma (fileKey OdPRdjodGO3WiR6tgSP7AA), живой скан 2026-07-04, + сниппет для биндинга переменных в use_figma
metadata:
  type: reference
---

Живой скан `figma.variables.getLocalVariableCollectionsAsync()` → collection "Density", 2026-07-04:

`-4, -3, -2, -1, -0,5, 0, 0,25, 0,5, 0,75, 1, 1,25, 1,5, 2, 2,5, 3, 3,5, 4, 4,25, 4,5, 5, 6, 6,25, 6,5, 7, 7,5, 8, 8,5, 9, 10, 10,5, 12, 12,5, 15,5, 16, 20, 24, 32, 999`

px-эквиваленты ключевых (база 4px): 0,25=1 · 0,5=2 · 0,75=3 · 1=4 · 1,5=6 · 2=8 · 2,5=10 · 3=12 · 3,5=14 · 4=16 · 4,5=18 · 5=20 · 6=24 · 7=28 · 7,5=30 · 8=32 · 9=36 · 10=40 · 12=48 · 16=64 · 20=80 · 24=96 · 32=128.

`999` — служебное значение (вероятно pill/infinite radius), не путать со шкалой. Отрицательные (`-0,5`…`-4`) встречаются на компенсирующих негативных отступах (напр. `pr-[var(---3,-12px)]` под иконку в кнопке).

**Расхождение с MEMORY.md**: главный файл памяти утверждает, что `40` (160px) был добавлен 2026-06-25 — в этом скане `40` ОТСУТСТВУЕТ. Не полагаться на `40` без повторной проверки.

## Как биндить переменную к узлу в `use_figma`
```js
async function getVar(collectionName, varName) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const col = cols.find(c => c.name === collectionName);
  for (const vid of col.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(vid);
    if (v && v.name === varName) return v;
  }
  throw new Error("not found");
}
function bindColor(node, prop, variable) {
  let paint = { type: 'SOLID', color: {r:1,g:1,b:1}, opacity: 1 };
  paint = figma.variables.setBoundVariableForPaint(paint, 'color', variable);
  node[prop] = [paint]; // prop: 'fills' | 'strokes'
}
// spacing/radius/size: node.setBoundVariable('itemSpacing'|'paddingLeft'|'width'|'height'|'cornerRadius', variable)
// text style: await textNode.setTextStyleIdAsync(style.id) — ПОСЛЕ figma.loadFontAsync(style.fontName) и после установки characters
```

## Ловушка: stray per-instance overrides переживают правку master
Если инстанс компонента был создан/трогался ДО структурной правки master (reparent, reorder, resize), у него могут быть собственные overrides (explicit width/height/visible), которые НЕ синхронизируются автоматически при последующих правках master. Симптом: инстанс выглядит иначе чем master (другая высота, пропавший блок). Быстрый фикс: `instance.resetOverrides()` — сбрасывает все per-instance overrides к текущему состоянию master. См. [[panel-anatomy]] — обнаружено и исправлено 2026-07-04.
