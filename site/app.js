/* ============================================================ TEFSÎR ATLASI
   Tek dosya · veri gömülü · D3 + MiniSearch. "Betimler; hüküm vermez." */
const C  = DATA.corpus;
const CO = DATA.concepts;            // {cats, items}
const ST = DATA.stats;
const CN = DATA.cnet;                // {nodes, edges}
const SV = DATA.svocab.edges;        // [{s,t,w,shared}]
const CH = DATA.chunks;              // [{id,w,atr,ttl,lang,ah,t}]
const byId = Object.fromEntries(C.map(w=>[w.id,w]));
const conByKey = Object.fromEntries(CO.items.map(c=>[c.key,c]));

/* ---- palette helpers ---- */
const TRAD = ST.trad_labels, GENRE = ST.genre_labels, CATS = CO.cats;
/* inject Arabic labels (data carries tr/en; ar added here for the trilingual UI) */
(function(){
  const TA={sunni:'سنّي',shii:'شيعي (إمامي)',zaydi:'زيدي',ibadi:'إباضي',mutazili:'معتزلي'};
  const GA={rivayet:'بالمأثور',diraye:'بالرأي (دراية)',lugavi:'لغوي وبلاغي',ahkam:'أحكام (فقهي)',
    isari:'إشاري / صوفي',kelami:'كلامي',hashiye:'حاشية / شرح',cagdas:'معاصر'};
  const CA={usul:'الأصول والمنهج',ulum:'علوم القرآن',dil:'اللغة والبلاغة',nakil:'النقل والإسناد',
    itikad:'الاعتقاد والكلام',ahkam:'الأحكام والفقه',isari:'الظاهر والباطن'};
  for(const k in TA){ if(TRAD[k]) TRAD[k].ar=TA[k]; }
  for(const k in GA){ if(GENRE[k]) GENRE[k].ar=GA[k]; }
  for(const k in CA){ if(CATS[k]) CATS[k].ar=CA[k]; }
})();
const tradColor = t => (TRAD[t]&&TRAD[t].color) || '#888';
const catColor  = c => (CATS[c]&&CATS[c].color) || '#888';
const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

/* ============================================================ I18N */
const S = {
 tr:{
  brand_sub:'Dijital Müfessirler Haritası',
  hero_eyebrow:'Dijital Beşerî Bilimler · OpenITI Külliyatı',
  hero_t1:'Tefsîr', hero_t2:'Atlası',
  hero_thesis:'Hicrî 1. yüzyıldan bugüne <b>'+ST.works+' tefsir eseri</b> — coğrafyada, zamanda, ekolde ve kavramda. Bu atlas mirası <em>haritalandırır</em>; murâd-ı ilâhînin tayinine ise karışmaz.',
  cta_map:'Haritada keşfet', cta_browse:'Külliyatı tara',
  epi_z:'Bu mercek ne ölçer', epi_b:'Ne ölçmez',
  pano_epi_z:'Eserin künyesini: müellifin vefât yılını, dilini, mensubu sayıldığı geleneği, baskın yöntemi ve metindeki terim sıklıklarını. Bunlar sayılabilir, kıyaslanabilir verilerdir.',
  pano_epi_b:'Tefsîrin isâbetini, tek bir âyetin doğru anlaşılışını, müfessirin takvâsını yahut murâd-ı ilâhîyi. Sayım yüzeyi (zâhir) gösterir; mânânın derinliği (bâtın) ehlinin uhdesinde kalır.',
  pano_centuries:'Yüzyıllara göre dağılım (Hicrî)', pano_lang:'Telif dili', pano_reach:'Kapsam',
  pano_trad:'Mezhep / Ekol geleneği', pano_genre:'Tefsir türü (baskın yöntem)',
  pano_note:'Not: '+ST.total_words.toLocaleString('tr-TR')+' kelime, biçim işaretlerinden arındırılmış ham metin üzerinden sayılmıştır; ham dosya boyutundan (≈863 MB) küçük oluşu bundandır. Mezhep ve tür ataması, müellif nisbeleri ve eser başlıklarından otomatik çıkarılmıştır; tartışmalı durumlar olabilir.',
  foot_thesis:'Sayar; ama hüküm vermez. Bu atlas tefsir mirasının dış hatlarını — kimin, ne zaman, nerede, hangi gelenekte yazdığını — haritalandırır. Murâd-ı ilâhînin tayini ise metnin ve ehlinin uhdesindedir.',
  foot_prep:'Hazırlayanlar',
  colophon_l:'Tefsîr Atlası · dijital beşerî bilimler denemesi',
  colophon_r:'Veri: OpenITI mARkdown külliyatı · İstatistikler tarayıcıda yerel hesaplanır',
  works:'eser', authors:'müellif', cities:'şehir', placed:'haritalı', concepts:'kavram',
  centuryAH:'. yy (H)', ce:'M.S.', search_ph:'Müellif, eser, şehir ya da kavram ara…',
  all:'Tümü', tradition:'Gelenek', genre:'Tür', century:'Yüzyıl', reset:'Sıfırla',
  noresult:'Eşleşen eser yok. Süzgeçleri gevşetmeyi deneyin.',
  worksN:n=>n+' eser', sortBy:'Sırala', byYear:'Yıla göre', byWords:'Hacme göre', byConc:'İlgiye göre',
  dr_words:'kelime', dr_fingerprint:'Kavram parmak izi', dr_sample:'Metinden numune',
  dr_neighbors:'Sözcüksel komşular', dr_open:'Açık künye', dr_school:'Gelenek', dr_genre:'Yöntem',
  dr_place:'Yer', dr_century:'Yüzyıl', dr_lang:'Dil', noNeighbors:'Eşik üstü belirgin komşu bulunmadı.',
  langs:{ara:'Arapça', per:'Farsça'}, langShort:{ara:'AR', per:'FA'},
  conc_ph:'Bir terim arayın; geçtiği pasajları kaynağıyla gösterelim…',
  conc_hint:'Konkordans metni <b>betimler</b>, yorumlamaz: aranan terimin külliyattaki bağlamlarını eseri ve müellifiyle birlikte listeler.',
  conc_none:'Bu terim, gömülü pasaj örnekleminde geçmiyor. (Tam külliyat için veri paketini kullanın.)',
  showing:n=>n+' pasaj',
 },
 en:{
  brand_sub:'A Map of Qurʾānic Commentators',
  hero_eyebrow:'Digital Humanities · OpenITI Corpus',
  hero_t1:'Tafsīr', hero_t2:'Atlas',
  hero_thesis:'From the 1st century AH to today — <b>'+ST.works+' works of Qurʾānic commentary</b>, across geography, time, school and concept. This atlas <em>maps</em> the tradition; it does not adjudicate the intended meaning.',
  cta_map:'Explore the map', cta_browse:'Browse the corpus',
  epi_z:'What this lens measures', epi_b:'What it does not',
  pano_epi_z:'A work\u2019s metadata: the author\u2019s death year, language, the tradition it is ascribed to, its dominant method, and term frequencies in the text. These are countable, comparable signals.',
  pano_epi_b:'The soundness of an interpretation, the right reading of a single verse, the commentator\u2019s piety, or the divine intent. Counting shows the surface (\u1e93\u0101hir); the depth of meaning (b\u0101\u1e6din) rests with those qualified.',
  pano_centuries:'Distribution by century (AH)', pano_lang:'Language', pano_reach:'Reach',
  pano_trad:'Tradition / school', pano_genre:'Genre (dominant method)',
  pano_note:'Note: '+ST.total_words.toLocaleString('en-US')+' words counted on plain text stripped of markup — hence smaller than the raw files (\u2248863 MB). School and genre are inferred automatically from author nisbas and titles; contested cases exist.',
  foot_thesis:'It counts, but does not judge. This atlas maps the outline of the exegetical heritage — who wrote, when, where, and in which tradition. The intended meaning rests with the text and its qualified readers.',
  foot_prep:'Prepared by',
  colophon_l:'Tafs\u012br Atlas · a digital-humanities essay',
  colophon_r:'Data: OpenITI mARkdown corpus · statistics computed locally in your browser',
  works:'works', authors:'authors', cities:'cities', placed:'mapped', concepts:'concepts',
  centuryAH:'th c. AH', ce:'CE', search_ph:'Search author, work, city or concept…',
  all:'All', tradition:'Tradition', genre:'Genre', century:'Century', reset:'Reset',
  noresult:'No matching works. Try relaxing the filters.',
  worksN:n=>n+' works', sortBy:'Sort', byYear:'By year', byWords:'By size', byConc:'By relevance',
  dr_words:'words', dr_fingerprint:'Concept fingerprint', dr_sample:'Text sample',
  dr_neighbors:'Lexical neighbours', dr_open:'Metadata', dr_school:'Tradition', dr_genre:'Method',
  dr_place:'Place', dr_century:'Century', dr_lang:'Language', noNeighbors:'No salient neighbour above threshold.',
  langs:{ara:'Arabic', per:'Persian'}, langShort:{ara:'AR', per:'FA'},
  conc_ph:'Search a term; we show passages where it occurs, with provenance…',
  conc_hint:'The concordance <b>describes</b>, it does not interpret: it lists the contexts of a term across the corpus, with work and author.',
  conc_none:'This term does not occur in the embedded passage sample. (Use the data bundle for the full corpus.)',
  showing:n=>n+' passages',
 },
 ar:{
  brand_sub:'خريطة المفسّرين الرقميّة',
  hero_eyebrow:'العلوم الإنسانية الرقمية · مكتبة OpenITI',
  hero_t1:'أطلس', hero_t2:'التفسير',
  hero_thesis:'من القرن الأول الهجري إلى اليوم — <b>'+ST.works+' مصنَّفًا تفسيريًّا</b> عبر الجغرافيا والزمن والمدرسة والمفهوم. هذا الأطلس <em>يرسم خريطة</em> التراث؛ ولا يقضي في المراد الإلهي.',
  cta_map:'استكشف الخريطة', cta_browse:'تصفّح المكتبة',
  epi_z:'ما الذي يقيسه هذا المنظور', epi_b:'وما الذي لا يقيسه',
  pano_epi_z:'بطاقة المصنَّف: سنة وفاة المؤلف، ولغته، والتقليد المنسوب إليه، ومنهجه الغالب، وتواتر المصطلحات في النص. هذه قرائن قابلة للعدّ والمقارنة.',
  pano_epi_b:'صحّة التفسير، وصواب فهم آية بعينها، وتقوى المفسّر، أو المراد الإلهي. العدّ يُظهر السطح (الظاهر)؛ أمّا عمق المعنى (الباطن) فموكول إلى أهله.',
  pano_centuries:'التوزيع حسب القرن (هجري)', pano_lang:'لغة التأليف', pano_reach:'النطاق',
  pano_trad:'المذهب / التقليد', pano_genre:'نوع التفسير (المنهج الغالب)',
  pano_note:'ملاحظة: عُدّت '+ST.total_words.toLocaleString('en-US')+' كلمة على نصّ مجرَّد من علامات التنسيق؛ ولذلك فهو أصغر من حجم الملفات الخام (نحو 863 ميغابايت). نُسب المذهب والنوع آليًّا من نِسَب المؤلفين وعناوين المصنَّفات؛ وقد توجد حالات خلافية.',
  foot_thesis:'يُحصي ولا يحكم. يرسم هذا الأطلس الخطوط العامة لتراث التفسير — من كتب، ومتى، وأين، وفي أيّ تقليد. أمّا المراد الإلهي فموكول إلى النصّ وأهله.',
  foot_prep:'إعداد',
  colophon_l:'أطلس التفسير · محاولة في العلوم الإنسانية الرقمية',
  colophon_r:'البيانات: مكتبة OpenITI بصيغة mARkdown · تُحسب الإحصاءات محليًّا في متصفّحك',
  works:'مصنَّف', authors:'مؤلِّف', cities:'مدينة', placed:'على الخريطة', concepts:'مفهوم',
  centuryAH:' هـ', ce:'م', search_ph:'ابحث عن مؤلِّف أو مصنَّف أو مدينة أو مفهوم…',
  all:'الكل', tradition:'التقليد', genre:'النوع', century:'القرن', reset:'إعادة',
  noresult:'لا توجد مصنَّفات مطابقة. جرِّب تخفيف عوامل التصفية.',
  worksN:n=>n+' مصنَّف', sortBy:'ترتيب', byYear:'حسب السنة', byWords:'حسب الحجم', byConc:'حسب الصلة',
  dr_words:'كلمة', dr_fingerprint:'بصمة المفاهيم', dr_sample:'نموذج من النص',
  dr_neighbors:'الجيران المعجميّون', dr_open:'البطاقة', dr_school:'التقليد', dr_genre:'المنهج',
  dr_place:'المكان', dr_century:'القرن', dr_lang:'اللغة', noNeighbors:'لا جار بارز فوق العتبة.',
  langs:{ara:'العربية', per:'الفارسية'}, langShort:{ara:'ع', per:'ف'},
  conc_ph:'ابحث عن مصطلح؛ نعرض المواضع التي ورد فيها مع مصدرها…',
  conc_hint:'الكشّاف <b>يصف</b> ولا يفسِّر: يسرد سياقات المصطلح في المكتبة مع المصنَّف والمؤلِّف.',
  conc_none:'لا يرد هذا المصطلح في العيّنة المضمَّنة من المقاطع. (استخدم حزمة البيانات للمكتبة الكاملة.)',
  showing:n=>n+' مقطعًا',
 }
};
let lang='tr';
const t = k => (S[lang][k]!==undefined?S[lang][k]:k);
const L = (tr,en,ar)=> lang==='ar' ? (ar!=null?ar:en) : lang==='en' ? en : tr;
const nameTrad = tr => L(TRAD[tr].tr, TRAD[tr].en, TRAD[tr].ar);
const nameGenre= g  => L(GENRE[g].tr, GENRE[g].en, GENRE[g].ar);
const nameCat  = c  => L(CATS[c].tr, CATS[c].en, CATS[c].ar);
const conName  = k  => { const c=conByKey[k]; return L(c.tr, c.en, c.ar); };
const auName = w => lang==='ar' ? (w.author_ar||w.author_tr) : lang==='en' ? w.author_en : w.author_tr;
const tiName = w => lang==='ar' ? (w.title_ar||w.title_en) : w.title_en;
const ctName = w => lang==='ar' ? (w.city_ar||w.city_tr) : lang==='en' ? w.city_en : w.city_tr;
const cityNm = c => lang==='ar' ? (c.name_ar||c.name) : lang==='en' ? c.name_en : c.name;

