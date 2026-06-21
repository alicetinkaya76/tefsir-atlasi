#!/usr/bin/env python3
"""
assemble.py — tek dosya siteyi (tefsir-atlasi.html) yeniden üretir.
  site/app.html (şablon) + site/app.js (uygulama) + data/*.json  ->  tefsir-atlasi.html

Kullanım (depo kökünden):
  python3 site/assemble.py
Çıktı kökte: tefsir-atlasi.html

Gömülen pasajlar data/chunks_lite.json'dan gelir; tam chunks.json yerine
küçük örneklem gömülür ki dosya tarayıcıda hızlı açılsın. Veriyi büyüttüyseniz
önce pipeline/make_lite.py çalıştırın.
"""
import json, pathlib, os

HERE = pathlib.Path(__file__).resolve().parent          # .../site
ROOT = HERE.parent                                       # repo root
DATA = pathlib.Path(os.environ.get("TEFSIR_OUT", ROOT/"data"))
OUT  = ROOT/"tefsir-atlasi.html"

def load(name): return json.load(open(DATA/name, encoding="utf-8"))

corpus   = load("corpus.json")
concepts = load("concepts.json")
stats    = load("stats.json")
cnet     = load("concept_network.json")
svocab   = load("shared_vocab.json")
chunks   = load("chunks_lite.json")

def emb(obj):
    s = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    return s.replace("</", "<\\/").replace("<!--", "<\\!--")

data_block = (
    "const DATA = {\n"
    f"  corpus: {emb(corpus)},\n"
    f"  concepts: {emb(concepts)},\n"
    f"  stats: {emb(stats)},\n"
    f"  cnet: {emb(cnet)},\n"
    f"  svocab: {emb(svocab)},\n"
    f"  chunks: {emb(chunks)}\n"
    "};"
)

tpl = (HERE/"app.html").read_text(encoding="utf-8")
js  = (HERE/"app.js").read_text(encoding="utf-8")
html = tpl.replace("/*__DATA__*/", data_block).replace("/*__JS__*/", js)
OUT.write_text(html, encoding="utf-8")
print(f"wrote {OUT}  ({OUT.stat().st_size/1024:.0f} KB)  · {len(corpus)} works · {len(chunks)} passages")
