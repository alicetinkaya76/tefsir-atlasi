# Tefsîr Atlası — Kaynak Paketi

161 tefsir eserini **coğrafya, zaman, ekol, tür ve kavram** eksenlerinde haritalandıran
tek dosyalık dijital atlas ile onu üreten veri hattının tam kaynağıdır.

Arayüz **üç dillidir (TR / EN / AR)**; Arapça tam RTL desteğiyle gelir. On analitik
mercek vardır; bunların ikisi — **Kavram Akışı** (yedi kavram ailesinin Hicrî yüzyıllar
boyunca yığılı akışı) ve **Mukayese** (gelenek radarı + iki eserin yüz yüze kavram
karşılaştırması) — mevcut korpustan, veri hattı değiştirilmeden istemci tarafında hesaplanır.

Tasarım ilkesi: **Betimler; hüküm vermez.** Atlas, tefsir mirasının dış hatlarını
(kim, ne zaman, nerede, hangi gelenekte) ölçer; bir âyetin doğru anlamına veya bir
tefsîrin isâbetine karar vermez. Her mercek, "ne ölçer / ne ölçmez" (zâhir / bâtın)
notuyla bu sınırı açıkça beyan eder.

---

## 1. Paket içeriği

```
tefsir-atlasi.html        ← Üretilmiş site (çift tıklayıp açın; kurulum yok)
README.md

site/                     ← Sitenin kaynağı (yeniden üretilebilir)
  app.html                  HTML şablonu + tüm CSS (tek dosya, veri yer tutucusu içerir)
  app.js                    Uygulama mantığı (i18n TR/EN/AR, 11 mercek, D3 ağlar, MiniSearch)
  assemble.py               data/ + şablon + app.js  →  tefsir-atlasi.html

pipeline/                 ← OpenITI külliyatından veriyi üreten hat
  build_data.py             Ana hat: okur, normalize eder, çıkarsar, JSON üretir (saf stdlib)
  curated.py                Gelenek/tür/coğrafya sözlükleri (nisba → şehir vs.)
  concept_lexicon.py        29 kavram + Arapça varyantları + zâhir notları
  make_lite.py              Gömülebilir küçük pasaj kümesini üretir
  scan_meta.py              (Yardımcı) #META# başlıklarını tarar
  compute_pca.py            Kavram parmak izlerini PCA ile 2B'ye indirger (numpy)
  compute_clusters.py       Yöntem kümeleri (KMeans) + mezhep geri-getirim sınaması
                            (numpy · scikit-learn) — "Kavram Uzayı" merceğini besler

data/                     ← Üretilmiş veri (JSON)
  corpus.json               161 eser künyesi + kavram parmak izleri + PCA koord. (px,py) + küme (cl)
  concepts.json             Kavram sözlüğü (kategoriler + maddeler)
  stats.json                Toplulaştırılmış istatistikler + pca/cluster_meta (eksen yükleri, NMI/ARI)
  concept_network.json      Kavram birliktelik ağı
  shared_vocab.json         Eserler arası sözcüksel benzerlik ağı
  chunks.json               Tam aranabilir pasaj kümesi (~2 MB)
  chunks_lite.json          HTML'e gömülen küçük örneklem (~0.5 MB)
```

`tefsir-atlasi.html` **tek başına çalışır**: tüm veri içine gömülüdür. Yalnızca
D3 ve MiniSearch kütüphaneleri cdnjs'ten yüklenir (çevrimiçi gerekir). Tümüyle
çevrimdışı bir sürüm isterseniz bu iki kütüphaneyi indirip `app.html` içindeki
`<script src=...>` satırlarını yerel dosyalara çevirmeniz yeterlidir.

---

## 2. Siteyi yeniden üretmek

Veri zaten `data/` içinde hazır. Şablon veya uygulama mantığını değiştirdiyseniz
yahut veriyi yenilediyseniz, tek dosyayı yeniden derleyin:

```bash
python3 site/assemble.py
# → tefsir-atlasi.html  (~944 KB)
```

Python 3.9+ ve **hiçbir üçüncü taraf bağımlılık** gerekmez.

---

