import json
import os

TOOL_DIR = os.path.dirname(os.path.abspath(__file__))
merged = json.load(open(os.path.join(TOOL_DIR, "classified.json")))

matches = [m for m in merged if m["verdict"] == "MATCH"]
maybes = [m for m in merged if m["verdict"] == "MAYBE"]

matches.sort(key=lambda m: m["date"], reverse=True)
maybes.sort(key=lambda m: m["date"], reverse=True)


def deep_link(m):
    return f"https://t.me/c/{m['channel_id']}/{m['message_id']}"


def entry(m):
    text = m["text"].replace("\n", " ").strip()
    if len(text) > 220:
        text = text[:220] + "…"
    date = m["date"][:10]
    return (
        f"- **{m['channel_name']}** ({date}) — {m['reason']}\n"
        f"  [{deep_link(m)}]({deep_link(m)})\n"
        f"  > {text}\n"
    )


lines = []
lines.append("# Вакансии из Telegram-каналов — прогон 2026-08-10\n")
lines.append(
    "Источник: 25 подписных Telegram-каналов, последние ~30-40 сообщений с каждого (905 всего). "
    "Классификатор — саб-агенты Claude (не отдельный API), критерии: Product/UI Designer, "
    "Middle/Senior, remote, full-time, от $4500/мес (USD/USDT/EUR, не RUB).\n"
)
lines.append(f"\n**MATCH: {len(matches)} · MAYBE: {len(maybes)} · REJECT: {905 - len(matches) - len(maybes)} / 905 просмотрено**\n")

lines.append("\n## MATCH — соответствуют всем критериям\n")
if matches:
    for m in matches:
        lines.append(entry(m))
else:
    lines.append("_нет_\n")

lines.append(
    "\n## MAYBE — подходят по роли/уровню/формату, но зарплата не указана в посте "
    "(нужно уточнять на месте)\n"
)
for m in maybes:
    lines.append(entry(m))

out_path = os.path.expanduser("~/Brain/portfolio/research/telegram-vacancies-2026-08-10.md")
with open(out_path, "w") as f:
    f.write("\n".join(lines))

print(f"written -> {out_path}")
print(f"MATCH {len(matches)}, MAYBE {len(maybes)}")
