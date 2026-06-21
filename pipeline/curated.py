#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""curated.py — hand-curated reference tables for the Tafsir Atlas pipeline.

Three orthogonal facets are curated here (the rest is auto-derived):
  • TRADITION  (mezhep / ekol)   — doctrinal school
  • GENRE      (tefsir türü)     — exegetical method
  • GEO        (nisba → şehir)   — production centre, projected onto the map

Everything else (death year, Latin author/title, Arabic name) is read straight
from the OpenITI filename + #META# header, so the corpus scales without curation.
"""

# ── doctrinal school ─────────────────────────────────────────────────────
TRADITIONS = {
    "sunni":    {"tr": "Sünnî",      "en": "Sunni",        "color": "#d8a657"},
    "shii":     {"tr": "Şiî (İmâmî)", "en": "Imāmī Shīʿī",  "color": "#7aa2c4"},
    "zaydi":    {"tr": "Zeydî",      "en": "Zaydī",        "color": "#85b79d"},
    "ibadi":    {"tr": "İbâzî",      "en": "Ibāḍī",        "color": "#c98a76"},
    "mutazili": {"tr": "Mu'tezilî",  "en": "Muʿtazilī",    "color": "#b18ac0"},
}

# Author Latin-substring → tradition (checked before the source-library guess).
TRAD_BY_AUTHOR = {
    # Imāmī Shīʿī
    "Qummi": "shii", "Cayyashi": "shii", "Tusi": "shii", "Tabarsi": "shii",
    "Fayd Kashani": "shii", "Tabatabai": "shii", "Makarim": "shii",
    "Huwayzi": "shii", "Mashhadi": "shii", "Sabzawari": "shii", "Hilli": "shii",
    "Fath Allah Kashani": "shii", "Fadl Allah": "shii", "Sadr Din Shirazi": "shii",
    "Imam Caskari": "shii", "Turayhi": "shii", "Abu Hamza Thumali": "shii",
    # Zaydī
    "Zayd Ibn Cali": "zaydi", "Qasim Rassi": "zaydi", "Hadi Ila Haqq": "zaydi",
    "Ibn Hakam Hibari": "zaydi", "Hakim Jushami": "zaydi",
    # Ibāḍī
    "Hud Hawwari": "ibadi", "Qutb Atfayyish": "ibadi", "Sacid Kindi": "ibadi",
    "Khalili": "ibadi", "Abu Nabhan Kharusi": "ibadi",
    # Muʿtazilī
    "Zamakhshari": "mutazili",
}

# ── exegetical method / genre ───────────────────────────────────────────
GENRES = {
    "rivayet": {"tr": "Rivâyet (me'sûr)",        "en": "Tradition-based (maʾthūr)"},
    "diraye":  {"tr": "Dirâyet (re'y)",          "en": "Reason-based (raʾy)"},
    "lugavi":  {"tr": "Dil & Filoloji",          "en": "Linguistic / philological"},
    "ahkam":   {"tr": "Ahkâm (fıkhî)",           "en": "Legal (aḥkām)"},
    "isari":   {"tr": "İşârî / Tasavvufî",       "en": "Mystical (ishārī)"},
    "kelami":  {"tr": "Kelâmî / Te'vîlî",        "en": "Theological (kalāmī)"},
    "hashiye": {"tr": "Hâşiye / Şerh",           "en": "Gloss / commentary"},
    "cagdas":  {"tr": "Çağdaş",                  "en": "Modern"},
}

# Author Latin-substring → işârî (mystical) tafsir
SUFI_AUTHORS = ("Tustari", "Qushayri", "Sulami", "Ibn Carabi", "Cabd Qadir Jilani",
                "Fath Allah Kashani", "Sultan Cali Shah Ganabadhi", "Najm Din Ahmad Ibn Cumar")
# Heavy-isnād tradition-based tafsirs (curated)
RIVAYET_AUTHORS = ("Tabari", "Ibn Abi Hatim", "Cabd Razzaq", "Suyuti", "Tabarani",
                   "Ibn Mundhir", "Ibn Mansur Khurasani", "Nasai", "Ibn Wahb",
                   "Ibn Kathir", "Khazin", "Cabd Qadir Jilani")
KELAM_AUTHORS = ("Maturidi", "Najm Din Abu Hafs Nasafi", "Fakhr Din Razi")


def infer_genre(ah, author_latin, title_latin, tradition):
    a, t = author_latin, title_latin
    if any(s in a for s in SUFI_AUTHORS) or "Lataif Isharat" in t or "Bayan Sacada" in t:
        return "isari"
    if any(k in t for k in ("Hashiya", "Tacliq", "Sharh", "Mukhtasar", "Talkhis")):
        return "hashiye"
    if any(k in t for k in ("Gharib", "Macani", "Icrab", "Mushkil", "Majaz",
                            "Asma Allah", "Mabahith")):
        return "lugavi"
    if "Ahkam" in t or "Kifayat" in t or "Ayat Ahkam" in t:
        return "ahkam"
    if any(s in a for s in KELAM_AUTHORS):
        return "kelami"
    if any(s in a for s in RIVAYET_AUTHORS):
        return "rivayet"
    if ah >= 1250:
        return "cagdas"
    return "diraye"


# ── geography: nisba substring → city (lat, lng) ────────────────────────
# Order matters: more specific nisbas first. Matched against the Latin author.
GEO_BY_NISBA = [
    ("Qurtubi",     {"tr":"Kurtuba","en":"Córdoba","ar":"قرطبة","lat":37.89,"lng":-4.78}),
    ("Ishbili",     {"tr":"İşbîliye","en":"Seville","ar":"إشبيلية","lat":37.39,"lng":-5.99}),
    ("Gharnati",    {"tr":"Gırnata","en":"Granada","ar":"غرناطة","lat":37.18,"lng":-3.60}),
    ("Ilbiri",      {"tr":"Elvira","en":"Elvira","ar":"إلبيرة","lat":37.23,"lng":-3.69}),
    ("Andalusi",    {"tr":"Endülüs","en":"al-Andalus","ar":"الأندلس","lat":37.18,"lng":-3.60}),
    ("Faras",       {"tr":"Gırnata","en":"Granada","ar":"غرناطة","lat":37.18,"lng":-3.60}),
    ("Warghami",    {"tr":"Tunus","en":"Tunis","ar":"تونس","lat":36.81,"lng":10.18}),
    ("Tunisi",      {"tr":"Tunus","en":"Tunis","ar":"تونس","lat":36.81,"lng":10.18}),
    ("Sanusi",      {"tr":"Tilimsân","en":"Tlemcen","ar":"تلمسان","lat":34.88,"lng":-1.32}),
    ("Ibn Badis",   {"tr":"Kostantîne","en":"Constantine","ar":"قسنطينة","lat":36.36,"lng":6.61}),
    ("Atfayyish",   {"tr":"Mîzâb (Cezayir)","en":"Mzab","ar":"وادي ميزاب","lat":32.48,"lng":3.68}),
    ("Jazairi",     {"tr":"Cezayir","en":"Algiers","ar":"الجزائر","lat":36.75,"lng":3.06}),
    ("Hawwari",     {"tr":"Kayrevân","en":"Kairouan","ar":"القيروان","lat":35.68,"lng":10.10}),
    ("Maraghi",     {"tr":"Kahire","en":"Cairo","ar":"القاهرة","lat":30.04,"lng":31.24}),
    ("Tantawi",     {"tr":"Kahire","en":"Cairo","ar":"القاهرة","lat":30.04,"lng":31.24}),
    ("Khalwati Sawi",{"tr":"Kahire","en":"Cairo","ar":"القاهرة","lat":30.04,"lng":31.24}),
    ("Zakariyya Ansari",{"tr":"Kahire","en":"Cairo","ar":"القاهرة","lat":30.04,"lng":31.24}),
    ("Ibn Hisham",  {"tr":"Kahire","en":"Cairo","ar":"القاهرة","lat":30.04,"lng":31.24}),
    ("Suyuti",      {"tr":"Kahire","en":"Cairo","ar":"القاهرة","lat":30.04,"lng":31.24}),
    ("Iji Shafici", {"tr":"Kahire","en":"Cairo","ar":"القاهرة","lat":30.04,"lng":31.24}),
    ("Tulun",       {"tr":"Dımaşk","en":"Damascus","ar":"دمشق","lat":33.51,"lng":36.29}),
    ("Dimashqi",    {"tr":"Dımaşk","en":"Damascus","ar":"دمشق","lat":33.51,"lng":36.29}),
    ("Ibn Taymiyya",{"tr":"Dımaşk","en":"Damascus","ar":"دمشق","lat":33.51,"lng":36.29}),
    ("Ibn Kathir",  {"tr":"Dımaşk","en":"Damascus","ar":"دمشق","lat":33.51,"lng":36.29}),
    ("Ibn Qayyim",  {"tr":"Dımaşk","en":"Damascus","ar":"دمشق","lat":33.51,"lng":36.29}),
    ("Ibn Rajab",   {"tr":"Dımaşk","en":"Damascus","ar":"دمشق","lat":33.51,"lng":36.29}),
    ("Sabuni",      {"tr":"Halep","en":"Aleppo","ar":"حلب","lat":36.20,"lng":37.16}),
    ("Hawmad",      {"tr":"Şam","en":"Damascus","ar":"دمشق","lat":33.51,"lng":36.29}),
    ("Fadl Allah",  {"tr":"Beyrut","en":"Beirut","ar":"بيروت","lat":33.89,"lng":35.50}),
    ("Qattan",      {"tr":"Amman","en":"Amman","ar":"عمّان","lat":31.95,"lng":35.93}),
    ("Baghdadi",    {"tr":"Bağdat","en":"Baghdad","ar":"بغداد","lat":33.31,"lng":44.36}),
    ("Khazin",      {"tr":"Bağdat","en":"Baghdad","ar":"بغداد","lat":33.31,"lng":44.36}),
    ("Cukbari",     {"tr":"Bağdat","en":"Baghdad","ar":"بغداد","lat":33.31,"lng":44.36}),
    ("Jassas",      {"tr":"Bağdat","en":"Baghdad","ar":"بغداد","lat":33.31,"lng":44.36}),
    ("Nahhas",      {"tr":"Mısır (Fustât)","en":"Fustat","ar":"الفسطاط","lat":30.00,"lng":31.23}),
    ("Sancani",     {"tr":"San'â","en":"Sanaa","ar":"صنعاء","lat":15.37,"lng":44.19}),
    ("Rassi",       {"tr":"Medîne","en":"Medina","ar":"المدينة","lat":24.47,"lng":39.61}),
    ("Hadi Ila Haqq",{"tr":"Sa'de (Yemen)","en":"Saada","ar":"صعدة","lat":16.94,"lng":43.76}),
    ("Kufi",        {"tr":"Kûfe","en":"Kufa","ar":"الكوفة","lat":32.03,"lng":44.40}),
    ("Thumali",     {"tr":"Kûfe","en":"Kufa","ar":"الكوفة","lat":32.03,"lng":44.40}),
    ("Thawri",      {"tr":"Kûfe","en":"Kufa","ar":"الكوفة","lat":32.03,"lng":44.40}),
    ("Farra",       {"tr":"Kûfe","en":"Kufa","ar":"الكوفة","lat":32.03,"lng":44.40}),
    ("Hibari",      {"tr":"Kûfe","en":"Kufa","ar":"الكوفة","lat":32.03,"lng":44.40}),
    ("Cubayda",     {"tr":"Basra","en":"Basra","ar":"البصرة","lat":30.51,"lng":47.78}),
    ("Akhfash",     {"tr":"Basra","en":"Basra","ar":"البصرة","lat":30.51,"lng":47.78}),
    ("Ibn Sallam",  {"tr":"Basra","en":"Basra","ar":"البصرة","lat":30.51,"lng":47.78}),
    ("Sida Mursi",  {"tr":"Mürsiye","en":"Murcia","ar":"مرسية","lat":37.99,"lng":-1.13}),
    ("Hilli",       {"tr":"Hille","en":"Hilla","ar":"الحلة","lat":32.48,"lng":44.43}),
    ("Tustari",     {"tr":"Tüster","en":"Tustar","ar":"تستر","lat":32.05,"lng":48.86}),
    ("Qummi",       {"tr":"Kum","en":"Qom","ar":"قم","lat":34.64,"lng":50.88}),
    ("Tusi",        {"tr":"Tûs","en":"Tus","ar":"طوس","lat":36.48,"lng":59.36}),
    ("Mashhadi",    {"tr":"Meşhed","en":"Mashhad","ar":"مشهد","lat":36.30,"lng":59.61}),
    ("Tabarsi",     {"tr":"Sebzevâr","en":"Sabzevar","ar":"سبزوار","lat":36.21,"lng":57.68}),
    ("Sabzawari",   {"tr":"Sebzevâr","en":"Sabzevar","ar":"سبزوار","lat":36.21,"lng":57.68}),
    ("Tabatabai",   {"tr":"Tebriz","en":"Tabriz","ar":"تبريز","lat":38.08,"lng":46.29}),
    ("Huwayzi",     {"tr":"Huveyze","en":"Huwayza","ar":"الحويزة","lat":31.45,"lng":48.07}),
    ("Shirazi",     {"tr":"Şîrâz","en":"Shiraz","ar":"شيراز","lat":29.59,"lng":52.58}),
    ("Makarim",     {"tr":"Şîrâz","en":"Shiraz","ar":"شيراز","lat":29.59,"lng":52.58}),
    ("Isbahani",    {"tr":"İsfahân","en":"Isfahan","ar":"أصفهان","lat":32.65,"lng":51.67}),
    ("Isfahani",    {"tr":"İsfahân","en":"Isfahan","ar":"أصفهان","lat":32.65,"lng":51.67}),
    ("Baquli",      {"tr":"İsfahân","en":"Isfahan","ar":"أصفهان","lat":32.65,"lng":51.67}),
    ("Kirmani",     {"tr":"Kirmân","en":"Kirman","ar":"كرمان","lat":30.28,"lng":57.08}),
    ("Dinawari",    {"tr":"Dînever","en":"Dinawar","ar":"دينور","lat":34.85,"lng":47.20}),
    ("Razi",        {"tr":"Rey","en":"Rayy","ar":"الري","lat":35.59,"lng":51.43}),
    ("Naysaburi",   {"tr":"Nîşâbur","en":"Nishapur","ar":"نيسابور","lat":36.21,"lng":58.79}),
    ("Khurasani",   {"tr":"Nîşâbur","en":"Nishapur","ar":"نيسابور","lat":36.21,"lng":58.79}),
    ("Thaclabi",    {"tr":"Nîşâbur","en":"Nishapur","ar":"نيسابور","lat":36.21,"lng":58.79}),
    ("Wahidi",      {"tr":"Nîşâbur","en":"Nishapur","ar":"نيسابور","lat":36.21,"lng":58.79}),
    ("Samarqandi",  {"tr":"Semerkant","en":"Samarqand","ar":"سمرقند","lat":39.65,"lng":66.96}),
    ("Maturidi",    {"tr":"Semerkant","en":"Samarqand","ar":"سمرقند","lat":39.65,"lng":66.96}),
    ("Nasafi",      {"tr":"Nesef","en":"Nasaf","ar":"نسف","lat":38.86,"lng":65.79}),
    ("Samcani",     {"tr":"Merv","en":"Merv","ar":"مرو","lat":37.66,"lng":62.19}),
    ("Baghawi",     {"tr":"Herat","en":"Herat","ar":"هراة","lat":34.35,"lng":62.20}),
    ("Surabadi",    {"tr":"Herat","en":"Herat","ar":"هراة","lat":34.35,"lng":62.20}),
    ("Panipati",    {"tr":"Pânipat (Hind)","en":"Panipat","ar":"بانيبت","lat":29.39,"lng":76.97}),
    ("Siwasi",      {"tr":"Sivas","en":"Sivas","ar":"سيواس","lat":39.75,"lng":37.02}),
    ("Khafaji",     {"tr":"Mısır","en":"Egypt","ar":"مصر","lat":30.04,"lng":31.24}),
    ("Shaykh Zada", {"tr":"Bursa","en":"Bursa","ar":"بورصة","lat":40.19,"lng":29.06}),
    ("Shanqiti",    {"tr":"Şinkît","en":"Shinqit","ar":"شنقيط","lat":20.46,"lng":-12.36}),
    ("Shawkani",    {"tr":"San'â","en":"Sanaa","ar":"صنعاء","lat":15.37,"lng":44.19}),
    ("Jushami",     {"tr":"Beyhak","en":"Bayhaq","ar":"بيهق","lat":36.21,"lng":57.68}),
    ("Bayhaqi",     {"tr":"Beyhak","en":"Bayhaq","ar":"بيهق","lat":36.21,"lng":57.68}),
    ("Qaysi",       {"tr":"Kayrevân","en":"Kairouan","ar":"القيروان","lat":35.68,"lng":10.10}),
    ("Harali",      {"tr":"Hama","en":"Hama","ar":"حماة","lat":35.13,"lng":36.75}),
]

# Famous authors with no usable nisba → explicit placement
GEO_BY_AUTHOR = {
    "Tabari":            {"tr":"Bağdat","en":"Baghdad","ar":"بغداد","lat":33.31,"lng":44.36},
    "Zamakhshari":       {"tr":"Hârizm","en":"Khwarazm","ar":"خوارزم","lat":41.36,"lng":60.36},
    "Mujahid Ibn Jabr":  {"tr":"Mekke","en":"Mecca","ar":"مكة","lat":21.42,"lng":39.83},
    "Cabd Allah Ibn Cabbas":{"tr":"Mekke","en":"Mecca","ar":"مكة","lat":21.42,"lng":39.83},
    "Muqatil Ibn Sulayman":{"tr":"Belh","en":"Balkh","ar":"بلخ","lat":36.76,"lng":66.90},
    "Sufyan Thawri":     {"tr":"Kûfe","en":"Kufa","ar":"الكوفة","lat":32.03,"lng":44.40},
    "Shafici":           {"tr":"Kahire","en":"Cairo","ar":"القاهرة","lat":30.04,"lng":31.24},
    "Tahawi":            {"tr":"Mısır","en":"Egypt","ar":"مصر","lat":30.04,"lng":31.24},
    "Ibn Catiyya Andalusi":{"tr":"Gırnata","en":"Granada","ar":"غرناطة","lat":37.18,"lng":-3.60},
    "Ibn Carafa Warghami":{"tr":"Tunus","en":"Tunis","ar":"تونس","lat":36.81,"lng":10.18},
    "Ibn Abi Zamanayn Ilbiri":{"tr":"Elvira","en":"Elvira","ar":"إلبيرة","lat":37.23,"lng":-3.69},
    "Sahl Tustari":      {"tr":"Tüster","en":"Tustar","ar":"تستر","lat":32.05,"lng":48.86},
    "Cabd Qadir Jilani": {"tr":"Bağdat","en":"Baghdad","ar":"بغداد","lat":33.31,"lng":44.36},
    "Ibn Carabi":        {"tr":"Dımaşk","en":"Damascus","ar":"دمشق","lat":33.51,"lng":36.29},
    "Fath Allah Kashani":{"tr":"Kâşân","en":"Kashan","ar":"كاشان","lat":33.98,"lng":51.43},
    "Fayd Kashani":      {"tr":"Kâşân","en":"Kashan","ar":"كاشان","lat":33.98,"lng":51.43},
    "Sadr Din Shirazi":  {"tr":"Şîrâz","en":"Shiraz","ar":"شيراز","lat":29.59,"lng":52.58},
    "Sultan Cali Shah Ganabadhi":{"tr":"Gunâbâd","en":"Gonabad","ar":"گناباد","lat":34.35,"lng":58.68},
    "Thana Allah Panipati":{"tr":"Pânipat (Hind)","en":"Panipat","ar":"بانيبت","lat":29.39,"lng":76.97},
    "Cabd Hamid Ibn Badis":{"tr":"Kostantîne","en":"Constantine","ar":"قسنطينة","lat":36.36,"lng":6.61},
    "Rashid Din Tabib":  {"tr":"Tebriz","en":"Tabriz","ar":"تبريز","lat":38.08,"lng":46.29},
    "Callama Hilli":     {"tr":"Hille","en":"Hilla","ar":"الحلة","lat":32.48,"lng":44.43},
}
