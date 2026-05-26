# Fadercraft brand colors

Source of truth: Figma file `OdPRdjodGO3WiR6tgSP7AA`, collection **Colors**.
Page `00 — Brand identity` (1903:5006) renders the three action swatches with live variable bindings — change a variable in Figma and this doc is what gets updated to match.

## Action palette

The three colors that carry the brand. Use in this priority.

| Role | Semantic token | Primitive token | Hex | RGB |
|---|---|---|---|---|
| **Primary** | `Semantic/Action/Primary` | `Primitives/Mint/400` | `#63F2CA` | rgb(99, 242, 202) |
| **Secondary** | `Semantic/Action/Secondary` | `Primitives/Lavender/400` | `#639AF2` | rgb(99, 154, 242) |
| **Tertiary** | `Semantic/Action/Tertiary` | `Primitives/Amber/400` | `#FFAD56` | rgb(255, 173, 86) |

Primary is the brand mark color on dark backgrounds — same mint as `web/favicon.svg` resolves to in dark mode. Tertiary is the light-mode favicon color.

## Neutrals

| Role | Semantic token | Primitive token | Hex |
|---|---|---|---|
| Bg / default (light) | `Semantic/Bg/Default` | `Primitives/Neutral/300` | `#C6C8D2` |
| Bg / surface | `Semantic/Bg/Surface` | `Primitives/Neutral/400` | `#989BAE` |
| Bg / dark | `Semantic/Bg/Dark` | `Primitives/Neutral/1000` | `#0F1017` |
| Border / default | `Semantic/Border/Default` | `Primitives/Neutral/800` | `#2A2C3C` |
| Text / on-light primary | `Semantic/Text/OnLight/Primary` | `Primitives/Neutral/1000` | `#0F1017` |
| Text / on-light secondary | `Semantic/Text/OnLight/Secondary` | `Primitives/Neutral/700` | `#414458` |
| Text / on-light tertiary | `Semantic/Text/OnLight/Tertiary` | `Primitives/Neutral/600` | `#595C73` |

## Usage rules

- **Brand mark / favicon** uses Primary (`#63F2CA`) on dark surfaces, Tertiary (`#FFAD56`) on light surfaces. The SVG at `web/favicon.svg` ships both via `prefers-color-scheme`.
- **Wordmark** is monochrome — neutral text, no action color.
- **CTA buttons** use Primary as default fill. Secondary is reserved for second-tier actions ("Learn more"); Tertiary is for warnings / non-action highlights.
- **Don't recolor the brand mark** outside the three action colors. The mint↔amber swap is the only sanctioned variant.
- **No gradients** in the brand mark or wordmark.

## Distribution

| Surface | Color use |
|---|---|
| `fadercraft.com` landing | Primary CTA, Bg/Dark backgrounds |
| Gumroad profile (`fadercraft.gumroad.com`) | Primary logo on Gumroad's dark theme |
| Gumroad product cover (1280×720) | Primary mark + wordmark on Bg/Dark |
| Instagram tiles (1080×1080) | Primary + Bg/Dark; Tertiary used sparingly |
| M4L device UI | Inherits Ableton Live colors; brand mark only in About panel |
| YouTube channel banner | Primary + Bg/Dark |
