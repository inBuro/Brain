import os
import sys
import json

from dotenv import load_dotenv
from telethon.sync import TelegramClient

CONFIG_DIR = os.path.expanduser("~/.config/telegram/hiring-bot")
load_dotenv(os.path.join(CONFIG_DIR, "env"))

api_id = int(os.environ["TELEGRAM_API_ID"])
api_hash = os.environ["TELEGRAM_API_HASH"]
phone = sys.argv[1]

session_path = os.path.join(CONFIG_DIR, "session")

client = TelegramClient(session_path, api_id, api_hash)
client.connect()

if client.is_user_authorized():
    print("ALREADY_AUTHORIZED")
else:
    sent = client.send_code_request(phone)
    with open(os.path.join(CONFIG_DIR, "login_state.json"), "w") as f:
        json.dump({"phone": phone, "phone_code_hash": sent.phone_code_hash}, f)
    print("CODE_SENT")

client.disconnect()
