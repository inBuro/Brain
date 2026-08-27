import os

from dotenv import load_dotenv
from telethon.sync import TelegramClient
from telethon.tl.types import Channel

CONFIG_DIR = os.path.expanduser("~/.config/telegram/hiring-bot")
load_dotenv(os.path.join(CONFIG_DIR, "env"))

api_id = int(os.environ["TELEGRAM_API_ID"])
api_hash = os.environ["TELEGRAM_API_HASH"]
session_path = os.path.join(CONFIG_DIR, "session")

client = TelegramClient(session_path, api_id, api_hash)
client.connect()

for dialog in client.iter_dialogs():
    entity = dialog.entity
    if isinstance(entity, Channel) and not entity.megagroup:
        print(f"{entity.id}\t{dialog.unread_count}\t{dialog.name}")

client.disconnect()
