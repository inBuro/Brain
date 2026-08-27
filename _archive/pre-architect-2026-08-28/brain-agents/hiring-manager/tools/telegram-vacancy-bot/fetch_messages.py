import os
import json

from dotenv import load_dotenv
from telethon.sync import TelegramClient

TOOL_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_DIR = os.path.expanduser("~/.config/telegram/hiring-bot")
load_dotenv(os.path.join(CONFIG_DIR, "env"))

api_id = int(os.environ["TELEGRAM_API_ID"])
api_hash = os.environ["TELEGRAM_API_HASH"]
session_path = os.path.join(CONFIG_DIR, "session")

MESSAGES_PER_CHANNEL = 35

with open(os.path.join(TOOL_DIR, "channels.json")) as f:
    channels = json.load(f)

client = TelegramClient(session_path, api_id, api_hash)
client.connect()

out = []
for ch in channels:
    try:
        entity = client.get_entity(ch["id"])
    except Exception as e:
        print(f"SKIP {ch['name']}: {e}")
        continue
    count = 0
    for msg in client.iter_messages(entity, limit=MESSAGES_PER_CHANNEL):
        if not msg.text:
            continue
        out.append({
            "channel_id": ch["id"],
            "channel_name": ch["name"],
            "message_id": msg.id,
            "date": msg.date.isoformat(),
            "text": msg.text,
        })
        count += 1
    print(f"{ch['name']}: {count} messages")

client.disconnect()

out_path = os.path.join(TOOL_DIR, "raw_messages.json")
with open(out_path, "w") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print(f"\nTotal: {len(out)} messages -> {out_path}")
