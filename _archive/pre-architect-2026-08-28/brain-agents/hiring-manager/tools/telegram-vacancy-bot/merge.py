import json
import os

TOOL_DIR = os.path.dirname(os.path.abspath(__file__))

raw = json.load(open(os.path.join(TOOL_DIR, "raw_messages.json")))
raw_by_key = {(m["channel_id"], m["message_id"]): m for m in raw}

merged = []
missing = 0
for i in range(6):
    verdicts = json.load(open(os.path.join(TOOL_DIR, "verdicts", f"chunk_{i}.json")))
    src = json.load(open(os.path.join(TOOL_DIR, f"chunk_{i}.json")))
    for src_msg, v in zip(src, verdicts):
        key = (src_msg["channel_id"], src_msg["message_id"])
        base = raw_by_key.get(key)
        if base is None:
            missing += 1
            continue
        merged.append({**base, "verdict": v["verdict"], "reason": v["reason"]})

print(f"merged: {len(merged)}, missing lookups: {missing}")

out_path = os.path.join(TOOL_DIR, "classified.json")
with open(out_path, "w") as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)

by_verdict = {"MATCH": [], "MAYBE": [], "REJECT": []}
for m in merged:
    by_verdict.setdefault(m["verdict"], []).append(m)

for k in ["MATCH", "MAYBE", "REJECT"]:
    print(k, len(by_verdict[k]))
