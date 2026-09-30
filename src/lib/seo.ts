import type { Metadata } from "next";
import { getDictionary, locales, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

// Path of a page (after the locale prefix) in every language, e.g.
// { fr: "/services/creation-site-web", en: "/services/web-development" }.
export type LocalizedPaths = Record<Locale, string>;

export const samePath = (path: string): LocalizedPaths => ({ fr: path, en: path });

export const absoluteUrl = (path: string) => `${site.url}${path}`;

export function pageMetadata({
  locale,
  paths,
  title,
  description,
  absoluteTitle = false,
}: {
  locale: Locale;
  paths: LocalizedPaths;
  title: string;
  description: string;
  absoluteTitle?: boolean;
}): Metadata {
  const dict = getDictionary(locale);
  const url = `/${locale}${paths[locale]}`;
  const languages = Object.fromEntries(locales.map((l) => [l, `/${l}${paths[l]}`]));
  // Set explicitly: a page-level openGraph object replaces the one inherited
  // from app/[locale]/opengraph-image.tsx instead of merging with it.
  const image = { url: `/${locale}/opengraph-image`, width: 1200, height: 630, alt: site.name };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: { ...languages, "x-default": `/fr${paths.fr}` },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: absoluteTitle ? title : `${title} | ${site.name}`,
      description,
      url,
      locale: dict.meta.ogLocale,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => getDictionary(l).meta.ogLocale),
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}
