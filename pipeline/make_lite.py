#!/usr/bin/env python3
"""
make_lite.py — gömülebilir (embed) küçük pasaj kümesini üretir.
data/chunks.json (tam) + data/corpus.json -> data/chunks_lite.json

Tam külliyat büyütüldüğünde (build_data.py --chunk-cap-big ... ile) tekrar
çalıştırın. Hedef: tek dosya HTML'e gömülecek ~550 KB'lık temsilî örneklem.

Ayarlar (ortam değişkeniyle de verilebilir):
  CAP_BIG   : >60k kelimelik eserlerden tutulacak azami pasaj (öntanım 5)
  CAP_SMALL : küçük eserlerden tutulacak azami pasaj (öntanım 2)
  CLIP_WORDS: her pasajda tutulacak azami kelime (öntanım 75)
"""
import json, os, collections, pathlib
DATA = pathlib.Path(os.environ.get("TEFSIR_OUT", "./data"))
CAP_BIG   = int(os.environ.get("CAP_BIG", 5))
CAP_SMALL = int(os.environ.get("CAP_SMALL", 2))
CLIP      = int(os.environ.get("CLIP_WORDS", 75))
BIG_WORDS = 60000

chunks = json.load(open(DATA/"chunks.json", encoding="utf-8"))
words  = {w["id"]: w["words"] for w in json.load(open(DATA/"corpus.json", encoding="utf-8"))}

byw = collections.defaultdict(list)
for c in chunks:
    byw[c["w"]].append(c)

out = []
for wid, items in byw.items():
    items = sorted(items, key=lambda x: x["c"])
    cap = CAP_BIG if words.get(wid, 0) > BIG_WORDS else CAP_SMALL
    if len(items) > cap:
        step = len(items) / cap
        idx = sorted({int(j*step) for j in range(cap)})
        items = [items[j] for j in idx]
    for it in items:
        toks = it["t"].split()
        txt = " ".join(toks[:CLIP]) if len(toks) > CLIP else it["t"]
        out.append({"id": it["id"], "w": wid, "atr": it["atr"], "ttl": it["ttl"],
                    "lang": it["lang"], "ah": it["ah"], "t": txt})

dst = DATA/"chunks_lite.json"
json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False)
kb = dst.stat().st_size/1024
print(f"wrote {dst}  {len(out)} pasaj  {kb:.0f} KB")
