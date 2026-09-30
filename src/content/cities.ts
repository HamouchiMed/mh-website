import type { Locale } from "@/lib/locales";

type L<T> = Record<Locale, T>;

export type City = {
  slug: string;
  name: L<string>;
  region: L<string>;
  intro: L<string>;
  sectors: L<string[]>;
  faq: L<{ q: string; a: string }>;
  geo: [number, number];
};

// One landing page per city (/fr/agence-web/casablanca, /en/web-agency/…).
// Each city has its own introduction, sectors and FAQ so the pages are
// genuinely useful rather than duplicates with a swapped name.
export const cities: City[] = [
  {
    slug: "casablanca",
    geo: [33.5731, -7.5898],
    name: { fr: "Casablanca", en: "Casablanca", ar: "الدار البيضاء" },
    region: { fr: "Casablanca-Settat", en: "Casablanca-Settat", ar: "الدار البيضاء-سطات" },
    intro: {
      fr: "Capitale économique du Royaume, Casablanca concentre sièges sociaux, industries, startups et commerces. Dans un marché aussi concurrentiel, votre site doit convaincre en quelques secondes et apparaître en tête des recherches locales. Nous concevons pour les entreprises casablancaises des sites et applications rapides, pensés pour générer des demandes qualifiées.",
      en: "Morocco's economic capital, Casablanca is home to headquarters, industry, startups and retail. In such a competitive market, your website has to convince in seconds and rank at the top of local searches. We build fast websites and apps for Casablanca businesses, designed to generate qualified leads.",
      ar: "بصفتها العاصمة الاقتصادية للمملكة، تضم الدار البيضاء المقرات الاجتماعية والصناعات والشركات الناشئة والمتاجر. وفي سوق بهذه التنافسية، يجب أن يُقنع موقعك في ثوانٍ وأن يتصدر نتائج البحث المحلية. نصمم لمقاولات الدار البيضاء مواقع وتطبيقات سريعة تهدف إلى جلب طلبات مؤهلة.",
    },
    sectors: {
      fr: ["Sièges sociaux et PME", "Startups et fintech", "Commerce et retail", "Immobilier et BTP"],
      en: ["Headquarters and SMEs", "Startups and fintech", "Retail and commerce", "Real estate and construction"],
      ar: ["المقرات والمقاولات الصغرى والمتوسطة", "الشركات الناشئة والتكنولوجيا المالية", "التجارة والتوزيع", "العقار والبناء"],
    },
    faq: {
      fr: {
        q: "Comment sortir du lot face à la concurrence à Casablanca ?",
        a: "Avec un positionnement clair, un site ultra-rapide et une stratégie SEO locale ciblant les quartiers et les services recherchés (Maârif, Sidi Maârouf, Aïn Sebaâ…). Nous analysons vos concurrents avant de concevoir votre site.",
      },
      en: {
        q: "How can we stand out from the competition in Casablanca?",
        a: "With clear positioning, a lightning-fast website and a local SEO strategy targeting the neighbourhoods and services people search for (Maarif, Sidi Maarouf, Ain Sebaa…). We analyse your competitors before designing your site.",
      },
      ar: {
        q: "كيف نتميز عن المنافسين في الدار البيضاء؟",
        a: "بتموقع واضح، وموقع فائق السرعة، واستراتيجية SEO محلية تستهدف الأحياء والخدمات التي يبحث عنها الزبناء (المعاريف، سيدي معروف، عين السبع…). نحلل منافسيك قبل تصميم موقعك.",
      },
    },
  },
  {
    slug: "rabat",
    geo: [34.0209, -6.8416],
    name: { fr: "Rabat", en: "Rabat", ar: "الرباط" },
    region: { fr: "Rabat-Salé-Kénitra", en: "Rabat-Salé-Kénitra", ar: "الرباط-سلا-القنيطرة" },
    intro: {
      fr: "Capitale administrative, Rabat réunit institutions, ambassades, organisations internationales, écoles et cabinets de conseil. Ces acteurs ont besoin de sites institutionnels clairs, accessibles et souvent multilingues. Nous créons des plateformes sobres et performantes, conformes aux bonnes pratiques d'accessibilité et de sécurité.",
      en: "As the capital, Rabat brings together institutions, embassies, international organisations, schools and consultancies. They need clear, accessible and often multilingual websites. We build clean, high-performing platforms that follow accessibility and security best practices.",
      ar: "بصفتها العاصمة الإدارية، تجمع الرباط المؤسسات والسفارات والمنظمات الدولية والمدارس ومكاتب الاستشارة. وتحتاج هذه الجهات إلى مواقع مؤسساتية واضحة وسهلة الولوج ومتعددة اللغات في الغالب. نصمم منصات أنيقة وعالية الأداء تحترم أفضل ممارسات الولوجية والأمان.",
    },
    sectors: {
      fr: ["Institutions et associations", "Conseil et professions libérales", "Écoles et formation", "Santé et cliniques"],
      en: ["Institutions and associations", "Consulting and professional services", "Schools and training", "Healthcare and clinics"],
      ar: ["المؤسسات والجمعيات", "الاستشارة والمهن الحرة", "المدارس والتكوين", "الصحة والمصحات"],
    },
    faq: {
      fr: {
        q: "Pouvez-vous créer un site en français, arabe et anglais ?",
        a: "Oui. Nous réalisons des sites multilingues avec une vraie version arabe de droite à gauche (RTL) et des balises hreflang pour que chaque langue soit bien référencée.",
      },
      en: {
        q: "Can you build a website in French, Arabic and English?",
        a: "Yes. We build multilingual websites with a proper right-to-left Arabic version and hreflang tags so each language ranks correctly.",
      },
      ar: {
        q: "هل يمكنكم إنشاء موقع بالفرنسية والعربية والإنجليزية؟",
        a: "نعم. ننجز مواقع متعددة اللغات بنسخة عربية حقيقية من اليمين إلى اليسار، مع وسوم hreflang ليحظى كل إصدار لغوي بترتيب جيد.",
      },
    },
  },
  {
    slug: "marrakech",
    geo: [31.6295, -7.9811],
    name: { fr: "Marrakech", en: "Marrakech", ar: "مراكش" },
    region: { fr: "Marrakech-Safi", en: "Marrakech-Safi", ar: "مراكش-آسفي" },
    intro: {
      fr: "Destination touristique mondiale, Marrakech vit au rythme des hôtels, riads, restaurants, agences de voyage et artisans. Ici, un site doit faire rêver, rassurer et permettre de réserver facilement, en plusieurs langues. Nous créons des expériences visuelles fortes, rapides sur mobile et optimisées pour les recherches des voyageurs.",
      en: "A world-famous destination, Marrakech runs on hotels, riads, restaurants, travel agencies and artisans. Here a website must inspire, reassure and make booking easy, in several languages. We create striking visual experiences that are fast on mobile and optimised for travellers' searches.",
      ar: "بصفتها وجهة سياحية عالمية، تعيش مراكش على إيقاع الفنادق والرياضات والمطاعم ووكالات الأسفار والصناع التقليديين. هنا يجب أن يُلهم الموقع ويطمئن ويسهّل الحجز بعدة لغات. نصمم تجارب بصرية قوية، سريعة على الهاتف ومحسّنة لعمليات بحث المسافرين.",
    },
    sectors: {
      fr: ["Riads et hôtels", "Restaurants et cafés", "Agences de voyage et activités", "Artisanat et boutiques"],
      en: ["Riads and hotels", "Restaurants and cafés", "Travel agencies and activities", "Crafts and boutiques"],
      ar: ["الرياضات والفنادق", "المطاعم والمقاهي", "وكالات الأسفار والأنشطة", "الصناعة التقليدية والمتاجر"],
    },
    faq: {
      fr: {
        q: "Pouvez-vous intégrer un système de réservation ?",
        a: "Oui : réservation en ligne, demande par WhatsApp ou connexion à vos outils existants. Nous choisissons la solution la plus simple pour vos clients et vos équipes.",
      },
      en: {
        q: "Can you add a booking system?",
        a: "Yes: online booking, WhatsApp requests or a connection to the tools you already use. We pick the simplest option for your guests and your team.",
      },
      ar: {
        q: "هل يمكنكم دمج نظام للحجز؟",
        a: "نعم: حجز عبر الإنترنت، طلب عبر واتساب، أو ربط بأدواتك الحالية. نختار الحل الأبسط لزبنائك ولفريقك.",
      },
    },
  },
  {
    slug: "tanger",
    geo: [35.7595, -5.834],
    name: { fr: "Tanger", en: "Tangier", ar: "طنجة" },
    region: { fr: "Tanger-Tétouan-Al Hoceïma", en: "Tanger-Tetouan-Al Hoceima", ar: "طنجة-تطوان-الحسيمة" },
    intro: {
      fr: "Porte de l'Europe, Tanger est un pôle industriel et logistique majeur, porté par le port Tanger Med et ses zones d'activités. Les entreprises tournées vers l'export ont besoin de sites professionnels multilingues et d'outils métier fiables. Nous développons des sites corporate, des plateformes B2B et des logiciels sur-mesure.",
      en: "Morocco's gateway to Europe, Tangier is a major industrial and logistics hub driven by the Tanger Med port and its business zones. Export-oriented companies need professional multilingual websites and reliable business tools. We build corporate sites, B2B platforms and custom software.",
      ar: "بوابة المغرب نحو أوروبا، تُعد طنجة قطبًا صناعيًا ولوجستيًا كبيرًا بفضل ميناء طنجة المتوسط ومناطق أنشطتها. وتحتاج المقاولات المتجهة نحو التصدير إلى مواقع احترافية متعددة اللغات وأدوات عمل موثوقة. نطوّر مواقع مؤسساتية ومنصات B2B وبرمجيات مخصصة.",
    },
    sectors: {
      fr: ["Industrie et automobile", "Logistique et transport", "Export et B2B", "Tourisme et hôtellerie"],
      en: ["Industry and automotive", "Logistics and transport", "Export and B2B", "Tourism and hospitality"],
      ar: ["الصناعة والسيارات", "اللوجستيك والنقل", "التصدير والتجارة بين المقاولات", "السياحة والفندقة"],
    },
    faq: {
      fr: {
        q: "Réalisez-vous des sites en espagnol ou dans d'autres langues ?",
        a: "Oui, votre site peut être décliné dans les langues de vos clients, dont l'espagnol, avec une structure SEO propre à chaque langue.",
      },
      en: {
        q: "Do you build websites in Spanish or other languages?",
        a: "Yes, your site can be translated into your customers' languages, including Spanish, with a dedicated SEO structure for each one.",
      },
      ar: {
        q: "هل تنجزون مواقع بالإسبانية أو بلغات أخرى؟",
        a: "نعم، يمكن ترجمة موقعك إلى لغات زبنائك، بما فيها الإسبانية، مع بنية SEO خاصة بكل لغة.",
      },
    },
  },
  {
    slug: "fes",
    geo: [34.0331, -5.0003],
    name: { fr: "Fès", en: "Fez", ar: "فاس" },
    region: { fr: "Fès-Meknès", en: "Fès-Meknès", ar: "فاس-مكناس" },
    intro: {
      fr: "Capitale spirituelle et culturelle, Fès allie patrimoine, artisanat, tourisme et un tissu universitaire dynamique. Artisans, maisons d'hôtes et entreprises locales gagnent à valoriser leur savoir-faire en ligne et à vendre au-delà de la médina. Nous créons des vitrines élégantes et des boutiques en ligne adaptées.",
      en: "Morocco's spiritual and cultural capital, Fez combines heritage, crafts, tourism and a lively university scene. Artisans, guesthouses and local businesses benefit from showcasing their know-how online and selling beyond the medina. We create elegant showcase sites and tailored online stores.",
      ar: "بصفتها العاصمة الروحية والثقافية، تجمع فاس بين التراث والصناعة التقليدية والسياحة ونسيج جامعي نشيط. ويستفيد الصناع ودور الضيافة والمقاولات المحلية من إبراز مهاراتهم عبر الإنترنت والبيع خارج أسوار المدينة القديمة. نصمم مواقع تعريفية أنيقة ومتاجر إلكترونية ملائمة.",
    },
    sectors: {
      fr: ["Artisanat et coopératives", "Maisons d'hôtes et tourisme", "Enseignement et formation", "Commerce local"],
      en: ["Crafts and cooperatives", "Guesthouses and tourism", "Education and training", "Local retail"],
      ar: ["الصناعة التقليدية والتعاونيات", "دور الضيافة والسياحة", "التعليم والتكوين", "التجارة المحلية"],
    },
    faq: {
      fr: {
        q: "Peut-on vendre de l'artisanat en ligne depuis Fès ?",
        a: "Oui. Une boutique en ligne bien présentée, avec paiement sécurisé et options de livraison au Maroc et à l'international, permet de toucher de nouveaux clients.",
      },
      en: {
        q: "Can we sell handicrafts online from Fez?",
        a: "Yes. A well-presented online store with secure payment and delivery options in Morocco and abroad helps you reach new customers.",
      },
      ar: {
        q: "هل يمكن بيع منتجات الصناعة التقليدية عبر الإنترنت من فاس؟",
        a: "نعم. متجر إلكتروني بعرض جيد، ودفع آمن، وخيارات توصيل داخل المغرب وخارجه، يتيح لك الوصول إلى زبناء جدد.",
      },
    },
  },
  {
    slug: "agadir",
    geo: [30.4278, -9.5981],
    name: { fr: "Agadir", en: "Agadir", ar: "أكادير" },
    region: { fr: "Souss-Massa", en: "Souss-Massa", ar: "سوس-ماسة" },
    intro: {
      fr: "Entre tourisme balnéaire, pêche, agriculture et agro-industrie, Agadir et la région Souss-Massa comptent de nombreuses entreprises tournées vers l'export et le tourisme. Nous les aidons à gagner en visibilité avec des sites rapides, multilingues et bien référencés, et avec des outils de gestion sur-mesure.",
      en: "With beach tourism, fishing, farming and agri-food industry, Agadir and the Souss-Massa region are home to many export- and tourism-oriented businesses. We help them gain visibility with fast, multilingual, well-ranked websites and custom management tools.",
      ar: "بين السياحة الشاطئية والصيد البحري والفلاحة والصناعات الغذائية، تضم أكادير وجهة سوس-ماسة العديد من المقاولات المتجهة نحو التصدير والسياحة. نساعدها على تعزيز حضورها بمواقع سريعة ومتعددة اللغات وجيدة الترتيب، وبأدوات تدبير مخصصة.",
    },
    sectors: {
      fr: ["Tourisme et hôtellerie", "Agriculture et agro-industrie", "Pêche et produits de la mer", "Surf, sport et loisirs"],
      en: ["Tourism and hospitality", "Farming and agri-food", "Fishing and seafood", "Surf, sport and leisure"],
      ar: ["السياحة والفندقة", "الفلاحة والصناعات الغذائية", "الصيد البحري ومنتجات البحر", "ركوب الأمواج والرياضة والترفيه"],
    },
    faq: {
      fr: {
        q: "Mon activité est saisonnière : le site peut-il s'adapter ?",
        a: "Oui. Un CMS vous permet de mettre à jour offres, tarifs et disponibilités selon les saisons, et nous pouvons prévoir des pages dédiées aux périodes fortes.",
      },
      en: {
        q: "My business is seasonal — can the website adapt?",
        a: "Yes. A CMS lets you update offers, rates and availability as seasons change, and we can plan dedicated pages for your peak periods.",
      },
      ar: {
        q: "نشاطي موسمي، فهل يمكن للموقع أن يتكيف؟",
        a: "نعم. يتيح لك نظام إدارة المحتوى تحديث العروض والأسعار والتوفر حسب المواسم، ويمكننا إعداد صفحات مخصصة لفترات الذروة.",
      },
    },
  },
  {
    slug: "meknes",
    geo: [33.8935, -5.5473],
    name: { fr: "Meknès", en: "Meknes", ar: "مكناس" },
    region: { fr: "Fès-Meknès", en: "Fès-Meknès", ar: "فاس-مكناس" },
    intro: {
      fr: "Ville impériale au cœur d'une grande région agricole, Meknès accueille chaque année le Salon International de l'Agriculture au Maroc. Producteurs, coopératives, commerces et prestataires de services y ont besoin d'une présence en ligne crédible pour trouver clients et partenaires.",
      en: "An imperial city at the heart of a major farming region, Meknes hosts Morocco's International Agriculture Show every year. Producers, cooperatives, shops and service providers need a credible online presence to find customers and partners.",
      ar: "مدينة إمبراطورية في قلب جهة فلاحية كبرى، تحتضن مكناس كل سنة المعرض الدولي للفلاحة بالمغرب. ويحتاج المنتجون والتعاونيات والمتاجر ومقدمو الخدمات إلى حضور رقمي موثوق لإيجاد الزبناء والشركاء.",
    },
    sectors: {
      fr: ["Agriculture et viticulture", "Coopératives", "Commerce et services", "Tourisme patrimonial"],
      en: ["Farming and wine-growing", "Cooperatives", "Retail and services", "Heritage tourism"],
      ar: ["الفلاحة وزراعة الكروم", "التعاونيات", "التجارة والخدمات", "السياحة التراثية"],
    },
    faq: {
      fr: {
        q: "Pouvez-vous créer un catalogue produits pour une coopérative ?",
        a: "Oui : catalogue en ligne, fiches produits détaillées, demande de devis ou vente en ligne, selon votre modèle.",
      },
      en: {
        q: "Can you build a product catalogue for a cooperative?",
        a: "Yes: an online catalogue, detailed product pages, quote requests or online sales, depending on how you work.",
      },
      ar: {
        q: "هل يمكنكم إنشاء كتالوج منتجات لتعاونية؟",
        a: "نعم: كتالوج عبر الإنترنت، صفحات مفصلة للمنتجات، طلب عروض أسعار أو بيع عبر الإنترنت، حسب نموذج عملكم.",
      },
    },
  },
  {
    slug: "oujda",
    geo: [34.6814, -1.9086],
    name: { fr: "Oujda", en: "Oujda", ar: "وجدة" },
    region: { fr: "Oriental", en: "Oriental", ar: "الشرق" },
    intro: {
      fr: "Capitale de l'Oriental, Oujda est un carrefour commercial et universitaire en plein développement. Commerces, cliniques, écoles et entreprises de services y cherchent à se démarquer en ligne. Nous créons des sites et applications performants qui renforcent leur crédibilité et leur visibilité locale.",
      en: "Capital of the Oriental region, Oujda is a growing commercial and university hub. Shops, clinics, schools and service companies are looking to stand out online. We build high-performing websites and apps that strengthen their credibility and local visibility.",
      ar: "عاصمة جهة الشرق، تُعد وجدة ملتقى تجاريًا وجامعيًا في طور النمو. وتسعى المتاجر والمصحات والمدارس ومقاولات الخدمات فيها إلى التميز عبر الإنترنت. نصمم مواقع وتطبيقات عالية الأداء تعزز مصداقيتها وظهورها المحلي.",
    },
    sectors: {
      fr: ["Commerce et distribution", "Santé", "Enseignement supérieur et formation", "Services aux entreprises"],
      en: ["Retail and distribution", "Healthcare", "Higher education and training", "Business services"],
      ar: ["التجارة والتوزيع", "الصحة", "التعليم العالي والتكوين", "خدمات المقاولات"],
    },
    faq: {
      fr: {
        q: "Le SEO local fonctionne-t-il dans une ville comme Oujda ?",
        a: "Oui. Dans de nombreuses villes, la concurrence en ligne est moins forte que dans les grandes métropoles : une fiche Google Business Profile optimisée et des pages locales peuvent vite faire la différence.",
      },
      en: {
        q: "Does local SEO work in a city like Oujda?",
        a: "Yes. In many cities online competition is lower than in the big metropolises, so an optimised Google Business Profile and local pages can quickly make a difference.",
      },
      ar: {
        q: "هل ينجح SEO المحلي في مدينة مثل وجدة؟",
        a: "نعم. في كثير من المدن تكون المنافسة الرقمية أقل مما هي عليه في الحواضر الكبرى، لذا يمكن لملف Google Business محسّن وصفحات محلية أن يُحدثا الفرق بسرعة.",
      },
    },
  },
  {
    slug: "kenitra",
    geo: [34.261, -6.5802],
    name: { fr: "Kénitra", en: "Kenitra", ar: "القنيطرة" },
    region: { fr: "Rabat-Salé-Kénitra", en: "Rabat-Salé-Kénitra", ar: "الرباط-سلا-القنيطرة" },
    intro: {
      fr: "Avec sa zone Atlantic Free Zone et son écosystème automobile, Kénitra connaît une croissance rapide. Sous-traitants, PME industrielles, commerces et promoteurs immobiliers ont besoin de sites professionnels et d'outils numériques pour accompagner ce développement.",
      en: "With the Atlantic Free Zone and its automotive ecosystem, Kenitra is growing fast. Suppliers, industrial SMEs, shops and property developers need professional websites and digital tools to keep up.",
      ar: "بفضل المنطقة الحرة الأطلسية ومنظومة صناعة السيارات، تعرف القنيطرة نموًا سريعًا. ويحتاج المناولون والمقاولات الصناعية الصغرى والمتوسطة والمتاجر والمنعشون العقاريون إلى مواقع احترافية وأدوات رقمية لمواكبة هذا التطور.",
    },
    sectors: {
      fr: ["Industrie automobile et sous-traitance", "Immobilier", "Commerce", "Formation"],
      en: ["Automotive industry and suppliers", "Real estate", "Retail", "Training"],
      ar: ["صناعة السيارات والمناولة", "العقار", "التجارة", "التكوين"],
    },
    faq: {
      fr: {
        q: "Pouvez-vous développer un outil interne pour notre usine ou PME ?",
        a: "Oui : suivi de production, gestion des stocks, tableaux de bord, portails fournisseurs… Nous développons des logiciels adaptés à vos processus.",
      },
      en: {
        q: "Can you build an internal tool for our plant or SME?",
        a: "Yes: production tracking, inventory management, dashboards, supplier portals… We build software that fits your processes.",
      },
      ar: {
        q: "هل يمكنكم تطوير أداة داخلية لمصنعنا أو مقاولتنا؟",
        a: "نعم: تتبع الإنتاج، تدبير المخزون، لوحات القيادة، بوابات الموردين… نطوّر برمجيات ملائمة لطريقة عملكم.",
      },
    },
  },
  {
    slug: "tetouan",
    geo: [35.5889, -5.3626],
    name: { fr: "Tétouan", en: "Tetouan", ar: "تطوان" },
    region: { fr: "Tanger-Tétouan-Al Hoceïma", en: "Tanger-Tetouan-Al Hoceima", ar: "طنجة-تطوان-الحسيمة" },
    intro: {
      fr: "Entre mer et montagne, Tétouan et sa côte (M'diq, Martil, Cabo Negro) vivent du commerce, du tourisme et d'une importante vie étudiante. Nous accompagnons hôtels, restaurants, commerces et entreprises locales avec des sites modernes et une stratégie de visibilité adaptée aux saisons.",
      en: "Between sea and mountains, Tetouan and its coast (M'diq, Martil, Cabo Negro) thrive on trade, tourism and a large student population. We support hotels, restaurants, shops and local businesses with modern websites and a visibility strategy that follows the seasons.",
      ar: "بين البحر والجبل، تعيش تطوان وساحلها (المضيق، مرتيل، كابو نيكرو) على التجارة والسياحة وحياة طلابية مهمة. نرافق الفنادق والمطاعم والمتاجر والمقاولات المحلية بمواقع حديثة واستراتيجية ظهور ملائمة للمواسم.",
    },
    sectors: {
      fr: ["Tourisme balnéaire", "Commerce", "Restauration", "Enseignement"],
      en: ["Seaside tourism", "Retail", "Restaurants", "Education"],
      ar: ["السياحة الشاطئية", "التجارة", "المطاعم", "التعليم"],
    },
    faq: {
      fr: {
        q: "Quand lancer un site pour être visible pendant l'été ?",
        a: "Un site vitrine peut être prêt en quelques semaines. Pour être bien visible pendant la saison estivale, l'idéal est de lancer le projet au printemps afin de laisser à Google le temps de l'indexer.",
      },
      en: {
        q: "When should we launch a website to be visible in summer?",
        a: "A showcase site can be ready in a few weeks. To be visible during the summer season, it's best to start in spring so Google has time to index it.",
      },
      ar: {
        q: "متى يجب إطلاق الموقع ليكون ظاهرًا خلال الصيف؟",
        a: "يمكن أن يكون الموقع التعريفي جاهزًا في بضعة أسابيع. ولتحقيق ظهور جيد خلال موسم الصيف، يُفضل بدء المشروع في الربيع لإتاحة الوقت لـ Google لفهرسته.",
      },
    },
  },
  {
    slug: "laayoune",
    geo: [27.1536, -13.2033],
    name: { fr: "Laâyoune", en: "Laayoune", ar: "العيون" },
    region: { fr: "Laâyoune-Sakia El Hamra", en: "Laayoune-Sakia El Hamra", ar: "العيون-الساقية الحمراء" },
    intro: {
      fr: "Plus grande ville des provinces du Sud, Laâyoune se développe rapidement : commerces, services, BTP, transport et location de véhicules. Nous y accompagnons déjà des entreprises locales, comme SOUBAI Location, avec des sites rapides, optimisés pour Google et pensés pour le mobile.",
      en: "The largest city in Morocco's southern provinces, Laayoune is growing fast: retail, services, construction, transport and vehicle rental. We already work with local businesses there, such as SOUBAI Location, building fast, Google-optimised, mobile-first websites.",
      ar: "بصفتها أكبر مدن الأقاليم الجنوبية، تعرف العيون تطورًا سريعًا: التجارة، الخدمات، البناء، النقل وكراء السيارات. ونرافق فيها بالفعل مقاولات محلية، مثل SOUBAI Location، بمواقع سريعة ومحسّنة لـ Google ومصممة أولًا للهواتف.",
    },
    sectors: {
      fr: ["Location de voitures et transport", "Commerce et services", "BTP et immobilier", "Pêche et logistique"],
      en: ["Car rental and transport", "Retail and services", "Construction and real estate", "Fishing and logistics"],
      ar: ["كراء السيارات والنقل", "التجارة والخدمات", "البناء والعقار", "الصيد البحري واللوجستيك"],
    },
    faq: {
      fr: {
        q: "Avez-vous déjà travaillé avec des entreprises du Sud ?",
        a: "Oui. Nous avons notamment réalisé le site de SOUBAI Location, agence de location de voitures et de 4×4 à Laâyoune, Boujdour et Dakhla.",
      },
      en: {
        q: "Have you worked with businesses in southern Morocco before?",
        a: "Yes. Among others, we built the website of SOUBAI Location, a car and 4×4 rental agency in Laayoune, Boujdour and Dakhla.",
      },
      ar: {
        q: "هل سبق لكم العمل مع مقاولات من الجنوب؟",
        a: "نعم. أنجزنا على سبيل المثال موقع SOUBAI Location، وكالة كراء السيارات وسيارات الدفع الرباعي في العيون وبوجدور والداخلة.",
      },
    },
  },
  {
    slug: "dakhla",
    geo: [23.6848, -15.958],
    name: { fr: "Dakhla", en: "Dakhla", ar: "الداخلة" },
    region: { fr: "Dakhla-Oued Ed-Dahab", en: "Dakhla-Oued Ed-Dahab", ar: "الداخلة-وادي الذهب" },
    intro: {
      fr: "Entre lagune, kitesurf et écotourisme, Dakhla attire des visiteurs du monde entier, tandis que la pêche et l'aquaculture font vivre son économie. Hébergements, écoles de kite, agences et commerces ont besoin d'une présence en ligne visuelle et multilingue. Nous connaissons bien la ville : nous y avons notamment réalisé le site Talent Dakhla.",
      en: "With its lagoon, kitesurfing and eco-tourism, Dakhla attracts visitors from all over the world, while fishing and aquaculture drive its economy. Accommodation, kite schools, agencies and shops need a visual, multilingual online presence. We know the city well — among other projects, we built the Talent Dakhla website.",
      ar: "بين البحيرة وركوب الأمواج الشراعي والسياحة البيئية، تستقطب الداخلة زوارًا من كل أنحاء العالم، فيما يشكل الصيد البحري وتربية الأحياء المائية عصب اقتصادها. وتحتاج أماكن الإيواء ومدارس الكايت والوكالات والمتاجر إلى حضور رقمي بصري ومتعدد اللغات. نعرف المدينة جيدًا، فقد أنجزنا فيها موقع Talent Dakhla.",
    },
    sectors: {
      fr: ["Kitesurf et sports nautiques", "Hébergement et écotourisme", "Pêche et aquaculture", "Commerce local"],
      en: ["Kitesurfing and water sports", "Accommodation and eco-tourism", "Fishing and aquaculture", "Local retail"],
      ar: ["الكايت سيرف والرياضات المائية", "الإيواء والسياحة البيئية", "الصيد البحري وتربية الأحياء المائية", "التجارة المحلية"],
    },
    faq: {
      fr: {
        q: "Pouvez-vous créer un site en plusieurs langues pour les touristes ?",
        a: "Oui : français, anglais, espagnol ou arabe, avec des réservations simplifiées par formulaire ou WhatsApp et un référencement adapté à chaque langue.",
      },
      en: {
        q: "Can you build a multilingual website for tourists?",
        a: "Yes: French, English, Spanish or Arabic, with simple bookings by form or WhatsApp and SEO tailored to each language.",
      },
      ar: {
        q: "هل يمكنكم إنشاء موقع متعدد اللغات موجه للسياح؟",
        a: "نعم: بالفرنسية أو الإنجليزية أو الإسبانية أو العربية، مع حجوزات مبسطة عبر استمارة أو واتساب، وتحسين لمحركات البحث ملائم لكل لغة.",
      },
    },
  },
];

export const findCity = (slug: string) => cities.find((c) => c.slug === slug);

export const fill = (template: string, city: City, locale: Locale) =>
  template.replaceAll("{city}", city.name[locale]).replaceAll("{region}", city.region[locale]);
