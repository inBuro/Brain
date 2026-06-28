---
name: df-master
description: DF Master.amxd v3.4 + DF Slot.amxd v1.1 — current state (2026-06-29): pattrstorage added to DF Slot, inactivelcdcolor token fixed in both .maxpat files, classnamespace dsp.midieffect OK
metadata:
  type: project
---

# DF Master.amxd — current state (v3.4, 2026-06-29) + DF Slot.amxd (v1.1, 2026-06-29)

**Location:** `/Users/Kirill/Music/Ableton/User Library/Max Devices/DF Master.amxd`
**Components (unfrozen deps, same User Library folder):**
- `MapCCButtonDF.maxpat` — CC-кнопка (v3.4: inactivelcdcolor expression key added)
- `MapButtonDF_M.maxpat` — stripped UI + SF-style Map btn (v3.4: inactivelcdcolor expression key added)
- `df_master.js` — движок (v3.4: diagnostic logs in handleCC/armCC/captureCC)

**Last archive (pre-bugfix session 2026-06-29-021237):**
- `DF Master.2026-06-29-021237.amxd` (unchanged, 66188 B, md5=3a630f99)
- `DF Slot.2026-06-29-021237.amxd` (pre-pattrstorage, 15184 B)
- `MapCCButtonDF.2026-06-29-021237.maxpat` (pre-inactivelcd-token-fix, 49912 B)
- `MapButtonDF_M.2026-06-29-021237.maxpat` (pre-inactivelcd-token-fix, 17541 B)

**Current sizes/md5:**
- DF Master.amxd: 66188 B | boxes=163 | lines=370 | md5=39f4041c | classnamespace=dsp.midieffect | pattr restore=[-1]
- DF Slot.amxd: 15184 B | boxes=16 | lines=20 | md5=3f3fc089 (added pattrstorage)
- MapCCButtonDF.maxpat: 111097 B | boxes=30 | lines=33 | md5=b645a5f2 (inactivelcdcolor token fixed)
- MapButtonDF_M.maxpat: 32119 B | boxes=43 | lines=48 | md5=c82dc3931 (inactivelcdcolor token fixed)
- df_master.js: sentinel changed 'empty'→-1 (numeric), restoreSlots guard updated
**Type:** MIDI Effect (`classnamespace: dsp.midieffect`)
**ptch invariant:** 66156 = filesize - 0x20 (OK)
**md5 (amxd):** unchanged (amxd not modified in v3.3)
**MapCCButtonDF.maxpat:** boxes=30 (was 29), lines=33 (was 31) — +msg_inactive_cc, +2 lines
**MapButtonDF_M.maxpat:** boxes=43 (was 42), lines=48 (was 46) — +msg_inactive_pa, +2 lines
**openrect:** [0, 0, 520, 169]
**devicewidth:** 520.0

WARNING: **classnamespace сбрасывается в "box" при каждом сохранении пользователем в Max-редакторе**. Это постоянная граблина: при открытии/сохранении в Max patching classnamespace слетает с dsp.midieffect -> box, и ctlin перестаёт получать MIDI -> маппинг ломается. После каждой пользовательской правки в Max нужно восстанавливать classnamespace через скрипт или m4l-master. Compact JSON (separators=(',',':')) нормально читается Max — уменьшает размер файла с ~160KB до ~65KB.

**MapCCButtonDF.maxpat v3.3:** boxes=30, lines=33
**MapButtonDF_M.maxpat v3.3:** boxes=43, lines=48

## Engine: df_master.js (outlets=4, v3.2-persist-fix)
- varname=`dfengine`, numinlets=4, numoutlets=4
- Inlet 0: bang (init from live.thisdevice)
- Inlet 1: row command `[row, cmd, ...]` OR page command `[page, N]` (N=0..31 0-based)
           OR named Max message `page N` — calls JS `function page(n)` directly
