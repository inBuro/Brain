#!/usr/bin/env python3
"""Открыть урок в VLC с нужного тайм-кода.

    .pipeline/play.py 2.6 6:47      — урок 2.6 с 6:47
    .pipeline/play.py 1.1-доп       — с начала
"""
import csv, pathlib, re, subprocess, sys, time

ROOT = pathlib.Path(__file__).resolve().parent.parent

# в папке первого урока два видео: сам урок и записанный позже разбор среды
OVERRIDE = {"m1-01b-product-thinking": "1.1", "m1-01-antigravity": "1.1-доп"}

def slug_to_address(slug):
    if slug in OVERRIDE:
        return OVERRIDE[slug]
    if slug.startswith("00-"):
        return "0"
    m = re.match(r"m(\d)-(\d+)-", slug)
    return f"{m.group(1)}.{int(m.group(2))}"

def main():
    if not sys.argv[1:]:
        sys.exit(__doc__)
    address, timecode = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "0:00")

    rows = list(csv.DictReader(open(ROOT / ".pipeline/manifest.tsv", encoding="utf-8"),
                               delimiter="\t"))
    video = next((r["video"] for r in rows if slug_to_address(r["slug"]) == address), None)
    if video is None:
        sys.exit(f"нет такого урока: {address}. Список адресов — в INDEX.md")

    parts = [int(x) for x in timecode.split(":")]
    seconds = parts[0] * 60 + parts[1] if len(parts) == 2 else parts[0] * 3600 + parts[1] * 60 + parts[2]

    # уже запущенный VLC игнорирует --args, поэтому гасим прежний экземпляр
    # и обязательно дожидаемся, пока процесс исчезнет, иначе новый запуск не переживёт выход старого
    subprocess.run(["osascript", "-e", 'tell application "VLC" to if it is running then quit'],
                   capture_output=True)
    for _ in range(50):
        if subprocess.run(["pgrep", "-f", "VLC.app/Contents/MacOS/VLC"],
                          capture_output=True).returncode != 0:
            break
        time.sleep(0.2)

    subprocess.run(["open", "-na", "VLC", "--args",
                    f"--start-time={seconds}", str(ROOT / video)], check=True)
    print(f"{address} @ {timecode} → {pathlib.Path(video).name}")

if __name__ == "__main__":
    main()
