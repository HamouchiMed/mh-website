import type { MetadataRoute } from "next";
import { cities } from "@/content/cities";
import { services } from "@/content/services";
import { getAllPosts, getProjects } from "@/lib/content";
import { cityFolder, locales, type Locale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";

type Paths = Partial<Record<Locale, string>>;
type Entry = { paths: Paths; priority: number; changeFrequency: "weekly" | "monthly" | "yearly"; lastModified?: string };

const all = (path: string): Paths => Object.fromEntries(locales.map((l) => [l, path]));
const perLocale = (fn: (l: Locale) => string): Paths => Object.fromEntries(locales.map((l) => [l, fn(l)]));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getAllPosts()]);

  const postGroups = new Map<string, Paths & { date?: string }>();
  for (const p of posts) {
    const group = postGroups.get(p.translationKey) ?? {};
    group[p.lang] = `/blog/${p.slug}`;
    group.date = [group.date, p.updated || p.date].filter(Boolean).sort().pop();
    postGroups.set(p.translationKey, group);
  }
  const blogLocales = new Set(posts.map((p) => p.lang));

  const entries: Entry[] = [
    { paths: all(""), priority: 1, changeFrequency: "weekly" },
    { paths: all("/services"), priority: 0.9, changeFrequency: "monthly" },
    ...services.map((s) => ({ paths: perLocale((l) => `/services/${s[l].slug}`), priority: 0.9, changeFrequency: "monthly" as const })),
    { paths: all("/pricing"), priority: 0.8, changeFrequency: "monthly" },
    { paths: all("/work"), priority: 0.7, changeFrequency: "monthly" },
    ...projects.map((p) => ({ paths: all(`/work/${p.slug}`), priority: 0.6, changeFrequency: "monthly" as const })),
    { paths: Object.fromEntries([...blogLocales].map((l) => [l, "/blog"])), priority: 0.7, changeFrequency: "weekly" },
    ...[...postGroups.values()].map(({ date, ...paths }) => ({
      paths,
      priority: 0.7,
      changeFrequency: "monthly" as const,
      lastModified: date,
    })),
    { paths: perLocale((l) => `/${cityFolder[l]}`), priority: 0.8, changeFrequency: "monthly" },
    ...cities.map((c) => ({ paths: perLocale((l) => `/${cityFolder[l]}/${c.slug}`), priority: 0.7, changeFrequency: "monthly" as const })),
    { paths: all("/about"), priority: 0.6, changeFrequency: "monthly" },
    { paths: all("/lab"), priority: 0.5, changeFrequency: "monthly" },
    { paths: all("/contact"), priority: 0.8, changeFrequency: "monthly" },
    { paths: all("/legal"), priority: 0.2, changeFrequency: "yearly" },
    { paths: all("/privacy"), priority: 0.2, changeFrequency: "yearly" },
  ];
  const now = new Date();

  return entries.flatMap(({ paths, priority, changeFrequency, lastModified }) => {
    const available = locales.filter((l) => paths[l] !== undefined);
    const languages = Object.fromEntries(available.map((l) => [l, absoluteUrl(`/${l}${paths[l]}`)]));
    return available.map((locale) => ({
      url: absoluteUrl(`/${locale}${paths[locale]}`),
      lastModified: lastModified ? new Date(lastModified) : now,
      changeFrequency,
      priority,
      alternates: available.length > 1 ? { languages } : undefined,
    }));
  });
}