- Inlet 2: `[value, cc, channel]` from ctlin → pack i i i
- Inlet 3: restore list from pattr df_data outlet 0 (flat atom list on .als load)
- **Outlet 0 (8 atoms):** `[visRow, ccLabel, paramLabel, outMin, outMax, mapped, ccArm, paramArm]`
  visRow 0..7 = left column, visRow 8..15 = right column
- **Outlet 1 (2 atoms):** `[visRow, valueInt(0-100)]`
- **Outlet 2 (2 atoms):** `[pageIdx, active(0/1)]` — все 32 страницы при смене страницы
- **Outlet 3 (flat atom list):** persist push to pattr df_data; fired on every state change
- NSLOTS=512, PAGE_SIZE=16, NPAGES=32, currentPage=0 by default
- Drive formula: `frac = lo + p*(hi-lo)`, clamp to [0,1]

## Persist scheme (v3.2 push-pull, 2026-06-29)

**PUSH path (save to .als):**
  1. On every state change (captureCC, onSelectedParam, clearSlot, min/max update):
     `pushState()` → `outlet(3, [i cc ch omin omax pmin pmax name_sym ...])` (flat atoms)
  2. `pattr df_data` (obj-300) receives via inlet 0, stores current value
  3. `pattrstorage df_store @greedy 1 @savemode 2` reads pattr on .als save — passive, no getvalueof needed

**PULL path (restore from .als):**
  1. pattrstorage restores stored atoms → pattr df_data outlet 0
  2. pattr outlet 0 → js inlet 3 (via explicit wire: `obj-300[0] → obj-2[3]`)
  3. `list()` on inlet 3 → `restoreSlots(a)` → Task.schedule(800) → resolveAll + render

**Patch wiring (obj-300 pattr):**
  - `obj-2[3] → obj-300[0]` (PUSH: js outlet 3 → pattr inlet 0)
  - `obj-300[0] → obj-2[3]` (PULL: pattr outlet 0 → js inlet 3)
  - obj-ps1: `pattrstorage df_store @greedy 1 @savemode 2` (no lines needed, @greedy auto-adopts df_data)

**Flat atom format (8 atoms per slot):**
  `[i, cc, ch, omin, omax, pmin, pmax, name_sym]`
  - i: slot index (int 0..511)
  - cc: CC number (int 0..127) or -1 if not set
  - ch: MIDI channel (int 1..16) or 0 if not set
  - omin/omax: OUTMIN/OUTMAX int 0..100
  - pmin/pmax: parameter min/max (float)
  - name_sym: parameter name with spaces → `__SP__`, or 'null' if no param
  - Sentinel: `['empty']` when no slots mapped

**Backward compat:** old JSON format (starts with '[') silently ignored; old .als data (if any) lost gracefully.

## ROOT CAUSE ANALYSIS (persist v1/v2 failures, 2026-06-29)

**Previous attempt 1:** pattr df_map @bindto dfengine + pattrstorage @greedy — obj-300 had ZERO lines. Even with @greedy + @bindto, the critical path was broken: no wire from pattr outlet to js inlet. pattrstorage could not deliver restored data to js even if it stored it correctly.

**Previous attempt 2 (same session):** Same structure, added pattrstorage but still no explicit lines. @bindto theoretically calls setvalueof internally, but pattr was also storing a JSON STRING as a single Max symbol — which has reliability risks for long strings (potential truncation or parse failures in Max atom layer).

**Root causes (both):**
  1. No explicit outlet wire from pattr to js: @bindto may send setvalueof internally, but behavior is unreliable for js without an explicit wired path
  2. JSON string as a single Max symbol atom: risky for large payloads; atom layer expects simple values
  3. @greedy auto-adoption of pattr requires no lines between pattr and pattrstorage, but does require the pattr be actively used (having an outlet wire to something is safer)

**v3.2 fix:**
  - Replaced JSON string with flat atom list (8 atoms/slot)
  - Added explicit wires: js[3]->pattr[0] (push) + pattr[0]->js[3] (pull)
  - Kept pattrstorage @greedy 1 @savemode 2 (still no lines to pattrstorage needed)
  - Removed @bindto from pattr (not needed with explicit wires)
  - Round-trip validated offline: 7 test cases PASS

