
import json, re

def make_title(reason):
    t = re.split(r" — | - ", reason)[0].strip()
    return (t[:90] + "…") if len(t) > 90 else (t or "Вакансия")

led = json.load(open("notion_rows.json"))
have = {x.get("link") for x in led}
push = json.load(open("to_push.json"))
added = 0
for r in push:
    link = f"https://t.me/c/{r['channel_id']}/{r['message_id']}"
    if link in have:
        continue
    text = r["text"].replace("\n", " ").strip()
    if len(text) > 500:
        text = text[:500] + "…"
    led.append({
        "title": make_title(r["reason"]),
        "status": r["verdict"],
        "channel": r["channel_name"],
        "date": r["date"][:10],
        "reason": r["reason"],
        "text": text,
        "link": link,
    })
    added += 1
json.dump(led, open("notion_rows.json", "w"), ensure_ascii=False, indent=2)
print(f"ledger appended {added} -> {len(led)} total")
