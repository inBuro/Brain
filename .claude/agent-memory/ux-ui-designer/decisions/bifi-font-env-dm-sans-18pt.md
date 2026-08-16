---
name: bifi-font-env-dm-sans-18pt
description: "DM Sans 18pt" cannot be loaded via figma.loadFontAsync in agent/use_figma sessions in BOTH Fadercraft and Bifi product files — three-case workaround recipe
metadata:
  type: project
---

## The problem

`"DM Sans 18pt"` is a named optical-size instance of the DM Sans variable font used heavily in both product files:
- **Bifi** (`fLrH3120KL4aNrtSBwi2rT`): dashboard value-text layer in "Your Vaults" row
- **Fadercraft** (`OdPRdjodGO3WiR6tgSP7AA`): ALL section text (headings, body, eyebrows — the entire file uses `"DM Sans 18pt"` family)

`figma.loadFontAsync({family: "DM Sans 18pt", style: "Bold"})` throws:
> `The font family "DM Sans 18pt" does not exist`

The installed font catalog only exposes `"DM Sans"` (styles: Bold, Regular, SemiBold, Medium). This blocks `.characters` edits and `insertChild` when a node's `fontName.family === "DM Sans 18pt"`.

Confirmed not a typo/casing issue. Not fixable from within a `use_figma` script — it's an env/font-catalog limitation.

## Three-case workaround recipe (use the correct case — mixing them causes errors)

### Case A: EXISTING node already in the document

Goal: change `node.characters` while preserving text style binding.

```javascript
await figma.loadFontAsync({ family: 'DM Sans', style: 'Bold' }); // or Regular, SemiBold
// 1. Swap fontName to a loadable variant
node.fontName = { family: 'DM Sans', style: 'Bold' }; // same weight as original
// 2. Change text
node.characters = 'new text';
// 3. Restore text style binding — works on existing nodes even though DM Sans 18pt can't load
if (styleId) await node.setTextStyleIdAsync(styleId);
```

`setTextStyleIdAsync` succeeds on existing nodes (it's just setting a reference, not loading the font at runtime). The node visually uses DM Sans 18pt again after this step.

### Case B: CLONED node before `insertChild`

Goal: insert a cloned FAQ item / section / component. Clone retains `"DM Sans 18pt"` references → `insertChild` fails with the same font error.

```javascript
const clone = sourceNode.clone();
// 1. Swap ALL text node fonts in clone BEFORE insertChild
const allTexts = clone.findAll(n => n.type === 'TEXT');
for (const tn of allTexts) {
  if (tn.fontName !== figma.mixed) {
    tn.fontName = { family: 'DM Sans', style: tn.fontName.style };
  } else {
    tn.setRangeFontName(0, tn.characters.length, { family: 'DM Sans', style: 'Bold' });
  }
}
// 2. Change text if needed
clone.findOne(n => n.type === 'TEXT').characters = 'new text';
// 3. DO NOT call setTextStyleIdAsync — it restores DM Sans 18pt → insertChild will fail again
// 4. Only now insert
parent.insertChild(index, clone);
```

**Debt**: cloned node is left without textStyleId binding. Flag and fix manually in Figma or in a later session when the font issue is resolved.

### Case C: NEW text node (createText)

Goal: add a brand-new text element with the correct color and visual style.

```javascript
await figma.loadFontAsync({ family: 'DM Sans', style: 'Regular' });
const node = figma.createText();
node.fontName = { family: 'DM Sans', style: 'Regular' };
node.fontSize = 20; // set manually
node.lineHeight = { value: 30, unit: 'PIXELS' };
node.characters = 'text here';
// Copy fills from a reference node for correct color variable binding
node.fills = JSON.parse(JSON.stringify(referenceNode.fills));
// DO NOT call setTextStyleIdAsync — same risk as Case B if it restores DM Sans 18pt
parent.appendChild(node);
```

**Debt**: new node is not bound to textStyleId. Same manual fix needed.

## Status and scope

- Applies to ALL text in the Fadercraft file (not just dashboard values as originally noted for Bifi)
- Confirmed 2026-07-21 during Dynamic Focus page text update (`2892:2337`)
- Cases A/B/C pattern validated in production across both files
- Revisit if/when Figma's font catalog starts resolving `"DM Sans 18pt"` — re-verify then before assuming this note is stale