## Sends Follower persist scheme (reference — different from DF)
SF does NOT use pattr for parameter paths. SF persists:
- live.numbox Min/Max (parameter_enable=1) per slot in MapButton bpatcher — Live parameters, auto-saved
- Parameter TARGET PATH: outlet(1, [slot,"store",path...]) but wn_route passthrough outlet 1 is UNCONNECTED
  → SF does NOT persist the parameter path! It re-resolves by track position on reload.
This is fundamentally different from DF's name-based approach. SF's scheme is not applicable to DF.

## MIDI ingest
`midiin → midiout` passthrough (obj-30/31)
`ctlin` out0=val, out1=cc, out2=ch → `pack i i i` → js inlet 2

## Architecture: bpatcher rows + page encoder (v3.0: dual-column, 32 pages)

Main patch boxes (163 total):
- `obj-1` live.thisdevice, `obj-2` js df_master.js (4 outlets, varname=dfengine), `obj-30/31` midiin/midiout
- `obj-32` ctlin, `obj-33` pack i i i
- `obj-300` pattr df_data (varname=df_data, restore=['empty']); wired push+pull to obj-2
- `obj-ps1` pattrstorage df_store @greedy 1 @savemode 2 (NO lines needed — greedy auto-binds pattr df_data)
- `r0` route 0..15 <- js out0 -> uk{i} inlet 0 (i=0..15)
- `r1` route 0..15 <- js out1 -> bmb{i}/bmb_id[4] (pct value, i=0..15)
- **Page encoder:**
  - `pg_numbox` = live.numbox, int 1..32, steps=32, presentation=[207,149,43,15], varname=pg_numbox
  - Forward: pg_numbox[0] -> pg_minus1(-1) -> pg_msg_page("page $1") -> obj-2[1]
  - Feedback: obj-2[2] -> pg_unpack(unpack i i) -> out1(active,fires first)->gate_pg_fb[0]; out0(pageIdx,fires second)->gate_pg_fb[1] -> pg_plus1(+1) -> pg_numbox[0]
  - gate_pg_fb passes pageIdx only when active=1 (correct unpack right-to-left order)
- **Left column** (visRow 0..7): bcc0..7 (x=192), bmb0..7 (x=-2), uk0..7 (all user-positioned)
- **Right column** (visRow 8..15): obj-3/4=row8, obj-5/6=row9, ..., obj-17/18=row15
- Panels: obj-62 (x=-3, w=253) = left, obj-19 (x=257, w=253) = right

## openrect
[0, 0, 258, 169]; contnet X=-3..250, numbox X=207..250; margin 8px

## Wiring per row (uk -> bcc/bmb)
- uk[0] -> bcc[0] (ccLabel text)
- uk[1] -> bmb[0] (paramLabel text)
- uk[2] -> bmb[1] (min)
- uk[3] -> bmb[2] (max)
- uk[4] -> bcc[2] (xshow) + bmb[3] (mapped -> show/hide x + filled/hollow btn_pr)
- uk[5] -> bcc[1] (ccArm -> blink)
- uk[6] -> bmb[5] (paramArm -> blink)

## MapCCButtonDF.maxpat — inlet/outlet order
- inlet [0] x=10: cc_inlet_text (label)
- inlet [1] x=60: cc_inlet_blink (blink flag 0/1)
- inlet [2] x=110: cc_inlet_xshow (X show flag 0/1)
- outlet [0]: bang on click
- outlet [1]: bang on X click

