import os
import sys
import json

from dotenv import load_dotenv
from telethon.sync import TelegramClient
from telethon.errors import SessionPasswordNeededError

CONFIG_DIR = os.path.expanduser("~/.config/telegram/hiring-bot")
load_dotenv(os.path.join(CONFIG_DIR, "env"))

api_id = int(os.environ["TELEGRAM_API_ID"])
api_hash = os.environ["TELEGRAM_API_HASH"]
code = sys.argv[1]

with open(os.path.join(CONFIG_DIR, "login_state.json")) as f:
    state = json.load(f)

session_path = os.path.join(CONFIG_DIR, "session")
client = TelegramClient(session_path, api_id, api_hash)
client.connect()

try:
    client.sign_in(phone=state["phone"], code=code, phone_code_hash=state["phone_code_hash"])
    print("SIGNED_IN")
except SessionPasswordNeededError:
    print("NEEDS_2FA_PASSWORD")

client.disconnect()
