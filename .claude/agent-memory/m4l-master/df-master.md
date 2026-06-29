---
name: df-master
description: DF Master.amxd current state v6.4 (2026-06-29). md5=96a5b24b (339639B). JS v6.4 md5=77bbe340. Bugfixes: pg_numbox pie=0; pgname no cursor-reset; _restoreDone=true after retry exhaustion.
metadata:
  type: project
---

# DF Master.amxd — current state (2026-06-29, v6.4)

**Location:** `/Users/Kirill/Music/Ableton/User Library/Max Devices/DF Master.amxd`
**JS:** `/Users/Kirill/Music/Ableton/User Library/Max Devices/df_master.js` (v6.4)
**Type:** MIDI Effect (`classnamespace: dsp.midieffect`)
**Container:** UNFROZEN. JSON at 0x20, ptch LE@0x1C = filesize-0x20 = 339607. Suffix = `\x00` (1 byte).
**md5 amxd:** `96a5b24b4f632389a8e9bdc90b24c48e` | 339639 B | boxes=742 | lines=373
**md5 js:** `77bbe3401dbcd6737aa08a2ff4d39a6a`
**Archive (pre-edit):** `DF Master.2026-06-29-190540.amxd` (md5 `258065e4`, 759414 B) — was Max-editor indented

## v6.4 Bugfixes (2026-06-29)

**Bug 1 — pgname text immediately erased:**
- Root cause A: `_restoreDone` never becomes `true` on fresh device (no mapped slots → all df_s*_meta=0 → all retries exhausted but `_restoreDone` stayed `false`). `pushNote()` is guarded by `if (!_restoreDone) return` → all text writes blocked.
- Fix A (JS): In `_scheduleRetry()` exhaustion branch, set `_restoreDone = true` before returning. This allows pushNote/pushSlot on a fresh device.
- Root cause B: `handleCmd("pgname")` called `renderNote()` which sent `outlet(3, "set", note)` back to `pg_name_edit` on every keystroke. Max `textedit` "set" message resets cursor to position 0 → next keystroke inserts at wrong position → typing feels broken.
- Fix B (JS): Removed `renderNote()` call from pgname handler. Now only updates placeholder visibility directly via `this.patcher.getnamed("pg_name_ph").hidden`.

**Bug 2 — page index deserializes to wrong value:**
- Root cause: `pg_numbox` SAA.valueof had no `parameter_initial_enable`. Per M4L docs: PIE absent = treated as 1 → Live resets to mmin on every load (instead of restoring saved .als value).
- Fix (amxd patch): Added `"parameter_initial_enable": 0` to `pg_numbox` SAA.valueof.
- Note: `parameter_type=1` (Float) on pg_numbox is OK — pg_numbox shows 1..64 display values. `pg_minus1` (-1) converts to 0-based page index for JS.

**CRITICAL NOTE on original file:** The archived `258065e4` (759414 B) was saved by Max-editor (indented JSON). The new `96a5b24b` (339639 B) is compact JSON — same content, different whitespace. Both are valid UNFROZEN .amxd.

## Arm blink mechanism (v6.3)
- `MapCCButtonDF.maxpat` и `MapButtonDF_M.maxpat` — оба содержат metro+toggle+gate механизм мигания, работающий от `ccArm`/`paramArm` флагов из JS outlet 0
- **Баг**: при нажатии Map CC кнопки на контроллере — сама кнопка шлёт CC → `handleCC` захватывал его немедленно → `learnCCSlot=-1` → мигание не успевало начаться
- **Фикс CC**: `_armCCTime = Date.now()` при армировании; в `handleCC` игнорировать CC если `elapsed < 300ms`
- **Баг Param**: `armParam` вызывал `pollSelectedParam()` синхронно → если параметр уже выбран, захват происходил до отрисовки blink
- **Фикс Param**: `pollSelectedParam()` отложен через Task(250ms) после renderAbsSlot