## MapButtonDF_M.maxpat — inlet/outlet order
- inlet [0] x=20:  in_label (paramLabel sym -> p setText -> btn_pr)
- inlet [1] x=80:  in_min (int 0-100 -> prepend set -> nbox_min -> out_min)
- inlet [2] x=140: in_max (int 0-100 -> prepend set -> nbox_max -> out_max)
- inlet [3] x=200: in_mapped (0/1 -> sel 0 1 -> hidden 1/0 -> btn_x + hollow/filled btn_pr)
- inlet [4] x=260: in_pct (int 0-100 -> prepend set -> value display)
- inlet [5] x=320: in_paramarm (0/1 -> paramArm blink)
- outlet [0]: out_map (mapparam bang from btn_pr click)
- outlet [1]: out_min (min value from nbox_min drag)
- outlet [2]: out_max (max value from nbox_max drag)
- outlet [3]: out_clear (clear bang from btn_x click)

## Exclusive arm (df_master.js v3.1+)
`armCC(absSlot)`: saves `prev = learnCCSlot`, sets new, if `prev >= 0 && prev !== absSlot` — renders old slot (ccArm=0 -> blink stops). Same for `armParam(absSlot)` via `learnPSlot`.
On page change (`setPage`): learnCCSlot/learnPSlot reset if they're on a different page.
CC and Param arm are independent: can have one CC-armed AND one Param-armed simultaneously from different rows.

## v3.5 bugfix session (2026-06-29, three-bug fix)

**Archive (v3.5.1):** `2026-06-29-021237` (DF Master.amxd, DF Slot.amxd, MapCCButtonDF.maxpat, MapButtonDF_M.maxpat)
**Archive (v3.5.2):** `2026-06-29-022515` (DF Master.amxd 161071B post-Max-save, df_master.js pre-sentinel-fix)

### BUG 1 FIX: dark buttons — inactivelcdcolor wrong expression token
**Root cause (v3.4→v3.5):** `saved_attribute_attributes.inactivelcdcolor.expression` was `''` (empty string) in obj-14 of both .maxpat files. An empty expression means Live registers the attribute as managed but WITHOUT a theme token → applies its own dark default. Not the same as having the correct token.
**Fix:** Set `"inactivelcdcolor": {"expression": "themecolor.live_control_selection"}` — same token as lcdcolor. Now idle color = same theme color as active color, buttons visible in both states.
**Files changed:** MapCCButtonDF.maxpat (49912→111097 B), MapButtonDF_M.maxpat (17541→32119 B).

**Earlier attempt (v3.4, same session):** Key was MISSING entirely → added with expression=''. That's why v3.4 still had dark buttons: key present, expression wrong.
**Earlier attempt (v3.3):** inactivelcdcolor was hardcoded `[0.098...]` (nearly black) → removed it. But missed the empty expression issue.

### BUG 2 FIX: Map CC "not working" — TWO causes

**Cause A: classnamespace reset by Max editor save (v3.5.2 fix).**
When DF Master.amxd was saved from Max editor, classnamespace reset 'dsp.midieffect'→'box'. With classnamespace=box, ctlin doesn't receive MIDI → Map CC completely dead. Fixed in v3.5.2 by restoring classnamespace=dsp.midieffect and compacting JSON (161071→66188 B). This WILL happen again if user opens+saves in Max editor — ALWAYS check classnamespace first when "Map CC stopped working".

**Cause B: track routing — Monitor=In required (NOT a patch bug).**
ctlin in dsp.midieffect receives MIDI ONLY when track is Record Armed OR Monitor=In. "Works only when armed" = expected Live behavior. Fix: set DF Master MIDI track Monitor=**In** (permanent, no ARM needed). This is the canonical setup for DF Master. Patch wiring is correct: ctlin[0,1,2]→pack i i i→obj-2[2]→handleCC→captureCC.

### BUG 3 FIX: DF Slot.amxd — parameters not persisting across reloads
**Root cause:** DF Slot had `pattr learnedCC @default -1` and `pattr learnedChannel @default -1` but NO `pattrstorage`. Without pattrstorage, pattr values are never saved to .als — only the static `restore` field in JSON is used (restore=[0] = CC+1=0 = unmapped). 
**Fix:** Added `obj-pss1 pattrstorage df_slot_store @greedy 1 @savemode 2` to DF Slot.amxd (boxes: 15→16, md5: old→3f3fc089). @greedy auto-adopts learnedCC and learnedChannel pattrs. Now learned CC numbers persist across .als save/reload.
**DF Slot.amxd pattr JS round-trip:** outlet(1, learnedCC+1) → pattr learnedCC inlet → pattrstorage saves. On restore: pattrstorage → pattr outlet 0 → js inlet 3 → msg_int(v) → learnedCC = v-1. The +1 offset is by design (pattr 0-default = CC+1=0 = unmapped).

