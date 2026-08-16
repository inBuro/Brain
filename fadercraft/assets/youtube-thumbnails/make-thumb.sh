#!/usr/bin/env bash
# Fadercraft YouTube thumbnail generator — one style for every video.
# Usage:
#   ./make-thumb.sh <photo.jpg> "14 channels." "One surface." "Control XL · LCXL MK3" \
#     "One Max for Live device. Your whole mixer under your hands." out.jpg
# The hook font auto-fits: each line always stays on ONE line, never wraps.
set -euo pipefail
PHOTO="$1"; L1="$2"; L2="$3"; EYE="${4:-}"; SUB="${5:-}"; OUT="${6:-thumb.jpg}"
TMP="$(mktemp -d)"
HS="$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell"
base64 -i "$HOME/Library/Fonts/DMSans-Black.ttf" > "$TMP/black.b64"
base64 -i "$HOME/Library/Fonts/DMSans-Bold.ttf"  > "$TMP/bold.b64"
base64 -i "$PHOTO"                                > "$TMP/bg.b64"
L1="$L1" L2="$L2" EYE="$EYE" SUB="$SUB" TMP="$TMP" python3 <<'PY'
import os
T=os.environ["TMP"]
r=lambda f:open(os.path.join(T,f)).read().replace("\n","")
d={"BLACK":r("black.b64"),"BOLD":r("bold.b64"),"BG":r("bg.b64"),
   "L1":os.environ["L1"],"L2":os.environ["L2"],"EYE":os.environ["EYE"],"SUB":os.environ["SUB"]}
html=('''<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:DM;src:url(data:font/ttf;base64,%(BLACK)s);font-weight:900}
@font-face{font-family:DM;src:url(data:font/ttf;base64,%(BOLD)s);font-weight:700}
*{margin:0;box-sizing:border-box}html,body{width:1280px;height:720px;overflow:hidden}
.c{position:relative;width:1280px;height:720px;background:#042B4A;font-family:DM;overflow:hidden}
.p{position:absolute;inset:0;background:url(data:image/jpeg;base64,%(BG)s) center 42%%/cover no-repeat;
 filter:brightness(1.30) contrast(1.05) saturate(1.20);transform:scale(1.02)}
.s{position:absolute;inset:0;background:linear-gradient(100deg,rgba(4,20,36,.97),rgba(4,25,45,.93) 30%%,rgba(4,29,53,.55) 52%%,rgba(4,29,53,0) 70%%)}
.v{position:absolute;inset:0;background:radial-gradient(120%% 90%% at 78%% 40%%,transparent 55%%,rgba(2,14,26,.55))}
.w{position:absolute;left:76px;top:0;height:720px;width:648px;display:flex;flex-direction:column;justify-content:center}
.e{font-weight:700;font-size:23px;letter-spacing:.22em;color:#63F2CA;text-transform:uppercase;margin-bottom:26px;display:flex;align-items:center;gap:14px}
.e i{width:9px;height:9px;border-radius:50%%;background:#1AE5AC;box-shadow:0 0 14px #1AE5AC}
.h{font-weight:900;font-size:104px;line-height:.98;letter-spacing:-.015em;color:#fff;text-shadow:0 3px 30px rgba(0,0,0,.45)}
.h span{display:block;width:max-content;max-width:100%%;white-space:nowrap}
.h .l2{color:#63F2CA}
.bar{width:96px;height:8px;background:#1AE5AC;border-radius:4px;margin-top:34px;box-shadow:0 0 22px rgba(26,229,172,.6)}
.sub{font-weight:700;font-size:26px;color:#CFE9E2;margin-top:26px;opacity:.92}
.br{position:absolute;left:78px;bottom:44px}
.br span{font-weight:700;font-size:15px;letter-spacing:.16em;color:#042B4A;background:#63F2CA;padding:6px 12px;border-radius:6px;text-transform:uppercase}
</style><div class=c><div class=p></div><div class=s></div><div class=v></div>
<div class=w><div class=e><i></i>%(EYE)s</div><div class=h><span class=l1>%(L1)s</span><span class=l2>%(L2)s</span></div><div class=bar></div><div class=sub>%(SUB)s</div></div>
<div class=br><span>Fadercraft</span></div></div>
<script>
function fit(){var w=document.querySelector('.w').clientWidth-6,h=document.querySelector('.h'),
 a=h.querySelector('.l1'),b=h.querySelector('.l2'),fs=104;h.style.fontSize=fs+'px';
 while(fs>40&&(a.offsetWidth>w||b.offsetWidth>w)){fs-=1;h.style.fontSize=fs+'px';}}
fit();document.fonts.ready.then(fit);
</script>''' % d)
open(os.path.join(T,"t.html"),"w").write(html)
PY
"$HS" --headless --no-sandbox --hide-scrollbars --force-device-scale-factor=1 \
  --virtual-time-budget=2500 --run-all-compositor-stages-before-draw \
  --window-size=1280,720 --screenshot="$TMP/t.png" "file://$TMP/t.html" 2>/dev/null
sips -s format jpeg -s formatOptions 88 "$TMP/t.png" --out "$OUT" >/dev/null 2>&1
echo "wrote $OUT"; rm -rf "$TMP"