## 3. Külliyatı yeniden işlemek / büyütmek

### 3.1 Girdi
Hat, **OpenITI mARkdown** formatındaki tefsir dosyalarını bekler. Dosya adları
ölüm yılını (Hicrî), müellifi ve eser adını Latin harflerle kodlar; örn.
`0310Tabari.JamicBayan.Shamela0023635-ara1`. Metnin başındaki `#META#` başlıkları
ek bilgi taşır. (Bu paket 863 MB'lık ham külliyatı **içermez**; OpenITI deposundan
edinebilirsiniz.)

### 3.2 Çalıştırma
```bash
export TEFSIR_SRC=/yol/OpenITI/tefsir/dosyalari   # girdi klasörü
export TEFSIR_OUT=./data                           # çıktı klasörü (öntanım ./data)

python3 pipeline/build_data.py
python3 pipeline/compute_pca.py       # PCA (px,py) — "Kavram Uzayı" için  [numpy]
python3 pipeline/compute_clusters.py  # yöntem kümeleri + NMI/ARI sınaması  [scikit-learn]
python3 pipeline/make_lite.py         # gömülebilir küçük pasaj kümesi
python3 site/assemble.py             # tek dosya HTML
```
`build_data.py` ve `make_lite.py` saf stdlib'dir ve `pipeline/` içinden çalıştırılmalı
ki `curated` ve `concept_lexicon` modüllerini bulabilsinler. `compute_pca.py` ve
`compute_clusters.py` çözümleme adımlarıdır ve `numpy` ile `scikit-learn` gerektirir;
çalıştırılmazsa "Kavram Uzayı" merceği nazikçe boş kalır, diğer 10 mercek etkilenmez.

> **Çözümleme notu — "Kavram Uzayı".** Her eserin 29 boyutlu kavram parmak izi
> (log dönüşümü + z-skor) PCA ile 2 boyuta indirgenir; eksenler, en yüksek yüklü
> kavramlarla yorumlanır. KMeans (k=5) eserleri yönteme göre kümeler; bu kümelerin
> mezhep etiketlerini ne kadar geri-getirdiği NMI/ARI ile sınanır. Bulgu dürüstçe
> bildirilir: kümeler mezhebi **geri-getirmez** (NMI≈0,05) — tefsir, mezhepten çok
> **yönteme** (dilbilim, rivâyet, belâgat, fıkıh, işârî) göre kümelenir.

### 3.3 Ölçeği büyütmek (daha çok arama metni)
Gömülen pasaj sayısı, dosya boyutunu küçük tutmak için sınırlandırılmıştır.
Daha geniş arama/konkordans için:

```bash
# eser başına daha çok pasaj sakla
python3 pipeline/build_data.py --chunk-cap-big 12 --chunk-cap-small 4
# veya en geniş:
python3 pipeline/build_data.py --full

# gömülen küçük kümeyi de büyüt (dosya büyür):
CAP_BIG=10 CAP_SMALL=4 CLIP_WORDS=120 python3 pipeline/make_lite.py
python3 site/assemble.py
```

`--full` tam `chunks.json`'u büyütür (sitenin "Külliyat" merceğindeki arama bunu
değil, gömülü `chunks_lite.json`'u kullanır; tarayıcıda tam metin istiyorsanız
`make_lite.py` eşiklerini yükseltin).

---

## 4. Veri şeması (özet)

**corpus.json** — eser başına bir kayıt:

| alan | açıklama |
|---|---|
| `id` | OpenITI kimliği (ör. `0310.Tabari.JamicBayan`) |
| `author_tr` / `author_en` / `author_ar` | müellif adı (Türkçe / translit / Arapça) |
| `title_en` / `title_ar` | eser adı |
| `death_ah` / `death_ce` / `century_ah` | vefât yılı (Hicrî / Mîlâdî) ve Hicrî asır |
| `lang` | `ara` / `per` |
| `trad` | gelenek: `sunni`/`shii`/`zaydi`/`ibadi`/`mutazili` |
| `genre` | baskın yöntem: `rivayet`/`diraye`/`lugavi`/`ahkam`/`isari`/`kelami`/`hashiye`/`cagdas` |
| `city_tr`/`city_en`/`city_ar`, `lat`, `lng` | nisba'dan çıkarılan şehir + koordinat |
| `words` | temizlenmiş metindeki kelime sayısı |
| `concepts` | 29 kavramın normalize sıklığı (her 1000 kelimede) |
| `sample` | metinden kısa numune (görüntüleme için) |