### BUG 3 PATTERN NOTE: DF Slot vs DF Master persist
DF Slot (per-track): pattr + pattrstorage (standard per-device pattern). Each DF Slot has its OWN pattrstorage, saves its own learnedCC independently.
DF Master: push-pull pattr + pattrstorage via flat atom list (512-slot, push on every change). Different architecture, same principle.

## v3.4 changes (2026-06-29, inactivelcdcolor fix + diagnostic logs)

**Root cause of dark idle buttons (BUG 1 first attempt):**
`saved_attribute_attributes` in live.text obj-14 had `inactivelcdcolor: {expression: ''}` added (was MISSING key before). Key present but expression empty → still dark. Full fix in v3.5 above.

**Diagnostic logs added to df_master.js (BUG 2 diagnostics):**
- `handleCC`: `[DF-Master] handleCC: val=X cc=Y ch=Z learnCCSlot=N`
- `armCC`: `[DF-Master] armCC: absSlot=N page=M (prev=K) — waiting for CC`
- `captureCC`: `[DF-Master] captureCC: absSlot=N cc=Y ch=Z`

**classnamespace: dsp.midieffect** — verified in DF Master.amxd. Without this, ctlin doesn't receive MIDI. Resets to 'box' on each user Max-editor save — check this first if CC stops working.

**CRITICAL: `inactivelcdcolor` expression key** — must be present in saved_attribute_attributes with the CORRECT token (not empty string). Without token: dark idle buttons. Pattern: same token as lcdcolor = `themecolor.live_control_selection`.

## v3.3 changes (2026-06-29, visual regression fix)

**Problem:** All Map buttons appeared dim/dark in idle state. Cause: hardcoded `inactivelcdcolor: [0.098, 0.098, 0.098, 1.0]` in live.text obj-14 of both .maxpat files. In `mode=0 (momentary)` live.text, idle = INACTIVE state → uses `inactivelcdcolor` → very dark. The runtime `lcdcolor` message only affects ACTIVE (pressed) color, not inactive.

**Fix (MapCCButtonDF.maxpat):**
1. Removed hardcoded `inactivelcdcolor` from obj-14 (and saved_attribute_attributes) — let Live theme handle it
2. Added `msg_inactive_cc` ('inactivelcdcolor $1 $2 $3 1.') wired from `route_rest_cc[0] → msg_inactive_cc[0] → obj-14[0]`
3. Added `msg_inactive_sub` in obj-39 subpatcher ('inactivelcdcolor $1 $2 $3 1.') wired from `obj-25[0] → msg_inactive_sub[0] → obj-20[1]`

**Fix (MapButtonDF_M.maxpat):**
1. Removed hardcoded `inactivelcdcolor` from obj-14 (and saved_attribute_attributes)
2. Added `msg_inactive_pa` ('inactivelcdcolor $1 $2 $3 1.') wired from `route_rest_pa[0] → msg_inactive_pa[0] → obj-14[0]`

**df_master.js pushState log added:** `[DF-Master] pushState: N non-empty slots → pattr (M atoms)` (symmetric to restoreSlots log)

**Persist wiring verified (all correct, no breaks):**
- classnamespace: dsp.midieffect ✓
- obj-2[3] → obj-300[0] (PUSH) ✓
- obj-300[0] → obj-2[3] (PULL) ✓
- pattrstorage @greedy 1 @savemode 2 ✓
- obj-300 restore: ['empty'] ✓

