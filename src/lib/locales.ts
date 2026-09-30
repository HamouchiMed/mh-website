// Client-safe locale helpers (no dictionaries or content imported here, so the
// header's language switcher stays tiny in the browser bundle).

export const locales = ["fr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const localeLabels: Record<Locale, string> = { fr: "FR", en: "EN", ar: "ع" };
export const localeNames: Record<Locale, string> = { fr: "Français", en: "English", ar: "العربية" };

export const dir = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// City landing pages live under a translated folder, e.g. /fr/agence-web/casablanca.
export const cityFolder: Record<Locale, string> = { fr: "agence-web", en: "web-agency", ar: "agence-web" };

// Segments whose slug differs per language, keyed by `${locale}/${slug}`.
export type SlugMap = Record<string, Record<Locale, string>>;
export type PathMaps = { services: SlugMap; posts: Record<string, Partial<Record<Locale, string>>> };

// Swap the locale prefix of a pathname, translating the segments that differ
// between languages (service slugs, city folder, blog slugs).
export function localizePath(pathname: string, target: Locale, maps?: PathMaps) {
  const [, current, ...rest] = pathname.split("/");
  if (!current || !isLocale(current)) return `/${target}`;
  if (rest[0] === "services" && rest[1]) {
    const slug = maps?.services[`${current}/${rest[1]}`]?.[target];
    if (slug) rest[1] = slug;
  }
  if (rest[0] === cityFolder[current]) rest[0] = cityFolder[target];
  if (rest[0] === "blog" && rest[1]) {
    const slug = maps?.posts[`${current}/${rest[1]}`]?.[target];
    if (slug) rest[1] = slug;
    else rest.splice(1);
  }
  return ["", target, ...rest].join("/").replace(/\/$/, "");
}
