# Version check (update notifier)

Sends Follower pings a server-hosted manifest on load (and every 30 minutes), compares the published
`latest` version to the device's own build, and lights a mint **"New Version"** button when an update
exists. The button is mirrored from the Control XL device's update-check, minus the Control XL-only
header decoration. Added 2026-06-17; the JavaScript is embedded in the frozen container, so the
feature ships self-contained.

## Status

| Aspect | Status | Notes |
|---|---|---|
| Manifest fetch + compare | Works (log-smoke verified) | Node-for-Max script `sf_version_check.js`; emits `dot 1`/`dot 0` and `url <link>` |
| "New Version" button shows only when an update exists | Works | `version_link` textbutton is `hidden: 1`; `script show/hide` driven by `vdot_sel` (`sel 0 1`) via `thispatcher` |
| Click opens the update URL | Works (mirrors Control XL click-fix v2) | silent-store pattern: `prepend set` → message store → `;\rmax launchbrowser $1` |
| Fallback URL before first successful ping | Works | `loadmess https://library.gumroad.com` seeds the store; a server `url` overrides it |
| JavaScript shipped inside the device | Yes (frozen 2026-06-17) | `sf_version_check.js` embedded in the container (dlst TEXT resource), no external file needed |
| Live endpoint reachable | Needs deploy | `https://fadercraft.com/api/sends-follower.json` — manifest lives in the site repo, goes to prod separately (not part of the device) |
| On-hardware confirmation | Needs verification | Force `latest` > 1.0 in the manifest, confirm the button appears and the link opens |

## Constants

In `sf_version_check.js`:

- `DEVICE_VERSION = '1.0'` — this build's version. Bump on each release in lock-step with the
  manifest's `latest`.
- `URL = 'https://fadercraft.com/api/sends-follower.json'` — the production manifest endpoint.
- `RECHECK_MS = 30 * 60 * 1000` — re-ping every 30 minutes.

The script is otherwise byte-for-byte the Control XL `version_check.js` (same fetch/redirect/compare
logic, same single diagnostic `maxApi.post`); only the header comment and these two constants differ.

## Manifest contract

The script reads JSON from `URL`. It accepts either field name for the version:

```json
{ "latest": "1.1", "url": "https://your-update-page" }
```

- `latest` (or `version`) — the newest published version string. Compared with `DEVICE_VERSION` via a
  dotted-numeric comparison (`1.1 > 1.0`, `2.3.1 > 1.0`, etc.). If `latest > DEVICE_VERSION`, the
  button lights.
- `url` (optional) — server-controlled click-through. When present it overrides the hardcoded
  fallback, so the destination can be changed without shipping a new device.

If the fetch fails (offline, timeout, non-JSON, missing version field) the script emits `dot 0` (no
button) and keeps the fallback URL, so a failed ping is silent.

## Object wiring (patcher box IDs)

The 11 added boxes (IDs are descriptive, not `obj-N`, to avoid colliding with the existing graph):

| ID | Object | Role |
|---|---|---|
| `version_node` | `node.script sf_version_check.js @autostart 1` | runs the ping script; outlet 0 carries tagged messages |
| `vlink_route` | `route dot url` | splits the script's `dot N` / `url <link>` messages |
| `vdot_sel` | `sel 0 1` | `dot 0` → hide branch, `dot 1` → show branch |
| `version_link` | `textbutton "New Version"` | the mint UI button (`hidden: 1`, presentation), click → open URL |
| `vlink_show` / `vlink_hide` | `script show/hide version_link` | toggle the button's visibility |
| `vlink_thispatcher` | `thispatcher` | executes the `script show/hide` messages |
| `vlink_fallback` | `loadmess https://library.gumroad.com` | seeds the click-through URL before any ping |
| `vlink_prepend` | `prepend set` | turns a bare URL into `set <url>` for silent storage |
| `vlink_store` | message box (empty) | silently holds the current URL; bang on click emits it |
| `vlink_open` | `;\rmax launchbrowser $1` | opens the stored URL in the default browser |

Lines (10):

```
version_node[0] -> vlink_route[0]
vlink_route[0](dot) -> vdot_sel[0]
vlink_route[1](url) -> vlink_prepend[0]
vlink_fallback[0]   -> vlink_prepend[0]
vlink_prepend[0]    -> vlink_store[0]
vdot_sel[0](match 0 / up-to-date) -> vlink_hide[0]
vdot_sel[1](match 1 / update)     -> vlink_show[0]
vlink_show[0] -> vlink_thispatcher[0]
vlink_hide[0] -> vlink_thispatcher[0]
version_link[0](click) -> vlink_store[0]   (-> vlink_open[0])
```

The click path uses the Control XL "silent-store" fix: the URL is parked in `vlink_store` via the
left inlet of a message box (so `$1` substitutes from the left inlet of `vlink_open`); a bare `v`
object would re-emit on receipt and open the browser unprompted, so a message box plus `prepend set`
is used instead.

## What was deliberately omitted vs Control XL

Control XL's update-check also shows/hides a mixer-section header decoration (`hdr_show` / `hdr_hide`
→ `script show/hide hdr_right`). Sends Follower has no such header object, so those two boxes and
their two lines were dropped. Everything else is a faithful mirror.

## Runtime files

- Embedded in the device (frozen): `sf_version_check.js` — dlst TEXT resource at `of32 = 33974`,
  `sz32 = 3106`. No external file is needed for the device to run.
- On disk next to the device (canonical edit copy):
  `~/Music/Ableton/User Library/Max Devices/sf_version_check.js`.

## How to test on hardware / in Live

1. Reload the device (Live caches it): remove `SendsFollower.amxd` / the rack from the track and drag
   it back, or reload the M4L device. If it is open in the Max editor, close **without saving**.
2. Temporarily set the manifest `latest` to something greater than `1.0`
   (e.g. `{ "latest": "1.1", "url": "https://library.gumroad.com" }`) at
   `https://fadercraft.com/api/sends-follower.json`.
3. The mint **"New Version"** button should appear on the device panel within a few seconds of load.
   Clicking it should open the manifest's `url` (or the Gumroad-library fallback). The Max Console
   prints one diagnostic line: `version check: device=1.0 latest=1.1 (ok) url=... -> dot 1`.
4. Set `latest` back to `1.0` (or below) and the button disappears on the next check.
