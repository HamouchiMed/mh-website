import type { Metadata } from "next";
import { getDictionary, locales, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

// Path of a page (after the locale prefix) in each language it exists in, e.g.
// { fr: "/services/creation-site-web", en: "/services/web-development", … }.
export type LocalizedPaths = Partial<Record<Locale, string>>;

export const samePath = (path: string): LocalizedPaths => Object.fromEntries(locales.map((l) => [l, path]));

export const absoluteUrl = (path: string) => `${site.url}${path}`;

export function pageMetadata({
  locale,
  paths,
  title,
  description,
  absoluteTitle = false,
  type = "website",
  noindex = false,
}: {
  locale: Locale;
  paths: LocalizedPaths;
  title: string;
  description: string;
  absoluteTitle?: boolean;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const dict = getDictionary(locale);
  const url = `/${locale}${paths[locale] ?? ""}`;
  const available = locales.filter((l) => paths[l] !== undefined);
  const languages = Object.fromEntries(available.map((l) => [l, `/${l}${paths[l]}`]));
  const xDefault = paths.fr !== undefined ? `/fr${paths.fr}` : url;
  // Set explicitly: a page-level openGraph object replaces the one inherited
  // from app/[locale]/opengraph-image.tsx instead of merging with it.
  const image = { url: `/${locale}/opengraph-image`, width: 1200, height: 630, alt: site.name };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: available.length > 1 ? { ...languages, "x-default": xDefault } : undefined,
    },
    openGraph: {
      type,
      siteName: site.name,
      title: absoluteTitle ? title : `${title} | ${site.name}`,
      description,
      url,
      locale: dict.meta.ogLocale,
      alternateLocale: available.filter((l) => l !== locale).map((l) => getDictionary(l).meta.ogLocale),
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