## Persistence Architecture (v6.0 — current)

**Slots:** 128 × 4 params = 512 (df_sN_meta + df_sN_p0/p1/p2)
**Global:** 1 (df_ch)
**Page notes:** 8 × 8 params = 64 (df_pgN_t0..t7)
**Total:** 577 live.numbox persist params

**Meta encoding:** `(cc+1) + omin*129 + omax*13029`; max 1315928 < 2^24. mmax=2000000
**Path encoding:** base-1e7 split into 3 Int params; each chunk mmax=9999999 < 2^24
**Note encoding:** 3 ASCII chars per Int: `c0 + c1*128 + c2*16384`; mmax=4194304

## JS Object (obj-2) — v6.0
- `text: "js df_master.js"`, `numinlets: 3`, **`numoutlets: 4`**
- Outlet 3 → `pg_name_edit` textedit (inlet 0): sends `"set <text>"` via renderNote()
- `pg_name_edit` outlet 1 (text string) → `pg_name_msg ("pgname $1")` → obj-2 inlet 1
- **NOTE_PLACEHOLDER = "page name"** — shown when NOTES[page]==''; sentinel: if received == "page name" → store ''

## Clear Page fix (v6.0)
- "clearpage" arrives as SINGLE-ATOM message (length=1) → old guard `if (a.length < 2) return` blocked it
- Fix: check `first === "clearpage"` BEFORE the length guard; early return after handling
- Wire: `pg_clear_btn → pg_clearpage_msg ("clearpage") → obj-2 inlet 1` — already present in patch

## Max-editor clobber prevention
- NEVER save DF Master from Max editor — resets classnamespace='box', numoutlets to declared count
- classnamespace must be `dsp.midieffect` for ctlin to receive MIDI
- After any Max-editor save: run repack script (classnamespace fix + JSON recompact)

## Archive dir
`~/Brain/Fadercraft/Dynamic Focus/archive/`
Pre-edit backup: `DF Master.2026-06-29-155036.amxd` (md5 `46e5f27e`, 758452 B = Max-editor-saved indented)

**MapButtonDF_M.maxpat md5:** `bfa2f07fff4590ad0a9d713b8a043f17` (shortname Min->dfmin, Max->dfmax)

## CRITICAL LESSON: pattr vs live.numbox for per-instance persistence

`pattr` with `parameter_enable=1` does NOT reliably persist per-instance values in .als.
`live.numbox` with `parameter_enable=1` DOES — it is a proper Live parameter object.

**pattr behaviour:** `get("name")` returns varname string → appears in `device.parameters`. But the value storage is NOT per-instance in .als even with `parameter_mmin/mmax` set. On reload, values reset to initial (or 0).

**live.numbox behaviour:** Proper Live parameter. `parameter_mmin/mmax` enforced by Live UI layer. `parameter_initial_enable=0` + `parameter_enable=1` + `parametervisibility=2` → stores per-instance in .als, restores correctly on reload, no initial-reset.

**Key box fields for live.numbox (must match SOA):**
- `"minimum": mmin_float` — box-level minimum (must equal parameter_mmin)
- `"maximum": mmax_float` — box-level maximum (must equal parameter_mmax)
- `"presentation": false` — hide from Live presentation layer
- `patching_rect`: position off-screen (x=2000, y=off-screen)

**Full SOA for persistent live.numbox:**
```json
{
  "parameter_enable": 1,
  "parameter_initial_enable": 0,
  "parameter_long_name": "df_s0_cc",
  "parameter_mappable": 0,
  "parameter_mmin": 0.0,
  "parameter_mmax": 13000.0,
  "parameter_shortname": "dfs0cc",
  "parameter_type": 0,
  "parameter_unitstyle": 0,
  "parametervisibility": 2
}
```
NO `parameter_initial_value` — unnecessary and may trigger reset in some Live versions.

