# Fadercraft email infrastructure

Status as of 2026-05-04. Verified end-to-end via mail-tester.com — score 8.3/10, SPF/DKIM/DMARC all PASS.

## Inbound — Cloudflare Email Routing

Forwards `*@fadercraft.com` to `hellokbbureau@gmail.com`.

| Address | Action | Destination |
|---|---|---|
| `hello@fadercraft.com` | Send to email | hellokbbureau@gmail.com |
| `support@fadercraft.com` | Send to email | hellokbbureau@gmail.com |
| `noreply@fadercraft.com` | Send to email | hellokbbureau@gmail.com |
| Catch-all (`*@fadercraft.com`) | Drop (toggle Active but action=Drop) | — |

Note on catch-all: currently set to Drop. To capture typo addresses (e.g. `hellp@`, `helo@`), change Action to "Send to email" → hellokbbureau@gmail.com. Trade-off: more inbound spam over time.

## Outbound — SendGrid (free tier, 100 emails/day post-trial)

Authenticated domain: `fadercraft.com`. Verified via 3 CNAMEs in Cloudflare DNS (DNS-only, not proxied).

- Account email: `hellokbbureau@gmail.com`
- API key: stored in password manager under "Fadercraft / SendGrid relay"
- Single API key with **Restricted Access → Mail Send: Full Access** only
- Trial converts to Free tier on 2026-07-03 — 100 emails/day forever, no card required

## Gmail "Send mail as" relay

Configured in `hellokbbureau@gmail.com` Gmail Settings → Accounts and Import → Send mail as.

The display name is `Fadercraft`, the email address is `hello@fadercraft.com`, and the "Treat as alias" checkbox stays **unchecked** so Gmail performs full outbound through the SMTP relay rather than going via its own.

For the SMTP relay endpoint, port number, and the literal username string SendGrid expects, follow [SendGrid's official SMTP integration guide](https://www.twilio.com/docs/sendgrid/for-developers/sending-email/integrating-with-the-smtp-api). The password field is filled with the API key generated above (stored in the password manager — see §Outbound). TLS-secured connection is selected.

Gmail then sends a verification code to `hello@fadercraft.com`; it arrives via the routes from §Inbound and is pasted back to complete the wizard.

Compose new email in Gmail → From dropdown → choose `Fadercraft <hello@fadercraft.com>` → send through the SendGrid relay with proper DKIM signing.

## DNS records (Cloudflare, fadercraft.com)

| Type | Name | Value | Proxy | Source |
|---|---|---|---|---|
| MX | @ | route1.mx.cloudflare.net (4) | n/a | CF Email Routing |
| MX | @ | route2.mx.cloudflare.net (13) | n/a | CF Email Routing |
| MX | @ | route3.mx.cloudflare.net (54) | n/a | CF Email Routing |
| TXT | @ | `v=spf1 include:_spf.mx.cloudflare.net ~all` | n/a | CF Email Routing |
| TXT | cf2024-1._domainkey | `v=DKIM1; h=sha256; k=rsa; p=...` | n/a | CF Email Routing (DKIM for forwards) |
| CNAME | em678 | u106728204.wl205.sendgrid.net | DNS only | SendGrid (return path) |
| CNAME | s1._domainkey | s1.domainkey.u106728204.wl205.sendgrid.net | DNS only | SendGrid (DKIM #1) |
| CNAME | s2._domainkey | s2.domainkey.u106728204.wl205.sendgrid.net | DNS only | SendGrid (DKIM #2) |
| TXT | _dmarc | `v=DMARC1; p=none; rua=mailto:hello@fadercraft.com` | n/a | manual (monitor mode) |

Note: SendGrid does NOT require `include:sendgrid.net` in the main SPF record because it uses CNAME-based return path (`em678.fadercraft.com`) for SPF alignment.

## Verification (2026-05-04, mail-tester.com)

- Total: 8.3/10
- DKIM: PASS (signature valid, author's domain, envelope-from domain)
- SPF: PASS
- DMARC: properly authenticated
- IP reputation: good (MailSpike whitelist)
- Not blacklisted

The 1.7-point loss came entirely from sending a one-word test email; real production emails do not trigger that filter.

## Future considerations

- When scaling beyond 100 emails/day → evaluate Mailgun, Resend, or paid SendGrid.
- DMARC currently in `p=none` (monitor mode). After 2-4 weeks of clean reports, consider tightening to `p=quarantine` or `p=reject` for stronger spoofing protection.
- Orphan SendGrid record `em7377.fadercraft.com` (CNAME in CF DNS) can be deleted — leftover from initial wizard run, harmless.
