# Fadercraft Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring Fadercraft from "idea" to "launch-ready" — domain, email, brand, product bundle with in-device update-check, landing page, demo video, and Gumroad storefront, all connected and tested.

**Architecture:** Static landing on Cloudflare Pages, single product on Gumroad ($39), in-device JS pings a static JSON endpoint for version-check, license verification via Cloudflare Worker against Gumroad License API. Email Routing on Cloudflare forwards to existing Gmail; outbound via SendGrid relay.

**Tech Stack:** Cloudflare (Registrar, DNS, Pages, Workers, Email Routing), SendGrid (SMTP relay), Gumroad (commerce + license API), Buttondown (newsletter), Max for Live 9.x, Ableton Live Suite, Novation Components, vanilla HTML/CSS/JS.

---

## 0. How to read this plan

This plan is a **living direction**, not a contract. Steps are sized so each one is a single 2–10 minute action; tasks are sized so each one delivers a self-contained piece of working infrastructure. Re-open any task and revise its steps when reality demands. Do not power through a step that has become wrong because "the plan said so".

Tasks are mostly sequenced by dependency, but several are parallelizable — see the dependency map in section 1.

---

## 1. Dependency map

```
T1 Domain & DNS          ─┬─→ T2 Email infra
                          ├─→ T6 Update-check server
                          └─→ T7 Landing page

T3 Brand identity         ─┬─→ T7 Landing page
                          ├─→ T5 Instagram
                          └─→ T9 Demo video

T4 Gumroad storefront     ──→ T6 (Worker needs Gumroad API key) ──→ T12 Bundle upload

T8 M4L device             ─→ T6 (device needs version.json URL)
T9 Demo video             ─→ T7 Landing page (embed)
T10 Documentation        ──→ T12 Bundle upload
T11 Newsletter pipeline  ─→ T7 Landing page (signup form embed)

T12 Bundle upload         ─→ T13 Final verification
```

**Parallelizable from day 1:** T1 (mostly done), T3, T4, T11 — start any of these in any order.
**Blocked until T1 done:** T2, T6, T7.
**Blocked until T6 done:** T8 in-device check button (can stub URL until then).
**Last in chain:** T12, T13.

---

## 2. File structure (what gets created where)

**Web (Cloudflare Pages repo, recommend new sibling repo `~/Brain/Novation/web/`):**
- `web/index.html` — landing page, single long-scroll
- `web/style.css` — styles (vanilla, no framework)
- `web/main.js` — light interactivity (smooth scroll, video autoplay control)
- `web/api/version.json` — static endpoint, `{latest, url, changelog}`
- `web/update.html` — license-key entry form
- `web/functions/api/verify-license.js` — Cloudflare Pages Function for license verification
- `web/assets/logo.svg`, `web/assets/wordmark.svg`, `web/assets/hero-loop.mp4`
- `web/wrangler.toml` — CF Pages config

**M4L device (existing path, `~/Music/Ableton/User Library/Max Devices/`):**
- `XL_Performance.amxd` — modify (add version display, check button, indicator dot, browser-open button, newsletter signup, optional heartbeat)
- `update_check.js` — new
- `solo_follower.js` — no changes

**Brand assets (`~/Brain/Novation/brand/`):**
- `brand/logo.svg`
- `brand/wordmark.svg`
- `brand/colors.md`
- `brand/social-tiles/`

**Bundle build (`~/Brain/Novation/dist/`):**
- `dist/Quickstart.md`, `dist/Quickstart.pdf`
- `dist/README.md` (extended ref)
- `dist/XL_Performance_starter.als`
- `dist/custom-modes/lcxl-mk3-modes.json`
- `dist/fadercraft-xl-performance-v1.0.zip` — final upload artifact

---

## 3. Tasks

### T1: Domain & DNS

**Status when this plan was written:** domain registered on Cloudflare Registrar; nameservers `anita.ns.cloudflare.com` / `rohin.ns.cloudflare.com` active; DNS Records page is empty.

**Files / services:** Cloudflare dashboard → `fadercraft.com` → DNS → Records.