**Components (unfrozen deps, same User Library folder):**
- `MapCCButtonDF.maxpat` — CC-кнопка
- `MapButtonDF_M.maxpat` — Map Param кнопка
- `df_master.js` — движок v5.4

**Archive dir:** `~/Brain/Fadercraft/Dynamic Focus/archive/`
**Last clean source before SAA-fix:** `DF Master.2026-06-29-131458.amxd` (77718 B) — had SOA instead of SAA for path (broken)
**Current on-disk (SAA-fixed, shortname=longname):** md5=edf5c84ea1b2eb4c7c6ecdc1d1676e07, 77250 B

## Persistence Architecture (v5.4-clean)

**Storage primitive:** 24 `live.numbox` objects with SOA (`saved_object_attributes`), `parameter_enable=1`, `parametervisibility=2` (Stored Only), `parameter_initial_enable=0`. These appear in `device.parameters` via LiveAPI and persist per-instance in .als.

**CRITICAL LESSON:** pattr with parameter_enable=1 APPEARS in device.parameters but does NOT persist per-instance values. pattr live-reported min/max = 0..127 regardless of SOA mmin/mmax. live.numbox with SOA is the correct primitive.

**3 fields per slot, 8 slots (page 0 MVP):**

| box id      | varname     | mmin | mmax             | ptype | encoding                          |
|-------------|-------------|------|------------------|-------|-----------------------------------|
| dfp_N_0     | df_sN_cc    | 0    | 13000.0          | 0 (int) | `(cc+1)*100 + ch`; sentinel 0  |
| dfp_N_1     | df_sN_path  | 0    | 2000000000000000.0 | 1 (float) | base-150 polynomial (8 tokens) |
| dfp_N_2     | df_sN_om    | 0    | 13000.0          | 0 (int) | `omin*101 + omax`; default=100 |

N = 0..7 (8 slots). ALL stored as SOA (not flat box fields). pe=1, pie=0, pv=2, pm=0.

**CC encoding:**
- `cc_field = (cc+1)*100 + ch` — sentinel 0 = no CC; cc=0,ch=0 → 100; cc=127,ch=16 → 12816
- Range: 0..12816 → mmax=13000 comfortably covers it

**OM encoding:**
- `om_field = omin*101 + omax` — omin,omax ∈ [0,100]; default: omin=0, omax=100 → field=100
- Max value: 100*101+100 = 10200 → mmax=13000 covers it

**Path encoding (base-150 polynomial, float64 exact):**
- Keywords 1..23 (live_set, tracks, return_tracks, master_track, devices, parameters, mixer_device, sends, value, volume, panning, chains, clip_slots, clip, view, crossfader, cue_volume, track_activator, solo, arm, mute, output_routing, input_routing)
- Index N (0..125) → code 24+N
- Sentinel 0 = end of path
- `float = t0 + t1*150 + ... + t7*150^7`; max ~1.7e15 < 2^53 → exact float64
- mmax=2e15 = 2000000000000000 covers all valid paths; stored as integer in JSON (no exponent notation)

**WRITE path (pushSlot):**
- `pushSlot(s)` → `Task(0)` deferred → `setParam("df_sN_cc", cc_f)` via LiveAPI "id pid" → `.set("value", x)`
- Task(0) avoids "Changes cannot be triggered by notifications" error
- `ensureCache()` called lazily inside Task body

**READ path (restoreFromParams):**
- `bang()` → `Task(400ms)` → `loadDeviceParams()` → `restoreFromParams()`
- `restoreFromParams`: reads df_sN_cc/om/path via `getParam()` → `decodeCC/decodeOM/decodePath` → populates SLOTS[]
- Log marker: `PARAM RESTORE (LiveAPI): slot=N cc_f=... path_f=... -> cc=... path=...`
- If path=null: means path_f=0 (empty) OR mmax range was too small (was blocking "Invalid value" before mmin/mmax fix)