/* ============================================================ LENS META */
const LENSES = [
 {id:'pano', rn:'I', tr:'Pano', en:'Panorama', ar:'لوحة'},
 {id:'harita', rn:'II', tr:'Harita', en:'Map', ar:'خريطة',
   bl_tr:'115 eser müellifinin nisbesinden çıkarılan şehre yerleştirildi. Nokta büyüklüğü o şehirdeki eser sayısını, rengi baskın geleneği gösterir.',
   bl_en:'115 works placed at the city inferred from the author\u2019s nisba. Dot size is the number of works there; colour is the dominant tradition.',
   bl_ar:'وُضِع 115 مصنَّفًا في المدينة المستخلَصة من نِسبة المؤلِّف. حجمُ النقطة عددُ المصنَّفات فيها، ولونُها التقليدُ الغالب.',
   z_tr:'Bir müellifin nisbe ile anıldığı şehri — ilim coğrafyasının ağırlık merkezlerini.',
   z_en:'The city by which an author is known via his nisba — the centres of gravity of the scholarly geography.',
   z_ar:'المدينةُ التي يُعرَف بها المؤلِّف عبر نسبته — مراكزُ ثِقَل الجغرافيا العلمية.',
   b_tr:'Bir âlimin ömrü boyunca dolaştığı yolları, hocalarını, yahut fikrin sınır tanımayan dolaşımını. Nisbe bir iz bırakır, güzergâhı değil.',
   b_en:'An author\u2019s travels, his teachers, or the borderless circulation of ideas. A nisba leaves a trace, not an itinerary.',
   b_ar:'رحلاتُ العالِم وشيوخُه ودورانُ الفكرة بلا حدود. النسبةُ تترك أثرًا لا مسارًا.'},
 {id:'zaman', rn:'III', tr:'Zaman', en:'Timeline', ar:'زمن',
   bl_tr:'Her eser, müellifinin vefât yılına (Hicrî) göre dizilir; şeritler geleneklere ayrılır. 1.4 bin yıllık kesintisiz bir tefsir geleneği.',
   bl_en:'Each work sits at its author\u2019s death year (AH); lanes separate the traditions. An unbroken 1,400-year commentary tradition.',
   bl_ar:'يقع كلُّ مصنَّف عند سنة وفاة مؤلِّفه (هجري)؛ والمساراتُ تفصل التقاليد. تقليدٌ تفسيريّ متّصلٌ امتدّ 1400 سنة.',
   z_tr:'Eserlerin kronolojik sıklığını, geleneklerin yoğunlaştığı ve seyrekleştiği dönemleri.',
   z_en:'The chronological density of works, and the eras in which each tradition thickens or thins.',
   z_ar:'الكثافةُ الزمنية للمصنَّفات، والعصورُ التي يكثُف فيها كلُّ تقليد أو يخفّ.',
   b_tr:'Bir eserin etkisinin ne zaman zirveye çıktığını; çünkü kimi tefsir asırlar sonra okunur. Vefât yılı telif anını, tesir anını değil verir.',
   b_en:'When a work\u2019s influence peaked — some commentaries are read centuries later. A death year marks composition, not reception.',
   b_ar:'متى بلغ أثرُ مصنَّفٍ ذروتَه؛ فبعضُ التفاسير يُقرأ بعد قرون. سنةُ الوفاة تؤرّخ التأليف لا التلقّي.'},
 {id:'ekoller', rn:'IV', tr:'Ekoller & Türler', en:'Schools & Genres', ar:'مدارس',
   bl_tr:'Gelenek (mezhep) ile yöntem (rivâyet/dirâyet/lugavî/ahkâm/işârî…) çaprazı. Bir hücreye dokunun: o kesişimdeki eserler açılsın.',
   bl_en:'Tradition (school) crossed with method (tradition-based / reason-based / linguistic / legal / mystical…). Tap a cell to see the works at that intersection.',
   bl_ar:'تقاطعُ التقليد (المذهب) مع المنهج (بالمأثور/بالرأي/لغوي/أحكام/إشاري…). انقر خلية لترى مصنَّفات ذلك التقاطع.',
   z_tr:'Eserlerin gelenek ve baskın yöntem etiketlerine göre kümelenişini; hangi yöntemin hangi gelenekte yoğunlaştığını.',
   z_en:'How works cluster by tradition and dominant method; which method concentrates in which tradition.',
   z_ar:'كيف تتجمّع المصنَّفات حسب التقليد والمنهج الغالب؛ وأيُّ منهجٍ يتركّز في أيّ تقليد.',
   b_tr:'Tek bir eserin birden çok yöntemi nasıl harmanladığını. Etiket bir baskın rengi seçer; metnin alacasını değil. Çoğu büyük tefsir melezdir.',
   b_en:'How a single work blends several methods. A label picks one dominant hue, not the text\u2019s full spectrum. Most great tafsīrs are hybrids.',
   b_ar:'كيف يمزج المصنَّفُ الواحد مناهجَ شتّى. التصنيفُ يختار لونًا غالبًا لا طيفَ النص. وأكثرُ التفاسير الكبرى هجينة.'},
 {id:'kavramlar', rn:'V', tr:'Kavramlar', en:'Concepts', ar:'مفاهيم',
   bl_tr:'29 anahtar terim, normalize sıklıkla. Dağılım külliyatta neyin baskın olduğunu; ağ ise hangi kavramların aynı eserde birlikte yükseldiğini gösterir.',
   bl_en:'29 key terms by normalised frequency. The distribution shows what dominates the corpus; the network shows which concepts rise together in the same work.',
   bl_ar:'29 مصطلحًا مفتاحيًّا بتواترٍ مُعيَّر. التوزيعُ يُظهر ما يغلب على المكتبة؛ والشبكةُ تُظهر المفاهيمَ التي تتصاعد معًا في المصنَّف الواحد.',
   z_tr:'Bir terimin metinde geçiş sıklığını ve hangi terimlerle birlikte yoğunlaştığını.',
   z_en:'How often a term occurs, and which other terms it concentrates alongside.',
   z_ar:'تواترُ ورود المصطلح، والمصطلحاتُ التي يتركّز بجوارها.',
   b_tr:'Terimin o bağlamdaki anlamını. "Te\u2019vîl" hem övülerek hem yerilerek geçer; sayım geçişi görür, kastı görmez. Eş-yazımlar ölçümü şişirir.',
   b_en:'What the term means in context. "Ta\u02bew\u012bl" appears both in praise and in censure; counting sees the token, not the intent. Homographs inflate the measure.',
   b_ar:'معنى المصطلح في سياقه. «التأويل» يَرِد مدحًا وذمًّا؛ العدُّ يرى اللفظ لا القصد. والمشترَكُ اللفظيّ يضخّم المقياس.'},
 {id:'akis', rn:'VI', tr:'Kavram Akışı', en:'Concept Flow', ar:'جريان المفاهيم',
   bl_tr:'Yedi kavram ailesinin yüzyıllar boyunca ağırlığının nasıl değiştiği — dilbilimsel, fıkhî yahut işârî vurgunun yükselişini ve çekilişini gösteren yığılı bir akış.',
   bl_en:'How the weight of the seven concept families shifts across the Hijri centuries — a stacked flow revealing the rise and ebb of linguistic, legal or mystical emphasis.',
   bl_ar:'كيف يتغيّر حضورُ أُسَر المفاهيم السبع عبر القرون الهجرية — تيّارٌ متراكمٌ يكشف صعودَ المنهج اللغوي أو الفقهي أو الإشاري وأفوله.',
   z_tr:'Her kavram ailesinin yüzyıl başına ortalama ağırlığını ve aileler arası dengenin zaman içinde kayışını.',
   z_en:'The mean weight of each concept family per century, and how the balance between families shifts over time.',
   z_ar:'متوسّطُ حضور كلِّ أسرة مفاهيم في كلّ قرن، وتحوُّلُ التوازن بين الأُسَر عبر الزمن.',
   b_tr:'Bu kayışın sebebini yahut anlamını. Eğri yoğunluğun değişimini betimler, nedenini değil; yüzyıllar arası örneklem boyutu farkı şekli etkileyebilir.',
   b_en:'The cause or meaning of that shift. The curve describes changing density, not its reasons; differing sample sizes across centuries can affect the shape.',
   b_ar:'سببَ التحوّل أو معناه. المنحنى يصف تغيُّرَ الكثافة لا عللَه؛ وتفاوتُ حجم العيّنة بين القرون قد يؤثّر في الشكل.'},
 {id:'mukayese', rn:'VII', tr:'Mukayese', en:'Comparison', ar:'مقارنة',
   bl_tr:'Gelenekleri yan yana koyun: yedi kavram ailesindeki imzalarını bir radar üzerinde karşılaştırın; yahut iki eseri seçip parmak izlerini ve ortak söz dağarcığını yüz yüze getirin.',
   bl_en:'Place traditions side by side: compare their signatures across the seven concept families on a radar; or pick two works and bring their fingerprints and shared vocabulary face to face.',
   bl_ar:'ضَعِ التقاليدَ جنبًا إلى جنب: قارِن بصماتِها عبر أُسَر المفاهيم السبع على رادار؛ أو اختَر مصنَّفَين لتضع بصمتَيهما والمفرداتِ المشتركة وجهًا لوجه.',
   z_tr:'Geleneklerin yahut iki eserin kavram profillerindeki göreli farkları; benzerlik ve ayrışma örüntülerini.',
   z_en:'The relative differences in the concept profiles of traditions or of two works; patterns of similarity and divergence.',
   z_ar:'الفروقُ النسبية في ملامح المفاهيم بين التقاليد أو بين مصنَّفَين؛ وأنماطُ التشابه والتباين.',
   b_tr:'Hangi profilin "daha doğru" tefsir olduğunu. Karşılaştırma vurguyu ölçer, isâbeti değil; profil bir eğilimi gösterir, bir hükmü değil.',
   b_en:'Which profile is the "sounder" exegesis. Comparison measures emphasis, not correctness; a profile shows a tendency, not a verdict.',
   b_ar:'أيُّ الملامح تفسيرٌ «أصوب». المقارنةُ تقيس التركيزَ لا الصواب؛ والملمحُ يُظهر ميلًا لا حُكمًا.'},
 {id:'uzay', rn:'VIII', tr:'Kavram Uzayı', en:'Conceptual Space', ar:'فضاء المفاهيم',
   bl_tr:'Her eserin 29 boyutlu kavram parmak izi, temel bileşen analiziyle (PCA) iki boyuta indirgenir; yakınlık kavramsal akrabalık demektir. Eksenler yorumlanabilir, renk geleneği · veriden çıkan yöntem kümesini · yahut yüzyılı gösterir.',
   bl_en:'Each work\u2019s 29-dimensional concept fingerprint is reduced to two dimensions by PCA; proximity means conceptual kinship. The axes are interpretable, and colour shows tradition, a data-driven method cluster, or century.',
   bl_ar:'تُختزَل بصمةُ كلِّ مصنَّفٍ ذاتُ الأبعاد التسعة والعشرين إلى بُعدَين بتحليل المكوّنات الرئيسة (PCA)؛ والقربُ يعني قرابةً مفاهيمية. والمحاورُ قابلةٌ للتأويل، ويدلّ اللونُ على التقليد أو عنقودٍ منهجيٍّ ناشئٍ من البيانات أو القرن.',
   z_tr:'Eserlerin kavram kullanımındaki çok değişkenli örüntüyü; hangi eserlerin kavramsal olarak yakın düştüğünü ve veriden kendiliğinden beliren yöntem kümelerini.',
   z_en:'The multivariate pattern in works\u2019 concept usage; which works fall conceptually close, and the method-clusters that emerge from the data on their own.',
   z_ar:'النمطَ المتعدّدَ المتغيّرات في استعمال المفاهيم؛ وأيُّ المصنَّفات تتقارب مفاهيميًّا، والعناقيدَ المنهجية التي تبرز من البيانات تلقائيًّا.',
   b_tr:'İki boyut varyansın ~%28\u2019ini taşır; uzaklıklar yaklaşıktır. Kümeler yumuşaktır ve gelenek (mezhep) etiketlerini geri-vermez (NMI\u22480,05) — bu, yöntemin mezhebi kestiğini gösterir, eserlerin değerini değil.',
   b_en:'Two dimensions carry ~28% of the variance; distances are approximate. The clusters are soft and do not recover the tradition (sect) labels (NMI\u22480.05) — showing that method cuts across sect, not the worth of any work.',
   b_ar:'يحمل البُعدان نحو 28% من التباين؛ والمسافاتُ تقريبية. والعناقيدُ ليّنةٌ ولا تستعيد التسميات المذهبية (NMI\u22480.05) — ممّا يدلّ على أنّ المنهج يقطع المذهب، لا على قيمة مصنَّفٍ بعينه.'},
 {id:'kulliyat', rn:'IX', tr:'Külliyat', en:'Corpus', ar:'كُتب',
   bl_tr:'Tüm külliyat: süz, sırala, ara. Bir esere dokunun; künyesi, kavram parmak izi ve metninden bir numune açılsın. Aşağıda konkordans ile terim bağlamlarını çıkarın.',
   bl_en:'The whole corpus: filter, sort, search. Tap a work for its metadata, concept fingerprint and a text sample. Below, pull term contexts with the concordance.',
   bl_ar:'المكتبةُ كاملةً: صفِّ ورتِّب وابحث. انقر مصنَّفًا لبطاقته وبصمةِ مفاهيمه ونموذجٍ من نصّه. وفي الأسفل استخرج سياقاتِ المصطلحات بالكشّاف.',
   z_tr:'Hangi eserin var olduğunu, künyesini ve metninde bir terimin nerede geçtiğini.',
   z_en:'Which works exist, their metadata, and where a term occurs in the text.',
   z_ar:'أيُّ المصنَّفات موجود، وبطاقتُه، وأين يرد مصطلحٌ في نصّه.',
   b_tr:'Pasajın ne dediğini, doğru mu yanlış mı olduğunu. Konkordans yeri gösterir, hükmü değil; okuma ve tahkik size aittir.',
   b_en:'What a passage says, or whether it is right. The concordance shows location, not verdict; reading and judgement remain yours.',
   b_ar:'ما يقوله المقطعُ أو صوابُه. الكشّافُ يدلّ على الموضع لا على الحكم؛ والقراءةُ والتحقيقُ إليك.'},
 {id:'metinler', rn:'X', tr:'Metinler Arası', en:'Intertextual', ar:'تناصّ',
   bl_tr:'Eserler, paylaştıkları belirgin sözcük dağarcığına göre bağlanır (Jaccard benzerliği). Yakınlık ortak dil demektir — alıntı yahut etki kanıtı değil.',
   bl_en:'Works are linked by the salient vocabulary they share (Jaccard similarity). Proximity means shared diction — not proof of citation or influence.',
   bl_ar:'تُربَط المصنَّفات بما تتقاسمه من مفرداتٍ بارزة (تشابه جاكار). القربُ يعني اشتراكًا في الديباجة — لا دليلًا على اقتباسٍ أو تأثير.',
   z_tr:'İki eserin sözcük dağarcığındaki örtüşmeyi; benzer terimlerle yazılmış metin kümelerini.',
   z_en:'The overlap in two works\u2019 vocabulary; clusters of texts written in similar terms.',
   z_ar:'تداخلُ مفردات مصنَّفَين؛ وعناقيدُ النصوص المكتوبة بمصطلحاتٍ متقاربة.',
   b_tr:'Kimin kimden aldığını. Ortak kelime, ortak konu ve dönemin de işareti olabilir; yön ve niyet bu ağdan okunamaz. Bunun için Aktarım merceğine bakın.',
   b_en:'Who borrowed from whom. Shared words may merely reflect shared topic and era; direction and intent are not legible here. See the Transmission lens.',
   b_ar:'مَن أخذ عمّن. المفرداتُ المشتركة قد تعكس موضوعًا وعصرًا مشتركَين؛ والاتجاهُ والقصدُ لا يُقرآن هنا. انظر منظورَ الإسناد.'},
 {id:'aktarim', rn:'XI', tr:'Aktarım', en:'Transmission', ar:'إسناد',
   bl_tr:'Kaynaklarca iyi belgelenmiş büyük tesir ilişkileri — elle seçilmiş, yorumlu bir okuma. Ok, "etkileyen → etkilenen" yönünü gösterir.',
   bl_en:'Well-attested major lines of influence — a hand-curated, interpretive reading. The arrow points "influencer → influenced".',
   bl_ar:'خطوطُ تأثيرٍ كبرى موثَّقة — قراءةٌ منتقاةٌ مفسِّرة. يشير السهمُ إلى اتجاه «المؤثِّر ← المتأثِّر».',
   z_tr:'Klasik kaynaklarda açıkça anılan büyük tefsir-tesir hatlarını (Taberî → İbn Kesîr gibi).',
   z_en:'Major lines of exegetical influence explicitly noted in classical sources (e.g. \u1e6cabar\u012b \u2192 Ibn Kath\u012br).',
   z_ar:'خطوطُ التأثير التفسيريّ الكبرى المذكورة صراحةً في المصادر الكلاسيكية (كالطبري ← ابن كثير).',
   b_tr:'Tesirin tam ölçüsünü ve her ipliğini. Bu ağ seçilmiş, eksik ve tartışmaya açıktır; bir tezdir, sayım değil. Diğer mercekler betimler; bu mercek yorumlar.',
   b_en:'The full measure of influence, or every thread. This graph is selective, partial and contestable; it is a thesis, not a count. Other lenses describe; this one interprets.',
   b_ar:'تمامَ مقدار التأثير أو كلَّ خيوطه. هذه الشبكةُ منتقاةٌ ناقصةٌ قابلةٌ للنقاش؛ هي أطروحةٌ لا إحصاء. غيرُها يصف؛ وهي تفسِّر.'},
];
const lensById = Object.fromEntries(LENSES.map(l=>[l.id,l]));
const lensName = l => L(l.tr, l.en, l.ar);

