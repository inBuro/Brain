---
type: reference
project: Fadercraft
created: 2026-05-26
updated: 2026-05-26
---

# External Links

**Summary**: Single source of truth for all Fadercraft external URLs (social, storefronts, support, docs). Used by the landing site, footer, README and any outreach. Update here first, then propagate to code.

**Sources**: —

**Last updated**: 2026-05-26

---

## Social

| Platform  | Handle         | URL                                             | Status |
|-----------|----------------|-------------------------------------------------|--------|
| Instagram | `fadercraft_`  | https://www.instagram.com/fadercraft_           | live   |
| YouTube   | `@fadercraft`  | https://www.youtube.com/@fadercraft             | live   |
| Facebook  | —              | —                                               | TBD    |
| TikTok    | —              | —                                               | TBD    |
| Discord   | —              | —                                               | TBD    |

## Storefronts

| Platform | URL                                               | Notes                          |
|----------|---------------------------------------------------|--------------------------------|
| Gumroad  | https://fadercraft.gumroad.com                    | umbrella store                 |
| Gumroad  | https://fadercraft.gumroad.com/l/control-xl       | XL_Performance product page    |

## Support

| Channel | Address                       | SLA                            |
|---------|-------------------------------|--------------------------------|
| Email   | support@fadercraft.com        | 48h response on working days   |

## Web

| Surface       | URL                       | Notes                       |
|---------------|---------------------------|-----------------------------|
| Landing site  | https://fadercraft.com    | React landing (Cloudflare)  |

## Code references

When updating a link here, also touch:

- `~/Projects/Claude/Fadercraft/app/src/components/organisms/FooterFull/FooterFull.tsx` — `defaultSocials`
- `~/Projects/Claude/Fadercraft/app/src/pages/LandingPage.tsx` — `ctaHref`, support email in FAQ
- `~/Projects/Claude/Fadercraft/app/src/pages/ProductPage.tsx` — same

## Related pages

- [[index]]
- [[roadmap]]
- [[payment-rails]]