**Parameter cache:**
- `loadDeviceParams()` iterates `this_device` parameters, filters by `nm.indexOf("df_s") === 0`
- Log: `loadDeviceParams DIAG all names: [...]` — shows ALL parameter names for debugging
- Log: `loadDeviceParams: total=N df_s*=24` — should show 24 df_s* params
- `_paramCache["df_sN_cc"] -> pid`; `getParam(name)` reads via `"id pid".get("value")`

**captureParam:** uses `p.unquotedpath` — no filter, accepts ANY Live API path (device params, sends, mixer_device)

**autowatch = 0** — prevents script reload resetting SLOTS on file change

## JS Object (obj-2)
- `text: "js df_master.js"`, `numinlets: 3`, `numoutlets: 3`
- Inlet 0: bang (init)
- Inlet 1: row/page command list
- Inlet 2: CC list `[value, cc, channel]`
- Outlet 0: row render `[visRow, ccLabel, paramLabel, outMin, outMax, mapped, ccArm, paramArm]`
- Outlet 1: value render `[visRow, valueInt(0-100)]`
- Outlet 2: page sel `[pageIdx, active(0/1)]`

## live.numbox Parameter Objects (24 total, SOA format)
IDs: dfp_0_0..dfp_7_2. All off-screen (patching_rect=[10000,10000,50,20]), presentation=false. NOT wired to js inlets — accessed ONLY via LiveAPI (parameter name lookup). cc and om: ptype=0 (int), path: ptype=1 (float).

## Patch structure
- `obj-1` live.thisdevice → `obj-2` js (bang on load)
- `obj-30/31` midiin/midiout passthrough
- `obj-32` ctlin → `obj-33` pack i i i → `obj-2[2]`
- 16 bpatcher rows (bcc0..7 + obj-3..17 for right col) + uk0..15 unpack
- Page numbox: live.numbox pg_numbox (int 1..32) with +1/-1 offset logic
- Panels: obj-62 (left), obj-19 (right)
- openrect: [0, 0, 258, 169]

## CRITICAL: live.numbox parameter fields — saved_attribute_attributes vs saved_object_attributes

**`saved_object_attributes`** = correct for `newobj`/`pattr`. Live IGNORES this for live UI objects.
**`saved_attribute_attributes.valueof`** = correct for live UI objects (`live.numbox`, `live.dial`, etc.). This is what Live reads at runtime to determine min/max/type.

Proof: runtme LiveAPI `p.get("min")` and `p.get("max")` on a live.numbox always returns 0/127 when fields are in `saved_object_attributes`, regardless of the values written there. After moving to `saved_attribute_attributes.valueof`, Live reads the actual mmax.

**Correct live.numbox box structure (hidden persist parameter):**
```json
{
  "id": "dfp_0_0",
  "maxclass": "live.numbox",
  "varname": "df_s0_cc",
  "numinlets": 1, "numoutlets": 2,
  "outlettype": ["", "float"],
  "patching_rect": [10000.0, 10000.0, 50.0, 20.0],
  "presentation": false,
  "parameter_enable": 1,
  "saved_attribute_attributes": {
    "valueof": {
      "parameter_longname": "df_s0_cc",
      "parameter_shortname": "dfs0cc",
      "parameter_type": 0,
      "parameter_unitstyle": 0,
      "parameter_mmin": 0.0,
      "parameter_mmax": 13000.0,
      "parameter_initial_enable": 0,
      "parameter_mappable": 0,
      "parametervisibility": 2
    }
  }
}
```
Note: `parameter_enable: 1` stays at the TOP LEVEL of box (not inside SAA). All other parameter_* go inside `saved_attribute_attributes.valueof`.