- [ ] **T1.1: Add `www` CNAME (CF alert #1)**

  Cloudflare → DNS → Records → **Add record**:
  - Type: `CNAME`
  - Name: `www`
  - Target: `fadercraft.com`
  - Proxy status: Proxied (orange cloud on)
  - TTL: Auto
  - **Save**

- [ ] **T1.2: Verify the record propagated**

  Run: `dig www.fadercraft.com +short`
  Expected: returns Cloudflare proxy IPs (3-letter CNAME chain ending at CF IPs).

- [ ] **T1.3: Decide landing host**

  Recommendation: **Cloudflare Pages** — free, sits in same dashboard, zero extra config. Skip Vercel/Netlify unless there's a strong reason.

- [ ] **T1.4: Commit decision to spec (open question 12 → resolved)**

  Edit `docs/superpowers/specs/2026-05-01-fadercraft-launch-design.md` section 12, remove the "landing host" open question (it was implicit via spec section 10.1 anyway).

  Run:
  ```bash
  git add docs/superpowers/specs/2026-05-01-fadercraft-launch-design.md
  git commit -m "docs: lock Cloudflare Pages as landing host"
  ```

---

### T2: Email infrastructure

**Files / services:** Cloudflare Email Routing, SendGrid free tier, Gmail.

- [ ] **T2.1: Enable Cloudflare Email Routing**

  Cloudflare → `fadercraft.com` → **Email** → **Email Routing** → **Get started**.
  Cloudflare auto-creates the required MX + TXT records for routing. Confirm them in DNS → Records (3 MX records pointing at `*.mx.cloudflare.net`, 1 TXT for SPF stub).

- [ ] **T2.2: Add Gmail as destination address**

  Email Routing → **Destination addresses** → **Add destination address** → enter `hellokbbureau@gmail.com` → **Send verification** → open the email Cloudflare sends to that Gmail → click verification link.

- [ ] **T2.3: Create routes**

  Email Routing → **Routes** → **Create address** for each:
  - `hello@fadercraft.com` → `hellokbbureau@gmail.com`
  - `support@fadercraft.com` → `hellokbbureau@gmail.com`
  - `noreply@fadercraft.com` → `hellokbbureau@gmail.com`

  Then **Catch-all address** → enable → action: send to `hellokbbureau@gmail.com`.

- [ ] **T2.4: Test inbound**

  From a different email (personal phone, etc.), send a test message to `hello@fadercraft.com`. Within ~30 seconds it should appear in `hellokbbureau@gmail.com`. If not, recheck routes and destination verification.

- [ ] **T2.5: Sign up SendGrid free tier**

  https://signup.sendgrid.com/ → create account with `hellokbbureau@gmail.com` → confirm email.

- [ ] **T2.6: SendGrid Domain Authentication**

  SendGrid → **Settings → Sender Authentication** → **Authenticate Your Domain** → DNS host: "Other Host (Not Listed)" → domain: `fadercraft.com` → **Next**.
  SendGrid generates 3 CNAME records (looks like `s1._domainkey.fadercraft.com`, `s2._domainkey.fadercraft.com`, `em####.fadercraft.com`). Copy them.

- [ ] **T2.7: Add SendGrid CNAMEs to Cloudflare DNS**

  For each of the 3 CNAMEs from T2.6: Cloudflare → DNS → Records → **Add record** → Type CNAME, Name from SendGrid (e.g. `s1._domainkey`), Target from SendGrid (e.g. `s1.domainkey.uXXXXX.wlYYY.sendgrid.net`), **Proxy status: DNS only** (grey cloud — DKIM must not be proxied).

- [ ] **T2.8: Verify in SendGrid**

  Back in SendGrid → Domain Authentication → **Verify**. All 3 records should show ✅ within 5 minutes (DNS propagation). If any fail, recheck the value vs DNS record exactly.

- [ ] **T2.9: Generate SendGrid API key**

  SendGrid → **Settings → API Keys** → **Create API Key** → name: `gmail-relay`, permissions: **Restricted Access** → **Mail Send: Full Access** (only) → **Create**.
  **Save the key in a password manager immediately** — SendGrid shows it once.

- [ ] **T2.10: Add "Send mail as" in Gmail**

  Gmail → ⚙️ → See all settings → **Accounts and Import** → **Send mail as** → **Add another email address**:
  - Name: `Fadercraft`
  - Email: `hello@fadercraft.com`
  - **Uncheck** "Treat as an alias"
  - **Next Step**
  - SMTP server: `smtp.sendgrid.net`
  - Port: `587`
  - Username: `apikey` (literal string)
  - Password: paste API key from T2.9
  - Secured connection using TLS
  - **Add Account**
  - Gmail sends a verification code to `hello@fadercraft.com` — it arrives in your inbox via T2.3 routes — paste the code.

- [ ] **T2.11: Add SPF TXT record**

  Cloudflare → DNS → Records → **Add record**:
  - Type: `TXT`
  - Name: `@`
  - Content: `v=spf1 include:_spf.mx.cloudflare.net include:sendgrid.net ~all`
  - TTL: Auto
  - **Save**

  **If a TXT record at `@` already exists** (from CF Email Routing setup), edit it to merge — SPF allows only one record at the apex. Final content should still start `v=spf1 ...`.

- [ ] **T2.12: Add DMARC TXT record**

  Cloudflare → DNS → Records → **Add record**:
  - Type: `TXT`
  - Name: `_dmarc`
  - Content: `v=DMARC1; p=none; rua=mailto:hello@fadercraft.com`
  - **Save**

- [ ] **T2.13: Test outbound + verify SPF/DKIM PASS**

  Compose new email in Gmail → in **From** dropdown choose `hello@fadercraft.com` → send to your personal email.
  Open the received email → ⋮ → **Show original**. Confirm:
  - SPF: `PASS`
  - DKIM: `PASS`
  - DMARC: `PASS`

  If any fail, the SPF/DKIM record likely propagated incorrectly — re-check spelling.

- [ ] **T2.14: Commit a `brand/email-setup.md` note**

  Document the configuration so it can be re-built or audited later.

  Create `brand/email-setup.md`:
  ```markdown
  # Fadercraft email infrastructure

  - Inbound: Cloudflare Email Routing → forwards to hellokbbureau@gmail.com
    Routes: hello@, support@, noreply@, catch-all
  - Outbound: SendGrid free tier (sender hello@fadercraft.com)
    "Send mail as" configured in Gmail
  - DKIM: 3 CNAMEs from SendGrid in Cloudflare DNS (DNS-only, not proxied)
  - SPF: v=spf1 include:_spf.mx.cloudflare.net include:sendgrid.net ~all
  - DMARC: v=DMARC1; p=none; rua=mailto:hello@fadercraft.com (monitor mode)
  - SendGrid API key: stored in password manager under "Fadercraft / SendGrid relay"

  Future: when scaling beyond 100 emails/day, evaluate Mailgun / Resend / paid SG.
  ```

  ```bash
  mkdir -p brand
  git add brand/email-setup.md
  git commit -m "docs: capture Fadercraft email infrastructure setup"
  ```

---

### T3: Brand identity (parallel with T1, T2, T4, T11)

**Files:** `brand/logo.svg`, `brand/wordmark.svg`, `brand/colors.md`, `brand/social-tiles/*.png`.

This task is design work — exact steps depend on tooling (Figma, Illustrator, Affinity). Below is a checklist of deliverables and constraints, not a paint-by-numbers procedure. Use the `design-consultation` skill if you want a structured kickoff.

- [ ] **T3.1: Define visual direction**

  Write a 1-paragraph brief for yourself in `brand/brief.md`:
  - **Audience:** Ableton producers / live performers (technical, design-aware, allergic to over-polished consumer SaaS aesthetics).
  - **Tone:** tooly, professional, slightly understated. Closer to Native Instruments / Ableton's own aesthetic than to Apple consumer.
  - **Avoid:** gradient blobs, "dark hero" fade, generic SaaS pastel.
  - **Lean toward:** monospaced or technical sans-serif type, 2 colors max, geometric mark.

- [ ] **T3.2: Logo mark — single geometric form**

  Design a single **mark** (no text) representing the brand. Suggested directions:
  - A stylized fader cap (rectangular, simple).
  - A 4×4 grid of dots/squares (echoing LCXL's button matrix and the "16 modes" hero copy).
  - An abstract layered form (echoing Mixer Layer / Instruments Layer architecture).

  Output: `brand/logo.svg`, vector, ≤2KB ideally.

- [ ] **T3.3: Wordmark**

  "Fadercraft" set in your chosen typeface, kerned by hand. Output: `brand/wordmark.svg`. Pair with the mark for the lockup version.

- [ ] **T3.4: Lock down colors**

  Pick exactly 2 primary colors (1 dark, 1 accent). Document in `brand/colors.md`:
  ```markdown
  # Fadercraft colors

  - **Ink** — `#XXXXXX` — primary text, mark
  - **Accent** — `#XXXXXX` — CTAs, indicators, highlights

  Background: white `#FFFFFF` for landing; off-white `#F8F7F5` for cards.
  ```

- [ ] **T3.5: Export social tiles**

  From the same source file, export 1080×1080 PNG variants for IG/Reddit (logo on light bg, logo on dark bg, wordmark only). Save to `brand/social-tiles/`.

- [ ] **T3.6: Commit**

  ```bash
  git add brand/
  git commit -m "feat(brand): add Fadercraft logo, wordmark, colors, social tiles"
  ```

---

### T4: Gumroad storefront (parallel with T1, T2, T3, T11)

- [ ] **T4.1: Sign up / sign in to Gumroad**

  https://gumroad.com — sign up with `hello@fadercraft.com` (now that email works after T2). If Gumroad refuses forwarded address, fall back to your real Gmail.

- [ ] **T4.2: Set storefront URL**

  Gumroad → Profile → **Username**: `fadercraft`. Storefront URL becomes `fadercraft.gumroad.com`.

- [ ] **T4.3: Configure payout method**

  Gumroad → Settings → **Payouts** → connect bank or PayPal. Verify identity if Gumroad requests it (usually only for first payout).

- [ ] **T4.4: Create draft product (placeholder)**

  Gumroad → **Products** → **New product**:
  - Type: **Digital product**
  - Name: `Fadercraft XL Performance`
  - Price: `$39`
  - Cover: skip for now (will add in T12)
  - Description: skip for now
  - URL slug: `xl-performance` → product URL becomes `fadercraft.gumroad.com/l/xl-performance`
  - Save as draft (do not publish)

- [ ] **T4.5: Generate Gumroad License API key**

  Gumroad → Settings → **Advanced** → **Application API access** → **Create access token**.
  Permissions needed: `view_sales`, `view_profile`. **Save token in password manager** as "Fadercraft / Gumroad API token".

- [ ] **T4.6: Commit a `dist/gumroad-setup.md` note**

  ```markdown
  # Fadercraft Gumroad setup

  - Storefront: https://fadercraft.gumroad.com
  - Product: Fadercraft XL Performance ($39, draft)
  - Product URL: https://fadercraft.gumroad.com/l/xl-performance
  - License-API token: stored in password manager
  - Payouts: <method>
  ```

  ```bash
  mkdir -p dist
  git add dist/gumroad-setup.md
  git commit -m "docs: capture Gumroad storefront setup"
  ```

---

### T5: Instagram presence (parallel with T1–T4)

- [ ] **T5.1: Try handles in priority order**

  Try each in this order until one is available:
  1. `@fadercraft.studio`
  2. `@fadercraft.audio`
  3. `@fadercraft.dev`
  4. `@fadercraft.app`
  5. `@hellofadercraft`
  6. `@getfadercraft`

- [ ] **T5.2: Sign up Instagram with chosen handle**

  Email: `hello@fadercraft.com`. Profile name: "Fadercraft". Bio (≤150 chars): "Max for Live tools that turn your controller into an instrument. Flagship: XL Performance for LCXL MK3. → fadercraft.com".

- [ ] **T5.3: Add profile photo + link**

  Profile photo: logo on light bg from `brand/social-tiles/`. Link in bio: `https://fadercraft.com`.

- [ ] **T5.4: Update spec with chosen handle**

  Edit spec section 12 → resolve "Instagram handle preference" open question with the actual chosen handle.

  ```bash
  git add docs/superpowers/specs/2026-05-01-fadercraft-launch-design.md
  git commit -m "docs: lock Fadercraft Instagram handle"
  ```

---

### T6: Update-check server endpoints

**Depends on:** T1 (domain), T4.5 (Gumroad API token).

**Files:** `web/api/version.json`, `web/update.html`, `web/functions/api/verify-license.js`.

- [ ] **T6.1: Bootstrap web/ as a git-tracked directory**

  ```bash
  cd ~/Brain/Novation
  mkdir -p web/api web/functions/api web/assets
  ```

- [ ] **T6.2: Create `web/api/version.json`**

  ```json
  {
    "latest": "1.0",
    "url": "https://fadercraft.com/update",
    "changelog": "Initial release of Fadercraft XL Performance.",
    "min_compatible": "1.0"
  }
  ```

  **Versioning note:** the existing patch comment says `v1.5` (internal development history). At launch, re-version the patch to `v1.0` so a single version number aligns across `version.json` `latest`, the in-device display, the Gumroad product version, and the git tag in T13.5. See T8.6 for the patch-comment update step.

  Schema notes for future plans:
  - `latest`: semver string, the most recent published `.amxd` version
  - `url`: where the in-device "Open in browser" link sends users
  - `changelog`: short human-readable string (one sentence)
  - `min_compatible`: oldest version that should still be told "you're current" — versions below this get a stronger "please update" hint

- [ ] **T6.3: Write `web/update.html`**

  ```html
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Update — Fadercraft XL Performance</title>
    <link rel="stylesheet" href="/style.css">
  </head>
  <body class="update-page">
    <main>
      <h1>Update Fadercraft XL Performance</h1>
      <p>Enter the license key from your Gumroad receipt to download the latest version.</p>
      <form id="license-form">
        <label for="license">License key</label>
        <input type="text" id="license" name="license" required autocomplete="off"
               placeholder="XXXX-XXXX-XXXX-XXXX">
        <button type="submit">Verify and download</button>
      </form>
      <p id="status" role="status" aria-live="polite"></p>
    </main>
    <script>
      document.getElementById('license-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const license = document.getElementById('license').value.trim();
        const status = document.getElementById('status');
        status.textContent = 'Verifying…';
        try {
          const res = await fetch('/api/verify-license', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({license})
          });
          const data = await res.json();
          if (data.ok) {
            status.textContent = 'Verified. Starting download…';
            window.location.href = data.download_url;
          } else {
            status.textContent = data.error || 'Invalid license.';
          }
        } catch (err) {
          status.textContent = 'Network error. Try again.';
        }
      });
    </script>
  </body>
  </html>
  ```

- [ ] **T6.4: Write license-verification function `web/functions/api/verify-license.js`**

  Cloudflare Pages Functions live in `functions/`. This file becomes `POST /api/verify-license`.

  ```javascript
  export async function onRequestPost({request, env}) {
    const {license} = await request.json().catch(() => ({}));
    if (!license || typeof license !== 'string') {
      return Response.json({ok: false, error: 'Missing license key.'}, {status: 400});
    }

    // Gumroad license verification API
    // Docs: https://gumroad.com/help/article/76-license-keys
    const productId = env.GUMROAD_PRODUCT_ID;
    if (!productId) {
      return Response.json({ok: false, error: 'Server misconfigured.'}, {status: 500});
    }

    const formData = new URLSearchParams();
    formData.append('product_id', productId);
    formData.append('license_key', license);
    formData.append('increment_uses_count', 'false');

    const gumroadRes = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: formData.toString()
    });
    const gumroadData = await gumroadRes.json();

    if (!gumroadData.success) {
      return Response.json({ok: false, error: 'License not recognized.'}, {status: 401});
    }

    // Optional: enforce refunded / disputed checks
    if (gumroadData.purchase?.refunded || gumroadData.purchase?.chargebacked) {
      return Response.json({ok: false, error: 'License invalidated.'}, {status: 403});
    }

    // Return signed URL to the latest bundle in R2 / external host
    return Response.json({
      ok: true,
      download_url: env.LATEST_BUNDLE_URL
    });
  }
  ```

  Notes for the engineer:
  - `env.GUMROAD_PRODUCT_ID` and `env.LATEST_BUNDLE_URL` will be set as **Environment variables** in the Pages project settings (T6.7).
  - For v1.0, `LATEST_BUNDLE_URL` can simply be a public URL to the zip bundle on Gumroad's CDN, or a Cloudflare R2 signed URL. Avoid storing the bundle in the git repo.

- [ ] **T6.5: Initial commit of web/**

  ```bash
  cd ~/Brain/Novation
  git add web/api/version.json web/update.html web/functions/api/verify-license.js
  git commit -m "feat(web): initial Fadercraft web shell with version endpoint and license verification"
  ```

- [ ] **T6.6: Connect `web/` to Cloudflare Pages**

  Cloudflare → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
  - Connect the `Brain/Novation` repo (assuming it's pushed to GitHub; if not — push first or use direct upload via Wrangler).
  - Project name: `fadercraft`
  - Production branch: `main`
  - Root directory: `web`
  - Build command: leave empty (no build step)
  - Output directory: `.` (everything under `web/` ships as-is)
  - **Save and Deploy**

- [ ] **T6.7: Set environment variables in Pages**

  CF Pages → fadercraft project → **Settings → Environment variables**:
  - `GUMROAD_PRODUCT_ID` = (find in Gumroad → product → Edit → URL contains the id, or via Gumroad API `GET /v2/products`)
  - `LATEST_BUNDLE_URL` = URL of the bundle zip (placeholder for now: e.g. `https://fadercraft.gumroad.com/l/xl-performance`)

- [ ] **T6.8: Map the custom domain**

  CF Pages → fadercraft project → **Custom domains** → **Set up a custom domain** → `fadercraft.com` → CF auto-creates the required A/AAAA records.

  Add a second domain `www.fadercraft.com` → confirm.

- [ ] **T6.9: Verify endpoints**

  Run:
  ```bash
  curl https://fadercraft.com/api/version.json
  ```
  Expected: returns the JSON from T6.2.

  ```bash
  curl -X POST https://fadercraft.com/api/verify-license \
    -H 'Content-Type: application/json' \
    -d '{"license":"INVALID"}'
  ```
  Expected: `{"ok":false,"error":"License not recognized."}` with status 401.

- [ ] **T6.10: Smoke test with a real license**

  Buy a test copy of your own Gumroad product (Gumroad lets the owner buy with a 100% off coupon — create one in the product settings). Get the license key from the receipt email. Visit `https://fadercraft.com/update`, paste the key, submit. Expected: redirects to `LATEST_BUNDLE_URL`.

---

### T8: M4L device modifications (in-device update check)

**Depends on:** T6 (the URL it pings must be live).

**Files:**
- `~/Music/Ableton/User Library/Max Devices/update_check.js` (new)
- `raw/XL_Performance.amxd` (modify in Max)

- [ ] **T8.1: Write `update_check.js`**

  Create at `~/Music/Ableton/User Library/Max Devices/update_check.js`:

  ```javascript
  autowatch = 1;
  outlets = 2; // outlet 0: status string, outlet 1: latest version

  // The version of THIS shipped device. Bump on each release.
  var CURRENT_VERSION = '1.0';
  var ENDPOINT = 'https://fadercraft.com/api/version.json';

  function bang() { check(); }

  function check() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', ENDPOINT, true);
      xhr.timeout = 5000;
      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        if (xhr.status !== 200) {
          outlet(0, 'check_failed');
          return;
        }
        try {
          var data = JSON.parse(xhr.responseText);
          var latest = data.latest;
          outlet(1, latest);
          if (compareSemver(latest, CURRENT_VERSION) > 0) {
            outlet(0, 'update_available');
          } else {
            outlet(0, 'up_to_date');
          }
        } catch (e) {
          outlet(0, 'parse_error');
        }
      };
      xhr.ontimeout = function() { outlet(0, 'timeout'); };
      xhr.send();
    } catch (e) {
      outlet(0, 'error');
    }
  }

  function compareSemver(a, b) {
    var pa = a.split('.').map(Number);
    var pb = b.split('.').map(Number);
    for (var i = 0; i < 3; i++) {
      var ai = pa[i] || 0, bi = pb[i] || 0;
      if (ai !== bi) return ai - bi;
    }
    return 0;
  }
  ```

  Note: Max for Live's JS engine supports `XMLHttpRequest`. If the user's Max version doesn't, fall back to `Net.XMLHttpRequest` or use the `[jweb]` object — verify by trying first.

- [ ] **T8.2: Open `raw/XL_Performance.amxd` in Max for editing**

  In Ableton: drop the device on a track, click the wrench icon → opens Max patcher.

- [ ] **T8.3: Add update-check UI section to the patcher**

  Add a comment-banner: `=====  UPDATE CHECK  =====`.

  Inside that section, add:
  - `[live.text]` — caption "v1.5" (bind to current version display)
  - `[live.text.btn]` — caption "Check for update" — outputs a bang on click
  - `[js update_check.js]` — connect bang from button to its inlet
  - `[route up_to_date update_available check_failed timeout error parse_error]` — split outlet 0 by status
    - `up_to_date` → `[live.text]` showing "Up to date"
    - `update_available` → `[live.text.btn]` showing "v{latest} available — open in browser" → triggers `[jweb https://fadercraft.com/update]` or `[shell open https://fadercraft.com/update]`
    - errors → small `[live.text]` "Couldn't check"

- [ ] **T8.4: Add in-device newsletter signup (collapsible)**

  Add a `[live.text.btn]` "📬 Release notes" → on click reveals a `[textedit]` for email + a "Subscribe" button → on click POSTs to Buttondown (configured in T11).

  POST endpoint: `https://buttondown.email/api/emails/embed-subscribe/fadercraft` (Buttondown's official embed-form endpoint — handles double opt-in).

  This can be implemented with `[jweb]` + a tiny HTML form or with `[node.script]` + `fetch`. Pick whichever is simpler in the user's Max.

- [ ] **T8.5: Optional opt-in heartbeat**

  Add `[live.toggle]` "Anonymous usage stats" (default OFF). When ON, `update_check.js` is called once a week via `[metro 604800000]`. Document this clearly in the Quickstart PDF (T10).

  This is **optional** — defer to v1.1 if Phase 0 timeline is tight.

- [ ] **T8.6: Re-version patch to v1.0 and save**

  In Max patcher inspector (Patcher info) → set patch comment to `v1.0`. Update the version label `live.text` to display `v1.0`. Save the patch → confirm `raw/XL_Performance.amxd` modtime updated.

- [ ] **T8.7: Smoke test in Live**

  In Live: reload the device → confirm UI shows "v1.0" and "Check for update" button. Click it → expect "Up to date" (because endpoint says latest = 1.0).

  Then temporarily edit `web/api/version.json` to `"latest": "1.1"`, commit + auto-deploy via CF Pages, click "Check for update" again → expect "v1.1 available — open in browser". Click that → confirms browser opens `https://fadercraft.com/update`.

  Revert `version.json` to 1.0.

- [ ] **T8.8: Commit device + script**

  ```bash
  cp ~/Music/Ableton/User\ Library/Max\ Devices/update_check.js raw/
  git add raw/XL_Performance.amxd raw/update_check.js
  git commit -m "feat(device): add in-device update check + newsletter signup"
  ```

  Then update `Novation XL.md` and `wiki/index.md` to mention the new `update_check.js` entity (per project CLAUDE.md rules — wiki must reflect raw changes).

---

### T7: Landing page

**Depends on:** T1 (domain), T3 (brand assets), T9 (demo video — can stub initially).

**Files:** `web/index.html`, `web/style.css`, `web/main.js`, `web/assets/hero-loop.mp4`.

This task is large. Below is a skeleton structure with the 9 sections from spec section 6, each as a sub-step. Write semantic HTML, single-page, no framework. Mobile-first CSS. Total page weight target: <500KB excluding video.

- [ ] **T7.1: Page skeleton**

  Create `web/index.html` with `<!doctype html>`, meta tags, `<link rel="stylesheet" href="/style.css">`, OpenGraph tags pointing at `https://fadercraft.com/assets/og-image.png`, and 9 empty `<section>` containers with IDs `hero`, `lost-modes`, `all-sixteen`, `kit`, `for-you`, `demo`, `requirements`, `faq`, `cta`.

- [ ] **T7.2: Section 1 — Hero**

  Locked copy (from spec section 5.2):

  ```html
  <section id="hero">
    <h1>Your Launch Control XL has 16 modes.<br>
        Most people figure out 3.</h1>
    <p>Fadercraft XL Performance is the kit that lets you play all 16 — out of the box, in 5 minutes.</p>
    <a class="cta" href="https://fadercraft.gumroad.com/l/xl-performance">Get it on Gumroad — $39</a>
    <video autoplay muted loop playsinline poster="/assets/hero-poster.jpg">
      <source src="/assets/hero-loop.mp4" type="video/mp4">
    </video>
  </section>
  ```

  Note: `hero-loop.mp4` and `hero-poster.jpg` come from T9 cuts.

- [ ] **T7.3: Section 2 — The 13 Lost Modes**

  Visual: 4×4 grid of buttons, 3 lit using accent color, 13 dim using ink at 20% opacity. Body text from spec section 6.

- [ ] **T7.4: Section 3 — All 16, in your hand**

  Same grid, all lit. Three bullets per spec.

- [ ] **T7.5: Section 4 — What's in the kit**

  Card grid showing 5 cards: device screenshot, Custom Modes preview, Live Set arrangement, docs cover, video poster.

- [ ] **T7.6: Section 5 — For you, specifically**

  Three columns: newbie / studio producer / live performer. 2-3 sentences each, drawn from spec section 4.

- [ ] **T7.7: Section 6 — Watch it work**

  ```html
  <section id="demo">
    <h2>Watch it work</h2>
    <div class="video-embed">
      <iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
              title="Fadercraft XL Performance demo"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen></iframe>
    </div>
  </section>
  ```

  `VIDEO_ID` filled in after T9 publishes the video to YouTube.

- [ ] **T7.8: Section 7 — Requirements**

  Bullet list: Ableton Live Suite (M4L required), LCXL MK3, macOS / Windows, Live 11+ recommended.

- [ ] **T7.9: Section 8 — FAQ**

  Six questions:
  1. Will it work with LCXL MK1 / MK2? — No, MK3 only (different mode protocol).
  2. Do I need Ableton Suite? — Yes, M4L is required.
  3. What about future updates? — Free for life of v1, notification inside the device + via email.
  4. Can I customize the layout? — Yes, includes templates and the patch is open in Max.
  5. Refunds? — 14 days, no questions, refund via Gumroad.
  6. Does it work with other controllers? — No, this product is LCXL MK3-specific. Future Fadercraft products may target other controllers.

- [ ] **T7.10: Section 9 — Final CTA**

  Repeat buy button + newsletter signup (Buttondown embed from T11).

- [ ] **T7.11: `web/style.css`**

  Use brand colors from T3. Mobile-first: single column under 768px, two columns above. System font stack to skip web-font load. Keep total CSS under 10KB.

- [ ] **T7.12: `web/main.js`**

  Smooth scroll for anchor links, `IntersectionObserver` to lazy-load images below the fold. Total JS under 2KB.

- [ ] **T7.13: Test locally**

  ```bash
  cd web && python3 -m http.server 8080
  ```
  Open `http://localhost:8080`. Walk through all sections on desktop and mobile-emulator (Chrome DevTools).

- [ ] **T7.14: Commit + auto-deploy**

  ```bash
  git add web/index.html web/style.css web/main.js web/assets/
  git commit -m "feat(web): launch landing page with 9 sections"
  git push
  ```
  CF Pages picks up the push and redeploys. Visit `https://fadercraft.com` to confirm live.

---

### T9: Demo video production

**Depends on:** T8 device works correctly (need real footage).

This is largely creative work, not engineering. Sub-steps below are a checklist; sequence and tooling are user's choice.

- [ ] **T9.1: Script outline (1 page)**

  Open with hero hook (10 sec): "16 modes / 3 used" framing.
  Then: install + first launch (60 sec).
  Then: layered architecture demo — Mixer Layer, Instruments Layer (90 sec).
  Then: cross-mode transit + Solo Follower in a real performance scenario (90 sec).
  Close: "Get it at fadercraft.com — $39" (10 sec).
  Total: ~5 min.

- [ ] **T9.2: Capture screen + camera**

  Screen: OBS or QuickTime, 1080p60. Audio: a USB mic or built-in (clean room).
  Camera optional — user mentioned learning Instagram, on-camera deferred. Voice-over works fine for v1.

- [ ] **T9.3: Edit in DaVinci Resolve / Final Cut / Premiere**

  Cuts tight, no dead air. Background music: pick royalty-free or user's own track (often the most authentic option for a producer's brand).

- [ ] **T9.4: Export master 1080p MP4**

  Save as `dist/fadercraft-xl-performance-demo.mp4`.

- [ ] **T9.5: Cut 8-second hero loop**

  Mode transit moment, no audio, looping cleanly. Export `web/assets/hero-loop.mp4` (max 2MB, H.264 baseline).
  Make a poster frame: `web/assets/hero-poster.jpg`.

- [ ] **T9.6: Cut 5 short clips for IG/TikTok/Reels**

  30 sec each. Save under `dist/social-clips/`.

- [ ] **T9.7: Upload to YouTube**

  Create channel "Fadercraft" with logo as channel art. Upload main video. Title: "Fadercraft XL Performance — your Launch Control XL, fully unlocked". Description: short blurb + link to fadercraft.com. Note the video ID — needed for T7.7.

- [ ] **T9.8: Update T7.7 with real YouTube video ID + commit**

  ```bash
  git add web/index.html web/assets/hero-loop.mp4 web/assets/hero-poster.jpg
  git commit -m "feat(web): wire in demo video and hero loop"
  git push
  ```

---

### T10: Documentation

**Files:**
- `dist/Quickstart.md` (source)
- `dist/Quickstart.pdf` (rendered)
- `dist/README.md` (extended reference, evolved from `raw/XL_Performance.README.md`)

- [ ] **T10.1: Write `dist/Quickstart.md`**

  Five-step quickstart, screenshots inline:
  1. Drop `XL_Performance.amxd` on a MIDI track.
  2. Set MIDI From → Launch Control XL MK3 (DAW port). MIDI To → same.
  3. Enable Active toggle.
  4. Open the included `XL_Performance_starter.als` to see all mappings live.
  5. Press a button — play.

  End with a "Need help? hello@fadercraft.com" line.

- [ ] **T10.2: Render to PDF**

  Use the `make-pdf` skill if available, or:
  ```bash
  pandoc dist/Quickstart.md -o dist/Quickstart.pdf \
    --pdf-engine=xelatex \
    -V geometry:margin=1in
  ```

- [ ] **T10.3: Adapt extended `README.md` for end users**

  Take `raw/XL_Performance.README.md` and rewrite section by section in user-facing language (the current text is engineer-facing). Save to `dist/README.md`.

- [ ] **T10.4: Commit**

  ```bash
  git add dist/Quickstart.md dist/Quickstart.pdf dist/README.md
  git commit -m "docs: add Quickstart and end-user README for XL Performance v1.0"
  ```

---

### T11: Newsletter pipeline (parallel with T1–T5)

**Files:** none in repo; configuration only.

- [ ] **T11.1: Create Buttondown account**

  https://buttondown.email/register — free tier (100 subscribers free, $9/mo above).
  Use `hello@fadercraft.com` as account email.

- [ ] **T11.2: Set newsletter handle**

  Settings → URL: `fadercraft` → newsletter URL becomes `https://buttondown.email/fadercraft`.

- [ ] **T11.3: Configure custom domain (optional)**

  Settings → Custom domain: `news.fadercraft.com`. Add CNAME to Cloudflare DNS as Buttondown specifies.

- [ ] **T11.4: Write welcome email**

  Settings → Welcome email — short, warm, sets expectations:

  > Subject: Welcome to Fadercraft
  > 
  > Thanks for signing up.
  > 
  > You'll get an email when a new version of XL Performance ships, plus the occasional note on what I'm building next.
  > 
  > No spam, no upsell sequences, easy unsubscribe.
  > 
  > — Fadercraft

- [ ] **T11.5: Enable double opt-in**

  Settings → Subscribe → require confirmation. Default in Buttondown.

- [ ] **T11.6: Get embed snippet**

  Settings → Subscribe form → embed code. Copy the `<form>` snippet — used in T7.10 and T8.4.

---

### T12: Bundle assembly + Gumroad upload

**Depends on:** all of T3, T4, T6, T8, T9, T10.

- [ ] **T12.1: Export Custom Modes from Novation Components**

  Open Novation Components → load LCXL MK3 → import 14 custom modes per spec → export as a single `.json` (Components export format).
  Save: `dist/custom-modes/lcxl-mk3-modes.json`.

  Include a short `dist/custom-modes/README.txt` explaining: "Open Novation Components, import this file, push to your LCXL."

- [ ] **T12.2: Build the demo Live Set**

  Open Ableton → create a new set → instantiate `XL_Performance.amxd` on a MIDI track → add 10 instrument tracks (one per Instruments Layer page) with simple synths/drums → set up returns + sends per Mixer Layer → save as `dist/XL_Performance_starter.als`.

- [ ] **T12.3: Assemble `dist/fadercraft-xl-performance-v1.0/`**

  ```
  dist/fadercraft-xl-performance-v1.0/
  ├── XL_Performance.amxd
  ├── solo_follower.js
  ├── update_check.js
  ├── XL_Performance_starter.als
  ├── custom-modes/
  │   ├── lcxl-mk3-modes.json
  │   └── README.txt
  ├── Quickstart.pdf
  └── README.md
  ```

- [ ] **T12.4: Zip the bundle**

  ```bash
  cd dist && zip -r fadercraft-xl-performance-v1.0.zip fadercraft-xl-performance-v1.0/
  ```

- [ ] **T12.5: Upload to Gumroad**

  Gumroad → product → Edit → **Content** → upload `fadercraft-xl-performance-v1.0.zip`.

- [ ] **T12.6: Fill product description on Gumroad**

  Re-use the landing page hero + bundle bullets. Add cover image (a 1280×720 PNG showing logo + "XL Performance"). Set short URL slug `xl-performance`.

- [ ] **T12.7: Update `LATEST_BUNDLE_URL` in Cloudflare Pages env**

  Get the Gumroad direct download URL (or an R2 mirror) → update `LATEST_BUNDLE_URL` in CF Pages → Settings → Environment variables → trigger redeploy.

- [ ] **T12.8: Publish the product on Gumroad**

  Move from Draft → Published. The product page goes live at `fadercraft.gumroad.com/l/xl-performance`.

- [ ] **T12.9: Smoke test full purchase flow**

  Use a 100% off coupon → buy your own product → receive license key in email → download bundle → unzip → place files in Ableton Live Set folder → confirm device loads cleanly.

---

### T13: Final pre-launch verification

- [ ] **T13.1: Landing page checklist**

  Visit `https://fadercraft.com` from desktop + phone. Confirm:
  - All 9 sections render correctly.
  - Hero video autoplays muted on desktop, gracefully fallback on iOS.
  - Buy button links to live Gumroad product.
  - YouTube embed plays inline.
  - FAQ accordions open.
  - Newsletter signup works (sends a real confirmation to your inbox).

- [ ] **T13.2: Email infrastructure end-to-end**

  Send to each of `hello@`, `support@`, `noreply@`, `random@fadercraft.com` → all four arrive in Gmail.
  Reply from `hello@` via Gmail → Show original on the receiving end → SPF + DKIM PASS.

- [ ] **T13.3: Update-check end-to-end**

  In Live, click "Check for update" → "Up to date".
  Bump `web/api/version.json` to `1.1`, commit, push, wait for CF Pages deploy, click again → "v1.1 available — open in browser" → browser opens `/update` page → license key works → download starts.
  Revert `version.json` to `1.0`.

- [ ] **T13.4: Purchase flow rehearsal**

  Use a non-owner test account or an alternate email + a 100% off coupon → walk through Gumroad checkout → receive license + download → install device + Live Set + Custom Modes per Quickstart → first sound plays within 5 minutes.

- [ ] **T13.5: Tag v1.0 in git**

  ```bash
  git tag -a v1.0 -m "Fadercraft XL Performance v1.0 — public launch"
  git push --tags
  ```

- [ ] **T13.6: Phase 0 done**

  At this point Phase 0 is complete. Phase 1 (launch week — Reddit/Discord/Facebook posts, YouTube publish) is the next plan. That plan should be drafted from spec section 10.2 when you are ready.

---

## 4. Out of scope for this plan

Per spec section 11, none of the following are included in Phase 0 implementation:
- Free / Lite tier
- Non-LCXL controller support
- Affiliate program / blogger outreach
- Multi-language docs
- iOS / mobile companion
- Trial period beyond Gumroad defaults
- Future Fadercraft products

## 5. Open questions inherited from the spec

- **Starter content pack** (drum samples, synth presets in the Live Set): T12.2 currently assumes a minimal set. If user decides to ship a fuller content pack, add T12.2.5 to source/license/include those samples.
- **Newsletter provider**: locked to Buttondown in T11. If user prefers ConvertKit or Substack, swap the provider — endpoint shape changes, but task structure is identical.
- **Demo video format** (voice-over only vs on-camera): T9.2 currently allows either. User said open to learning on-camera; for v1.0 voice-over is faster and lower-risk.
