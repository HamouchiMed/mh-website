import { en } from "@/content/en";
import { fr } from "@/content/fr";
import { findServiceBySlug } from "@/content/services";

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const localeLabels: Record<Locale, string> = { fr: "FR", en: "EN" };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale) {
  return locale === "fr" ? fr : en;
}

// Swap the locale prefix of a pathname. Service slugs are translated, so they
// are mapped to their counterpart in the target language.
export function localizePath(pathname: string, target: Locale) {
  const [, current, ...rest] = pathname.split("/");
  if (!current || !isLocale(current)) return `/${target}`;
  if (rest[0] === "services" && rest[1]) {
    const service = findServiceBySlug(current, rest[1]);
    if (service) rest[1] = service[target].slug;
  }
  return ["", target, ...rest].join("/").replace(/\/$/, "");
}
