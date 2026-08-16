---
name: vpn-proxy-suspects-cohort
description: Dynamic cohort 399599 "VPN/Proxy suspects — geo mismatch" — definition, why it was tightened from the literal ask, size, sample, caveats
metadata:
  type: project
---

Cohort **"VPN/Proxy suspects — geo mismatch"**, id **399599**, dynamic (recalculates automatically), created 2026-07-07 at owner's request.
https://us.posthog.com/project/458316/cohorts/399599

## Property availability check (do this before touching this signal again)
Confirmed 2026-07-07 via `execute-sql` on `events` (90d window, `$pageview`):
- `$timezone` (browser/OS timezone) — **exists and is populated** (5091/5796 events), even though it does NOT appear in `read-data-schema` `event_properties` output for `$pageview` (that list is curated/incomplete — don't trust its absence as proof a property doesn't exist; verify with SQL).
- `$geoip_time_zone`, `$geoip_country_code`, `$geoip_continent_name`, `$browser_language`, `$browser_language_prefix` — all populated, all event-level (not persisted as their own person properties except the geoip ones, which do have `$geoip_*` / `$initial_geoip_*` person-property mirrors).
- **No ASN / ISP / hosting-provider / "datacenter" property exists anywhere in this project** (checked `event_properties` for `$pageview`, `entity_properties` for `person`, and `system.information_schema.tables` for a property-definitions table). Don't build a signal on this — it isn't there.

## Definition (as built)
Person matches if `OR` of:
- **(A, primary)** On any `$pageview` (365d lookback): browser-clock region ≠ IP-geo region — i.e. `$timezone`'s region prefix (`Europe`/`Asia`/`America`/...) is **not contained** in `$geoip_continent_name`. HogQL used as a behavioral `event_filters` condition:
  `isNotNull(properties.$timezone) AND isNotNull(properties.$geoip_time_zone) AND properties.$timezone != properties.$geoip_time_zone AND position(properties.$geoip_continent_name, extract(properties.$timezone, '^([A-Za-z]+)')) = 0`
- **(B, secondary)** On any `$pageview` (365d): non-English `$browser_language` carries an explicit country subtag (e.g. `ru-RU`, `de-DE`) that doesn't match `$geoip_country_code`:
  `isNotNull(properties.$browser_language) AND isNotNull(properties.$geoip_country_code) AND match(properties.$browser_language, '-') AND properties.$browser_language_prefix != 'en' AND upper(extract(properties.$browser_language, '-(.*)$')) != upper(properties.$geoip_country_code)`
- `AND NOT` in cohort 349231 (Internal / Test users).

Both signals implemented as **PostHog behavioral cohort filters** (`type: "behavioral"`, `value: "performed_event"`, `key: "$pageview"`, `event_type: "events"`) with a `hogql`-type `event_filters` entry — this is how you express "property A vs property B" comparisons in a dynamic PostHog cohort; plain `person`-type filters can only compare a property to a fixed value, not to another property.

**JSON structure gotcha:** PostHog rejects a filter group whose `values` array mixes a nested `PropertyGroup` (AND/OR with its own `values`) and a bare `Property`/`behavioral`/`cohort` object at the same level ("Property list cannot contain both PropertyGroup and Property objects"). Fix: wrap every sibling in its own group, even a single-condition one — e.g. the cohort-exclusion became `{"type":"AND","values":[{"type":"cohort","key":"id","value":349231,"negation":true}]}` instead of a bare cohort object next to the OR group.

## Why refined from the owner's literal ask ("$timezone != $geoip_time_zone")
Tested the literal form first via `execute-sql`: it matched **80/220 persons (36%)** lifetime — dominated by GeoIP city-level imprecision inside large multi-timezone countries, overwhelmingly the US (e.g. one person's browser tz `America/Los_Angeles` vs geoip tz `America/Chicago` — same person, same country, MaxMind just resolved the wrong US city — not a VPN signal at all). Breakdown showed 58/110 raw mismatch events were exactly this US same-country noise.
Restricting signal A to continent-level mismatch cut it to **31/220 (14%)**.
Signal B (any `$browser_language`/`$geoip_country_code` mismatch, no other restriction) hit **83/220 (38%)** — swamped by generic English-locale visitors (`en-US`/`en-GB` is close to a global default, uninformative about actual location). Restricting to non-English locales with an explicit region subtag cut it to **18/220 (8%)**.
Combined via OR: **47/220 (~21%)**.
This was a deliberate tightening of the owner's literal spec, not a silent substitution — flagged in the cohort description itself so anyone reading it later sees the reasoning and can loosen it back if they disagree.

## Caveat (baked into the cohort description too)
False positives are expected and likely: legitimate travelers, expats who keep their home OS locale/timezone while abroad, and multi-region households will trip this. **Treat membership as "worth a Session Replay look," not confirmed VPN/proxy usage.**

## Sample (5-10 members, pulled 2026-07-07)
Notable pattern in the sample: a cluster of Russian-locale (`ru-RU`/`ru`) browsers with Moscow/Samara/Novosibirsk timezone but IP resolving to NL/AT/DE/HU/SE/KZ — classic "Russian visitor via EU/CIS VPN exit node" shape (plausible given Russia's internet restrictions push VPN use). This is reassuring — signal A/B are catching a real, coherent pattern, not just noise, though see caveat above.

| distinct_id | geoip country | geoip tz | browser tz | browser lang | browser | first seen |
|---|---|---|---|---|---|---|
| 019f3d1e-22c2... | NL | Europe/Amsterdam | Europe/Moscow | ru-RU | Chrome | 2026-07-07 22:06 ICT |
| 019f3cf7-ec54... | AT | Europe/Vienna | Europe/Samara | ru-RU | Yandex | 2026-07-07 21:25 ICT |
| 019f3cd3-f7d6... | DE | Europe/Berlin | Asia/Novosibirsk | ru-RU | Chrome | 2026-07-07 20:45 ICT |
| 019f3ccd-c641... | KZ | Asia/Almaty | Europe/Moscow | ru | Mobile Safari | 2026-07-07 20:39 ICT |
| 019f3cc6-556f... | HU | Europe/Budapest | Europe/Budapest | ru-RU | Chrome | 2026-07-07 20:30 ICT (tz same — this one's actually B-only, weak) |
| 019f3cc2-f8bb... | AT | Europe/Vienna | Europe/Moscow | ru-RU | Chrome | 2026-07-07 20:27 ICT |
| 019f3cb1-07c7... | US | America/Chicago | Europe/Moscow | ru | Yandex | 2026-07-07 19:47 ICT |
| 019f31d4-d469... | IE | Europe/Dublin | America/Los_Angeles | en-US | Chrome | 2026-07-05 17:31 ICT |
| 019f213c-5521... | US | America/Denver | UTC | en-US | Chrome | 2026-07-02 12:10 ICT |

The 2026-07-07 18:21-22:06 ICT cluster (7 of the 9 sampled rows, all within ~4h) is worth a second look on its own — could be one visitor cycling VPN exit nodes, several distinct real people, or automated/bot traffic; not diagnosed here, flag if it recurs.

## Maintenance
Dynamic — recalculates automatically on person-property/event changes. If it balloons or empties out as traffic grows, re-run the same `execute-sql` diagnostic (literal mismatch % vs continent-restricted %) before touching the filter, so any future retuning is evidence-based like this one.
