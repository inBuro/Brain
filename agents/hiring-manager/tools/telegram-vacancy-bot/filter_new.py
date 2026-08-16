import json
import os

TOOL_DIR = os.path.dirname(os.path.abspath(__file__))

raw = json.load(open(os.path.join(TOOL_DIR, "raw_messages.json")))
seen_path = os.path.join(TOOL_DIR, "seen_store.json")
seen = json.load(open(seen_path)) if os.path.exists(seen_path) else {}

new_messages = [m for m in raw if f"{m['channel_id']}:{m['message_id']}" not in seen]

out_path = os.path.join(TOOL_DIR, "new_messages.json")
with open(out_path, "w") as f:
    json.dump(new_messages, f, ensure_ascii=False, indent=2)

print(f"{len(new_messages)} new / {len(raw)} fetched -> {out_path}")
