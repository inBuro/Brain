#!/usr/bin/env python3
"""Под каждым заголовком темы в QUESTIONS.md проставить, из каких уроков и папок она собрана.

Строка вида:  Уроки: 1.4 · папка 2 «AI Strategist»
Пересобирается при каждом запуске, так что после правки таблиц достаточно прогнать заново.
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
MARK = "Уроки: "

FOLDER = {  # модуль в адресе -> номер папки на диске и короткое имя
    "0": (1, "Старт"),
    "1": (2, "AI Strategist"),
    "2": (3, "System Architect"),
    "3": (4, "Visual Engineer"),
    "4": (5, "AI Prototyper & Agents"),
}

def order(a):
    if a == "0":
        return (0, 0, 0)
    mod, _, lesson = a.partition(".")
    extra = lesson.endswith("-доп")
    return (int(mod), int(lesson.removesuffix("-доп")), extra)

def main():
    p = ROOT / "QUESTIONS.md"
    lines = p.read_text(encoding="utf-8").splitlines()

    # границы разделов
    heads = [i for i, l in enumerate(lines)
             if l.startswith("## ") and l != "## Как читать адрес"]
    out, prev = [], 0
    for h in heads:
        end = next((i for i in heads if i > h), len(lines))
        body = "\n".join(lines[h:end])
        addrs = sorted({m.group(1) for m in
                        re.finditer(r"(?<![\d.])(\d(?:\.\d+(?:-доп)?)?) @", body)}, key=order)
        if not addrs:
            continue
        folders = sorted({FOLDER[a.partition(".")[0]] for a in addrs})
        folder_text = ", ".join(f"{n} «{name}»" for n, name in folders)
        folder_word = "папка" if len(folders) == 1 else "папки"
        if len(addrs) > 8:      # сквозная тема — перечислять все уроки бессмысленно
            note = f"{MARK}сквозная тема, {len(addrs)} уроков · {folder_word} {folder_text}"
        else:
            note = f"{MARK}{', '.join(addrs)} · {folder_word} {folder_text}"

        out.append((h, note))

    # вставляем сверху вниз, снимая прежнюю строку
    result, i = [], 0
    notes = dict(out)
    while i < len(lines):
        result.append(lines[i])
        if i in notes:
            j = i + 1
            while j < len(lines) and (not lines[j].strip() or lines[j].startswith(MARK)):
                j += 1
            result += ["", notes[i], ""]
            i = j - 1
        i += 1
    p.write_text("\n".join(result) + "\n", encoding="utf-8")
    print(f"разделов подписано: {len(out)}")

if __name__ == "__main__":
    main()
