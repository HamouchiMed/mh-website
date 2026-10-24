import { locales, type Locale, type SlugMap } from "@/lib/locales";
import { servicesAr } from "./services.ar";

type Faq = { q: string; a: string };

export type ServiceCopy = {
  slug: string;
  title: string;
  short: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  deliverables: string[];
  faqs: Faq[];
};

export type Service = {
  id: string;
  stack: string[];
} & Record<Locale, ServiceCopy>;

// Each service gets its own landing page per language, with a keyword-rich slug.
// French and English copy lives here; Arabic copy is in services.ar.ts.
const base: Omit<Service, "ar">[] = [
  {
    id: "web",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Three.js", "Headless CMS"],
    fr: {
      slug: "creation-site-web",
      title: "Création de sites web",
      short: "Sites vitrines et plateformes sur-mesure ultra-rapides, pensés pour convertir et bien se positionner sur Google.",
      metaTitle: "Création de site web au Maroc — sur-mesure & optimisé SEO",
      metaDescription:
        "Création de sites web sur-mesure au Maroc : design unique, chargement ultra-rapide et SEO technique intégré. Sites vitrines, corporate et landing pages par MH Group.",
      h1: "Création de sites web sur-mesure, rapides et optimisés pour Google",
      lead: "Votre site est votre meilleur commercial. Nous concevons des sites vitrines, corporate et landing pages uniques, qui se chargent en un clin d'œil et transforment vos visiteurs en clients.",
      deliverables: [
        "Sites vitrines et corporate",
        "Landing pages orientées conversion",
        "Design sur-mesure et responsive",
        "Animations, motion et 3D WebGL",
        "SEO technique et données structurées",
        "CMS pour gérer vos contenus en autonomie",
      ],
      faqs: [
        {
          q: "Pourrai-je modifier le contenu moi-même ?",
          a: "Oui. Nous connectons votre site à un CMS simple à utiliser pour que vous puissiez mettre à jour textes, images et articles sans développeur.",
        },
        {
          q: "Le site sera-t-il adapté aux mobiles ?",
          a: "Chaque site est conçu mobile-first et testé sur smartphones, tablettes et ordinateurs.",
        },
        {
          q: "Pouvez-vous refondre mon site existant ?",
          a: "Oui. Nous auditons l'existant, conservons ce qui fonctionne — notamment votre référencement — et mettons en place les redirections nécessaires.",
        },
      ],
    },
    en: {
      slug: "web-development",
      title: "Web development",
      short: "Lightning-fast websites and custom platforms, built to convert visitors and rank on Google.",
      metaTitle: "Web development agency in Morocco — custom, SEO-ready websites",
      metaDescription:
        "Custom website development in Morocco: unique design, lightning-fast performance and built-in technical SEO. Corporate sites and landing pages by MH Group.",
      h1: "Custom websites that load fast and rank on Google",
      lead: "Your website is your best salesperson. We design and build unique corporate sites and landing pages that load in a blink and turn visitors into customers.",
      deliverables: [
        "Corporate and showcase websites",
        "Conversion-focused landing pages",
        "Custom, responsive design",
        "Animation, motion and WebGL 3D",
        "Technical SEO and structured data",
        "A CMS to manage your content yourself",
      ],
      faqs: [
        {
          q: "Will I be able to edit the content myself?",
          a: "Yes. We connect your site to an easy-to-use CMS so you can update copy, images and articles without a developer.",
        },
        {
          q: "Will the website work well on mobile?",
          a: "Every site is designed mobile-first and tested on phones, tablets and desktops.",
        },
        {
          q: "Can you redesign my existing website?",
          a: "Yes. We audit what you have, keep what works — especially your search rankings — and set up the redirects you need.",
        },
      ],
    },
  },
  {
    id: "mobile",
    stack: ["React Native", "Expo", "Flutter", "Node.js", "Firebase", "PostgreSQL"],
    fr: {
      slug: "developpement-application-mobile",
      title: "Applications mobiles",
      short: "Applications iOS et Android performantes et intuitives, de la conception à la publication sur les stores.",
      metaTitle: "Développement d'application mobile au Maroc — iOS & Android",
      metaDescription:
        "Développement d'applications mobiles iOS et Android au Maroc : UX soignée, performances proches du natif, back-end sécurisé et publication sur l'App Store et Google Play.",
      h1: "Développement d'applications mobiles iOS et Android",
      lead: "Nous transformons votre idée en application mobile fluide et fiable, avec une seule base de code pour iOS et Android, un back-end sécurisé et un accompagnement jusqu'à la publication.",
      deliverables: [
        "Applications iOS et Android",
        "Développement cross-platform",
        "UX/UI mobile et prototypes",
        "API et back-end sécurisés",
        "Notifications push et paiements",
        "Publication App Store et Google Play",
      ],
      faqs: [
        {
          q: "Natif ou cross-platform ?",
          a: "Pour la plupart des projets, une approche cross-platform (React Native ou Flutter) offre des performances proches du natif pour un budget et des délais réduits. Nous vous conseillons selon vos besoins.",
        },
        {
          q: "Vous occupez-vous de la publication sur les stores ?",
          a: "Oui. Nous préparons les fiches, les captures d'écran et gérons la soumission sur l'App Store et Google Play.",
        },
        {
          q: "Peut-on commencer par une première version (MVP) ?",
          a: "C'est même recommandé : un MVP permet de tester votre idée rapidement auprès de vrais utilisateurs avant d'investir davantage.",
        },
      ],
    },
    en: {
      slug: "mobile-app-development",
      title: "Mobile apps",
      short: "Fast, intuitive iOS and Android apps — from first sketch to App Store and Google Play launch.",
      metaTitle: "Mobile app development in Morocco — iOS & Android",
      metaDescription:
        "iOS and Android app development in Morocco: polished UX, near-native performance, secure back-ends and full App Store and Google Play publishing.",
      h1: "iOS and Android mobile app development",
      lead: "We turn your idea into a smooth, reliable mobile app — one codebase for iOS and Android, a secure back-end, and hands-on support all the way to launch.",
      deliverables: [
        "iOS and Android apps",
        "Cross-platform development",
        "Mobile UX/UI and prototypes",
        "Secure APIs and back-ends",
        "Push notifications and payments",
        "App Store and Google Play publishing",
      ],
      faqs: [
        {
          q: "Native or cross-platform?",
          a: "For most projects, a cross-platform approach (React Native or Flutter) delivers near-native performance with a smaller budget and shorter timeline. We'll recommend what fits your needs.",
        },
        {
          q: "Do you handle store publishing?",
          a: "Yes. We prepare the listings and screenshots and manage submission to the App Store and Google Play.",
        },
        {
          q: "Can we start with a first version (MVP)?",
          a: "We recommend it: an MVP lets you test your idea quickly with real users before investing further.",
        },
      ],
    },
  },
  {
    id: "ecommerce",
    stack: ["Next.js", "Shopify", "WooCommerce", "Stripe", "CMI", "PostgreSQL"],
    fr: {
      slug: "site-e-commerce",
      title: "E-commerce",
      short: "Boutiques en ligne rapides et sécurisées, avec paiement en ligne, gestion des stocks et livraison.",
      metaTitle: "Création de site e-commerce au Maroc — boutique en ligne",
      metaDescription:
        "Création de boutiques en ligne au Maroc : paiement en ligne sécurisé ou à la livraison, gestion des commandes et SEO produit pour vendre plus.",
      h1: "Création de sites e-commerce qui vendent",
      lead: "Nous créons des boutiques en ligne rapides, sécurisées et faciles à gérer, pensées pour le marché marocain comme pour l'international.",
      deliverables: [
        "Boutique sur-mesure ou Shopify",
        "Paiement en ligne et à la livraison",
        "Gestion des produits, stocks et commandes",
        "Tunnel d'achat optimisé",
        "SEO des fiches produits et catégories",
        "Tableaux de bord et statistiques de vente",
      ],
      faqs: [
        {
          q: "Quels moyens de paiement pouvez-vous intégrer ?",
          a: "Paiement par carte via des passerelles marocaines et internationales, paiement à la livraison, virement… Nous choisissons ensemble les solutions adaptées à vos clients.",
        },
        {
          q: "Shopify ou site sur-mesure ?",
          a: "Shopify est idéal pour démarrer vite ; le sur-mesure s'impose quand vous avez des besoins spécifiques ou un fort volume. Nous vous aidons à choisir.",
        },
        {
          q: "Pourrai-je gérer mes produits seul ?",
          a: "Oui, vous disposez d'une interface d'administration simple pour gérer produits, prix, stocks et commandes.",
        },
      ],
    },
    en: {
      slug: "ecommerce-development",
      title: "E-commerce",
      short: "Fast, secure online stores with online payments, inventory management and delivery built in.",
      metaTitle: "E-commerce development in Morocco — online stores that sell",
      metaDescription:
        "Online store development in Morocco: secure online and cash-on-delivery payments, order management and product SEO to help you sell more.",
      h1: "E-commerce websites built to sell",
      lead: "We build fast, secure and easy-to-manage online stores, designed for the Moroccan market and for customers worldwide.",
      deliverables: [
        "Custom or Shopify storefronts",
        "Online and cash-on-delivery payments",
        "Product, inventory and order management",
        "Optimised checkout flow",
        "Product and category SEO",
        "Sales dashboards and analytics",
      ],
      faqs: [
        {
          q: "Which payment methods can you integrate?",
          a: "Card payments through Moroccan and international gateways, cash on delivery, bank transfer… We pick the right mix for your customers together.",
        },
        {
          q: "Shopify or a custom build?",
          a: "Shopify is great for launching fast; custom makes sense when you have specific needs or high volume. We'll help you decide.",
        },
        {
          q: "Can I manage my products myself?",
          a: "Yes — you get a simple admin to manage products, prices, stock and orders.",
        },
      ],
    },
  },
  {
    id: "software",
    stack: ["Next.js", "Node.js", "NestJS", "Laravel", "PostgreSQL", "Docker"],
    fr: {
      slug: "logiciel-sur-mesure",
      title: "Logiciels sur-mesure",
      short: "Plateformes SaaS, ERP, SIRH et tableaux de bord qui automatisent et simplifient votre activité.",
      metaTitle: "Développement de logiciel sur-mesure au Maroc — SaaS, ERP, SIRH",
      metaDescription:
        "Développement de logiciels et plateformes web sur-mesure au Maroc : SaaS, ERP, SIRH, CRM et tableaux de bord sécurisés, adaptés à vos processus métier.",
      h1: "Logiciels et plateformes web sur-mesure",
      lead: "Quand les outils du marché ne suffisent plus, nous développons des logiciels adaptés à vos processus : plus d'automatisation, moins de tâches répétitives et des données claires pour décider.",
      deliverables: [
        "Plateformes SaaS",
        "ERP, CRM et SIRH",
        "Tableaux de bord et back-offices",
        "Espaces clients et portails",
        "Intégrations API et automatisations",
        "Hébergement cloud et sécurité",
      ],
      faqs: [
        {
          q: "Pourquoi un logiciel sur-mesure plutôt qu'un outil existant ?",
          a: "Un logiciel sur-mesure s'adapte à vos processus plutôt que l'inverse, évite les abonnements superflus et évolue avec votre entreprise.",
        },
        {
          q: "Mes données sont-elles sécurisées ?",
          a: "Oui : authentification robuste, gestion des rôles, sauvegardes et bonnes pratiques de sécurité sont intégrées à chaque projet.",
        },
        {
          q: "Pouvez-vous connecter le logiciel à nos outils actuels ?",
          a: "Oui, nous intégrons vos outils existants (comptabilité, CRM, paiement, e-mail…) via leurs API.",
        },
      ],
    },
    en: {
      slug: "custom-software-development",
      title: "Custom software",
      short: "SaaS platforms, ERP, HR systems and dashboards that automate and simplify how you work.",
      metaTitle: "Custom software development in Morocco — SaaS, ERP, HR systems",
      metaDescription:
        "Custom software and web platform development in Morocco: SaaS, ERP, HRIS, CRM and secure dashboards tailored to your business processes.",
      h1: "Custom software and web platforms",
      lead: "When off-the-shelf tools stop fitting, we build software around your processes: more automation, fewer repetitive tasks and clear data to make decisions.",
      deliverables: [
        "SaaS platforms",
        "ERP, CRM and HR systems",
        "Dashboards and back-offices",
        "Client portals",
        "API integrations and automation",
        "Cloud hosting and security",
      ],
      faqs: [
        {
          q: "Why custom software instead of an existing tool?",
          a: "Custom software adapts to your processes instead of the other way round, avoids unnecessary subscriptions and grows with your business.",
        },
        {
          q: "Is my data secure?",
          a: "Yes: strong authentication, role management, backups and security best practices are part of every project.",
        },
        {
          q: "Can you connect it to the tools we already use?",
          a: "Yes, we integrate your existing tools (accounting, CRM, payments, email…) through their APIs.",
        },
      ],
    },
  },
  {
    id: "design",
    stack: ["Figma", "Blender", "Three.js", "GSAP", "Lottie", "Adobe CC"],
    fr: {
      slug: "ui-ux-design-branding",
      title: "UI/UX & branding",
      short: "Identités visuelles, interfaces et expériences interactives 3D qui rendent votre marque inoubliable.",
      metaTitle: "Agence UI/UX design & branding au Maroc",
      metaDescription:
        "Design UI/UX, identité visuelle et expériences interactives 3D au Maroc : des interfaces belles, intuitives et cohérentes avec votre marque.",
      h1: "UI/UX design, branding et expériences interactives",
      lead: "Un bon design ne se contente pas d'être beau : il guide, rassure et convertit. Nous créons des identités et des interfaces cohérentes, du logo au prototype interactif.",
      deliverables: [
        "Identité visuelle et logo",
        "Design system et charte digitale",
        "Recherche utilisateur et parcours",
        "Wireframes et prototypes Figma",
        "Motion design et micro-interactions",
        "Expériences 3D et WebGL",
      ],
      faqs: [
        {
          q: "Livrez-vous les fichiers sources ?",
          a: "Oui, vous recevez les fichiers Figma, les déclinaisons du logo et un guide d'utilisation de votre identité.",
        },
        {
          q: "Pouvez-vous améliorer une interface existante ?",
          a: "Oui. Nous réalisons un audit UX, identifions les points de friction et proposons une nouvelle version testée.",
        },
        {
          q: "Qu'est-ce qu'une expérience 3D WebGL ?",
          a: "Ce sont des scènes 3D interactives affichées directement dans le navigateur — comme sur la page d'accueil de ce site — optimisées pour rester rapides.",
        },
      ],
    },
    en: {
      slug: "ui-ux-design-branding",
      title: "UI/UX & branding",
      short: "Visual identities, interfaces and interactive 3D experiences that make your brand unforgettable.",
      metaTitle: "UI/UX design & branding agency in Morocco",
      metaDescription:
        "UI/UX design, visual identity and interactive 3D experiences in Morocco: beautiful, intuitive interfaces that stay true to your brand.",
      h1: "UI/UX design, branding and interactive experiences",
      lead: "Good design isn't just pretty: it guides, reassures and converts. We create consistent identities and interfaces, from logo to interactive prototype.",
      deliverables: [
        "Visual identity and logo",
        "Design system and digital guidelines",
        "User research and journeys",
        "Wireframes and Figma prototypes",
        "Motion design and micro-interactions",
        "3D and WebGL experiences",
      ],
      faqs: [
        {
          q: "Do you hand over source files?",
          a: "Yes — you get the Figma files, logo variations and a guide to using your identity.",
        },
        {
          q: "Can you improve an existing interface?",
          a: "Yes. We run a UX audit, identify friction points and deliver a tested new version.",
        },
        {
          q: "What is a WebGL 3D experience?",
          a: "Interactive 3D scenes rendered right in the browser — like the one on this site's home page — optimised to stay fast.",
        },
      ],
    },
  },
  {
    id: "seo",
    stack: ["Search Console", "Google Analytics 4", "Semrush", "Ahrefs", "Schema.org", "Looker Studio"],
    fr: {
      slug: "referencement-seo",
      title: "SEO & croissance",
      short: "Référencement naturel, contenus et analytics pour attirer des clients qualifiés depuis Google.",
      metaTitle: "Agence SEO au Maroc — référencement naturel & croissance",
      metaDescription:
        "Agence SEO au Maroc : audit technique, optimisation on-page, contenus, SEO local et Google Business Profile pour attirer plus de clients qualifiés.",
      h1: "Référencement SEO et croissance digitale",
      lead: "Être en première page de Google, c'est être trouvé au moment précis où vos clients cherchent. Nous combinons SEO technique, contenus et suivi analytique pour une croissance durable.",
      deliverables: [
        "Audit SEO technique complet",
        "Recherche de mots-clés",
        "Optimisation on-page et contenus",
        "SEO local et Google Business Profile",
        "SEO multilingue (FR, EN, AR)",
        "Suivi analytics et reporting",
      ],
      faqs: [
        {
          q: "En combien de temps voit-on des résultats ?",
          a: "Le SEO est un investissement à moyen terme : les premiers effets apparaissent généralement après quelques mois, puis s'amplifient avec le temps.",
        },
        {
          q: "Garantissez-vous la première position ?",
          a: "Personne ne peut garantir une position sur Google. Nous appliquons des méthodes éprouvées et vous montrons l'évolution de vos résultats dans des rapports réguliers.",
        },
        {
          q: "Qu'est-ce que le SEO local ?",
          a: "C'est l'optimisation de votre visibilité dans votre ville : fiche Google Business Profile, avis, pages locales et cohérence de vos informations en ligne.",
        },
      ],
    },
    en: {
      slug: "seo-growth",
      title: "SEO & growth",
      short: "Search engine optimisation, content and analytics to bring qualified customers from Google.",
      metaTitle: "SEO agency in Morocco — search optimisation & growth",
      metaDescription:
        "SEO agency in Morocco: technical audits, on-page optimisation, content, local SEO and Google Business Profile to attract more qualified customers.",
      h1: "SEO and digital growth",
      lead: "Ranking on Google's first page means being found at the exact moment your customers are searching. We combine technical SEO, content and analytics for lasting growth.",
      deliverables: [
        "Full technical SEO audit",
        "Keyword research",
        "On-page and content optimisation",
        "Local SEO and Google Business Profile",
        "Multilingual SEO (FR, EN, AR)",
        "Analytics tracking and reporting",
      ],
      faqs: [
        {
          q: "How long until we see results?",
          a: "SEO is a medium-term investment: first effects usually show after a few months, then compound over time.",
        },
        {
          q: "Do you guarantee the #1 position?",
          a: "Nobody can guarantee a Google ranking. We apply proven methods and show you how your results evolve in regular reports.",
        },
        {
          q: "What is local SEO?",
          a: "Optimising your visibility in your city: Google Business Profile, reviews, local pages and consistent business information online.",
        },
      ],
    },
  },
  {
    id: "access-control",
    stack: ["RFID / badge", "Biométrie", "Reconnaissance faciale", "ZKTeco", "Interphonie", "Pointage"],
    fr: {
      slug: "controle-acces",
      title: "Contrôle d'accès",
      short: "Systèmes de contrôle d'accès par badge, code ou biométrie pour sécuriser portes, bureaux et sites, avec gestion des droits et des horaires.",
      metaTitle: "Contrôle d'accès au Maroc — badge, biométrie & gestion des entrées",
      metaDescription:
        "Installation de systèmes de contrôle d'accès au Maroc : badges RFID, lecteurs biométriques, reconnaissance faciale, gestion des droits et pointage. Installation et maintenance par MH Group.",
      h1: "Systèmes de contrôle d'accès pour sécuriser vos locaux",
      lead: "Maîtrisez qui entre, où et quand. Nous installons et configurons des systèmes de contrôle d'accès fiables — badge, code ou biométrie — pour vos portes, portails et zones sensibles, avec une gestion simple des droits et des horaires.",
      deliverables: [
        "Contrôle d'accès par badge RFID et code",
        "Lecteurs biométriques (empreinte, reconnaissance faciale)",
        "Portes, portails, barrières et tourniquets",
        "Gestion des droits, zones et plages horaires",
        "Pointage et suivi des présences",
        "Intégration avec la vidéosurveillance et l'alarme",
      ],
      faqs: [
        {
          q: "Peut-on gérer les accès à distance ?",
          a: "Oui. La plupart des systèmes se pilotent depuis un logiciel ou une application : ajout de badges, horaires et zones, en temps réel.",
        },
        {
          q: "Le système fonctionne-t-il en cas de coupure de courant ?",
          a: "Oui. Nous prévoyons des batteries de secours et un déverrouillage sécurisé conforme aux normes, pour ne jamais bloquer les issues.",
        },
        {
          q: "Assurez-vous l'installation et la maintenance ?",
          a: "Oui, de l'étude sur site à l'installation, la configuration et la maintenance, partout au Maroc.",
        },
      ],
    },
    en: {
      slug: "access-control",
      title: "Access control",
      short: "Badge, PIN and biometric access control to secure doors, offices and sites, with full control over permissions and schedules.",
      metaTitle: "Access control systems in Morocco — badge, biometric & entry management",
      metaDescription:
        "Access control installation in Morocco: RFID badges, biometric and facial-recognition readers, permission management and time tracking. Installed and maintained by MH Group.",
      h1: "Access control systems to secure your premises",
      lead: "Control who gets in, where and when. We install and configure reliable access control — badge, PIN or biometric — for your doors, gates and sensitive areas, with simple management of permissions and schedules.",
      deliverables: [
        "RFID badge and PIN access control",
        "Biometric readers (fingerprint, facial recognition)",
        "Doors, gates, barriers and turnstiles",
        "Permission, zone and time-slot management",
        "Time and attendance tracking",
        "Integration with CCTV and alarm systems",
      ],
      faqs: [
        {
          q: "Can access be managed remotely?",
          a: "Yes. Most systems are managed from software or an app: add badges, schedules and zones in real time.",
        },
        {
          q: "Does it work during a power cut?",
          a: "Yes. We add backup batteries and standards-compliant safe unlocking, so exits are never blocked.",
        },
        {
          q: "Do you handle installation and maintenance?",
          a: "Yes, from the on-site survey to installation, configuration and maintenance, anywhere in Morocco.",
        },
      ],
    },
  },
  {
    id: "cctv",
    stack: ["Caméras IP", "4K / HD", "NVR / DVR", "Hikvision", "Vision nocturne", "Accès mobile"],
    fr: {
      slug: "videosurveillance",
      title: "Vidéosurveillance",
      short: "Installation de caméras de surveillance HD et 4K, intérieures et extérieures, avec enregistrement et accès en direct depuis votre mobile.",
      metaTitle: "Vidéosurveillance & caméras au Maroc — installation et accès mobile",
      metaDescription:
        "Installation de caméras de surveillance au Maroc : caméras IP HD et 4K, vision nocturne, enregistrement NVR/DVR et visionnage à distance sur mobile. Installation et maintenance par MH Group.",
      h1: "Caméras de surveillance et vidéosurveillance sur-mesure",
      lead: "Gardez un œil sur ce qui compte, où que vous soyez. Nous installons des systèmes de vidéosurveillance fiables — caméras HD et 4K, intérieures comme extérieures — avec enregistrement et accès en direct depuis votre téléphone.",
      deliverables: [
        "Caméras IP et analogiques, HD et 4K",
        "Vidéosurveillance intérieure et extérieure",
        "Vision nocturne et détection de mouvement",
        "Enregistrement NVR/DVR et stockage sécurisé",
        "Visionnage en direct et à distance sur mobile",
        "Installation, câblage et maintenance",
      ],
      faqs: [
        {
          q: "Puis-je voir mes caméras depuis mon téléphone ?",
          a: "Oui. Vous accédez au direct et aux enregistrements depuis une application mobile, où que vous soyez.",
        },
        {
          q: "Combien de temps les enregistrements sont-ils conservés ?",
          a: "Selon la capacité de stockage choisie : de quelques jours à plusieurs semaines, avec archivage possible.",
        },
        {
          q: "Les caméras fonctionnent-elles la nuit et en extérieur ?",
          a: "Oui. Nous installons des caméras à vision nocturne et étanches, adaptées aux conditions extérieures du Maroc.",
        },
      ],
    },
    en: {
      slug: "video-surveillance",
      title: "Video surveillance",
      short: "HD and 4K CCTV installation, indoor and outdoor, with recording and live access from your phone.",
      metaTitle: "CCTV & video surveillance in Morocco — installation and mobile access",
      metaDescription:
        "CCTV installation in Morocco: HD and 4K IP cameras, night vision, NVR/DVR recording and remote viewing on mobile. Installed and maintained by MH Group.",
      h1: "CCTV and video surveillance, tailored to your site",
      lead: "Keep an eye on what matters, wherever you are. We install reliable CCTV systems — HD and 4K cameras, indoor and outdoor — with recording and live access from your phone.",
      deliverables: [
        "IP and analogue cameras, HD and 4K",
        "Indoor and outdoor video surveillance",
        "Night vision and motion detection",
        "NVR/DVR recording and secure storage",
        "Live and remote viewing on mobile",
        "Installation, cabling and maintenance",
      ],
      faqs: [
        {
          q: "Can I view my cameras from my phone?",
          a: "Yes. You get live and recorded footage from a mobile app, wherever you are.",
        },
        {
          q: "How long is footage kept?",
          a: "It depends on the storage you choose: from a few days to several weeks, with archiving available.",
        },
        {
          q: "Do the cameras work at night and outdoors?",
          a: "Yes. We install weatherproof, night-vision cameras suited to Moroccan outdoor conditions.",
        },
      ],
    },
  },
];

export const services: Service[] = base.map((s) => ({ ...s, ar: servicesAr[s.id] }));

export function findServiceBySlug(locale: Locale, slug: string) {
  return services.find((s) => s[locale].slug === slug);
}

// `${locale}/${slug}` → slug in every language, for the language switcher.
export function serviceSlugMap(): SlugMap {
  const map: SlugMap = {};
  for (const s of services) {
    const slugs = Object.fromEntries(locales.map((l) => [l, s[l].slug])) as Record<Locale, string>;
    for (const l of locales) map[`${l}/${s[l].slug}`] = slugs;
  }
  return map;
}
