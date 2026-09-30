import { ar } from "@/content/ar";
import { en } from "@/content/en";
import { fr } from "@/content/fr";
import type { Locale } from "./locales";

export * from "./locales";

const dictionaries = { fr, en, ar };
export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

// Language-specific value with a French fallback (used for CMS content where
// a translation may still be empty).
export function pick<T>(value: Partial<Record<Locale, T>> | undefined, locale: Locale): T | undefined {
  if (!value) return undefined;
  const v = value[locale];
  const empty = v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
  return empty ? value.fr : v;
}
