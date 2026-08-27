import json
import os

TOOL_DIR = os.path.dirname(os.path.abspath(__file__))

classified = json.load(open(os.path.join(TOOL_DIR, "classified.json")))

seen = {}
for r in classified:
    key = f"{r['channel_id']}:{r['message_id']}"
    seen[key] = {
        "verdict": r["verdict"],
        "reason": r["reason"],
        "date": r["date"],
    }

out_path = os.path.join(TOOL_DIR, "seen_store.json")
with open(out_path, "w") as f:
    json.dump(seen, f, ensure_ascii=False, indent=2)

print(f"seeded {len(seen)} seen messages -> {out_path}")
