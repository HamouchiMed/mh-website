// Brand-wide settings. Edit these values first: they feed the header, footer,
// contact page, JSON-LD structured data, sitemap and Open Graph tags.
export const site = {
  name: "MH Group",
  // Production URL without a trailing slash. Set NEXT_PUBLIC_SITE_URL on Vercel
  // once the final domain (e.g. https://mh-group.ma) is connected.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mh-website-bay.vercel.app").replace(/\/$/, ""),
  // Shown on the site, and where the contact form sends. Personal Gmail for now.
  // TODO: switch to an address on the final domain once it is bought.
  email: "mohamedhamouchi2006@gmail.com",
  // International format without spaces, e.g. "+212600000000". Leave empty to hide.
  phone: "+212708826686",
  whatsapp: "+212708826686",
  country: "MA",
  // Look of the home page and footer. "ciel" is the "Du ciel au code" design
  // (sky dive, topographic map, LED panels, blueprint plan, ASCII covers);
  // "classic" brings back the previous design (3D bubble, marquee, particles).
  experience: "ciel" as "ciel" | "classic",
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
