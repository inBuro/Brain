import json
import os
import re
import difflib

TOOL_DIR = os.path.dirname(os.path.abspath(__file__))

STRIP_RE = re.compile(r"[*_#>`\[\]()]|https?://\S+|#\w+")
WS_RE = re.compile(r"\s+")


def normalize(text):
    text = STRIP_RE.sub(" ", text)
    text = WS_RE.sub(" ", text).strip().lower()
    return text


def score(row):
    s = 0
    if row["verdict"] == "MATCH":
        s += 10
    if "не указана" not in row["reason"] and "не указан" not in row["reason"]:
        s += 5
    s += min(len(row["text"]), 2000) / 2000
    return s


def find_duplicate_clusters(rows, threshold=0.72):
    normed = [normalize(r["text"]) for r in rows]
    n = len(rows)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    for i in range(n):
        for j in range(i + 1, n):
            if min(len(normed[i]), len(normed[j])) < 40:
                continue
            if abs(len(normed[i]) - len(normed[j])) / max(len(normed[i]), len(normed[j])) > 0.35:
                continue
            ratio = difflib.SequenceMatcher(None, normed[i], normed[j]).ratio()
            if ratio >= threshold:
                union(i, j)

    clusters = {}
    for i in range(n):
        clusters.setdefault(find(i), []).append(i)

    return [c for c in clusters.values() if len(c) > 1]


if __name__ == "__main__":
    rows = json.load(open(os.path.join(TOOL_DIR, "classified.json")))
    rows = [r for r in rows if r["verdict"] in ("MATCH", "MAYBE")]
    clusters = find_duplicate_clusters(rows)
    print(f"{len(clusters)} duplicate clusters among {len(rows)} MATCH/MAYBE rows")
    for c in clusters:
        winner = max(c, key=lambda i: score(rows[i]))
        for i in c:
            tag = "KEEP" if i == winner else "DROP"
            r = rows[i]
            print(f"  [{tag}] {r['channel_name']} {r['date'][:10]} {r['reason'][:70]}")
