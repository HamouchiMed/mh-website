import { PostCard } from "@/components/blocks";
import { PageHero } from "@/components/sections";
import { JsonLd, Label } from "@/components/ui";
import { getAllPosts, getPosts } from "@/lib/content";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { absoluteUrl, breadcrumbLd, pageMetadata, samePath } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale as Locale).blog;
  const posts = await getPosts(locale as Locale);
  return pageMetadata({
    locale: locale as Locale,
    paths: samePath("/blog"),
    title: t.metaTitle,
    description: t.metaDescription,
    noindex: posts.length === 0,
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const t = getDictionary(locale);
  const posts = await getPosts(locale);
  const others = posts.length ? [] : (await getAllPosts()).filter((p) => p.lang !== locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        name: `${site.name} — ${t.blog.label}`,
        url: absoluteUrl(`/${locale}/blog`),
        inLanguage: locale,
        publisher: { "@id": `${site.url}/#organization` },
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: absoluteUrl(`/${locale}/blog/${p.slug}`),
          datePublished: p.date,
        })),
      },
      breadcrumbLd([
        { name: t.nav.home, path: `/${locale}` },
        { name: t.nav.blog, path: `/${locale}/blog` },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero label={t.blog.label} title={t.blog.h1} lead={t.blog.lead} />
      <section className="container-x pb-20 md:pb-28">
        {posts.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <PostCard key={p.slug} post={p} locale={locale} index={i} />
            ))}
          </ul>
        ) : (
          <>
            <p className="rounded-2xl border border-line bg-white/40 p-8 text-lg text-muted">{t.blog.empty}</p>
            {others.length > 0 && (
              <>
                <Label as="h2" className="mt-16 text-muted">
                  {t.blog.otherLanguages}
                </Label>
                <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {others.map((p, i) => (
                    <PostCard key={`${p.lang}-${p.slug}`} post={p} locale={locale} index={i} showLang />
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}
