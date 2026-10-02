import Markdoc from "@markdoc/markdoc";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { formatDate, PostCard } from "@/components/blocks";
import { delay } from "@/components/sections";
import { JsonLd, Label, Pill } from "@/components/ui";
import { getPost, getPosts, getPostTranslations, renderMarkdoc } from "@/lib/content";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { absoluteUrl, breadcrumbLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return [];
  return (await getPosts(params.locale)).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const post = await getPost(locale, slug);
  if (!post) return {};
  const translations = await getPostTranslations(post);
  const paths = Object.fromEntries(Object.entries(translations).map(([l, s]) => [l, `/blog/${s}`])) as Partial<Record<Locale, string>>;
  return {
    ...pageMetadata({ locale, paths, title: post.title, description: post.description, type: "article" }),
    other: { "article:published_time": post.date, ...(post.updated ? { "article:modified_time": post.updated } : {}) },
  };
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const post = await getPost(locale, slug);
  if (!post) notFound();
  const t = getDictionary(locale);
  const related = (await getPosts(locale)).filter((p) => p.slug !== slug).slice(0, 2);
  const content = Markdoc.renderers.react(renderMarkdoc(post.node), React);
  const url = absoluteUrl(`/${locale}/blog/${slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        url,
        mainEntityOfPage: url,
        inLanguage: locale,
        datePublished: post.date,
        dateModified: post.updated || post.date,
        image: absoluteUrl(`/${locale}/opengraph-image`),
        author: { "@type": "Organization", name: site.name, url: site.url },
        publisher: { "@id": `${site.url}/#organization` },
        articleSection: post.category,
      },
      breadcrumbLd([
        { name: t.nav.home, path: `/${locale}` },
        { name: t.nav.blog, path: `/${locale}/blog` },
        { name: post.title, path: `/${locale}/blog/${slug}` },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article>
        <header className="container-x pb-12 pt-32 md:pb-16 md:pt-44">
          <nav aria-label="Breadcrumb">
            <ol className="eyebrow flex flex-wrap items-center gap-2 text-muted">
              <li>
                <Link href={`/${locale}/blog`} className="hover:text-ink">
                  {t.nav.blog}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-accent">{post.category}</li>
            </ol>
          </nav>
          <h1 className="h-page mt-6 max-w-[24ch] [text-wrap:balance]">{post.title}</h1>
          <p className="mt-8 max-w-3xl text-xl leading-relaxed text-ink/75" data-rise style={delay(150)}>
            {post.description}
          </p>
          <p className="mt-8 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span>
              {t.blog.published} <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
            </span>
            {post.updated && (
              <span>
                · {t.blog.updated} <time dateTime={post.updated}>{formatDate(post.updated, locale)}</time>
              </span>
            )}
            <span>
              · {post.readingMinutes} {t.blog.minutes}
            </span>
          </p>
        </header>
        <div className="container-x border-t border-line pt-12 md:pt-16">
          <div className="prose-mh mx-auto max-w-[72ch]">{content}</div>
        </div>
      </article>

      <section className="container-x py-20 md:py-28">
        <div className="mx-auto flex max-w-[72ch] flex-col items-start gap-6 rounded-2xl bg-ink p-8 text-paper md:p-12">
          <p className="eyebrow text-paper/60">{t.cta.label}</p>
          <p className="h-section">{t.cta.title}</p>
          <Pill href={`/${locale}/contact`}>{t.cta.button}</Pill>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related" className="container-x pb-20 md:pb-28">
          <Label as="h2" id="related" className="text-muted">
            {t.blog.related}
          </Label>
          <ul className="mt-8 grid gap-5 md:grid-cols-2">
            {related.map((p, i) => (
              <PostCard key={p.slug} post={p} locale={locale} index={i} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