## CRITICAL: parameter_initial_enable semantics
- `parameter_initial_enable=0` (explicit) = Live restores the PER-INSTANCE saved value from .als on load. This is what we want.
- `parameter_initial_enable=1` = Live RESETS the parameter to `parameter_initial_value` on EVERY device load, overwriting the saved per-instance value. This silently kills persistence.
- `parameter_initial_enable` ABSENT = behaves as 1 for some object types. Must be set EXPLICITLY to 0.
- `parameter_initial_value` should NOT be set when `parameter_initial_enable=0` — it's unused but may confuse Live's parameter UI. Remove it.
- Reference: dfs* live.numbox (archive 115025.amxd) had `parameter_initial_enable: 0` and cc PERSISTED correctly. pattr without this flag resets to initial on each load.

## Known behaviors / constraints
- **pattr middle outlet → js non-left inlet: FORBIDDEN.** Causes "pattr can only connect to left inlet" flood. Removed in v5.1 stabilization.
- **8 slots MVP (PERSIST_SLOTS=8).** Slots 8..511 work in memory but NOT persisted.
- **pmin/pmax not stored** in 3-field scheme. Read from LiveAPI on `restoreFromParams` Task+200ms → `resolveAll()` → `normValue()`.
- **encodePath index cap = 125.** Tracks/devices beyond index 125 logged as WARNING and clamped. Real sessions rarely exceed 50 tracks.
- **Sends path:** `captureParam` accepts sends (`live_set tracks N mixer_device sends M value`) without filter. encodes correctly.
- **decodePath returns null for f=0** → slot treated as empty (no path). After fix: path param has mmax=2e15, "Invalid value" eliminated → path_f properly stored.
- **classnamespace:** `dsp.midieffect` — resets to 'box' if user saves in Max editor. Always check if CC stops working.
- **Monitor=In:** required for ctlin to receive MIDI without arm.

## Repack notes (CRITICAL for this device)
This is UNFROZEN. JSON starts at 0x20 (offset 32), NOT 0x30. Suffix = `\x00` only (1 byte). No dlst.
Path B is needed when JSON grows: just update `ptch` LE@0x1C = new_filesize-0x20. No dlst patches needed.

