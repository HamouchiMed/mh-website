import type { MetadataRoute } from "next";
import { services } from "@/content/services";
import { locales, type Locale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";

type Entry = { paths: Record<Locale, string>; priority: number; changeFrequency: "weekly" | "monthly" };

export default function sitemap(): MetadataRoute.Sitemap {
  const same = (p: string) => ({ fr: p, en: p });
  const entries: Entry[] = [
    { paths: same(""), priority: 1, changeFrequency: "weekly" },
    { paths: same("/services"), priority: 0.9, changeFrequency: "monthly" },
    ...services.map((s) => ({
      paths: { fr: `/services/${s.fr.slug}`, en: `/services/${s.en.slug}` },
      priority: 0.9,
      changeFrequency: "monthly" as const,
    })),
    { paths: same("/work"), priority: 0.7, changeFrequency: "monthly" },
    { paths: same("/about"), priority: 0.6, changeFrequency: "monthly" },
    { paths: same("/contact"), priority: 0.8, changeFrequency: "monthly" },
  ];
  const lastModified = new Date();

  return entries.flatMap(({ paths, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: absoluteUrl(`/${locale}${paths[locale]}`),
      lastModified,
      changeFrequency,
      priority: locale === "fr" ? priority : Math.round(priority * 90) / 100,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(`/${l}${paths[l]}`)])),
      },
    })),
  );
}