**concept_network.json** `{nodes, edges}` — iki kavramın aynı eserde birlikte
belirginleşme sayısı. **shared_vocab.json** `{edges:[{s,t,w,shared}]}` — eser
çiftlerinin belirgin sözcük dağarcığı örtüşmesi (Jaccard). **stats.json** —
toplulaştırılmış sayımlar ve etiket sözlükleri.

---

## 5. Yöntem ve sınırlar (şeffaflık)

Bu, **otomatik** çıkarımlara dayanan bir dijital beşerî bilimler denemesidir.
Bilerek ihtiyatlı davrandık; yine de:

- **Kelime sayısı (≈89,4 milyon)** biçim işaretlerinden arındırılmış ham metin
  üzerinden sayılır; bu yüzden 863 MB'lık ham boyuttan küçüktür.
- **Gelenek (mezhep) ve tür ataması** müellif nisbeleri ve eser başlıklarından
  otomatik çıkarılır. Tek bir baskın etiket seçilir; oysa çoğu büyük tefsir
  melezdir (ör. dirâyet ağırlıklı bir eser yoğun rivâyet de içerebilir).
  Tartışmalı atamalar olabilir; `curated.py` içindeki `TRAD_BY_AUTHOR` ve
  `infer_genre` ile elle düzeltilebilir.
- **Coğrafya** nisba → şehir eşlemesiyle konulur; 161 eserin **115'i** yerleşti.
  Eşleşmeyen 46 eser haritada görünmez ama diğer tüm merceklerde yer alır. Nisba
  bir izdir; âlimin ömür boyu güzergâhı değil.
- **Kavram sayımı** terimin *geçişini* yakalar, *anlamını* değil. "Te'vîl" hem
  övülerek hem yerilerek geçer; eş-yazımlar ölçümü şişirebilir. `concept_lexicon.py`
  her kavramın bu sınırını ("zâhir notu") kayda geçirir.
- **Metinler Arası** ağı sözcüksel benzerliği gösterir — alıntı veya etki kanıtı
  değil. Ortak kelime, ortak konu ve dönemin de işareti olabilir.
- **Aktarım** merceği farklıdır: elle seçilmiş, klasik tefsir tarihçiliğinde
  belgelenen 65 büyük tesir bağıdır. Eksiktir, tartışmaya açıktır ve bir *tezdir* —
  salt sayım değil. Düzenlemek için `app.js` içindeki `TRANS` dizisine bakın.

Bu sınırların hepsi arayüzde de görünür kılınmıştır; atlasın amacı kesin hüküm
vermek değil, mirası gezilebilir hâle getirmektir.

---

## 6. Mimarî notu

Referans alınan **Dijital Tasavvuf Atlası**'nın "haritalandırır ama indirgemez"
ilkesi ve çok-mercekli yapısı esin kaynağıdır; ancak bu atlas farklı bir veri
hattı (OpenITI dosya adlarından **otomatik künye çıkarımı**, elle hazırlanan
meta tablosu olmadan), tefsire özgü mercekler (Ekoller × Türler, kavram ayırt
ediciliği, konkordans) ve ayrı bir görsel kimlik (Âyetü'n-Nûr / "kandil"
teması) üzerine kurulmuştur. Harita, dış servise bağımlı olmamak için elle
çizilmiş şematik bir SVG'dir.

---

## Hazırlayanlar

- **Dr. Öğr. Üyesi Hasan Sevim** — Selçuk Üniversitesi, İlahiyat Fakültesi
- **Dr. Öğr. Üyesi Ali Çetinkaya** — Selçuk Üniversitesi, Teknoloji Fakültesi,
  Bilgisayar Mühendisliği

Veri kaynağı: OpenITI mARkdown külliyatı. İstatistikler tarayıcıda yerel hesaplanır.
