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
