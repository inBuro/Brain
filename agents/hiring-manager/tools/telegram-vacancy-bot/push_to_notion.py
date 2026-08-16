import json
import os
import sys

import requests

TOOL_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_SOURCE_ID = "8ebe034a-c806-490e-98f8-e2482fa89858"

env = {}
with open(os.path.expanduser("~/.config/notion/env")) as f:
    for line in f:
        line = line.strip()
        if line and "=" in line:
            k, v = line.split("=", 1)
            env[k] = v

TOKEN = env["NOTION_TOKEN"]
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Notion-Version": "2025-09-03",
    "Content-Type": "application/json",
}


def make_title(reason):
    import re
    t = re.split(r" — | - ", reason)[0].strip()
    if len(t) > 90:
        t = t[:90] + "…"
    return t or "Вакансия"


def create_page(row):
    text = row["text"].replace("\n", " ").strip()
    if len(text) > 500:
        text = text[:500] + "…"
    link = f"https://t.me/c/{row['channel_id']}/{row['message_id']}"
    payload = {
        "parent": {"data_source_id": DATA_SOURCE_ID, "type": "data_source_id"},
        "properties": {
            "Название": {"title": [{"text": {"content": make_title(row["reason"])}}]},
            "Статус": {"select": {"name": row["verdict"]}},
            "Канал": {"rich_text": [{"text": {"content": row["channel_name"]}}]},
            "Дата": {"date": {"start": row["date"][:10]}},
            "Причина": {"rich_text": [{"text": {"content": row["reason"]}}]},
            "Текст": {"rich_text": [{"text": {"content": text}}]},
            "Ссылка": {"url": link},
        },
    }
    resp = requests.post("https://api.notion.com/v1/pages", headers=HEADERS, json=payload)
    if resp.status_code != 200:
        print(f"FAILED {row['channel_name']} {row['message_id']}: {resp.status_code} {resp.text[:300]}")
        return None
    return resp.json()["id"]


if __name__ == "__main__":
    in_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(TOOL_DIR, "to_push.json")
    rows = json.load(open(in_path))
    pushed = 0
    for r in rows:
        if r["verdict"] not in ("MATCH", "MAYBE"):
            continue
        pid = create_page(r)
        if pid:
            pushed += 1
    print(f"pushed {pushed}/{len(rows)}")
