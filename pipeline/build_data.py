#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""build_data.py — OpenITI tafsir corpus → Tafsir Atlas JSON.

Modelled on the Sufi-atlas pipeline (prepare_corpus.py) but retargeted at the
161-work tafsir corpus, and made *self-bootstrapping*: author identity, death
year, title and language are read straight from the OpenITI filename + #META#
header, so no per-work bibliographic curation is needed. Three facets
(school, genre, geography) come from curated.py; the counted vocabulary from
concept_lexicon.py.

Performance: concept counting and shared-vocabulary profiling operate on the
*unique token types* of each work (and their frequencies), not on every token
instance — turning a ~120M-token pass into a few-million-type pass.

Run:  python3 build_data.py  [--full]
  --full keeps more search chunks per work (heavier output).
"""
import os, re, json, sys, math, argparse
from pathlib import Path
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from curated import (TRADITIONS, TRAD_BY_AUTHOR, GENRES, infer_genre,
                     GEO_BY_NISBA, GEO_BY_AUTHOR)
from concept_lexicon import CATS, CONCEPTS

SRC = Path(os.environ.get("TEFSIR_SRC", "/home/claude/corpus/en_buyuk_dosyalar"))
OUT = Path(os.environ.get("TEFSIR_OUT", "./data"))
META_END = "#META#Header#End#"

# ── normalisation (folds Arabic & Persian orthographic variants) ─────────
AR_DIAC = re.compile(r"[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u08d4-\u08ff]")
TATWEEL = "\u0640"

def normalize_ar(s):
    if not s:
        return ""
    s = AR_DIAC.sub("", s).replace(TATWEEL, "")
    s = re.sub("[إأآٱ]", "ا", s)
    s = s.replace("ك", "ک").replace("ي", "ی").replace("ى", "ی")
    s = s.replace("ة", "ه").replace("ۀ", "ه").replace("ئ", "ی")
    return s

_PROCLITIC = re.compile(r"^(وال|فال|بال|کال|لل|ال|و|ف|ب|ک|ل)")
def strip_proclitics(tok):
    prev = None
    while tok != prev and len(tok) > 2:
        prev = tok
        tok = _PROCLITIC.sub("", tok, count=1)
    return tok

# variant (normalised) → concept key
VARIANT2KEY = {}
for c in CONCEPTS:
    for v in c["variants"]:
        VARIANT2KEY.setdefault(normalize_ar(v), c["key"])

def match_concept(tok_norm):
    """Return concept key for a normalised token, or None (conservative)."""
    if tok_norm in VARIANT2KEY:
        return VARIANT2KEY[tok_norm]
    base = strip_proclitics(tok_norm)
    if base != tok_norm and base in VARIANT2KEY:
        return VARIANT2KEY[base]
    # prefix-stem with short inflectional tail (variant length >=4)
    for cut in (1, 2):
        if len(base) - cut >= 4:
            stem = base[:-cut]
            if stem in VARIANT2KEY:
                return VARIANT2KEY[stem]
    return None

# ── OpenITI markup cleaning ──────────────────────────────────────────────
PAGE_RE = re.compile(r"PageV\d+P\d+")
MS_RE = re.compile(r"\bms\d+\b")
EDIT_RE = re.compile(r"@[A-Z]+@|ms\d+|PageV\d+P\d+")

def read_meta(raw_head):
    meta = {}
    for line in raw_head.splitlines():
        m = re.match(r"#META#\s*([0-9.]*\s*[A-Za-z.]+)\s*::\s*(.+)", line)
        if m:
            key = m.group(1).strip().split(".")[-1]
            val = m.group(2).strip()
            if val and val != "NODATA":
                meta.setdefault(key, val)
    return meta

def clean_body(body):
    body = PAGE_RE.sub(" ", body)
    body = MS_RE.sub(" ", body)
    body = EDIT_RE.sub(" ", body)
    body = re.sub(r"%~%", " ", body)
    body = re.sub(r"[#~|@+]", " ", body)
    body = re.sub(r"\[[^\]]*\]", " ", body)
    body = re.sub(r"\(\d+\)", " ", body)
    body = re.sub(r"\s+", " ", body)
    return body.strip()

TOK_RE = re.compile(r"[\s\.,;:!?()«»\"'،؛؟\-/\\\u060c\u06d4]+")
def tokenize(text):
    return [t for t in TOK_RE.split(text) if t]

# ── transliteration: OpenITI Latin → readable (ʿayn = c/C) ──────────────
def latin_split(camel):
    s = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", camel)
    s = re.sub(r"(?<=[A-Za-z])(?=[A-Z][a-z])", " ", s)
    return s.strip()

def translit(spaced):
    out = []
    for w in spaced.split():
        w2 = w.replace("C", "ʿ").replace("c", "ʿ")
        if w2 and w2[0] == "ʿ" and len(w2) > 1:
            w2 = "ʿ" + w2[1].upper() + w2[2:]
        elif w2 and w2[0].islower():
            w2 = w2[0].upper() + w2[1:]
        out.append(w2)
    s = " ".join(out)
    s = s.replace("Quran", "Qurʾān").replace("Qurʾan", "Qurʾān")
    return s

# Turkish display names for the most-cited authors (long tail falls back to translit)
TR_NAME = {
    "Tabari":"Taberî","Fakhr Din Razi":"Fahreddin Râzî","Abu Cabd Allah Qurtubi":"Kurtubî",
    "Ibn Kathir":"İbn Kesîr","Jar Allah Zamakhshari":"Zemahşerî","Abu Mansur Maturidi":"Mâtürîdî",
    "Shihab Din Alusi":"Âlûsî","Suyuti":"Süyûtî","Nasir Din Baydawi":"Beyzâvî",
    "Sahl Tustari":"Sehl et-Tüsterî","Ibn Hawazin Qushayri":"Kuşeyrî","Sulami":"Sülemî",
    "Sayyid Tabatabai":"Tabâtabâî","Muhammad Tahir Ibn Cashur Tunisi":"İbn Âşûr",
    "Abu Ishaq Thaclabi":"Sa'lebî","Abu Hayyan Gharnati":"Ebû Hayyân","Shaykh Tusi":"Şeyh Tûsî",
    "Ibn Hasan Tabarsi":"Tabersî","Cabd Qadir Jilani":"Abdülkādir Geylânî",
    "Ibn Carabi":"İbnü'l-Arabî","Muqatil Ibn Sulayman":"Mukātil b. Süleymân",
    "Cabd Allah Ibn Cabbas":"İbn Abbâs","Mujahid Ibn Jabr":"Mücâhid b. Cebr",
    "Ibn Catiyya Andalusi":"İbn Atıyye","Ibn Mascud Baghawi":"Begavî","Khazin Baghdadi":"Hâzin",
    "Shawkani":"Şevkânî","Ahmad Mustafa Maraghi":"Merâgî","Nasir Makarim Shirazi":"Mekârim Şîrâzî",
    "Muhammad Sayyid Tantawi":"Tantâvî","Ibn Taymiyya":"İbn Teymiyye","Ibn Qayyim Jawziyya":"İbn Kayyim",
    "Ibn Sari Zajjaj":"Zeccâc","Ibn Ziyad Farra":"Ferrâ","Abu Cubayda":"Ebû Ubeyde",
    "Ibn Qutayba Dinawari":"İbn Kuteybe","Raghib Isbahani":"Râgıb el-İsfahânî",
    "Cabd Razzaq Sancani":"Abdürrezzâk es-San'ânî","Ibn Abi Hatim Razi":"İbn Ebî Hâtim",
    "Tabarani":"Taberânî","Ibn Cali Jassas":"Cessâs","Abu Layth Samarqandi":"Semerkandî",
    "Ibn Ahmad Wahidi Naysaburi":"Vâhidî","Ibn Ahmad Hafiz Din Nasafi":"Nesefî",
    "Muhammad Muhsin Fayd Kashani":"Feyz-i Kâşânî","Fath Allah Kashani":"Fethullah Kâşânî",
    "Sadr Din Shirazi":"Molla Sadrâ","Muhammad Cali Sabuni":"Sâbûnî",
    "Abu Hasan Mawardi":"Mâverdî","Ibn Mascud Cayyashi":"Ayyâşî","Ibn Ibrahim Qummi":"Kummî",
    "Thana Allah Panipati":"Pânîpetî","Muhammad Husayn Fadl Allah":"Fadlullah",
    "Qutb Atfayyish":"Atfeyyiş","Hud Hawwari":"Hûd b. Muhakkem","Nasai":"Nesâî",
    "Shafici":"İmâm Şâfiî","Sufyan Thawri":"Süfyân es-Sevrî","Tahawi":"Tahâvî",
    "Najm Din Abu Hafs Nasafi":"Necmeddin Nesefî","Muhyi Din Shaykh Zada":"Şeyhzâde",
    "Shihab Din Khafaji":"Hafâcî","Callama Hilli":"Allâme Hillî","Ibn Jumca Huwayzi":"Huveyzî",
    "Abu Bakr Jazairi":"Cezâirî","Zayd Ibn Cali":"Zeyd b. Ali",
}

# ── AH → CE ──────────────────────────────────────────────────────────────
def ah_to_ce(ah):
    return round(ah * 0.970224 + 621.57)

def trad_for(author_latin, source_token):
    for sub, t in TRAD_BY_AUTHOR.items():
        if sub in author_latin:
            return t
    st = source_token.lower()
    if "zaydiyya" in st:
        return "zaydi"
    if "ibadiyya" in st:
        return "ibadi"
    if re.search(r"shia\d", st):
        return "shii"
    return "sunni"

def geo_for(author_latin):
    if author_latin in GEO_BY_AUTHOR:
        return GEO_BY_AUTHOR[author_latin]
    for sub, g in GEO_BY_NISBA:
        if sub in author_latin:
            return g
    return None

# ── main ─────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--full", action="store_true", help="keep more search chunks")
    ap.add_argument("--chunk-cap-big", type=int, default=12)
    ap.add_argument("--chunk-cap-small", type=int, default=4)
    args = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)

    files = sorted([p for p in SRC.iterdir()
                    if p.is_file() and not p.name.startswith("._")
                    and re.match(r"\d{4}", p.name)], key=lambda p: p.name)

    works = []
    all_chunks = []
    work_profiles = {}     # id -> set of distinctive terms (for shared-vocab)
    cid = 0

    for p in files:
        m = re.match(r"(\d{4})([A-Za-z]+)\.([A-Za-z]+)\.([A-Za-z0-9]+)-(\w+)", p.name)
        if not m:
            continue
        ah = int(m.group(1))
        author_latin = latin_split(m.group(2))
        title_latin = latin_split(m.group(3))
        source_token = m.group(4)
        lang = "per" if "per" in m.group(5) else "ara"

        raw = p.read_text(encoding="utf-8", errors="ignore")
        if META_END in raw:
            head, body = raw.split(META_END, 1)
        else:
            head, body = "", raw
        meta = read_meta(head)
        body = clean_body(body)
        tokens = tokenize(body)
        wc = len(tokens)
        if wc < 200:
            continue

        # unique-type pass
        types = Counter(tokens)                     # raw type -> count
        concept_counts = Counter()
        content = Counter()                         # normalised content term -> count
        for tok, n in types.items():
            tn = normalize_ar(tok)
            k = match_concept(tn)
            if k:
                concept_counts[k] += n
            if len(tn) >= 3:
                content[strip_proclitics(tn)] += n
        per_k = {c["key"]: round(concept_counts.get(c["key"], 0) / wc * 1000, 3)
                 for c in CONCEPTS}

        # facets
        trad = trad_for(author_latin, source_token)
        genre = infer_genre(ah, author_latin, title_latin, trad)
        geo = geo_for(author_latin)

        author_tr = TR_NAME.get(author_latin, translit(author_latin))
        wid = f"{ah:04d}.{m.group(2)}.{m.group(3)}"

        works.append({
            "id": wid,
            "author_tr": author_tr,
            "author_en": translit(author_latin),
            "author_ar": meta.get("AuthorNAME", ""),
            "title_en": translit(title_latin),
            "title_ar": meta.get("BookTITLE", ""),
            "death_ah": ah, "death_ce": ah_to_ce(ah),
            "century_ah": (ah - 1) // 100 + 1,
            "lang": lang, "trad": trad, "genre": genre,
            "city_tr": geo["tr"] if geo else None,
            "city_en": geo["en"] if geo else None,
            "city_ar": geo["ar"] if geo else None,
            "lat": geo["lat"] if geo else None,
            "lng": geo["lng"] if geo else None,
            "words": wc,
            "concepts": per_k,
            "sample": body[:260],
            "oi_subject": meta.get("BookSUBJ", ""),
            "source": source_token,
        })

        # distinctive-term profile (top by frequency among mid-length terms)
        prof = [t for t, _ in content.most_common(1200) if 3 <= len(t) <= 14]
        work_profiles[wid] = set(prof[:600])

        # search chunks — sampled
        cap = args.chunk_cap_big if wc > 60000 else args.chunk_cap_small
        if args.full:
            cap *= 4
        # build ~size chunks then evenly sample `cap`
        size, overlap = 130, 25
        chunks = []
        i = 0
        while i < len(tokens):
            chunks.append(" ".join(tokens[i:i+size]))
            if i + size >= len(tokens):
                break
            i += size - overlap
        if len(chunks) > cap:
            step = len(chunks) / cap
            idx = sorted({int(j*step) for j in range(cap)})
            chunks = [(j, chunks[j]) for j in idx]
        else:
            chunks = list(enumerate(chunks))
        for ci, ch in chunks:
            all_chunks.append({
                "id": cid, "w": wid,
                "atr": author_tr, "ttl": translit(title_latin),
                "lang": lang, "ah": ah, "c": ci,
                "t": ch[:620],
            })
            cid += 1

    works.sort(key=lambda w: (w["death_ah"], w["author_en"]))
    print(f"processed {len(works)} works, {sum(w['words'] for w in works):,} words, "
          f"{len(all_chunks)} chunks")

    # ── concept co-occurrence network ───────────────────────────────────
    def salient(cv, top=7):
        return [k for k, v in sorted(cv.items(), key=lambda kv: kv[1], reverse=True)[:top] if v > 0]
    pair = Counter()
    for w in works:
        s = salient(w["concepts"])
        for a in range(len(s)):
            for b in range(a+1, len(s)):
                x, y = sorted((s[a], s[b]))
                pair[(x, y)] += 1
    cmeta = {c["key"]: c for c in CONCEPTS}
    concept_net = {
        "nodes": [{"id": c["key"], "tr": c["tr"], "en": c["en"], "ar": c["ar"],
                   "cat": c["cat"],
                   "total": round(sum(w["concepts"][c["key"]] for w in works), 2)}
                  for c in CONCEPTS],
        "edges": [{"s": a, "t": b, "w": n} for (a, b), n in pair.items() if n >= 3],
    }

    # ── work↔work shared-vocabulary network ─────────────────────────────
    ids = list(work_profiles.keys())
    sv_edges = []
    for a in range(len(ids)):
        for b in range(a+1, len(ids)):
            pa, pb = work_profiles[ids[a]], work_profiles[ids[b]]
            inter = len(pa & pb)
            if not inter:
                continue
            union = len(pa | pb)
            jac = inter / union
            if jac > 0.18:
                sv_edges.append({"s": ids[a], "t": ids[b],
                                 "w": round(jac, 3), "shared": inter})
    sv_edges.sort(key=lambda e: e["w"], reverse=True)
    sv_edges = sv_edges[:600]
    shared_vocab = {"edges": sv_edges}

    # ── concepts + categories metadata ──────────────────────────────────
    concepts_out = {
        "cats": CATS,
        "items": [{"key": c["key"], "cat": c["cat"], "tr": c["tr"], "en": c["en"],
                   "ar": c["ar"], "fa": c["fa"], "variants": c["variants"],
                   "zahir": c["zahir"]} for c in CONCEPTS],
    }

    # ── rollup stats ────────────────────────────────────────────────────
    by_lang = Counter(w["lang"] for w in works)
    by_trad = Counter(w["trad"] for w in works)
    by_genre = Counter(w["genre"] for w in works)
    by_century = Counter(w["century_ah"] for w in works)
    placed = sum(1 for w in works if w["lat"] is not None)
    cities = sorted(set(w["city_en"] for w in works if w["city_en"]))
    authors = sorted(set(w["author_en"] for w in works))
    stats = {
        "works": len(works),
        "total_words": sum(w["words"] for w in works),
        "authors": len(authors),
        "cities": len(cities),
        "placed": placed,
        "concepts": len(CONCEPTS),
        "chunks": len(all_chunks),
        "langs": dict(by_lang),
        "trads": dict(by_trad),
        "genres": dict(by_genre),
        "ah_min": min(w["death_ah"] for w in works),
        "ah_max": max(w["death_ah"] for w in works),
        "ce_min": min(w["death_ce"] for w in works),
        "ce_max": max(w["death_ce"] for w in works),
        "by_century_ah": {str(k): v for k, v in sorted(by_century.items())},
        "trad_labels": {k: v for k, v in TRADITIONS.items()},
        "genre_labels": {k: v for k, v in GENRES.items()},
    }

    OUT.joinpath("corpus.json").write_text(json.dumps(works, ensure_ascii=False), "utf-8")
    OUT.joinpath("concepts.json").write_text(json.dumps(concepts_out, ensure_ascii=False), "utf-8")
    OUT.joinpath("chunks.json").write_text(json.dumps(all_chunks, ensure_ascii=False), "utf-8")
    OUT.joinpath("concept_network.json").write_text(json.dumps(concept_net, ensure_ascii=False), "utf-8")
    OUT.joinpath("shared_vocab.json").write_text(json.dumps(shared_vocab, ensure_ascii=False), "utf-8")
    OUT.joinpath("stats.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2), "utf-8")

    print("="*60)
    for k in ("works","total_words","authors","cities","placed","chunks"):
        print(f"  {k:14s} {stats[k]:,}" if isinstance(stats[k],int) else f"  {k:14s} {stats[k]}")
    print(f"  AH range       {stats['ah_min']}–{stats['ah_max']} (CE {stats['ce_min']}–{stats['ce_max']})")
    print(f"  schools        {stats['trads']}")
    print(f"  genres         {stats['genres']}")
    print(f"  concept edges  {len(concept_net['edges'])}   shared-vocab edges {len(sv_edges)}")
    print("="*60)
    for f in ("corpus.json","concepts.json","chunks.json","concept_network.json","shared_vocab.json","stats.json"):
        print(f"  {f:24s} {OUT.joinpath(f).stat().st_size/1024:8.1f} KB")

if __name__ == "__main__":
    main()
