
import json
import dedupe

def link(r):
    return f"https://t.me/c/{r['channel_id']}/{r['message_id']}"

new = json.load(open("new_classified.json"))
cand = [r for r in new if r["verdict"] in ("MATCH", "MAYBE")]

pushed_links = {x.get("link") for x in json.load(open("notion_rows.json"))}

clusters = dedupe.find_duplicate_clusters(cand)
drop = set()
for c in clusters:
    winner = max(c, key=lambda i: dedupe.score(cand[i]))
    for i in c:
        if i != winner:
            drop.add(i)

kept, dupe, already = [], [], []
for i, r in enumerate(cand):
    if i in drop:
        dupe.append(r)
    elif link(r) in pushed_links:
        already.append(r)
    else:
        kept.append(r)

json.dump(kept, open("to_push.json", "w"), ensure_ascii=False, indent=2)
print(f"candidates(MATCH/MAYBE): {len(cand)}  clusters: {len(clusters)}")
print(f"-> to_push: {len(kept)} | dropped in-batch dupe: {len(dupe)} | already in Notion: {len(already)}")
for r in kept:
    print("  PUSH", r["verdict"], r["channel_name"], r["date"][:10], "|", r["reason"][:70])
for r in dupe:
    print("  DUPE", r["channel_name"], "|", r["reason"][:60])
for r in already:
    print("  SKIP(pushed)", r["channel_name"], link(r))