/* ============================================================ small DOM utils */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function el(tag, attrs={}, html){ const e=document.createElement(tag);
  for(const k in attrs){ if(k==='class')e.className=attrs[k]; else if(k==='html')e.innerHTML=attrs[k];
    else if(k.startsWith('on'))e.addEventListener(k.slice(2),attrs[k]); else e.setAttribute(k,attrs[k]); }
  if(html!=null)e.innerHTML=html; return e; }
const esc = s => (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tipEl = ()=>$('#tip');
function showTip(html,x,y){ const tip=tipEl(); tip.innerHTML=html; tip.style.opacity=1;
  const w=tip.offsetWidth,h=tip.offsetHeight, pad=14;
  let nx=x+16, ny=y+16; if(nx+w>innerWidth-pad)nx=x-w-16; if(ny+h>innerHeight-pad)ny=y-h-16;
  tip.style.left=Math.max(pad,nx)+'px'; tip.style.top=Math.max(pad,ny)+'px'; }
function hideTip(){ tipEl().style.opacity=0; }

/* ============================================================ INIT / NAV / ROUTING */
function init(){
  buildNav();
  renderPano();
  applyI18n();
  const h=location.hash.slice(1);
  if(h && lensById[h]) go(h, true);
}
function buildNav(){
  const nav=$('#lensNav'); nav.innerHTML='';
  LENSES.forEach(l=>{
    const b=el('button',{class:'lens-tab'+(l.id==='pano'?' on':''),'data-lens':l.id,
      onclick:()=>go(l.id)});
    b.innerHTML=`<span class="rn">${l.rn}</span><span class="nm">${lensName(l)}</span>${lang!=='ar'?`<span class="na ar">${l.ar}</span>`:''}`;
    nav.appendChild(b);
  });
}
const rendered={pano:true};
function go(id, noscroll){
  $$('.lens-panel').forEach(p=>p.classList.remove('on'));
  $$('.lens-tab').forEach(tb=>tb.classList.toggle('on', tb.dataset.lens===id));
  const panel=$('#lp-'+id); panel.classList.add('on');
  try{ history.replaceState(null,'','#'+id); }catch(_){}
  if(!rendered[id]){ renderLens(id); rendered[id]=true; }
  if(!noscroll) window.scrollTo({top:0,behavior:'smooth'});
}
function renderLens(id){
  const p=$('#lp-'+id);
  ({harita:renderMap, zaman:renderTimeline, ekoller:renderSchools,
    kavramlar:renderConcepts, akis:renderFlow, mukayese:renderCompare, uzay:renderLandscape,
    kulliyat:renderCorpus, metinler:renderInter,
    aktarim:renderTransmission})[id](p);
}
function lensHead(l){
  return `<div class="lens-head">
    <div class="idx">${l.rn}</div>
    <div class="tt"><div class="sub">${L('Mercek','Lens','منظور')} ${l.rn}</div>
      <h2>${lensName(l)} ${lang!=='ar'?`<span class="ar">${l.ar}</span>`:''}</h2>
      <p class="blurb">${L(l.bl_tr,l.bl_en,l.bl_ar)}</p></div></div>
   <div class="epi"><div class="zahir"><h5>${t('epi_z')}</h5><p>${L(l.z_tr,l.z_en,l.z_ar)}</p></div>
     <div class="batin"><h5>${t('epi_b')}</h5><p>${L(l.b_tr,l.b_en,l.b_ar)}</p></div></div>`;
}

/* ============================================================ I18N apply */
function setLang(lg){ lang=lg; document.documentElement.lang=lg;
  document.documentElement.dir = (lg==='ar'?'rtl':'ltr');
  ['tr','en','ar'].forEach(x=>{ const b=$('#lang-'+x); if(b)b.classList.toggle('on',x===lg); });
  applyI18n(); buildNav();
  for(const k in rendered){ if(rendered[k]){ if(k==='pano')renderPano(); else renderLens(k); } }
  const cur=$('.lens-panel.on'); if(cur){const id=cur.id.replace('lp-','');
    $$('.lens-tab').forEach(tb=>tb.classList.toggle('on',tb.dataset.lens===id));}
}
function applyI18n(){
  $$('[data-i]').forEach(n=>{ const k=n.getAttribute('data-i'); if(S[lang][k]!==undefined)n.innerHTML=S[lang][k]; });
  renderHeroStats(); drawHeroFig();
}
/* ============================================================ HERO */
function renderHeroStats(){
  const box=$('#heroStats'); if(!box)return;
  const labels={works:t('works'),authors:t('authors'),placed:t('placed'),concepts:t('concepts'),
    cent:L('asır (H)','centuries','قرن (هـ)')};
  const items=[[ST.works,'works'],[ST.authors,'authors'],[ST.placed,'placed'],['14','cent'],[ST.concepts,'concepts']];
  box.innerHTML = items.map(([n,k])=>`<div class="hstat"><div class="n"><b>${n}</b></div>
    <div class="k">${labels[k]}</div></div>`).join('');
}
function drawHeroFig(){
  const host=$('#heroFig'); if(!host)return;
  const W=460,H=480, cx=W/2, maxC=15;
  let stars='';
  C.forEach((w,i)=>{
    const c=w.century_ah, frac=(c-1)/(maxC-1);
    const ang=(-Math.PI*0.82)+(Math.PI*0.64)*frac;
    const seed=(i*97%100)/100;
    const r=120+seed*150+(w.words>120000?-14:0);
    const x=cx+Math.cos(ang)*r, y=120+Math.sin(ang)*r*0.62+150;
    const rad=1.1+Math.min(3.0,Math.sqrt(w.words)/170);
    stars+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(2)}" fill="${tradColor(w.trad)}" opacity="${(0.35+seed*0.5).toFixed(2)}"/>`;
  });
  host.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Niche of light with a constellation of ${ST.works} works">
    <defs>
      <radialGradient id="lampg" cx="50%" cy="34%" r="62%">
        <stop offset="0%" stop-color="#fff4d8"/><stop offset="22%" stop-color="${cssv('--gold-bright')}"/>
        <stop offset="60%" stop-color="${cssv('--gold')}" stop-opacity=".5"/><stop offset="100%" stop-color="${cssv('--gold')}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="nicheg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${cssv('--gold-deep')}" stop-opacity=".55"/>
        <stop offset="100%" stop-color="${cssv('--gold-deep')}" stop-opacity=".06"/>
      </linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="2.2"/></filter>
    </defs>
    <g opacity=".95">${stars}</g>
    <g transform="translate(${cx},150)">
      <path d="M-86,250 L-86,40 A86,86 0 0 1 86,40 L86,250 Z" fill="none" stroke="url(#nicheg)" stroke-width="2"/>
      <path d="M-58,250 L-58,52 A58,58 0 0 1 58,52 L58,250" fill="none" stroke="${cssv('--line')}" stroke-width="1"/>
      <line x1="0" y1="-44" x2="0" y2="58" stroke="${cssv('--gold-deep')}" stroke-width="1" opacity=".6"/>
      <circle cx="0" cy="92" r="120" fill="url(#lampg)" filter="url(#soft)"/>
      <g transform="translate(0,86)">
        <path d="M-20,-26 Q0,-34 20,-26 L24,2 Q24,30 0,40 Q-24,30 -24,2 Z" fill="#0f1119" stroke="${cssv('--gold')}" stroke-width="1.4"/>
        <ellipse cx="0" cy="-26" rx="20" ry="6" fill="none" stroke="${cssv('--gold')}" stroke-width="1.2"/>
        <circle cx="0" cy="6" r="7" fill="${cssv('--gold-bright')}"/>
        <circle cx="0" cy="2" r="3.4" fill="#fff7e6"/>
      </g>
      <text x="0" y="250" text-anchor="middle" font-family="Amiri,serif" font-size="15" fill="${cssv('--gold-deep')}" opacity=".8">نور</text>
    </g>
  </svg>`;
}

/* ============================================================ I. PANO */
function barRows(host, rows){
  const max=Math.max(...rows.map(r=>r.n),1);
  host.innerHTML = rows.map(r=>{
    const pct=(r.n/max*100).toFixed(1);
    const dot=r.color?`<span class="dot" style="background:${r.color}"></span>`:'';
    return `<div class="bar-row"><span class="bl">${dot}${r.label}</span>
      <span class="bar-track"><span class="bar-fill" style="width:0%;background:${r.color||cssv('--gold')}" data-w="${pct}"></span></span>
      <span class="bv">${r.n}</span></div>`;
  }).join('');
  requestAnimationFrame(()=>host.querySelectorAll('.bar-fill').forEach(f=>f.style.width=f.dataset.w+'%'));
}
function renderPano(){
  const cents=ST.by_century_ah;
  barRows($('#panoCenturies'), Object.keys(cents).map(Number).sort((a,b)=>a-b).map(c=>(
    {label:c+'. '+L('yy','c','هـ'), n:cents[c], color:cssv('--gold')})));
  barRows($('#panoLang'), Object.entries(ST.langs).map(([k,v])=>({label:t('langs')[k]||k, n:v,
    color:k==='per'?cssv('--teal'):cssv('--gold')})));
  $('#panoReach').innerHTML=`<div class="bar-row"><span class="bl">${t('authors')}</span><span class="bar-track"></span><span class="bv">${ST.authors}</span></div>
    <div class="bar-row"><span class="bl">${t('cities')}</span><span class="bar-track"></span><span class="bv">${ST.cities}</span></div>
    <div class="bar-row"><span class="bl">${t('placed')}</span><span class="bar-track"></span><span class="bv">${ST.placed}</span></div>
    <div class="bar-row"><span class="bl">${L('Pasaj (arama)','Passages','مقاطع (بحث)')}</span><span class="bar-track"></span><span class="bv">${CH.length}</span></div>`;
  barRows($('#panoTrad'), Object.entries(ST.trads).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({label:nameTrad(k),n:v,color:tradColor(k)})));
  barRows($('#panoGenre'), Object.entries(ST.genres).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({label:nameGenre(k),n:v,color:cssv('--gold-deep')})));
}

/* ============================================================ II. HARITA */
const PROJ={L0:-15,L1:80,T0:12,T1:43,W:1000,H:380};
function project(lat,lng){ const {L0,L1,T0,T1,W,H}=PROJ;
  return [ (lng-L0)/(L1-L0)*W, (T1-lat)/(T1-T0)*H ]; }
let mapState={trad:'all',genre:'all'};
function renderMap(p){
  p.innerHTML = lensHead(lensById.harita)
    + `<div class="controls" id="mapControls"></div>
       <div class="map-wrap"><svg id="mapSvg" viewBox="0 0 ${PROJ.W} ${PROJ.H}" preserveAspectRatio="xMidYMid meet"></svg></div>
       <div class="legend" id="mapLegend"></div>`;
  buildFilterChips($('#mapControls'), mapState, ()=>drawMap());
  $('#mapLegend').innerHTML = Object.keys(TRAD).map(k=>(
    `<i><b style="background:${tradColor(k)}"></b>${nameTrad(k)}</i>`)).join('')
    + `<i style="opacity:.7;margin-left:auto">${L('◦ küçük → büyük: eser sayısı','◦ small → large: works count','◦ صغير ← كبير: عدد المصنَّفات')}</i>`;
  drawMap();
}
function mapFiltered(){ return C.filter(w=>w.lat &&
  (mapState.trad==='all'||w.trad===mapState.trad) &&
  (mapState.genre==='all'||w.genre===mapState.genre)); }
function drawMap(){
  const svg=$('#mapSvg'); const {W,H}=PROJ;
  const cities={};
  mapFiltered().forEach(w=>{ const key=w.city_tr+'|'+w.lat+'|'+w.lng;
    (cities[key]=cities[key]||{name:w.city_tr,name_en:w.city_en,name_ar:w.city_ar,lat:w.lat,lng:w.lng,works:[]}).works.push(w);});
  const arr=Object.values(cities);
  const maxN=Math.max(...arr.map(c=>c.works.length),1);
  let g='';
  for(let lng=-10;lng<=80;lng+=10){const [x]=project(0,lng);
    g+=`<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${H}" stroke="${cssv('--line-soft')}" stroke-width=".6"/>`;}
  for(let lat=15;lat<=42;lat+=5){const [,y]=project(lat,0);
    g+=`<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="${cssv('--line-soft')}" stroke-width=".6"/>`;}
  const coast=[
    [[35,-9],[36,2],[33,11],[31,20],[31,30],[36,36],[40,30]],
    [[30,34],[21,40],[15,44],[20,57],[30,49]],
    [[37,49],[42,51],[40,53],[37,49]],
  ];
  coast.forEach(line=>{ const pts=line.map(([la,lo])=>project(la,lo).map(v=>v.toFixed(1)).join(',')).join(' ');
    g+=`<polyline points="${pts}" fill="none" stroke="${cssv('--line')}" stroke-width="1" opacity=".5" stroke-dasharray="2 3"/>`;});
  const regions=[['el-Endelüs','Andalus','الأندلس',37.5,-4],['Mağrib','Maghrib','المغرب',33,3],['Mısır','Egypt','مصر',27,30],
    ['Şâm','Levant','الشام',34.5,37.5],['Haremeyn','Ḥaramayn','الحرمان',22.5,40.5],['Yemen','Yemen','اليمن',15.6,45.5],
    ['Irak','Iraq','العراق',32.6,44.6],['Cibâl','Jibāl','الجبال',35,50.5],['Horasan','Khurāsān','خراسان',37,60],
    ['Mâverâünnehir','Transoxiana','ما وراء النهر',39.6,66],['Hind','India','الهند',29,75]];
  regions.forEach(([tr,en,ar,la,lo])=>{ const [x,y]=project(la,lo); const lab=lang==='ar'?ar:(lang==='en'?en:tr);
    g+=`<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" text-anchor="middle" font-family="${lang==='ar'?'Amiri,serif':'Archivo'}"
       font-size="${lang==='ar'?13:11}" letter-spacing="${lang==='ar'?0:2}" fill="${cssv('--faint')}">${lang==='ar'?lab:lab.toUpperCase()}</text>`;});
  let dots='';
  arr.sort((a,b)=>b.works.length-a.works.length).forEach(c=>{
    const [x,y]=project(c.lat,c.lng); const n=c.works.length;
    const r=4+Math.sqrt(n/maxN)*22;
    const tc={}; c.works.forEach(w=>tc[w.trad]=(tc[w.trad]||0)+1);
    const dom=Object.entries(tc).sort((a,b)=>b[1]-a[1])[0][0]; const col=tradColor(dom);
    dots+=`<g class="city" tabindex="0" data-key="${esc(c.name)}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
      <circle class="halo" r="${(r+3).toFixed(1)}" fill="${col}" opacity=".10"/>
      <circle class="hit" r="${r.toFixed(1)}" fill="${col}" fill-opacity=".82" stroke="${cssv('--ground')}" stroke-width="1"/>
      ${n>=3?`<text text-anchor="middle" dy="-${(r+5).toFixed(0)}" font-family="${lang==='ar'?'Amiri,serif':'Archivo'}" font-size="${lang==='ar'?13:11}" fill="${cssv('--ivory-dim')}">${esc(cityNm(c))}</text>`:''}
    </g>`;
  });
  svg.innerHTML=`<g>${g}</g><g>${dots}</g>`;
  svg.querySelectorAll('.city').forEach(node=>{
    const key=node.dataset.key; const c=arr.find(a=>a.name===key);
    const handler=ev=>{ const n=c.works.length;
      const tcount={}; c.works.forEach(w=>tcount[w.trad]=(tcount[w.trad]||0)+1);
      const breakdown=Object.entries(tcount).sort((a,b)=>b[1]-a[1])
        .map(([k,v])=>`<span style="color:${tradColor(k)}">●</span> ${nameTrad(k)} ${v}`).join(' · ');
      const e=ev.touches?ev.touches[0]:ev;
      showTip(`<div class="tt-t">${esc(cityNm(c))}</div>
        <div class="tt-m">${t('worksN')(n)} · ${breakdown}</div>
        <div class="tt-r">${c.works.slice(0,4).map(w=>esc(auName(w))).join(' · ')}${n>4?' …':''}</div>`, e.clientX,e.clientY); };
    node.addEventListener('mousemove',handler);
    node.addEventListener('mouseleave',hideTip);
    node.addEventListener('click',()=>openCity(c));
    node.addEventListener('keydown',e=>{if(e.key==='Enter')openCity(c);});
  });
}
function openCity(c){
  const rows=c.works.sort((a,b)=>a.death_ah-b.death_ah).map(w=>workRowHTML(w)).join('');
  openDrawerHTML(`<div class="dr-yr">${t('dr_place')}</div>
    <div class="dr-au">${esc(cityNm(c))}</div>
    <div class="dr-ti">${t('worksN')(c.works.length)}</div>
    <div class="work-list">${rows}</div>`);
  bindWorkRows($('#drawerIn'));
}

