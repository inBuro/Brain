# Copywriter Memory Index

- [Notion API token handling](notion_api_token_handling.md) — canon moved 2026-08-28 to global skill `~/.claude/skills/notion/SKILL.md` (не продукт-специфично, нужно любому агенту, трогающему Notion API)
- [Fadercraft audience voice](fadercraft_audience_voice.md) — platform-split tone rules, anti-patterns, conversion formula, vocabulary; source: voice-guide.md
- [Fadercraft copy anti-patterns](fadercraft_copy_antipatterns.md) — specific banned phrases, structures, and registers that trigger hostile reception
- [killihu style benchmark](reference_killihu_style_benchmark.md) — ToV, page structure template, length norms, M4L vocabulary from 58 killihu.vstskins.com pages (2026-06-18); add-on to Steinkamp voice

- [Dynamic Focus naming](dynamic_focus_naming.md) — DF is final name; tag cleanup done 2026-08-06: 30/33 rows retagged to DF, 3 intentionally left as Mapping Deck (not honest DF fit)
- [Russian range hyphen](feedback_russian_range_hyphen.md) — словесные диапазоны («пять-шесть») пишутся через дефис; en dash только для числовых (5–8)

## Shared references (read-only, owned by other agents)
- [Reddit watchlist](../analyst/reddit-threads-tracking.md) — analyst-owned registry of which Fadercraft Reddit posts we monitor (URLs, UTM campaign, PostHog status); full URLs/narrative in [../project-manager/launch-journal.md](../project-manager/launch-journal.md). Consult this BEFORE analyzing thread voice — it's the canonical list of monitored posts; don't ask the user for links that are already here. Reddit is unreachable for live fetch from this machine (403) — work from the Voice Guide + this registry, or content the user pastes.
