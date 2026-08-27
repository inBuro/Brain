
import json, collections

new = json.load(open("new_classified.json"))
master = json.load(open("classified.json"))
have = {(r["channel_id"], r["message_id"]) for r in master}
added = 0
for r in new:
    if (r["channel_id"], r["message_id"]) not in have:
        master.append(r); added += 1
json.dump(master, open("classified.json", "w"), ensure_ascii=False, indent=2)

seen = {f"{r['channel_id']}:{r['message_id']}": {"verdict": r["verdict"], "reason": r["reason"], "date": r["date"]} for r in master}
json.dump(seen, open("seen_store.json", "w"), ensure_ascii=False, indent=2)

print(f"appended {added} new rows -> classified.json {len(master)} total")
print("master verdicts:", dict(collections.Counter(r["verdict"] for r in master)))
print("seen_store keys:", len(seen))
