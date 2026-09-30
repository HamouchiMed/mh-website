// Brand-wide settings. Edit these values first: they feed the header, footer,
// contact page, JSON-LD structured data, sitemap and Open Graph tags.
export const site = {
  name: "MH Group",
  // Production URL without a trailing slash. Set NEXT_PUBLIC_SITE_URL on Vercel
  // once the final domain (e.g. https://mh-group.ma) is connected.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mh-group-ma.vercel.app").replace(/\/$/, ""),
  // TODO: replace with the agency's real inbox — the contact form sends here.
  email: "contact@mh-group.ma",
  // International format without spaces, e.g. "+212600000000". Leave empty to hide.
  phone: "",
  whatsapp: "",
  country: "MA",
  // Shown on the legal notice page. Empty values display "À compléter".
  // TODO: fill in once the company details are final.
  legal: {
    companyName: "",
    legalForm: "",
    address: "",
    ice: "",
    rc: "",
    director: "",
  },
  // Full profile URLs. Empty entries are not rendered.
  socials: {
    instagram: "",
    linkedin: "",
    behance: "",
    github: "",
  } as Record<string, string>,
};

export const activeSocials = Object.entries(site.socials).filter(([, url]) => url);