**Previous corruption source:** using `soa = box.get('saved_object_attributes', {})` returns NEW `{}` if key exists (Python's `.get()` with default returns a NEW object, NOT a reference). Fix: use `box['saved_object_attributes']` directly (guaranteed reference to existing dict).
Wait — actually Python dict.get() DOES return the real object if the key exists (not a new one). The real bug was: the key DID exist (`saved_object_attributes` in box = True), so `.get()` returned the real soa. But the EARLIER repack scripts used `ensure_ascii=False` + `indent=1`, producing a LONGER JSON (dL>0) but the bytearray conversion introduced corruption at byte[47].

**Root cause of byte[47]=0xa2 corruption:** `ensure_ascii=False` + `indent=1` in json.dumps changes the byte layout significantly. When later combined with `struct.pack_into` on a `bytearray` that was constructed via `bytearray(raw[:off]) + new_json_bytes`, the offset calculation was correct but the `bytearray(raw[:off])` converted non-ASCII bytes in the header to wrong values if the underlying data had bytes >127 in the header region. REAL FIX: use `separators=(',',':')` + `ensure_ascii=True`.encode('ascii') — no bytearray conversion needed for prefix (keep as bytes), only convert to bytearray for struct.pack_into.

## CRITICAL: Why max=255 appeared in DIAG (resolved in edf5c84e)

The diagnostic `DIAG param: name=df_s0_path pid=324 min=0 max=255` was captured from archive
`131458.amxd`, which had `saved_object_attributes` (SOA) for path boxes — NOT `saved_attribute_attributes.valueof` (SAA).
Live **ignores** SOA for live.numbox and applies default range (0..255). The current file (edf5c84e)
has SAA for all 24 parameters (including 8 path boxes with mmax=2e15). This was NOT tested in Live yet.

**Expected after reload:** `DIAG param: name=df_s0_path ... max=2000000000000000`
**If still 255 after reload:** check that the file on disk is edf5c84e (md5), not an older cache version.

## CRITICAL: float64 decision for path parameters

`parameter_type=1` (Float) chosen deliberately. Justification:
- JS Number = IEEE 754 double (64-bit) → encodePath/decodePath exact for values < 2^53
- path_f ≈ 1.8e12 < 2^53 = 9e15 → exact representation, no rounding
- Live `.als` stores values as XML text strings → exact round-trip
- LiveAPI C++ API uses double for parameter value transfer (standard for audio software)
- Evidence CC works: `cc_f=7901` accepted via `set("value")` with mmax=13000 (absolute, not normalized)
  → same mechanism applies to path with mmax=2e15

Split-field scheme (2-3 sub-parameters in safe range) was considered but NOT implemented.
Reason: float64 single-parameter is sufficient and simpler. Revisit ONLY if Live empirically
shows float32 rounding for type=1 parameters (would manifest as path_f decoded to wrong path).

## Scale plan (next step — NOT YET IMPLEMENTED)
- Need empirical test: add 400 pattr with pe=1 and check how many appear in device.parameters
- If ceiling ≥ 384: implement 128 slots × 3 fields = 384 pattr (dfp_0_0..dfp_127_2)
- If ceiling < 384: need alternative (e.g. pattr with JSON string for multiple slots per pattr)
- Current: 8 slots confirmed working after mmin/mmax fix (pending first real test)

## CRITICAL: Live API p.get("name") returns parameter_shortname (NOT longname)

`loadDeviceParams()` calls `p.get("name")` on each device parameter. This returns `SAA.valueof.parameter_shortname`, NOT `parameter_longname`. If shortname != longname, JS filter `nm.indexOf("df_s") === 0` will miss parameters that have correct longname but wrong shortname.

**Root cause of `df_s*=0` bug (2026-06-29):** SAA.shortname was `dfs0cc` (no underscores), while JS searched for `df_s0_cc`. Filter failed on ALL 24 params.

**Fix:** Make `parameter_shortname == parameter_longname` for all storage live.numbox. Then `p.get("name")` returns the full `df_sN_field` string that JS expects.

**Implication:** `setParam("df_s0_cc", val)` looks up `_paramCache["df_s0_cc"]` which is keyed by shortname. So shortname must match the key string exactly.

## CRITICAL LESSONS (v5.x specific)
1. **pattr parameter_enable=1**: appears in device.parameters. live.numbox with parameter_initial_enable=0 does NOT.
2. **pattr middle outlet → js inlet N≠0: FORBIDDEN.** Max will flood "pattr can only connect to left inlet".
3. **pattr mmin/mmax required for large floats.** Without them, default range 0..1 → "Invalid value" → value stored as 0 → decodePath(0) = null (path lost on reload).
4. **pushSlot must be Task(0) deferred** inside notification callback context (onSelectedParam, onSelectedTrack). Otherwise "Changes cannot be triggered by notifications".
5. **ensureCache() in Task body** (not at global scope) — LiveAPI not available at global init time.
6. **autowatch=0** — production must. autowatch=1 resets SLOTS mid-session.
7. **captureParam uses p.unquotedpath** — no path type filter. Accepts sends, mixer, device params.
8. **Path B for unfrozen amxd**: JSON at 0x20, suffix=\x00. No dlst. Just update ptch LE@0x1C = new_filesize-0x20.
9. **Python repack**: use `separators=(',',':')` + `ensure_ascii=True` + `.encode('ascii')`. Keep prefix/suffix as bytes, only bytearray for struct.pack_into on ptch field.
10. **soa modification bug**: `box.get('saved_object_attributes', {})` — if key exists, returns real ref (correct). BUT earlier scripts checked `if 'saved_object_attributes' not in box: box['saved_object_attributes'] = {}` before assignment, which was fine. The REAL root cause was indent=1 + ensure_ascii=False → different encoding → different length + corrupted bytes in header region during bytearray ops.