## CRITICAL LESSONS
1. `classnamespace: dsp.midieffect` must be set explicitly after EVERY file edit — Max editor on save resets it to 'box'. Without dsp.midieffect, ctlin doesn't receive MIDI -> mapping completely broken. Always check this first when diagnosing "mapping not working".
2. `textbutton` does NOT theme in M4L -> use only `live.text appearance=2`
3. `p setText` — only reliable mechanism to update label in live.text at runtime
4. `live.text rounded=0` -> square corners (confirmed Factory Pack)
5. `live.colors` receives token name directly (symbol), no thisdevice needed for context
6. **SF-style blink (canonical):** `metro -> toggle -> t b i -> lcd_control_fg -> live.colors -> route lcd_control_fg -> gate 2 (sel=toggle+1) -> lcdcolor $1 $2 $3 0.5/1.` Only one attribute (`lcdcolor`), one token (`lcd_control_fg`), alpha 0.5<->1.0. Stop: `t 0 b` -> stop metro + restore `lcdcolor full` + `bgcolor` via tb_restore. MANDATORY `route lcd_control_fg` between live.colors and gate 2 (strips label symbol, leaves only RGBA args).
7. Unfrozen `.amxd`: JSON at 0x20, ptch LE@0x1C = filesize-0x20; separators=(',',':') for compact JSON (Path B)
8. `live.text` does NOT understand `bgfillcolor` — only `bgcolor` (and `textcolor`/`bgoncolor`/`textoncolor`).
9. **Path B for unfrozen**: no dlst -> just write larger JSON + update ptch LE@0x1C = new_filesize-0x20. Unfrozen suffix = just `\x00` (1 byte).
10. `unpack s s i i i i i` in JSON may have numoutlets=5 (mismatch) — Max resolves from args. Fix numoutlets and outlettype explicitly when manually repacking.
11. **hollow/filled btn_pr**: `bgcolor` message to inlet[0] live.text = direct color control. Hollow = alpha=0, filled = alpha=1. Not via toggle-state, via direct bgcolor message driven by mapped flag.
12. **CRITICAL: message box + live.text momentary**: live.text (appearance=2, mode=0=momentary) sends INT 1 on press, INT 0 on release. Message box ("page N") when receiving INT in LEFT inlet replaces content with that number and outputs it — instead of "page N" it outputs "1"! Always put `t b` (trigger bang) between momentary button and message box when message box has fixed content. Bang -> message box = outputs content without replacement.
13. **paramArm blink + hollow/filled conflict**: blink via live.colors/bgcolor overwrites button color. On arm-off need retrigger filled/hollow from stored mapped state. Pattern: `int_mapped` (int storage) + `sel_map` -> `msg_pr_hollow/filled` + on arm-off: `tb_restore -> int_mapped` (bang -> outputs stored -> sel_map -> hollow/filled).
14. **`unpack i i` right-to-left order**: Max unpack always outputs outlets right-to-left. `unpack i i` on list `[a, b]`: out1(=b) fires FIRST, out0(=a) fires SECOND. For gate pattern: put selector signal in out1 (right/second field), data signal in out0 (left/first field) — then gate opens before data arrives.
15. **`live.numbox` silent set**: when numbox receives number in its inlet (from another object) — sets value SILENTLY, without triggering its outlet. Prevents feedback loop in feedback-update from js.
16. **`rect` vs `openrect` vs `devicewidth`**: three fields in patcher JSON: `rect`=[x,y,W,H] Max editor window position (NOT device width), `openrect`=[0,0,W,H] device width in Live (W=openrect[2]), `devicewidth`=W (duplicates openrect[2]). When trimming device: change `openrect[2]` AND `devicewidth`, do NOT touch `rect`.
17. **CRITICAL: named messages vs list in JS**: `message box "page $1"` sends NOT a list, but a **named Max message** with selector `"page"`. In JS this calls `function page()`, NOT `function list()`. `list()` fires only for pure list atoms (no symbolic selector). For each named message: add `function <selector>()` in JS.
18. **CRITICAL: pattr without pattrstorage does NOT save to Live set**: `pattr @bindto varname` saves values ONLY when `.amxd` file is saved (via `restore` field in JSON). For .als save/load, pattr works ONLY if pattrstorage @savemode 2 is in the patcher. Without it, mappings only live while device is open.
19. **pattr @bindto + js — UNRELIABLE without explicit wires**: @bindto may call setvalueof internally on js, but this path is unreliable in M4L practice. Confirmed root cause of DF persist failures. ALWAYS add explicit outlet wire from pattr[0] to js inlet for the restore path.
22. **CRITICAL: live.text mode=0 (momentary) has TWO color states**: `lcdcolor` = color when ACTIVE (pressed), `inactivelcdcolor` = color when INACTIVE (idle, not pressed). Runtime `lcdcolor` message ONLY changes active color. To make idle button visible: must also send `inactivelcdcolor R G B 1.` at runtime (via same live.colors token). Hardcoded `inactivelcdcolor: [0.098...]` in JSON = nearly black idle button regardless of any runtime lcdcolor messages → visual regression. Pattern: at blink-stop + init render, send BOTH `lcdcolor ... 1.` AND `inactivelcdcolor ... 1.` from same live.colors RGB source.
25. **CRITICAL: `inactivelcdcolor` SAA expression must NOT be empty**: `saved_attribute_attributes.inactivelcdcolor.expression = ''` (empty string) means Live registers the attribute but applies its OWN dark default — NOT the theme. Must set expression to the SAME token as `lcdcolor` (e.g. `'themecolor.live_control_selection'`). Empty expression ≠ 'no override' here; it means 'managed by theme with no token' = dark default. Adding the key with empty expression (v3.4) fixed registration but NOT the dark color. Full fix = correct token (v3.5).
26. **CRITICAL: DF Slot needs pattrstorage**: Each DF Slot instance has `pattr learnedCC @default -1` + `pattr learnedChannel @default -1`. WITHOUT `pattrstorage @greedy 1 @savemode 2` in the same patcher, learned CC is NEVER saved to .als — resets to -1 (unmapped) on every reload. Symptom: "Map CC stops working after reload" = learnedCC=-1 → routeCC() early-returns. Fix: add pattrstorage @greedy 1 @savemode 2. @greedy auto-adopts both pattr objects (no explicit pattrstorage lines needed).
23. **pushState log**: `[DF-Master] pushState: N non-empty slots → pattr (M atoms)` printed every time state is pushed to pattr. Symmetric log to `restoreSlots` log. If pushState log appears but restoreSlots log does not on reload → pattrstorage or pattr issue. If neither appears → user is loading stale cached version.
20. **Push-pull pattr pattern (CANONICAL for js persist in M4L)**: js outlet N -> pattr inlet 0 (push current state on every change); pattr outlet 0 -> js inlet M (pattr feeds back on restore). pattrstorage @greedy reads pattr passively on save. DO NOT rely on @bindto + getvalueof/setvalueof alone.
24. **CRITICAL: `inactivelcdcolor` MUST be in `saved_attribute_attributes`**: For `live.text appearance=2 mode=0 (momentary)`, the idle state color comes from `inactivelcdcolor`. If `saved_attribute_attributes` does NOT have the key `"inactivelcdcolor": {"expression": ""}`, Live does NOT register it as a managed attribute → Max uses a static dark default → idle button appears dark even after runtime `inactivelcdcolor` messages fire. FIX: add `"inactivelcdcolor": {"expression": ""}` to saved_attribute_attributes in live.text JSON. Empty expression = managed by theme. SF MapButtonDF.maxpat always had this key — copy that pattern exactly.
21. **Flat atom list vs JSON string for pattr storage**: flat atom list [i, cc, ch, omin, omax, pmin, pmax, name_sym] is MUCH more reliable than JSON-as-single-symbol. pattr stores atoms natively; JSON string risks: very long symbol truncation, special chars, Max tokenization. Spaces in names: encode as `__SP__`.
