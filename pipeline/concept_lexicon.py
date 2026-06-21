#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""concept_lexicon.py — the counted vocabulary of the Tafsir Atlas.

Each concept carries: a Latin key, a family (cat), four-language labels, the
Arabic spelling-variants matched after normalisation, and a **zāhir/bāṭin note**
— what the count captures and what escapes it (homographs, ambiguity). The note
is the conscience of the project: it states the limit of every number.
"""

CATS = {
    "usul":   {"tr": "Usûl & Yöntem",      "en": "Method",        "color": "#d8a657"},
    "ulum":   {"tr": "Ulûmü'l-Kur'ân",     "en": "Qurʾānic sciences","color": "#7daea3"},
    "dil":    {"tr": "Dil & Belâgat",      "en": "Language & rhetoric","color": "#83a8c9"},
    "nakil":  {"tr": "Nakil & İsnâd",      "en": "Transmission",  "color": "#c08552"},
    "itikad": {"tr": "İtikad & Kelâm",     "en": "Theology",      "color": "#a98bc0"},
    "ahkam":  {"tr": "Ahkâm & Fıkıh",      "en": "Law",           "color": "#9aa05f"},
    "isari":  {"tr": "Zâhir & Bâtın",      "en": "Exoteric & esoteric","color": "#cf8a6b"},
}

CONCEPTS = [
    # ── usûl / method ──────────────────────────────────────────────────
    {"key":"tefsir","cat":"usul","tr":"Tefsir","en":"Tafsīr","ar":"تفسير","fa":"تفسیر",
     "variants":["تفسير","تفاسير","التفسير"],
     "zahir":"Lafzın açımlanması — sözcüğün yüzeyi. Sayım, “tefsir” teriminin geçişini yakalar; ama hangi tefsîrin *isâbet* ettiğini, müfessirin niyetini ve murâd-ı ilâhîyi ölçmez."},
    {"key":"tevil","cat":"usul","tr":"Te'vîl","en":"Taʾwīl","ar":"تأويل","fa":"تأویل",
     "variants":["تأويل","تأويلات","التأويل"],
     "zahir":"Zâhirden bâtına dönüş — yorumun derinliği. Terim sayılabilir; fakat te'vîlin *meşrû* olanını keyfî olanından ayıran ölçü metnin dışındadır."},
    {"key":"murad","cat":"usul","tr":"Murâd / Kasıt","en":"Intended meaning","ar":"مراد","fa":"مراد",
     "variants":["مراد","المراد","مقصود"],
     "zahir":"“Kastedilen mânâ”ya yapılan atıf sayılır; ama kastın kendisi — Konuşan'ın muradı — sayımın ufkunun ötesindedir."},

    # ── ulûmü'l-Kur'ân ─────────────────────────────────────────────────
    {"key":"nesih","cat":"ulum","tr":"Nâsih–Mensûh","en":"Abrogation","ar":"نسخ","fa":"نسخ",
     "variants":["نسخ","ناسخ","منسوخ","النسخ"],
     "zahir":"Hükmün kaldırılması. ⚠ Eş-yazım: نسخ aynı zamanda “istinsah/kopyalama” demektir; sayı bir miktar şişebilir. Görece eğilim olarak okunmalı."},
    {"key":"nuzul","cat":"ulum","tr":"Esbâb-ı Nüzûl","en":"Occasions of revelation","ar":"نزول","fa":"نزول",
     "variants":["نزول","نزلت","النزول","أنزل"],
     "zahir":"Âyetin “iniş sebebi/bağlamı”. Rivâyetin *aktarılışı* sayılır; o bağlamın tefsîri ne kadar belirlediği sayımın dışındadır."},
    {"key":"kiraat","cat":"ulum","tr":"Kırâat","en":"Variant readings","ar":"قراءة","fa":"قرائت",
     "variants":["قراءة","قراءات","القراءة","القراءات"],
     "zahir":"Yedi/on okuyuş. Terim yoğunluğu kırâat ilgisini gösterir; ama bir okuyuşun mânâya etkisi nitel bir yargıdır, sayı değil."},
    {"key":"muhkem","cat":"ulum","tr":"Muhkem","en":"Clear verses","ar":"محكم","fa":"محکم",
     "variants":["محكم","محكمات","المحكم"],
     "zahir":"Mânâsı açık âyet. Hangi âyetin muhkem sayıldığı bizzat ihtilâf konusudur; sayım bu tartışmayı çözmez, yalnız terimin geçtiğini bildirir."},
    {"key":"mutesabih","cat":"ulum","tr":"Müteşâbih","en":"Ambiguous verses","ar":"متشابه","fa":"متشابه",
     "variants":["متشابه","متشابهات","المتشابه","تشابه"],
     "zahir":"Mânâsı kapalı âyet. “Te'vîlini ancak Allah bilir” — bu kapanış, sayımın da kapanışıdır: terim sayılır, sır sayılmaz."},
    {"key":"icaz","cat":"ulum","tr":"İ'câz","en":"Inimitability","ar":"إعجاز","fa":"اعجاز",
     "variants":["إعجاز","الإعجاز","معجزة","معجز"],
     "zahir":"Kur'ân'ın benzersizliği. Terim geçişi i'câz vurgusunu gösterir; ama belâgatin *yaşanan* tesiri sayıya gelmez."},
    {"key":"mekki","cat":"ulum","tr":"Mekkî–Medenî","en":"Meccan/Medinan","ar":"مكي","fa":"مکی",
     "variants":["مكية","مدنية","مكي","مدني"],
     "zahir":"Nüzûl yeri/dönemi. Sınıflandırma terimi sayılır; sınırdaki âyetlerin aidiyeti ise ictihâdîdir."},

    # ── dil & belâgat ──────────────────────────────────────────────────
    {"key":"irab","cat":"dil","tr":"İ'râb","en":"Grammatical analysis","ar":"إعراب","fa":"اعراب",
     "variants":["إعراب","الإعراب","معرب"],
     "zahir":"Nahvî tahlil. İ'râb yoğunluğu dilbilimsel ilgiyi ölçer; ama doğru i'râbın mânâyı nasıl *belirlediği* yorumdur."},
    {"key":"nahiv","cat":"dil","tr":"Nahiv","en":"Syntax","ar":"نحو","fa":"نحو",
     "variants":["نحو","النحو","نحوي","النحويين"],
     "zahir":"Sözdizimi ilmi. Terim sayılır; gramerin tefsîrdeki *hükmü* nitel bir tercihtir."},
    {"key":"lugat","cat":"dil","tr":"Lugat","en":"Lexicon","ar":"لغة","fa":"لغت",
     "variants":["لغة","اللغة","لغوي","لغات"],
     "zahir":"Sözlük/dil bilgisi. ⚠ لغة sık ve genel bir kelimedir; sayı dil-merkezli ilgiyi gösterir ama gürültü taşır."},
    {"key":"mecaz","cat":"dil","tr":"Mecâz","en":"Metaphor","ar":"مجاز","fa":"مجاز",
     "variants":["مجاز","المجاز","مجازي"],
     "zahir":"Hakîkatin karşıtı: aktarılmış mânâ. Terim sayılır; bir ifadenin mecâz mı hakîkat mi olduğu ise kelâmî-belâgî bir yargıdır."},
    {"key":"istiare","cat":"dil","tr":"İsti'âre","en":"Trope","ar":"استعارة","fa":"استعاره",
     "variants":["استعارة","الاستعارة","استعارات"],
     "zahir":"Eğretileme. Belâgat terimi sayılır; istiârenin *güzelliği* ve tesiri tecrübîdir, sayıya gelmez."},
    {"key":"belagat","cat":"dil","tr":"Belâgat","en":"Rhetoric","ar":"بلاغة","fa":"بلاغت",
     "variants":["بلاغة","البلاغة","فصاحة","بليغ"],
     "zahir":"Sözün yerindeliği ilmi. Terim yoğunluğu belâgî ilgiyi ölçer; lafzın *tadı* ölçülemez."},

    # ── nakil & isnâd ──────────────────────────────────────────────────
    {"key":"hadis","cat":"nakil","tr":"Hadîs","en":"Hadith","ar":"حديث","fa":"حدیث",
     "variants":["حديث","أحاديث","الحديث","الأحاديث"],
     "zahir":"Nebevî haber. Rivâyetin *zikri* sayılır; sıhhati ve delâleti ise ayrı ilimlerin yargısıdır."},
    {"key":"isnad","cat":"nakil","tr":"İsnâd / Sened","en":"Chain of transmission","ar":"إسناد","fa":"اسناد",
     "variants":["إسناد","الإسناد","أسانيد","سند"],
     "zahir":"Aktarım zinciri. Zincirin *anılması* sayılır; zincirin sağlamlığı cerh-ta'dîlin işidir."},
    {"key":"rivayet","cat":"nakil","tr":"Rivâyet","en":"Narration","ar":"رواية","fa":"روایت",
     "variants":["رواية","روايات","الرواية","المروي"],
     "zahir":"Nakledilen haber. ⚠ روى kökü çok geçişlidir; sayı rivâyet-yoğunluğunu gösterir ama gevşektir."},
    {"key":"sahabe","cat":"nakil","tr":"Sahâbe","en":"Companions","ar":"صحابة","fa":"صحابه",
     "variants":["الصحابة","صحابة","صحابي","أصحاب"],
     "zahir":"Ashâb-ı kirâm. Atfın *sıklığı* sayılır; bir sahâbî sözünün *otoritesi* yorumla belirlenir."},
    {"key":"tabiun","cat":"nakil","tr":"Tâbiûn","en":"Successors","ar":"تابعون","fa":"تابعین",
     "variants":["التابعين","تابعون","تابعي","التابعون"],
     "zahir":"Tâbiîn nesli. Terim sayılır; bu neslin tefsîrdeki konumu ekolden ekole değişir."},

    # ── itikad & kelâm ─────────────────────────────────────────────────
    {"key":"tevhid","cat":"itikad","tr":"Tevhîd","en":"Divine unity","ar":"توحيد","fa":"توحید",
     "variants":["توحيد","التوحيد","الوحدانية","موحد"],
     "zahir":"Allah'ın birliği. Terim sayılır; tevhîdin *tahkîki* (yaşanan birleme) sayımın ötesindedir."},
    {"key":"iman","cat":"itikad","tr":"Îmân","en":"Faith","ar":"إيمان","fa":"ایمان",
     "variants":["إيمان","الإيمان","مؤمن","المؤمنين"],
     "zahir":"İnanç. ⚠ مؤمن sık geçer; sayı îmân-temalı ilgiyi gösterir ama kişi-atıflarıyla şişebilir. Îmânın *kalbî hakîkati* ölçülemez."},

    # ── ahkâm & fıkıh ──────────────────────────────────────────────────
    {"key":"ahkam","cat":"ahkam","tr":"Ahkâm","en":"Legal rulings","ar":"أحكام","fa":"احکام",
     "variants":["أحكام","الأحكام","حكم","الحكم"],
     "zahir":"Fıkhî hükümler. ⚠ حكم hem “hüküm” hem “hikmet/yargı” olabilir; sayı fıkhî-yoğunluğa işaret eder ama eş-yazım taşır."},
    {"key":"helal_haram","cat":"ahkam","tr":"Helâl–Harâm","en":"Lawful & unlawful","ar":"حلال وحرام","fa":"حلال و حرام",
     "variants":["حلال","حرام","التحريم","حرم"],
     "zahir":"Mübah ve yasak. Terimler sayılır; bir meselenin *fiilen* helâl/harâm oluşu ictihâdın hükmüdür."},

    # ── zâhir & bâtın ──────────────────────────────────────────────────
    {"key":"isaret","cat":"isari","tr":"İşâret","en":"Esoteric allusion","ar":"إشارة","fa":"اشاره",
     "variants":["إشارة","إشارات","الإشارة","الإشارات"],
     "zahir":"İşârî tefsîrin anahtarı: lafzın ardındaki ima. Terim sayılır; işâretin *keşfen* alınışı tamamen sayımın dışındadır."},
    {"key":"batin","cat":"isari","tr":"Bâtın","en":"Inner meaning","ar":"باطن","fa":"باطن",
     "variants":["باطن","الباطن","بواطن","باطنة"],
     "zahir":"Gizli/iç mânâ. Terim sayılır; bâtının kendisi — tanımı gereği — sayıya kapalıdır. Atlas burada en açık biçimde susar."},
    {"key":"hakikat","cat":"isari","tr":"Hakîkat","en":"Inner reality","ar":"حقيقة","fa":"حقیقت",
     "variants":["حقيقة","الحقيقة","حقائق","الحقائق"],
     "zahir":"Mecâzın karşıtı / tasavvufî “öz gerçeklik”. İki anlam eş-yazımdır; bağlamı sayı çözemez."},
    {"key":"zahir","cat":"isari","tr":"Zâhir","en":"Outer meaning","ar":"ظاهر","fa":"ظاهر",
     "variants":["ظاهر","الظاهر","ظواهر","ظاهرة"],
     "zahir":"Açık/dış mânâ — atlasın bütünüyle haritaladığı katman. ⚠ ظاهر sık ve genel bir kelimedir. Bu kavram, projenin kendi sınırının da adıdır: o yalnız zâhiri sayar."},
]
