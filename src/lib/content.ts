import "server-only";
import Markdoc, { type Node } from "@markdoc/markdoc";
import { createReader } from "@keystatic/core/reader";
import { cache } from "react";
import keystaticConfig from "../../keystatic.config";
import { pick, type Locale } from "./i18n";

// Content edited through Keystatic (/keystatic) and stored in /content.
const reader = createReader(process.cwd(), keystaticConfig);

export type Project = Awaited<ReturnType<typeof loadProjects>>[number];

const loadProjects = cache(async () => {
  const entries = await reader.collections.projects.all();
  return entries
    .map(({ slug, entry }) => ({ slug, ...entry, palette: toPalette(entry.palette) }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
});

function toPalette(p: readonly string[]): [string, string, string] {
  const fallback = ["#2E3BFF", "#8FA2FF", "#0B0B12"];
  return [p[0] || fallback[0], p[1] || fallback[1], p[2] || fallback[2]];
}

export const getProjects = loadProjects;

export async function getProject(slug: string) {
  return (await loadProjects()).find((p) => p.slug === slug);
}

// Localised view of a project with French fallbacks.
export function localizeProject(p: Project, locale: Locale) {
  return {
    slug: p.slug,
    name: p.name,
    client: p.client,
    year: p.year,
    url: p.url,
    palette: p.palette,
    cover: p.cover,
    gallery: p.gallery.filter((g) => g.image),
    tags: p.tags,
    stack: p.stack,
    services: p.services,
    category: pick(p.category, locale) ?? "",
    summary: pick(p.summary, locale) ?? "",
    challenge: pick(p.challenge, locale) ?? "",
    solution: pick(p.solution, locale) ?? "",
    features: pick(p.features, locale) ?? [],
  };
}

export type Post = {
  slug: string;
  title: string;
  lang: Locale;
  translationKey: string;
  description: string;
  category: string;
  date: string;
  updated: string | null;
  readingMinutes: number;
  node: Node;
};

const loadPosts = cache(async (): Promise<Post[]> => {
  const entries = await reader.collections.posts.all({ resolveLinkedFiles: true });
  return entries
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      lang: entry.lang as Locale,
      translationKey: entry.translationKey || slug,
      description: entry.description,
      category: entry.category,
      date: entry.date ?? "",
      updated: entry.updated,
      node: entry.content.node,
      readingMinutes: readingTime(entry.content.node),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
});

function readingTime(node: Node) {
  let words = 0;
  for (const child of node.walk()) {
    if (child.type === "text" && typeof child.attributes.content === "string") {
      words += child.attributes.content.split(/\s+/).filter(Boolean).length;
    }
  }
  return Math.max(1, Math.ceil(words / 200));
}

export const getAllPosts = loadPosts;

export async function getPosts(locale: Locale) {
  return (await loadPosts()).filter((p) => p.lang === locale);
}

export async function getPost(locale: Locale, slug: string) {
  return (await loadPosts()).find((p) => p.lang === locale && p.slug === slug);
}

// Same article in the other languages, keyed by locale.
export async function getPostTranslations(post: Post) {
  const all = await loadPosts();
  return Object.fromEntries(
    all.filter((p) => p.translationKey === post.translationKey).map((p) => [p.lang, p.slug]),
  ) as Partial<Record<Locale, string>>;
}

export async function getPostSlugMap() {
  const all = await loadPosts();
  const map: Record<string, Partial<Record<Locale, string>>> = {};
  for (const p of all) {
    map[`${p.lang}/${p.slug}`] = Object.fromEntries(
      all.filter((o) => o.translationKey === p.translationKey).map((o) => [o.lang, o.slug]),
    );
  }
  return map;
}

export function renderMarkdoc(node: Node) {
  return Markdoc.transform(node, {
    nodes: {
      heading: {
        children: ["inline"],
        attributes: { id: { type: String }, level: { type: Number, required: true } },
        transform(node, config) {
          const children = node.transformChildren(config);
          const text = children.filter((c) => typeof c === "string").join(" ");
          const id = text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^\p{L}\p{N}]+/gu, "-")
            .replace(/^-|-$/g, "");
          return new Markdoc.Tag(`h${node.attributes.level}`, { id }, children);
        },
      },
    },
  });
}

export const getTestimonials = cache(async () => {
  const entries = await reader.collections.testimonials.all();
  return entries.map(({ slug, entry }) => ({ slug, ...entry }));
});

export const getClients = cache(async () => {
  const entries = await reader.collections.clients.all();
  return entries.map(({ slug, entry }) => ({ slug, ...entry }));
});

export const getStudio = cache(async () => {
  const studio = await reader.singletons.studio.read();
  return {
    showreel: studio?.showreel ?? null,
    showreelPoster: studio?.showreelPoster ?? null,
    stats: (studio?.stats ?? []).filter((s) => s.value),
  };
});

export const getTeam = cache(async () => {
  const entries = await reader.collections.team.all();
  return entries.map(({ slug, entry }) => ({ slug, ...entry })).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
});
