import os
import json
import re

from dotenv import load_dotenv
import anthropic

TOOL_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.expanduser("~/.config/anthropic/env"))

client = anthropic.Anthropic()

CRITERIA = """
- Role: Product Designer or UI Designer (or a close synonym: UX/UI Designer, Product/UI Designer). Not: pure UX researcher, illustrator, graphic/brand designer, motion designer, developer, marketer, PM.
- Seniority: Middle or Senior. Not: Junior, Intern, Lead/Head-only postings are fine if hands-on design is still core.
- Employment: full-time only. Not: freelance/project/contract/part-time gigs.
- Location: fully remote, no relocation required. Not: office-only, relocation-required, hybrid-with-office-requirement.
- Compensation: from $4500/month or higher, ideally stated in USD/USDT/EUR. Reject if the post explicitly states a lower figure, or states RUB/rubles as the payment currency. If pay is not mentioned at all, still pass it through as UNCERTAIN (don't reject solely for missing salary) — but if RUB is mentioned, reject regardless of amount.
- Industry: reject any gaming/game-dev vacancy outright (game studio, mobile games, iGaming/gambling/betting platforms), regardless of how well it fits the other criteria.
"""

SYSTEM = f"""You are a job-vacancy filter for a specific candidate. Classify each Telegram message as one of:
- MATCH: clearly a job posting that fits ALL the criteria below
- MAYBE: a job posting that fits most criteria but is missing/ambiguous on one (e.g. no salary stated, seniority unclear)
- REJECT: not a fit, or not a job posting at all (e.g. it's a resume/CV post from a candidate, a course ad, a freelance gig, wrong role/seniority/location/currency)

Criteria:
{CRITERIA}

Respond with ONLY a JSON array, one object per input message in the same order, each: {{"verdict": "MATCH"|"MAYBE"|"REJECT", "reason": "<one short sentence, in Russian>"}}
No prose, no markdown fences, just the JSON array.
"""

with open(os.path.join(TOOL_DIR, "raw_messages.json")) as f:
    messages = json.load(f)

BATCH = 15
results = []

for i in range(0, len(messages), BATCH):
    batch = messages[i:i + BATCH]
    user_content = "\n\n".join(
        f"[{j}] (channel: {m['channel_name']})\n{m['text'][:1200]}"
        for j, m in enumerate(batch)
    )
    resp = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=4000,
        system=SYSTEM,
        messages=[{"role": "user", "content": user_content}],
    )
    raw = resp.content[0].text.strip()
    raw = re.sub(r"^```(json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
    try:
        verdicts = json.loads(raw)
    except json.JSONDecodeError:
        print(f"PARSE FAIL batch {i}: {raw[:300]}")
        verdicts = [{"verdict": "REJECT", "reason": "parse error"} for _ in batch]

    for m, v in zip(batch, verdicts):
        results.append({**m, **v})

    print(f"batch {i}-{i+len(batch)} done")

out_path = os.path.join(TOOL_DIR, "classified.json")
with open(out_path, "w") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

match = [r for r in results if r["verdict"] == "MATCH"]
maybe = [r for r in results if r["verdict"] == "MAYBE"]
print(f"\nMATCH: {len(match)}  MAYBE: {len(maybe)}  REJECT: {len(results) - len(match) - len(maybe)}  / {len(results)} total")