/* ============================================================ III. ZAMAN */
let tlMode='trad';
function renderTimeline(p){
  p.innerHTML = lensHead(lensById.zaman)
    + `<div class="controls"><span class="lbl">${L('Şeritler','Lanes','مسارات')}</span>
        <div class="seg" id="tlSeg">
          <button data-m="trad" class="on">${t('tradition')}</button>
          <button data-m="genre">${t('genre')}</button></div>
        <span style="flex:1"></span>
        <span class="note" style="margin:0">${L('Yatay eksen: Hicrî vefât yılı','Horizontal: death year AH','المحور الأفقي: سنة الوفاة الهجرية')}</span></div>
       <div style="overflow-x:auto"><svg id="tlSvg"></svg></div>`;
  p.querySelectorAll('#tlSeg button').forEach(b=>b.addEventListener('click',()=>{
    tlMode=b.dataset.m; p.querySelectorAll('#tlSeg button').forEach(x=>x.classList.toggle('on',x===b)); drawTimeline();}));
  drawTimeline();
}
function drawTimeline(){
  const svg=$('#tlSvg');
  const W=Math.max(900, $('#lp-zaman').clientWidth-10), padL=120, padR=24, padT=24;
  const lanes = tlMode==='trad' ? Object.keys(TRAD) : Object.keys(GENRE);
  const laneName = tlMode==='trad' ? nameTrad : nameGenre;
  const laneColor= k => tlMode==='trad'? tradColor(k) : cssv('--gold');
  const laneH=46, H=padT+lanes.length*laneH+40, ahMax=1480;
  const X = ah => padL + ah/ahMax*(W-padL-padR);
  let g='';
  for(let c=100;c<=1400;c+=100){ const x=X(c);
    g+=`<line x1="${x.toFixed(1)}" y1="${padT-6}" x2="${x.toFixed(1)}" y2="${H-30}" stroke="${cssv('--line-soft')}"/>
        <text x="${x.toFixed(1)}" y="${H-14}" text-anchor="middle" font-family="Archivo" font-size="10" fill="${cssv('--faint')}">${c}H</text>`;}
  lanes.forEach((k,i)=>{ const y=padT+i*laneH+laneH/2;
    g+=`<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="${cssv('--line-soft')}"/>
        <text x="${padL-12}" y="${y+1}" text-anchor="end" dominant-baseline="middle" font-family="Archivo" font-size="11" fill="${cssv('--ivory-dim')}">${laneName(k)}</text>
        <circle cx="${padL-104}" cy="${y}" r="4" fill="${laneColor(k)}"/>`;});
  let marks='';
  C.forEach((w,idx)=>{ const k=tlMode==='trad'?w.trad:w.genre; const li=lanes.indexOf(k); if(li<0)return;
    const y0=padT+li*laneH+laneH/2; const jit=((idx*53%24)-12);
    const x=X(w.death_ah), y=y0+jit*0.7; const r=2.4+Math.min(4.4,Math.sqrt(w.words)/150);
    marks+=`<circle class="tl-mark" data-id="${w.id}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"
       fill="${tradColor(w.trad)}" fill-opacity=".78" stroke="${cssv('--ground')}" stroke-width=".7"/>`;});
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`); svg.style.width=W+'px';
  svg.innerHTML=g+marks;
  svg.querySelectorAll('.tl-mark').forEach(m=>{ const w=byId[m.dataset.id];
    m.addEventListener('mousemove',ev=>showTip(workTip(w),ev.clientX,ev.clientY));
    m.addEventListener('mouseleave',hideTip);
    m.addEventListener('click',()=>openWork(w.id));});
}
function workTip(w){ return `<div class="tt-t">${esc(w.author_tr)}</div>
  <div class="tt-m">${t('ce')} ${w.death_ce} · ${w.death_ah}H · ${nameTrad(w.trad)} · ${nameGenre(w.genre)}</div>
  <div class="tt-r" style="font-style:italic">${esc(tiName(w))}</div>`; }

/* ============================================================ IV. EKOLLER (matrix) */
function renderSchools(p){
  const trads=Object.keys(TRAD), genres=Object.keys(GENRE);
  const M={}; trads.forEach(tr=>{M[tr]={}; genres.forEach(g=>M[tr][g]=[]);});
  const gTot={}, tTot={}; genres.forEach(g=>gTot[g]=0); trads.forEach(tr=>tTot[tr]=0);
  C.forEach(w=>{ if(M[w.trad]&&M[w.trad][w.genre]){M[w.trad][w.genre].push(w); gTot[w.genre]++; tTot[w.trad]++;}});
  const maxCell=Math.max(...trads.flatMap(tr=>genres.map(g=>M[tr][g].length)));
  let head=`<th></th>`+genres.map(g=>`<th>${nameGenre(g)}<br><span style="color:var(--faint)">${gTot[g]}</span></th>`).join('')+`<th style="color:var(--gold)">Σ</th>`;
  let rows=trads.map(tr=>{
    const cells=genres.map(g=>{ const n=M[tr][g].length; const a=n/maxCell;
      const bg=n? `rgba(216,166,87,${(0.10+a*0.62).toFixed(2)})`:'transparent';
      return `<td class="${n?'has':'zero'}" ${n?`data-tr="${tr}" data-g="${g}"`:''} style="background:${bg}">${n||'·'}</td>`;}).join('');
    return `<tr><th class="rowh"><span style="color:${tradColor(tr)}">●</span> ${nameTrad(tr)}</th>${cells}<td style="color:var(--gold);font-weight:600">${tTot[tr]}</td></tr>`;
  }).join('');
  p.innerHTML = lensHead(lensById.ekoller)
    + `<div style="overflow-x:auto"><table class="matrix"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>
       <p class="note">${L('Bir hücre, o gelenek × yöntem kesişimindeki eser sayısıdır. Renk yoğunluğu sayıyla artar; dolu bir hücreye dokunarak eserleri görün.','Each cell is the number of works at that tradition × method intersection. Tap a filled cell to list the works.','كلُّ خلية عددُ المصنَّفات في تقاطع التقليد × المنهج. تزداد كثافةُ اللون بالعدد؛ انقر خلية مملوءة لسرد مصنَّفاتها.')}</p>`;
  p.querySelectorAll('td.has').forEach(td=>td.addEventListener('click',()=>{
    const tr=td.dataset.tr,g=td.dataset.g; const ws=M[tr][g].sort((a,b)=>a.death_ah-b.death_ah);
    openDrawerHTML(`<div class="dr-yr">${nameTrad(tr)} · ${nameGenre(g)}</div>
      <div class="dr-au" style="font-size:1.4rem">${t('worksN')(ws.length)}</div><div style="height:.6rem"></div>
      <div class="work-list">${ws.map(workRowHTML).join('')}</div>`);
    bindWorkRows($('#drawerIn'));
  }));
}
/* ============================================================ V. KAVRAMLAR */
let kavMode='dist';
function renderConcepts(p){
  p.innerHTML = lensHead(lensById.kavramlar)
   + `<div class="controls"><div class="seg" id="kavSeg">
        <button data-m="dist" class="on">${L('Dağılım','Distribution','توزيع')}</button>
        <button data-m="distinct">${L('Ayırt edicilik','Distinctiveness','تمايز')}</button>
        <button data-m="net">${L('Birliktelik ağı','Co-occurrence','شبكة التلازم')}</button></div></div>
      <div id="kavBody"></div>`;
  p.querySelectorAll('#kavSeg button').forEach(b=>b.addEventListener('click',()=>{
    kavMode=b.dataset.m; p.querySelectorAll('#kavSeg button').forEach(x=>x.classList.toggle('on',x===b)); drawKav();}));
  drawKav();
}
function corpusConceptMean(key){ let s=0,n=0; C.forEach(w=>{if(w.concepts[key]!=null){s+=w.concepts[key];n++;}}); return n?s/n:0; }
function drawKav(){
  const body=$('#kavBody');
  if(kavMode==='dist'){
    const rows=CO.items.map(c=>({key:c.key,label:conName(c.key),cat:c.cat,
      n:+(corpusConceptMean(c.key)).toFixed(3),color:catColor(c.cat)})).sort((a,b)=>b.n-a.n);
    const max=Math.max(...rows.map(r=>r.n),0.001);
    body.innerHTML=`<div class="card"><h3><span class="rosette">۝</span> ${L('Külliyat ortalaması — her 1000 kelimede geçiş','Corpus mean — occurrences per 1000 words','متوسّط المكتبة — ورودًا لكل 1000 كلمة')}</h3>
      ${rows.map(r=>{const pct=(r.n/max*100).toFixed(1);
        return `<div class="bar-row"><span class="bl" title="${nameCat(r.cat)}"><span class="dot" style="background:${r.color}"></span>${r.label}</span>
        <span class="bar-track"><span class="bar-fill" style="width:0;background:${r.color}" data-w="${pct}"></span></span>
        <span class="bv">${r.n.toFixed(2)}</span></div>`;}).join('')}
      <div class="legend" style="margin-top:1rem">${Object.keys(CATS).map(c=>`<i><b style="background:${catColor(c)};border-radius:2px"></b>${nameCat(c)}</i>`).join('')}</div></div>`;
    requestAnimationFrame(()=>body.querySelectorAll('.bar-fill').forEach(f=>f.style.width=f.dataset.w+'%'));
  }
  else if(kavMode==='distinct'){
    const trads=Object.keys(TRAD);
    const base={}; CO.items.forEach(c=>base[c.key]=corpusConceptMean(c.key)+0.001);
    let html=`<p class="note" style="margin-top:0">${L('Bir geleneğin, bir kavramı külliyat ortalamasına kıyasla ne kadar yoğun kullandığı (log₂ kat). Yeşil: beklenenden çok; kırmızı: az. Eş-yazımlar bu ölçüyü şişirebilir.','How heavily a tradition uses a concept versus the corpus mean (log₂ fold). Green: more than expected; red: less. Homographs may inflate this.','مدى استعمال تقليدٍ لمفهومٍ مقارنةً بمتوسّط المكتبة (أضعاف log₂). الأخضر: أكثر من المتوقَّع؛ الأحمر: أقل. وقد يضخّم المشترَكُ اللفظيُّ هذا المقياس.')}</p>
      <div class="pano-grid">`;
    trads.forEach(tr=>{
      const ws=C.filter(w=>w.trad===tr); if(!ws.length)return;
      const lift=CO.items.map(c=>{ let s=0,n=0; ws.forEach(w=>{if(w.concepts[c.key]!=null){s+=w.concepts[c.key];n++;}});
        const m=n?s/n:0; return {label:conName(c.key),l:Math.log2((m+0.001)/base[c.key])};}).sort((a,b)=>b.l-a.l);
      const top=lift.slice(0,5), bot=lift.slice(-4).reverse();
      const chip=o=>{ const pos=o.l>=0; const col=pos?cssv('--zaydi'):cssv('--ibadi');
        return `<div class="bar-row"><span class="bl">${o.label}</span>
          <span class="bar-track" style="background:rgba(255,255,255,.04)"><span class="bar-fill" style="width:${Math.min(100,Math.abs(o.l)/3*100).toFixed(0)}%;background:${col}"></span></span>
          <span class="bv" style="color:${col}">${o.l>0?'+':''}${o.l.toFixed(1)}</span></div>`;};
      html+=`<div class="card span6"><h3><span style="color:${tradColor(tr)}">●</span> ${nameTrad(tr)} <span style="color:var(--faint);font-weight:400">· ${ws.length}</span></h3>
        ${top.map(chip).join('')}<div style="height:.5rem;border-top:1px solid var(--line-soft);margin:.4rem 0"></div>${bot.map(chip).join('')}</div>`;
    });
    body.innerHTML=html+`</div>`;
  }
  else {
    body.innerHTML=`<div class="net-wrap"><svg id="kavNet"></svg></div>
      <p class="note">${L('İki kavram aynı eserde birlikte belirginleştiğinde aralarına bir kenar çizilir; kenar kalınlığı birlikte-belirginlik sayısıdır. Düğümü sürükleyin.','An edge joins two concepts that become salient together in the same work; thickness is the co-salience count. Drag a node.','يُرسَم خطٌّ بين مفهومَين يبرزان معًا في المصنَّف نفسه؛ وسماكتُه عددُ مرات التلازم. اسحب العقدة.')}</p>`;
    drawConceptNet();
  }
}
function drag(sim){ return d3.drag()
  .on('start',(e,d)=>{if(!e.active)sim.alphaTarget(.3).restart(); d.fx=d.x; d.fy=d.y;})
  .on('drag',(e,d)=>{d.fx=e.x; d.fy=e.y;})
  .on('end',(e,d)=>{if(!e.active)sim.alphaTarget(0); d.fx=null; d.fy=null;}); }
function drawConceptNet(){
  const svg=d3.select('#kavNet'); const W=Math.max(760,$('#lp-kavramlar').clientWidth-2), H=560;
  svg.attr('viewBox',`0 0 ${W} ${H}`).selectAll('*').remove();
  const nodes=CN.nodes.map(d=>({...d})); const links=CN.edges.map(d=>({source:d.s,target:d.t,w:d.w}));
  const maxW=d3.max(links,l=>l.w), maxT=d3.max(nodes,n=>n.total);
  const sim=d3.forceSimulation(nodes)
    .force('link',d3.forceLink(links).id(d=>d.id).distance(d=>70+90*(1-d.w/maxW)).strength(d=>0.05+0.5*d.w/maxW))
    .force('charge',d3.forceManyBody().strength(-260))
    .force('center',d3.forceCenter(W/2,H/2))
    .force('collide',d3.forceCollide(26));
  const link=svg.append('g').attr('stroke',cssv('--line')).selectAll('line').data(links).join('line')
    .attr('stroke-width',d=>0.5+3*d.w/maxW).attr('stroke-opacity',d=>0.15+0.5*d.w/maxW);
  const node=svg.append('g').selectAll('g').data(nodes).join('g').attr('class','node').call(drag(sim));
  node.append('circle').attr('r',d=>7+18*Math.sqrt(d.total/maxT))
    .attr('fill',d=>catColor(d.cat)).attr('fill-opacity',.85).attr('stroke',cssv('--ground')).attr('stroke-width',1.4);
  node.append('text').attr('class','nlabel').attr('text-anchor','middle').attr('dy',d=>-(10+18*Math.sqrt(d.total/maxT)))
    .text(d=> L(d.tr, d.en, d.ar));
  node.on('mousemove',(ev,d)=>{ const c=conByKey[d.id];
      showTip(`<div class="tt-t">${L(d.tr,d.en,d.ar)} ${lang!=='ar'?`<span class="ar">${d.ar}</span>`:''}</div>
        <div class="tt-m">${nameCat(d.cat)} · ${L('külliyat payı','corpus share','حصّة المكتبة')} ${(d.total).toFixed(1)}</div>
        <div class="tt-r">${esc(c.zahir)}</div>`, ev.clientX,ev.clientY);})
    .on('mouseleave',hideTip).on('click',(ev,d)=>{kavConceptFocus(d.id);});
  sim.on('tick',()=>{ link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
    node.attr('transform',d=>`translate(${d.x},${d.y})`); });
}
function kavConceptFocus(key){
  // show works where this concept is most salient
  const ranked=C.map(w=>({w,v:w.concepts[key]||0})).filter(o=>o.v>0).sort((a,b)=>b.v-a.v).slice(0,18);
  const c=conByKey[key];
  openDrawerHTML(`<div class="dr-yr">${nameCat(c.cat)}</div>
    <div class="dr-au">${conName(key)} <span class="ar">${c.ar}</span></div>
    <div class="dr-ti">${esc(c.zahir)}</div>
    <div class="dr-sec"><h4>${L('Bu kavramın en yoğun olduğu eserler','Works where this concept is densest','المصنَّفات الأكثف لهذا المفهوم')}</h4>
    <div class="work-list">${ranked.map(o=>workRowHTML(o.w)).join('')}</div></div>`);
  bindWorkRows($('#drawerIn'));
}

/* ============================================================ VI. KÜLLIYAT */
let mini=null, corpState={trad:'all',genre:'all',q:'',sort:'year'};
function ensureMini(){ if(mini)return;
  mini=new MiniSearch({fields:['atr','ttl','t'], storeFields:['w'], idField:'id',
    searchOptions:{boost:{atr:3,ttl:2}, prefix:true, fuzzy:0.2, combineWith:'AND'}});
  const metaDocs=C.map(w=>({id:'M_'+w.id, w:w.id, atr:w.author_tr+' '+w.author_en,
    ttl:w.title_en+' '+(w.title_ar||''), t:(w.city_tr||'')+' '+(w.city_en||'')}));
  mini.addAll(metaDocs); mini.addAll(CH.map(c=>({id:c.id,w:c.w,atr:c.atr,ttl:c.ttl,t:c.t})));
}
function renderCorpus(p){
  ensureMini();
  p.innerHTML = lensHead(lensById.kulliyat)
   + `<div class="controls">
       <input class="search" id="corpSearch" placeholder="${t('search_ph')}" value="${esc(corpState.q)}">
       <div class="seg" id="corpSort">
         <button data-s="year" class="on">${t('byYear')}</button>
         <button data-s="words">${t('byWords')}</button></div></div>
      <div class="controls" id="corpFilters"></div>
      <div id="corpCount" class="lbl" style="margin:.2rem 0 1rem"></div>
      <div class="work-list" id="corpList"></div>
      <div class="card" style="margin-top:2rem">
        <h3><span class="rosette">۝</span> ${L('Konkordans — terim bağlamları','Concordance — term contexts','الكشّاف — سياقات المصطلح')}</h3>
        <p class="note" style="margin-top:0">${t('conc_hint')}</p>
        <input class="search" id="concSearch" placeholder="${t('conc_ph')}" style="max-width:520px">
        <div id="concResults" style="margin-top:1rem"></div></div>`;
  buildFilterChips($('#corpFilters'), corpState, drawCorpusList);
  $('#corpSearch').addEventListener('input',e=>{corpState.q=e.target.value; drawCorpusList();});
  p.querySelectorAll('#corpSort button').forEach(b=>b.addEventListener('click',()=>{
    corpState.sort=b.dataset.s; p.querySelectorAll('#corpSort button').forEach(x=>x.classList.toggle('on',x===b)); drawCorpusList();}));
  $('#concSearch').addEventListener('input',e=>concordance(e.target.value));
  drawCorpusList();
}
function corpusResults(){
  let ids=null;
  if(corpState.q.trim()){ const res=mini.search(corpState.q.trim());
    const set=new Set(); res.forEach(r=>set.add(r.w)); ids=set; }
  let ws=C.filter(w=>(corpState.trad==='all'||w.trad===corpState.trad)
    && (corpState.genre==='all'||w.genre===corpState.genre) && (!ids||ids.has(w.id)));
  if(corpState.sort==='year') ws.sort((a,b)=>a.death_ah-b.death_ah); else ws.sort((a,b)=>b.words-a.words);
  return ws;
}
function drawCorpusList(){
  const ws=corpusResults(); const list=$('#corpList');
  $('#corpCount').textContent=t('worksN')(ws.length);
  if(!ws.length){ list.innerHTML=`<div class="empty">${t('noresult')}</div>`; return; }
  list.innerHTML=ws.map(workRowHTML).join(''); bindWorkRows(list);
}
function concordance(q){
  const box=$('#concResults'); q=q.trim();
  if(q.length<2){ box.innerHTML=''; return; }
  const res=mini.search(q,{fields:['t'],prefix:true,fuzzy:0.1}).filter(r=>String(r.id)[0]!=='M');
  const hits=[];
  for(const r of res){ const ch=CH.find(c=>String(c.id)===String(r.id)); if(!ch)continue;
    const terms=q.toLowerCase().split(/\s+/); const txt=ch.t, low=txt.toLowerCase();
    let pos=-1; for(const tm of terms){const i=low.indexOf(tm); if(i>=0){pos=i;break;}}
    let snip=txt; if(pos>=0){ const a=Math.max(0,pos-90),b=Math.min(txt.length,pos+150);
      snip=(a>0?'… ':'')+txt.slice(a,b)+(b<txt.length?' …':''); }
    let h=esc(snip); terms.forEach(tm=>{ if(tm.length>1){
      const re=new RegExp('('+tm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'); h=h.replace(re,'<mark>$1</mark>'); }});
    hits.push({ch,h}); if(hits.length>=14)break; }
  if(!hits.length){ box.innerHTML=`<div class="empty">${t('conc_none')}</div>`; return; }
  box.innerHTML=`<div class="lbl" style="margin-bottom:.6rem">${t('showing')(hits.length)}</div>`+
    hits.map(({ch,h})=>{ const w=byId[ch.w]; const isAr=ch.lang==='ara';
      return `<div class="conc"><div class="src" style="cursor:pointer" onclick="openWork('${ch.w}')">${esc(w?auName(w):ch.atr)} · <span style="font-style:italic">${esc(w?tiName(w):ch.ttl)}</span> · ${ch.ah}H</div>
        <div class="txt ${isAr?'ar':''}">${h}</div></div>`;}).join('');
}

/* ---- shared: work rows + filter chips + drawer + openWork ---- */
function workRowHTML(w){
  const tags=`<span class="tg trad" style="background:${tradColor(w.trad)}">${nameTrad(w.trad)}</span>
    <span class="tg">${nameGenre(w.genre)}</span>${w.city_tr?`<span class="tg">${esc(ctName(w))}</span>`:''}`;
  return `<div class="work-row" data-id="${w.id}">
    <div class="yr">${w.death_ah}<small>${w.death_ce} ${t('ce')}</small></div>
    <div class="mid"><div class="au">${esc(auName(w))}</div>
      <div class="ti">${esc(tiName(w))}${(w.title_ar&&lang!=='ar')?` <span class="ar">${esc(w.title_ar)}</span>`:''}</div></div>
    <div class="tags">${tags}</div></div>`;
}
function bindWorkRows(scope){ scope.querySelectorAll('.work-row').forEach(r=>
  r.addEventListener('click',()=>openWork(r.dataset.id))); }
function buildFilterChips(host, state, cb){
  const mk=(group,key,label,color)=>{ const on=state[group]===key;
    return `<button class="chip ${color?'swatch':''} ${on?'on':''}" data-g="${group}" data-k="${key}"
      style="${on&&color?`border-color:${color};color:${color}`:''}">${color?`<span class="dot" style="background:${color}"></span>`:''}${label}</button>`;};
  host.innerHTML=`<span class="lbl">${t('tradition')}</span>`
    + mk('trad','all',t('all'))
    + Object.keys(TRAD).map(k=>mk('trad',k,nameTrad(k),tradColor(k))).join('')
    + `<span class="lbl" style="margin-left:.6rem">${t('genre')}</span>`
    + mk('genre','all',t('all'))
    + Object.keys(GENRE).map(k=>mk('genre',k,nameGenre(k))).join('');
  host.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{
    state[c.dataset.g]=c.dataset.k; buildFilterChips(host,state,cb); cb();}));
}
function openWork(id){
  const w=byId[id]; if(!w)return;
  const fp=Object.entries(w.concepts).filter(([k,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const maxv=fp.length?fp[0][1]:1;
  const fpHTML=fp.map(([k,v])=>{const c=conByKey[k];
    return `<div class="bar-row"><span class="bl" style="width:140px"><span class="dot" style="background:${catColor(c.cat)}"></span>${conName(k)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${(v/maxv*100).toFixed(0)}%;background:${catColor(c.cat)}"></span></span>
      <span class="bv">${v.toFixed(2)}</span></div>`;}).join('');
  const nb=SV.filter(e=>e.s===id||e.t===id).map(e=>({o:e.s===id?e.t:e.s,w:e.w})).sort((a,b)=>b.w-a.w).slice(0,6);
  const nbHTML = nb.length? nb.map(n=>{const o=byId[n.o];
    return `<div class="nb" onclick="openWork('${n.o}')"><span>${esc(auName(o))} · <span style="color:var(--muted)">${esc(tiName(o))}</span></span><span class="w">${(n.w*100).toFixed(0)}%</span></div>`;}).join('')
    : `<div class="note">${t('noNeighbors')}</div>`;
  const meta=`<span class="tg trad" style="background:${tradColor(w.trad)}">${nameTrad(w.trad)}</span>
    <span class="tg">${nameGenre(w.genre)}</span>
    <span class="tg">${t('langs')[w.lang]||w.lang}</span>
    ${w.city_tr?`<span class="tg">${esc(ctName(w))}${(w.city_ar&&lang!=='ar')?` · <span class="ar">${esc(w.city_ar)}</span>`:''}</span>`:''}
    <span class="tg">${w.century_ah}. ${L('yy H','c AH','هـ')}</span>`;
  openDrawerHTML(`
    <div class="dr-yr">${w.death_ah} H · ${w.death_ce} ${t('ce')}</div>
    <div class="dr-au">${esc(auName(w))}${(w.author_ar&&lang!=='ar')?`<span class="ar">${esc(w.author_ar)}</span>`:''}</div>
    <div class="dr-ti">${esc(tiName(w))}${(w.title_ar&&lang!=='ar')?` · <span class="ar">${esc(w.title_ar)}</span>`:''}</div>
    <div class="dr-meta">${meta}</div>
    <div style="display:flex;gap:1.4rem;flex-wrap:wrap;font-family:var(--f-ui);font-size:.78rem;color:var(--muted)">
      <span><b style="color:var(--ivory);font-family:var(--f-disp);font-size:1.1rem">${w.words.toLocaleString(lang==='tr'?'tr-TR':lang==='ar'?'ar-EG':'en-US')}</b> ${t('dr_words')}</span></div>
    <div class="dr-sec"><h4>${t('dr_fingerprint')}</h4><div class="fp">${fpHTML||'<div class="note">—</div>'}</div></div>
    ${w.sample?`<div class="dr-sec"><h4>${t('dr_sample')}</h4><div class="sample ar">${esc(w.sample)}</div></div>`:''}
    <div class="dr-sec"><h4>${t('dr_neighbors')} <span style="color:var(--faint)">· ${L('sözcüksel','lexical','معجمي')}</span></h4><div class="neighbors">${nbHTML}</div></div>
  `);
}
function openDrawerHTML(html){ $('#drawerIn').innerHTML=html; $('#drawer').classList.add('on');
  $('#scrim').classList.add('on'); $('#drawer').setAttribute('aria-hidden','false'); }
function closeDrawer(){ $('#drawer').classList.remove('on'); $('#scrim').classList.remove('on');
  $('#drawer').setAttribute('aria-hidden','true'); hideTip(); }
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();});

/* ============================================================ VII. METINLER ARASI */
let interNode=null;
function renderInter(p){
  p.innerHTML = lensHead(lensById.metinler)
   + `<div class="controls"><span class="lbl">${L('Vurgula','Highlight','إبراز')}</span><div class="seg" id="intSeg">
        <button data-m="all" class="on">${t('all')}</button>
        ${Object.keys(TRAD).map(k=>`<button data-m="${k}" title="${nameTrad(k)}"><span style="color:${tradColor(k)}">●</span></button>`).join('')}
      </div><span class="note" style="margin:0 0 0 auto">${L('Düğümü sürükleyin · dokununca künye açılır','Drag a node · tap to open metadata','اسحب العقدة · انقر لفتح البطاقة')}</span></div>
      <div class="net-wrap"><svg id="intNet"></svg></div>`;
  p.querySelectorAll('#intSeg button').forEach(b=>b.addEventListener('click',()=>{
    p.querySelectorAll('#intSeg button').forEach(x=>x.classList.toggle('on',x===b));
    highlightInter(b.dataset.m);}));
  drawInterNet();
}
function drawInterNet(){
  const svg=d3.select('#intNet'); const W=Math.max(760,$('#lp-metinler').clientWidth-2), H=620;
  svg.attr('viewBox',`0 0 ${W} ${H}`).selectAll('*').remove();
  const ids=new Set(); SV.forEach(e=>{ids.add(e.s);ids.add(e.t);});
  const nodes=[...ids].map(id=>({id,...byId[id]}));
  const links=SV.map(e=>({source:e.s,target:e.t,w:e.w}));
  const sim=d3.forceSimulation(nodes)
    .force('link',d3.forceLink(links).id(d=>d.id).distance(d=>30+70*(1-d.w)).strength(d=>d.w*0.9))
    .force('charge',d3.forceManyBody().strength(-90))
    .force('center',d3.forceCenter(W/2,H/2))
    .force('collide',d3.forceCollide(d=>5+Math.sqrt(d.words)/260));
  const link=svg.append('g').selectAll('line').data(links).join('line')
    .attr('stroke',cssv('--line')).attr('stroke-width',d=>0.4+1.6*d.w).attr('stroke-opacity',d=>0.12+0.4*d.w);
  const node=svg.append('g').selectAll('circle').data(nodes).join('circle')
    .attr('r',d=>3+Math.sqrt(d.words)/240).attr('fill',d=>tradColor(d.trad)).attr('fill-opacity',.82)
    .attr('stroke',cssv('--ground')).attr('stroke-width',.8).attr('class','node').call(drag(sim))
    .on('mousemove',(ev,d)=>showTip(workTip(d),ev.clientX,ev.clientY))
    .on('mouseleave',hideTip).on('click',(ev,d)=>openWork(d.id));
  interNode=node;
  sim.on('tick',()=>{ link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
    node.attr('cx',d=>d.x).attr('cy',d=>d.y);});
  setTimeout(()=>sim.alphaTarget(0),5000);
}
function highlightInter(m){ if(!interNode)return;
  interNode.attr('fill-opacity',d=> m==='all'?.82 : (d.trad===m?.95:.08))
    .attr('r',d=>{const base=3+Math.sqrt(d.words)/240; return m!=='all'&&d.trad===m?base*1.5:base;}); }

/* ============================================================ VIII. AKTARIM (curated) */
/* Directed influence edges (older → younger), referencing real corpus works.
   Compiled from standard tafsīr historiography; interpretive & non-exhaustive. */
const TRANS=[
 ['0068.CabdAllahIbnCabbas.GharibQuran','0104.MujahidIbnJabr.Tafsir'],
 ['0068.CabdAllahIbnCabbas.GharibQuran','0310.Tabari.JamicBayan'],
 ['0104.MujahidIbnJabr.Tafsir','0310.Tabari.JamicBayan'],
 ['0161.SufyanThawri.Tafsir','0310.Tabari.JamicBayan'],
 ['0211.CabdRazzaqSancani.Tafsir','0310.Tabari.JamicBayan'],
 ['0310.Tabari.JamicBayan','0327.IbnAbiHatimRazi.Tafsir'],
 ['0310.Tabari.JamicBayan','0427.AbuIshaqThaclabi.KashfWaBayan'],
 ['0310.Tabari.JamicBayan','0671.AbuCabdAllahQurtubi.JamicLiAhkamQuran'],
 ['0310.Tabari.JamicBayan','0774.IbnKathir.TafsirQuran'],
 ['0310.Tabari.JamicBayan','0911.Suyuti.DurrManthur'],
 ['0327.IbnAbiHatimRazi.Tafsir','0774.IbnKathir.TafsirQuran'],
 ['0427.AbuIshaqThaclabi.KashfWaBayan','0468.IbnAhmadWahidiNaysaburi.TafsirBasit'],
 ['0427.AbuIshaqThaclabi.KashfWaBayan','0510.IbnMascudBaghawi.Tafsir'],
 ['0510.IbnMascudBaghawi.Tafsir','0741.KhazinBaghdadi.LubabTawil'],
 ['0510.IbnMascudBaghawi.Tafsir','0685.NasirDinBaydawi.AnwarTanzil'],
 ['0538.JarAllahZamakhshari.Kashshaf','0685.NasirDinBaydawi.AnwarTanzil'],
 ['0538.JarAllahZamakhshari.Kashshaf','0710.IbnAhmadHafizDinNasafi.Tafsir'],
 ['0538.JarAllahZamakhshari.Kashshaf','0745.AbuHayyanGharnati.TafsirBahrMuhit'],
 ['0538.JarAllahZamakhshari.Kashshaf','1270.ShihabDinAlusi.RuhMacani'],
 ['0538.JarAllahZamakhshari.Kashshaf','1393.MuhammadTahirIbnCashurTunisi.TahrirWaTanwir'],
 ['0541.IbnCatiyyaAndalusi.MuharrarWajiz','0671.AbuCabdAllahQurtubi.JamicLiAhkamQuran'],
 ['0541.IbnCatiyyaAndalusi.MuharrarWajiz','0745.AbuHayyanGharnati.TafsirBahrMuhit'],
 ['0541.IbnCatiyyaAndalusi.MuharrarWajiz','1393.MuhammadTahirIbnCashurTunisi.TahrirWaTanwir'],
 ['0333.AbuMansurMaturidi.Tafsir','0537.NajmDinAbuHafsNasafi.TaysirFiTafsir'],
 ['0606.FakhrDinRazi.MafatihGhayb','0685.NasirDinBaydawi.AnwarTanzil'],
 ['0606.FakhrDinRazi.MafatihGhayb','0710.IbnAhmadHafizDinNasafi.Tafsir'],
 ['0606.FakhrDinRazi.MafatihGhayb','1270.ShihabDinAlusi.RuhMacani'],
 ['0685.NasirDinBaydawi.AnwarTanzil','0950.MuhyiDinShaykhZada.HashiyaCalaTafsirBaydawi'],
 ['0685.NasirDinBaydawi.AnwarTanzil','1069.ShihabDinKhafaji.HashiyaCalaTafsirBaydawi'],
 ['0685.NasirDinBaydawi.AnwarTanzil','1270.ShihabDinAlusi.RuhMacani'],
 ['0911.Suyuti.TafsirJalalayn','1241.IbnMuhammadKhalwatiSawi.HashiyaCalaTafsirJalalayn'],
 ['0911.Suyuti.TafsirJalalayn','1450.CabdKarimKhudayr.TacliqCalaTafsirJalalayn'],
 ['0728.IbnTaymiyya.MuqaddimaFiUsulTafsir','0751.IbnQayyimJawziyya.TafsirQuran'],
 ['0728.IbnTaymiyya.MuqaddimaFiUsulTafsir','0774.IbnKathir.TafsirQuran'],
 ['0728.IbnTaymiyya.MuqaddimaFiUsulTafsir','1255.Shawkani.FathQadir'],
 ['0728.IbnTaymiyya.MuqaddimaFiUsulTafsir','1393.MuhammadAminShanqiti.AdwaBayan'],
 ['0728.IbnTaymiyya.MuqaddimaFiUsulTafsir','1450.BashirJawadQaysi.RayIbnTaymiyyaFiTafasir'],
 ['0774.IbnKathir.TafsirQuran','1442.MuhammadCaliSabuni.MukhtasarTafsirIbnKathir'],
 ['0283.SahlTustari.Tafsir','0412.Sulami.Tafsir'],
 ['0412.Sulami.Tafsir','0465.IbnHawazinQushayri.LataifIsharat'],
 ['0283.SahlTustari.Tafsir','0465.IbnHawazinQushayri.LataifIsharat'],
 ['0638.IbnCarabi.Tafsir','0988.FathAllahKashani.ZubdatTafasir'],
 ['0638.IbnCarabi.Tafsir','1350.SultanCaliShahGanabadhi.TafsirBayanSacada'],
 ['0465.IbnHawazinQushayri.LataifIsharat','1350.SultanCaliShahGanabadhi.TafsirBayanSacada'],
 ['0329.IbnIbrahimQummi.Tafsir','0460.ShaykhTusi.Tibyan'],
 ['0320.IbnMascudCayyashi.Tafsir','0460.ShaykhTusi.Tibyan'],
 ['0460.ShaykhTusi.Tibyan','0548.IbnHasanTabarsi.TafsirMajmacBayan'],
 ['0460.ShaykhTusi.Tibyan','1091.MuhammadMuhsinFaydKashani.TafsirSafi'],
 ['0329.IbnIbrahimQummi.Tafsir','1091.MuhammadMuhsinFaydKashani.TafsirSafi'],
 ['0320.IbnMascudCayyashi.Tafsir','1112.IbnJumcaHuwayzi.TafsirNurThaqalayn'],
 ['0329.IbnIbrahimQummi.Tafsir','1125.MirzaMuhammadMashhadi.TafsirKanzDaqaiq'],
 ['0260.ImamCaskari.Tafsir','1091.MuhammadMuhsinFaydKashani.TafsirSafi'],
 ['0548.IbnHasanTabarsi.TafsirMajmacBayan','1402.SayyidTabatabai.TafsirMizan'],
 ['1091.MuhammadMuhsinFaydKashani.TafsirSafi','1402.SayyidTabatabai.TafsirMizan'],
 ['1402.SayyidTabatabai.TafsirMizan','1450.NasirMakarimShirazi.AmthalFiTafsir'],
 ['1402.SayyidTabatabai.TafsirMizan','1431.MuhammadHusaynFadlAllah.TafsirMinWahyQuran'],
 ['0548.IbnHasanTabarsi.TafsirMajmacBayan','1450.NasirMakarimShirazi.AmthalFiTafsir'],
 ['0122.ZaydIbnCali.TafsirGharibQuran','0246.QasimRassi.TafsirQuran'],
 ['0246.QasimRassi.TafsirQuran','0298.HadiIlaHaqqYahya.TafsirKursi'],
 ['0298.HadiIlaHaqqYahya.TafsirKursi','0494.HakimJushami.TahdhibFiTafsir'],
 ['0538.JarAllahZamakhshari.Kashshaf','0494.HakimJushami.TahdhibFiTafsir'],
 ['0280.HudHawwari.Tafsir','1207.SacidKindi.TafsirMuyassar'],
 ['0280.HudHawwari.Tafsir','1332.QutbAtfayyish.Tafsir'],
 ['1332.QutbAtfayyish.Tafsir','1450.AhmadBinHamadKhalili.JawahirTafasir'],
 ['1207.SacidKindi.TafsirMuyassar','1450.AhmadBinHamadKhalili.JawahirTafasir'],
];
function renderTransmission(p){
  p.innerHTML = lensHead(lensById.aktarim)
   + `<div class="net-wrap"><svg id="transNet"></svg></div>
      <div class="legend" id="transLegend"></div>
      <p class="note">${lang==='ar'?`تضمّ هذه الشبكةُ ${TRANS.length} خطَّ تأثيرٍ كبيرًا منتقاةً يدويًّا: علاقاتٌ مذكورةٌ صراحةً في تاريخ التفسير الكلاسيكي باتجاهٍ وقصدٍ موثَّقَين. وهي ناقصةٌ قابلةٌ للنقاش وأطروحةٌ <b>لا إحصاء</b> كسائر المناظير. تشير الأسهمُ من المؤثِّر إلى المتأثِّر. اسحب العقدة.`:lang==='tr'?`Bu ağ ${TRANS.length} büyük tesir bağı içerir ve elle seçilmiştir: klasik tefsir tarihçiliğinde açıkça anılan, yön ve niyeti belgelenmiş ilişkiler. Eksiktir, tartışmaya açıktır ve bir <b>tezdir</b> — diğer mercekler gibi salt sayım değil. Oklar etkileyenden etkilenene doğrudur. Düğümü sürükleyin.`:`This graph holds ${TRANS.length} major lines of influence, hand-curated: relations explicitly noted in classical tafsīr historiography with documented direction and intent. It is partial, contestable, and a <b>thesis</b> — not a bare count like the other lenses. Arrows run influencer → influenced. Drag a node.`}</p>`;
  $('#transLegend').innerHTML=Object.keys(TRAD).map(k=>`<i><b style="background:${tradColor(k)}"></b>${nameTrad(k)}</i>`).join('');
  drawTransNet();
}
function drawTransNet(){
  const svg=d3.select('#transNet'); const W=Math.max(760,$('#lp-aktarim').clientWidth-2), H=680;
  svg.attr('viewBox',`0 0 ${W} ${H}`).selectAll('*').remove();
  const ids=new Set(); TRANS.forEach(([a,b])=>{ids.add(a);ids.add(b);});
  const deg={}; TRANS.forEach(([a,b])=>{deg[a]=(deg[a]||0)+1; deg[b]=(deg[b]||0)+1;});
  const nodes=[...ids].map(id=>({id,...byId[id],deg:deg[id]||1}));
  const links=TRANS.map(([a,b])=>({source:a,target:b}));
  svg.append('defs').html(`<marker id="arrow" viewBox="0 -5 10 10" refX="16" refY="0" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0,-4L9,0L0,4" fill="${cssv('--gold-deep')}" opacity=".8"/></marker>`);
  const sim=d3.forceSimulation(nodes)
    .force('link',d3.forceLink(links).id(d=>d.id).distance(95).strength(.4))
    .force('charge',d3.forceManyBody().strength(-420))
    .force('center',d3.forceCenter(W/2,H/2))
    .force('x',d3.forceX(d=>W*(d.death_ah/1480)).strength(0.28))
    .force('collide',d3.forceCollide(d=>16+d.deg*1.5));
  const link=svg.append('g').selectAll('line').data(links).join('line')
    .attr('stroke',cssv('--gold-deep')).attr('stroke-width',1).attr('stroke-opacity',.34).attr('marker-end','url(#arrow)');
  const node=svg.append('g').selectAll('g').data(nodes).join('g').attr('class','node').call(drag(sim));
  node.append('circle').attr('r',d=>5+Math.sqrt(d.deg)*3.4).attr('fill',d=>tradColor(d.trad))
    .attr('fill-opacity',.86).attr('stroke',cssv('--ground')).attr('stroke-width',1.4);
  node.append('text').attr('class','nlabel').attr('text-anchor','middle').attr('dy',d=>-(8+Math.sqrt(d.deg)*3.4))
    .text(d=>auName(d)).style('font-size',d=>d.deg>=4?'11px':'9.5px').style('fill',d=>d.deg>=4?cssv('--ivory'):cssv('--ivory-dim'));
  node.on('mousemove',(ev,d)=>{
      const outs=TRANS.filter(([a])=>a===d.id).map(([,b])=>auName(byId[b]));
      const ins=TRANS.filter(([,b])=>b===d.id).map(([a])=>auName(byId[a]));
      showTip(`<div class="tt-t">${esc(auName(d))}</div>
        <div class="tt-m">${d.death_ah}H · ${nameTrad(d.trad)} · ${esc(tiName(d))}</div>
        ${ins.length?`<div class="tt-r"><b style="color:var(--teal)">${L('beslendiği','draws on','يستمدّ من')}:</b> ${ins.map(esc).join(' · ')}</div>`:''}
        ${outs.length?`<div class="tt-r"><b style="color:var(--gold)">${L('etkilediği','influenced','أثّر في')}:</b> ${outs.map(esc).join(' · ')}</div>`:''}`,
        ev.clientX,ev.clientY);})
    .on('mouseleave',hideTip).on('click',(ev,d)=>openWork(d.id));
  sim.on('tick',()=>{ link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
    node.attr('transform',d=>`translate(${d.x},${d.y})`);});
  setTimeout(()=>sim.alphaTarget(0),6000);
}

/* ====== (init relocated to end of part 4) ====== */
/* ============================================================ PART 4
   Two new analytical lenses, computed entirely from the embedded corpus:
   · renderFlow    — concept-family weight across the Hijri centuries (stacked flow)
   · renderCompare — tradition radar + head-to-head two-work comparison
   All visuals are hand-rolled SVG (no d3 scales/stack) to stay dependency-light
   and testable in the headless harness.                                        */

/* shared: collapse a work's 29 concept values into the 7 family buckets */
function familyVec(w){
  const v={}; for(const k in CATS) v[k]=0;
  for(const key in w.concepts){ const c=conByKey[key]; if(c) v[c.cat]+=(w.concepts[key]||0); }
  return v;
}

/* ----------------------------------------------------------- VI · AKIŞ */
let flowMode='share';   // 'share' | 'abs'
let flowFocus=null;     // a cat key to spotlight, or null

function flowData(){
  const buckets={}; C.forEach(w=>{ const y=w.century_ah; if(y==null) return; (buckets[y]=buckets[y]||[]).push(w); });
  const years=Object.keys(buckets).map(Number).sort((a,b)=>a-b);
  const catKeys=Object.keys(CATS);
  const rows=years.map(y=>{
    const ws=buckets[y]; const acc={}; catKeys.forEach(k=>acc[k]=0);
    ws.forEach(w=>{ const fv=familyVec(w); catKeys.forEach(k=>acc[k]+=fv[k]); });
    catKeys.forEach(k=>acc[k]/=ws.length);            // mean per work in that century
    const total=catKeys.reduce((s,k)=>s+acc[k],0)||1;
    return {y, n:ws.length, vals:acc, total};
  });
  return {years, catKeys, rows};
}

function renderFlow(p){
  p.innerHTML = lensHead(lensById.akis)
   + `<div class="controls">
        <div class="seg" id="flowSeg">
          <button data-m="share" class="on">${L('Pay (%)','Share (%)','حصّة (%)')}</button>
          <button data-m="abs">${L('Yoğunluk','Density','كثافة')}</button>
        </div>
        <span style="flex:1"></span>
        <span class="note" style="margin:0">${L('Yatay eksen: Hicrî yüzyıl','Horizontal: Hijri century','المحور الأفقي: القرن الهجري')}</span>
      </div>
      <div class="map-wrap" style="background:radial-gradient(130% 130% at 50% 0%,#1c2233,#12151f)"><svg id="flowSvg"></svg></div>
      <div class="legend" id="flowLegend"></div>`;
  p.querySelectorAll('#flowSeg button').forEach(b=>b.addEventListener('click',()=>{
    flowMode=b.dataset.m;
    p.querySelectorAll('#flowSeg button').forEach(x=>x.classList.toggle('on',x===b));
    drawFlow();
  }));
  $('#flowLegend').innerHTML=Object.keys(CATS).map(c=>
    `<i data-cat="${c}" style="cursor:pointer"><b style="background:${catColor(c)};border-radius:2px"></b>${nameCat(c)}</i>`).join('');
  $('#flowLegend').querySelectorAll('i').forEach(it=>it.addEventListener('click',()=>{
    flowFocus = (flowFocus===it.dataset.cat) ? null : it.dataset.cat;
    $('#flowLegend').querySelectorAll('i').forEach(x=>x.style.opacity = (flowFocus&&flowFocus!==x.dataset.cat)?.4:1);
    drawFlow();
  }));
  drawFlow();
}

function drawFlow(){
  const svg=$('#flowSvg'); if(!svg) return; const host=$('#lp-akis');
  const W=Math.max(720,(host?host.clientWidth:0)-2)||720, H=470, padL=46, padR=18, padT=18, padB=46;
  const innerH=H-padT-padB;
  const {years, catKeys, rows}=flowData();
  const n=years.length;
  const xAt = i => padL + (n<=1?0:(i/(n-1))*(W-padL-padR));
  const yMaxAbs=Math.max(...rows.map(r=>r.total))||1;
  const yAt = frac => padT+innerH-frac*innerH;     // frac in 0..1

  // stack the families bottom→top
  let base=years.map(()=>0); const layers=[];
  catKeys.forEach(k=>{
    const top=rows.map((r,i)=>{
      const val = flowMode==='share' ? r.vals[k]/r.total : r.vals[k]/yMaxAbs;
      return base[i]+val;
    });
    layers.push({k, base:base.slice(), top}); base=top;
  });

  // grid + axis labels
  let g='';
  [0,.25,.5,.75,1].forEach(tk=>{ const yy=yAt(tk);
    const lab = flowMode==='share' ? Math.round(tk*100)+'%' : (tk*yMaxAbs).toFixed(1);
    g+=`<line x1="${padL}" y1="${yy.toFixed(1)}" x2="${W-padR}" y2="${yy.toFixed(1)}" stroke="${cssv('--line-soft')}"/>`
     + `<text x="${padL-8}" y="${(yy+3).toFixed(1)}" text-anchor="end" font-family="Archivo" font-size="10" fill="${cssv('--faint')}">${lab}</text>`;});
  years.forEach((y,i)=>{ const xx=xAt(i);
    g+=`<text x="${xx.toFixed(1)}" y="${(H-padB+18).toFixed(1)}" text-anchor="middle" font-family="Archivo" font-size="10" fill="${cssv('--faint')}">${y}</text>`;});
  g+=`<text x="${padL}" y="${H-7}" font-family="Archivo" font-size="9" letter-spacing="2" fill="${cssv('--faint')}">${L('YÜZYIL (H)','CENTURY (AH)','القرن (هـ)')}</text>`;

  // stacked areas
  let areas='';
  layers.forEach(layer=>{ const col=catColor(layer.k); const dim = flowFocus && flowFocus!==layer.k;
    const topPts =layer.top.map((v,i)=>`${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`);
    const basePts=layer.base.map((v,i)=>`${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).reverse();
    areas+=`<path d="M${topPts.join(' L')} L${basePts.join(' L')} Z" fill="${col}" fill-opacity="${dim?0.07:0.6}" stroke="${col}" stroke-opacity="${dim?0.12:0.55}" stroke-width="1"/>`;});

  // invisible hover columns per century
  let hit='';
  years.forEach((y,i)=>{ const xx=xAt(i);
    const halfL=i===0?12:(xx-xAt(i-1))/2, halfR=i===n-1?12:(xAt(i+1)-xx)/2;
    hit+=`<rect class="flow-col" data-i="${i}" x="${(xx-halfL).toFixed(1)}" y="${padT}" width="${(halfL+halfR).toFixed(1)}" height="${innerH}" fill="transparent" style="cursor:pointer"/>`;});

  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svg.style.width='100%'; svg.style.height='auto';
  svg.innerHTML=`<g>${g}</g><g>${areas}</g>`
    +`<line class="flow-cursor" x1="0" y1="${padT}" x2="0" y2="${padT+innerH}" stroke="${cssv('--gold')}" stroke-opacity="0" stroke-dasharray="3 3"/><g>${hit}</g>`;

  const cursor=svg.querySelector('.flow-cursor');
  svg.querySelectorAll('.flow-col').forEach(rect=>{
    const i=+rect.dataset.i, r=rows[i], xx=xAt(i);
    rect.addEventListener('mousemove',ev=>{
      cursor.setAttribute('x1',xx); cursor.setAttribute('x2',xx); cursor.setAttribute('stroke-opacity','.5');
      const ranked=catKeys.map(k=>({k,v:r.vals[k],share:r.vals[k]/r.total})).sort((a,b)=>b.v-a.v).slice(0,4);
      const rowsHtml=ranked.map(o=>`<div><span style="color:${catColor(o.k)}">●</span> ${nameCat(o.k)} — ${(o.share*100).toFixed(0)}%</div>`).join('');
      showTip(`<div class="tt-t">${r.y}. ${L('yüzyıl','century','قرن')} (H)</div><div class="tt-m">${t('worksN')(r.n)}</div><div class="tt-r">${rowsHtml}</div>`, ev.clientX, ev.clientY);
    });
    rect.addEventListener('mouseleave',()=>{ hideTip(); cursor.setAttribute('stroke-opacity','0'); });
    rect.addEventListener('click',()=>openCentury(r.y));
  });
}

function openCentury(y){
  const ws=C.filter(w=>w.century_ah===y).sort((a,b)=>a.death_ah-b.death_ah);
  openDrawerHTML(`<div class="dr-yr">${L('Yüzyıl','Century','القرن')} ${y} H</div>
    <div class="dr-au" style="font-size:1.6rem">${t('worksN')(ws.length)}</div>
    <div style="height:.7rem"></div>
    <div class="work-list">${ws.map(workRowHTML).join('')}</div>`);
  bindWorkRows($('#drawerIn'));
}

/* ----------------------------------------------------------- VII · MUKAYESE */
let cmpMode='trad';     // 'trad' | 'works'
let cmpA=null, cmpB=null;
let cmpTradOff={};      // tradition key -> hidden

function traditionVec(tr){
  const ws=C.filter(w=>w.trad===tr); const acc={}; Object.keys(CATS).forEach(k=>acc[k]=0);
  ws.forEach(w=>{ const fv=familyVec(w); for(const k in fv) acc[k]+=fv[k]; });
  Object.keys(acc).forEach(k=>acc[k]/=(ws.length||1));
  return {n:ws.length, vals:acc};
}

function renderCompare(p){
  p.innerHTML = lensHead(lensById.mukayese)
   + `<div class="controls">
        <div class="seg" id="cmpSeg">
          <button data-m="trad" class="on">${L('Gelenekler','Traditions','التقاليد')}</button>
          <button data-m="works">${L('İki eser','Two works','مصنَّفان')}</button>
        </div>
      </div>
      <div id="cmpBody"></div>`;
  p.querySelectorAll('#cmpSeg button').forEach(b=>b.addEventListener('click',()=>{
    cmpMode=b.dataset.m;
    p.querySelectorAll('#cmpSeg button').forEach(x=>x.classList.toggle('on',x===b));
    drawCompare();
  }));
  drawCompare();
}

function drawCompare(){
  const body=$('#cmpBody'); if(!body) return;
  if(cmpMode==='trad'){
    body.innerHTML=`<div class="net-wrap" style="background:radial-gradient(130% 130% at 50% 0%,#1c2233,#12151f)"><svg id="radarSvg"></svg></div>
      <div class="legend" id="radarLegend"></div>
      <p class="note">${L(
        'Her eksen bir kavram ailesidir; köşe, o gelenekteki eserlerin o ailedeki ortalama yoğunluğudur (eksen başına en yüksek gelenek dış halkaya değer). Bir geleneği gizlemek için göstergeye dokunun. Renkler ekol geleneğini verir.',
        'Each axis is a concept family; a vertex is the mean density of that family across a tradition\u2019s works (the strongest tradition per axis touches the outer ring). Tap the legend to hide a tradition. Colours encode the school.',
        'كلُّ محورٍ أسرةُ مفاهيم؛ والرأسُ متوسّطُ كثافة تلك الأسرة في مصنَّفات التقليد (أقوى تقليدٍ لكلّ محور يلامس الحلقة الخارجية). انقر الوسيلة لإخفاء تقليد. وتدلّ الألوانُ على المدرسة.')}</p>`;
    drawRadar();
  } else {
    drawWorksCompare(body);
  }
}

function drawRadar(){
  const svg=$('#radarSvg'); if(!svg) return; const host=$('#lp-mukayese');
  const W=Math.max(680,(host?host.clientWidth:0)-2)||680, H=560, cx=W/2, cy=H/2+4, R=Math.min(W,H)/2-92;
  const cats=Object.keys(CATS), A=cats.length;
  const ang=i=>-Math.PI/2 + i*2*Math.PI/A;
  const trads=Object.keys(TRAD);
  const vecs={}; trads.forEach(tr=>vecs[tr]=traditionVec(tr));
  const axMax={}; cats.forEach(k=>{ axMax[k]=Math.max(...trads.map(tr=>vecs[tr].vals[k]))||1; });

  let g='';
  [.25,.5,.75,1].forEach(rr=>{ const pts=cats.map((k,i)=>{const a=ang(i);return `${(cx+Math.cos(a)*R*rr).toFixed(1)},${(cy+Math.sin(a)*R*rr).toFixed(1)}`;}).join(' ');
    g+=`<polygon points="${pts}" fill="none" stroke="${cssv('--line-soft')}" stroke-width="1"/>`;});
  cats.forEach((k,i)=>{ const a=ang(i), ex=cx+Math.cos(a)*R, ey=cy+Math.sin(a)*R;
    g+=`<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${cssv('--line')}" stroke-width="1"/>`;
    const lx=cx+Math.cos(a)*(R+26), ly=cy+Math.sin(a)*(R+26);
    const anchor=Math.abs(Math.cos(a))<0.34?'middle':(Math.cos(a)>0?'start':'end');
    g+=`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" font-family="${lang==='ar'?'Amiri,serif':'Archivo'}" font-size="${lang==='ar'?13:11}" fill="${catColor(k)}">${nameCat(k)}</text>`;});

  let polys='';
  trads.forEach(tr=>{ if(cmpTradOff[tr]) return; const col=tradColor(tr);
    const pts=cats.map((k,i)=>{ const a=ang(i), v=vecs[tr].vals[k]/axMax[k]; return [cx+Math.cos(a)*R*v, cy+Math.sin(a)*R*v]; });
    const path=pts.map(pp=>pp.map(v=>v.toFixed(1)).join(',')).join(' ');
    polys+=`<polygon points="${path}" fill="${col}" fill-opacity=".10" stroke="${col}" stroke-width="2" stroke-opacity=".9"/>`;
    pts.forEach(pp=>{ polys+=`<circle cx="${pp[0].toFixed(1)}" cy="${pp[1].toFixed(1)}" r="3" fill="${col}"/>`; });
  });

  svg.setAttribute('viewBox',`0 0 ${W} ${H}`); svg.style.width='100%'; svg.style.height='auto';
  svg.innerHTML=`<g>${g}</g><g>${polys}</g>`;

  $('#radarLegend').innerHTML=trads.map(tr=>
    `<i data-tr="${tr}" style="cursor:pointer;opacity:${cmpTradOff[tr]?.4:1}"><b style="background:${tradColor(tr)}"></b>${nameTrad(tr)} <span style="color:var(--faint)">· ${vecs[tr].n}</span></i>`).join('');
  $('#radarLegend').querySelectorAll('i').forEach(it=>it.addEventListener('click',()=>{
    const tr=it.dataset.tr; cmpTradOff[tr]=!cmpTradOff[tr]; drawRadar();
  }));
}

function jaccardEdge(a,b){ return SV.find(e=>(e.s===a&&e.t===b)||(e.s===b&&e.t===a)) || null; }
function cosineConcepts(wa,wb){
  let dot=0,na=0,nb=0;
  CO.items.forEach(c=>{ const x=wa.concepts[c.key]||0, y=wb.concepts[c.key]||0; dot+=x*y; na+=x*x; nb+=y*y; });
  return (na&&nb)? dot/Math.sqrt(na*nb) : 0;
}

function drawWorksCompare(body){
  const sorted=C.slice().sort((a,b)=>a.death_ah-b.death_ah);
  if(cmpA==null) cmpA=sorted[0].id;
  if(cmpB==null) cmpB=(sorted.find(w=>w.trad!==byId[cmpA].trad)||sorted[Math.min(sorted.length-1,40)]).id;
  const opt=w=>`<option value="${w.id}">${esc(auName(w))} — ${esc(tiName(w))} (${w.death_ah}H)</option>`;
  const opts=sorted.map(opt).join('');
  body.innerHTML=`<div class="cmp-pick">
      <label class="cmp-sel"><span class="cb-key a"></span><select id="cmpSelA" class="search sel">${opts}</select></label>
      <span class="cmp-vs">⇄</span>
      <label class="cmp-sel"><span class="cb-key b"></span><select id="cmpSelB" class="search sel">${opts}</select></label>
    </div>
    <div id="cmpOut"></div>`;
  $('#cmpSelA').value=cmpA; $('#cmpSelB').value=cmpB;
  $('#cmpSelA').addEventListener('change',e=>{ cmpA=e.target.value; renderCmpOut(); });
  $('#cmpSelB').addEventListener('change',e=>{ cmpB=e.target.value; renderCmpOut(); });
  renderCmpOut();
}

function renderCmpOut(){
  const out=$('#cmpOut'); if(!out) return;
  const wa=byId[cmpA], wb=byId[cmpB]; if(!wa||!wb){ out.innerHTML=''; return; }
  const ranked=CO.items.map(c=>({k:c.key, cat:c.cat, a:wa.concepts[c.key]||0, b:wb.concepts[c.key]||0}))
    .filter(o=>o.a+o.b>0).sort((x,y)=>(y.a+y.b)-(x.a+x.b)).slice(0,12);
  const maxv=Math.max(0.001,...ranked.map(o=>Math.max(o.a,o.b)));
  const bars=ranked.map(o=>`<div class="cmp-row">
      <div class="cmp-k"><span class="dot" style="background:${catColor(o.cat)}"></span>${conName(o.k)}</div>
      <div class="cmp-bars">
        <div class="cb a"><span style="width:${(o.a/maxv*100).toFixed(0)}%"></span></div>
        <div class="cb b"><span style="width:${(o.b/maxv*100).toFixed(0)}%"></span></div>
      </div></div>`).join('');

  const edge=jaccardEdge(cmpA,cmpB), cos=cosineConcepts(wa,wb);
  const simTxt = edge
    ? `${L('Sözcüksel benzerlik','Lexical similarity','تشابه معجمي')} (Jaccard) <b>${(edge.w*100).toFixed(0)}%</b> · ${L('ortak belirgin terim','shared salient terms','مصطلحات بارزة مشتركة')} <b>${edge.shared}</b>`
    : `${L('Belirgin sözcük örtüşmesi eşik altında','Salient-vocabulary overlap below threshold','تداخل المفردات البارزة دون العتبة')}`;

  out.innerHTML=`
    <div class="cmp-head">
      <div class="cmp-card" style="border-color:${tradColor(wa.trad)}">
        <div class="cmp-tag" style="color:${tradColor(wa.trad)}">A · ${nameTrad(wa.trad)} · ${nameGenre(wa.genre)}</div>
        <div class="cmp-au">${esc(auName(wa))}</div>
        <div class="cmp-ti">${esc(tiName(wa))} · ${wa.death_ah}H</div></div>
      <div class="cmp-card" style="border-color:${tradColor(wb.trad)}">
        <div class="cmp-tag" style="color:${tradColor(wb.trad)}">B · ${nameTrad(wb.trad)} · ${nameGenre(wb.genre)}</div>
        <div class="cmp-au">${esc(auName(wb))}</div>
        <div class="cmp-ti">${esc(tiName(wb))} · ${wb.death_ah}H</div></div>
    </div>
    <div class="cmp-sim">
      <span class="legend-mini"><span class="cb-key a"></span>A</span>
      <span class="legend-mini"><span class="cb-key b"></span>B</span>
      <span class="cmp-simtxt">${simTxt} · ${L('kavram benzerliği','concept similarity','تشابه المفاهيم')} (cosine) <b>${(cos*100).toFixed(0)}%</b></span>
    </div>
    <div class="cmp-list">${bars||'<div class="note">—</div>'}</div>
    <p class="note">${L(
      'Çubuklar, iki eserde en baskın kavramların normalize yoğunluğunu yan yana koyar. Bu bir benzerlik/farklılık betimidir; üstünlük yahut isâbet ölçüsü değildir. Jaccard yalnızca eşik üstü çiftler için vardır; aksi hâlde kavram kosinüsü gösterilir.',
      'The bars place the two works\u2019 most dominant concepts side by side by normalised density. This describes similarity/difference; it is not a measure of superiority or correctness. Jaccard exists only for above-threshold pairs; otherwise the concept cosine is shown.',
      'تضع الأعمدةُ أبرزَ مفاهيم المصنَّفَين جنبًا إلى جنب بكثافةٍ مُعيَّرة. هذا وصفٌ للتشابه/الاختلاف لا مقياسٌ للأفضلية أو الصواب. وتشابُه جاكار متاحٌ للأزواج فوق العتبة فقط؛ وإلا عُرض جيبُ تمام المفاهيم.')}</p>`;
}

/* ----------------------------------------------------------- VIII · KAVRAM UZAYI */
let lsColor='trad';     // 'trad' | 'cluster' | 'century'
let lsHull=true;
const CLPAL=['#d8a657','#7daea3','#7aa2c4','#c98a76','#b18ac0'];
const clColor=i=>CLPAL[((i%CLPAL.length)+CLPAL.length)%CLPAL.length];
function hex2rgb(h){ h=h.replace('#',''); return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
function lerpColor(a,b,tt){ const pa=hex2rgb(a),pb=hex2rgb(b);
  return `rgb(${Math.round(pa[0]+(pb[0]-pa[0])*tt)},${Math.round(pa[1]+(pb[1]-pa[1])*tt)},${Math.round(pa[2]+(pb[2]-pa[2])*tt)})`; }
function centuryColor(cy){ const cs=C.map(w=>w.century_ah); const lo=Math.min(...cs),hi=Math.max(...cs);
  return lerpColor('#7a4f12','#edca7e',(cy-lo)/((hi-lo)||1)); }
function convexHull(pts){
  const P=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]); if(P.length<3) return P;
  const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[]; for(const p of P){ while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop(); lo.push(p); }
  const up=[]; for(let i=P.length-1;i>=0;i--){ const p=P[i]; while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop(); up.push(p); }
  lo.pop(); up.pop(); return lo.concat(up);
}
const lsWorkColor=w=> lsColor==='trad'?tradColor(w.trad) : lsColor==='cluster'?clColor(w.cl) : centuryColor(w.century_ah);

function renderLandscape(p){
  if(!C.length || C[0].px===undefined || !ST.pca){
    p.innerHTML = lensHead(lensById.uzay)
      + `<p class="empty">${L('Bu mercek için PCA verisi yok. Veri hattında compute_pca.py ve compute_clusters.py adımlarını çalıştırın.','Conceptual-space data is missing. Run compute_pca.py and compute_clusters.py in the pipeline.','بيانات هذا المنظور غير متوفّرة. شغّل compute_pca.py و compute_clusters.py في خطّ المعالجة.')}</p>`;
    return;
  }
  p.innerHTML = lensHead(lensById.uzay)
   + `<div class="controls">
        <span class="lbl">${L('Renk','Colour','اللون')}</span>
        <div class="seg" id="lsSeg">
          <button data-c="trad" class="on">${L('Gelenek','Tradition','التقليد')}</button>
          <button data-c="cluster">${L('Yöntem kümesi','Method cluster','عنقود منهجي')}</button>
          <button data-c="century">${L('Yüzyıl','Century','القرن')}</button>
        </div>
        <span class="chip" id="lsHullChip" style="cursor:pointer"><span class="dot" style="background:var(--gold)"></span>${L('Konturlar','Hulls','الأُطُر')}</span>
        <span style="flex:1"></span>
        <span class="note" style="margin:0">${L('PCA · açıklanan varyans','PCA · explained variance','PCA · التباين المُفسَّر')} ${(ST.pca.var[0]*100).toFixed(0)}% + ${(ST.pca.var[1]*100).toFixed(0)}%</span>
      </div>
      <div class="map-wrap" style="background:radial-gradient(130% 130% at 50% 0%,#1b2233,#11141f)"><svg id="lsSvg"></svg></div>
      <div class="legend" id="lsLegend"></div>
      <div id="lsValid"></div>`;
  p.querySelectorAll('#lsSeg button').forEach(b=>b.addEventListener('click',()=>{
    lsColor=b.dataset.c; p.querySelectorAll('#lsSeg button').forEach(x=>x.classList.toggle('on',x===b)); drawLandscape(); }));
  const hc=$('#lsHullChip'); hc.classList.toggle('on',lsHull);
  hc.addEventListener('click',()=>{ lsHull=!lsHull; hc.classList.toggle('on',lsHull); drawLandscape(); });
  drawLandscape();
}

function drawLandscape(){
  const svg=$('#lsSvg'); if(!svg) return; const host=$('#lp-uzay');
  const W=Math.max(720,(host?host.clientWidth:0)-2)||720, H=560, pad=56;
  const xs=C.map(w=>w.px), ys=C.map(w=>w.py), maxWords=Math.max(...C.map(w=>w.words))||1;
  const xlo=Math.min(...xs),xhi=Math.max(...xs),ylo=Math.min(...ys),yhi=Math.max(...ys);
  const sx=v=>pad+((v-xlo)/((xhi-xlo)||1))*(W-2*pad);
  const sy=v=>H-pad-((v-ylo)/((yhi-ylo)||1))*(H-2*pad);
  const axFont=lang==='ar'?'Amiri,serif':'Archivo';

  let g=`<rect x="${pad}" y="${pad}" width="${(W-2*pad).toFixed(1)}" height="${(H-2*pad).toFixed(1)}" fill="none" stroke="${cssv('--line-soft')}"/>`;
  if(xlo<0&&xhi>0){ const x0=sx(0); g+=`<line x1="${x0.toFixed(1)}" y1="${pad}" x2="${x0.toFixed(1)}" y2="${H-pad}" stroke="${cssv('--line')}" stroke-dasharray="2 4"/>`; }
  if(ylo<0&&yhi>0){ const y0=sy(0); g+=`<line x1="${pad}" y1="${y0.toFixed(1)}" x2="${W-pad}" y2="${y0.toFixed(1)}" stroke="${cssv('--line')}" stroke-dasharray="2 4"/>`; }
  const a1p=ST.pca.ax1.pos.slice(0,3).map(a=>conName(a[0])).join(' · ');
  const a1n=ST.pca.ax1.neg.slice(0,3).map(a=>conName(a[0])).join(' · ');
  const a2p=ST.pca.ax2.pos.slice(0,3).map(a=>conName(a[0])).join(' · ');
  const a2n=ST.pca.ax2.neg.slice(0,3).map(a=>conName(a[0])).join(' · ');
  g+=`<text x="${(W-pad).toFixed(1)}" y="${(H-pad+22).toFixed(1)}" text-anchor="end" font-family="${axFont}" font-size="11" fill="${cssv('--gold-deep')}">${esc(a1p)} →</text>`
   + `<text x="${pad}" y="${(H-pad+22).toFixed(1)}" text-anchor="start" font-family="${axFont}" font-size="11" fill="${cssv('--gold-deep')}">← ${esc(a1n)}</text>`
   + `<text x="${(pad-12).toFixed(1)}" y="${(pad-12).toFixed(1)}" text-anchor="start" font-family="${axFont}" font-size="11" fill="${cssv('--teal')}">↑ ${esc(a2p)}</text>`
   + `<text x="${(pad-12).toFixed(1)}" y="${(H-pad+38).toFixed(1)}" text-anchor="start" font-family="${axFont}" font-size="11" fill="${cssv('--teal')}">↓ ${esc(a2n)}</text>`
   + `<text x="${(W/2).toFixed(0)}" y="${H-8}" text-anchor="middle" font-family="Archivo" font-size="9" letter-spacing="2" fill="${cssv('--faint')}">PC1 ${(ST.pca.var[0]*100).toFixed(0)}%  ·  PC2 ${(ST.pca.var[1]*100).toFixed(0)}%</text>`;

  let hulls='';
  if(lsHull && lsColor!=='century'){
    const groups={}; C.forEach(w=>{ const k=lsColor==='trad'?w.trad:String(w.cl); (groups[k]=groups[k]||[]).push([sx(w.px),sy(w.py)]); });
    Object.entries(groups).forEach(([k,pts])=>{ if(pts.length<3) return;
      const h=convexHull(pts); const col=lsColor==='trad'?tradColor(k):clColor(+k);
      hulls+=`<polygon points="${h.map(pp=>pp.map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="${col}" fill-opacity=".06" stroke="${col}" stroke-opacity=".34" stroke-width="1" stroke-dasharray="4 4"/>`; });
  }
  let dots='';
  C.forEach(w=>{ const x=sx(w.px),y=sy(w.py), r=3+Math.sqrt(w.words/maxWords)*5;
    dots+=`<circle class="ls-dot" data-id="${w.id}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${lsWorkColor(w)}" fill-opacity=".82" stroke="${cssv('--ground')}" stroke-width=".6" style="cursor:pointer"/>`; });

  svg.setAttribute('viewBox',`0 0 ${W} ${H}`); svg.style.width='100%'; svg.style.height='auto';
  svg.innerHTML=`<g>${g}</g><g>${hulls}</g><g>${dots}</g>`;
  svg.querySelectorAll('.ls-dot').forEach(dot=>{ const w=byId[dot.dataset.id];
    dot.addEventListener('mousemove',ev=>{ showTip(
      `<div class="tt-t">${esc(auName(w))}</div><div class="tt-m">${esc(tiName(w))}</div>`
     +`<div class="tt-r">${nameTrad(w.trad)} · ${nameGenre(w.genre)} · ${w.century_ah}.${L('yy','c','هـ')}</div>`, ev.clientX, ev.clientY); });
    dot.addEventListener('mouseleave',hideTip);
    dot.addEventListener('click',()=>openWork(w.id));
  });
  drawLsLegend();
}

function drawLsLegend(){
  const leg=$('#lsLegend'), val=$('#lsValid'); if(!leg) return;
  if(lsColor==='trad'){
    leg.innerHTML=Object.keys(TRAD).map(k=>`<i><b style="background:${tradColor(k)}"></b>${nameTrad(k)}</i>`).join('');
    val.innerHTML='';
  } else if(lsColor==='cluster'){
    const cm=ST.cluster_meta;
    leg.innerHTML=cm.sizes.map((sz,c)=>{ const tops=(cm.top[c]||[]).slice(0,3).map(k=>conName(k)).join(' · ');
      return `<i><b style="background:${clColor(c)}"></b>${L('Küme','Cluster','عنقود')} ${c+1} <span style="color:var(--faint)">· ${tops} · ${sz}</span></i>`; }).join('');
    val.innerHTML=`<p class="note">${L(
      `Beş kavram kümesi eserleri kullandıkları yönteme göre ayırır (dilbilim · rivâyet · belâgat-iʿcâz · fıkıh-itikad · işârî). Bu kümeler gelenek (mezhep) etiketlerini geri-vermez: NMI=${cm.nmi}, ARI=${cm.ari} (≈0). Yani yöntem mezhebi keser — bir Şiî dilbilim tefsiri, Sünnî dilbilim tefsirleriyle aynı bölgeye düşer.`,
      `Five concept clusters separate works by the method they use (linguistic · tradition-based · rhetorical-iʿjāz · legal-theological · mystical). They do not recover the tradition (sect) labels: NMI=${cm.nmi}, ARI=${cm.ari} (≈0). Method cuts across sect — a Shīʿī linguistic tafsīr lands with the Sunnī linguistic ones.`,
      `تفصل العناقيدُ المفاهيمية الخمسة المصنَّفات بحسب المنهج (لغوي · بالمأثور · بلاغي-إعجازي · فقهي-عقدي · إشاري). وهي لا تستعيد التسميات المذهبية: NMI=${cm.nmi}، ARI=${cm.ari} (≈صفر). فالمنهجُ يقطع المذهب — فتفسيرٌ شيعيٌّ لغويٌّ يقع مع نظائره السنّية اللغوية.`)} · ${L('siluet','silhouette','مُعامل الظل')} ${cm.sil}</p>`;
  } else {
    const cs=C.map(w=>w.century_ah); const lo=Math.min(...cs),hi=Math.max(...cs);
    leg.innerHTML=`<i><b style="background:${centuryColor(lo)}"></b>${lo}. ${L('yy','c','هـ')}</i>`
      +`<i><b style="background:${centuryColor((lo+hi)/2)}"></b>…</i>`
      +`<i><b style="background:${centuryColor(hi)}"></b>${hi}. ${L('yy','c','هـ')}</i>`;
    val.innerHTML='';
  }
}

/* ============================================================ GO */
init();
