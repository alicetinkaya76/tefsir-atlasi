#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Quick scan: list every real corpus file with death AH, Latin author/title from
filename, and Arabic AuthorNAME/BookTITLE from the #META# header."""
import os, re, sys
from pathlib import Path

SRC = Path("/home/claude/corpus/en_buyuk_dosyalar")
META_END = "#META#Header#End#"

def latin_split(camel):
    # split CamelCase / digit boundaries into spaced words
    s = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", camel)
    s = re.sub(r"(?<=[A-Za-z])(?=[A-Z][a-z])", " ", s)
    return s.strip()

def read_meta(path, want=("AuthorNAME","BookTITLE","BookSUBJ")):
    out = {}
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            for line in f:
                if META_END in line:
                    break
                m = re.match(r"#META#\s*([0-9.]*\s*[A-Za-z.]+)\s*::\s*(.+)", line)
                if m:
                    key = m.group(1).strip().split(".")[-1]
                    val = m.group(2).strip()
                    if key in want and val and val != "NODATA":
                        out.setdefault(key, val)
    except Exception as e:
        pass
    return out

files = [p for p in SRC.iterdir()
         if p.is_file() and not p.name.startswith("._")
         and re.match(r"\d{4}", p.name)]
files.sort(key=lambda p: p.name)

rows = []
for p in files:
    m = re.match(r"(\d{4})([A-Za-z]+)\.([A-Za-z]+)\.", p.name)
    if not m:
        # fallback parse
        m2 = re.match(r"(\d{4})(\w+?)\.(\w+)", p.name)
        ah = int(p.name[:4]); auth = "?"; title = "?"
    else:
        ah = int(m.group(1)); auth = latin_split(m.group(2)); title = latin_split(m.group(3))
    lang = "per" if re.search(r"-per\d", p.name) else "ara"
    meta = read_meta(p)
    size = p.stat().st_size
    rows.append((ah, auth, title, lang, size, meta.get("AuthorNAME",""), meta.get("BookTITLE","")))

print(f"{len(rows)} works\n")
for ah, auth, title, lang, size, anm, btl in rows:
    print(f"{ah:4d} {lang} {size/1048576:6.2f}MB  {auth:38s} | {title[:34]:34s} | {anm[:30]}")
