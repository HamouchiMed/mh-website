import Image from "next/image";
import Link from "next/link";
import { getClients, getPosts, getTestimonials, type Post } from "@/lib/content";
import { getDictionary, localeNames, pick, type Locale } from "@/lib/i18n";
import { delay, SectionHeader } from "./sections";
import { Arrow, arrowHover, Label } from "./ui";

export function formatDate(date: string, locale: Locale) {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function PostCard({ post, locale, index = 0, showLang = false }: { post: Post; locale: Locale; index?: number; showLang?: boolean }) {
  const t = getDictionary(locale).blog;
  return (
    <li data-reveal style={delay((index % 3) * 90)}>
      <Link
        href={`/${post.lang}/blog/${post.slug}`}
        hrefLang={post.lang}
        className="group flex h-full flex-col rounded-[28px] border border-line bg-white/40 p-7 transition-colors duration-500 hover:border-accent hover:bg-white md:p-9"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow text-accent">{post.category}</span>
          {showLang && <span className="rounded-full border border-line px-2.5 py-0.5 text-xs">{localeNames[post.lang]}</span>}
        </div>
        <h3 lang={post.lang} className="mt-8 text-2xl font-medium leading-tight tracking-[-0.02em] md:text-[1.75rem]">
          {post.title}
        </h3>
        <p lang={post.lang} className="mt-4 line-clamp-3 text-muted">
          {post.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-10 text-sm text-muted">
          <span>
            {formatDate(post.date, locale)} · {post.readingMinutes} {t.minutes}
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full border border-line transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white">
            <Arrow className={arrowHover} />
          </span>
        </div>
      </Link>
    </li>
  );
}

export async function LatestPosts({ locale }: { locale: Locale }) {
  const posts = (await getPosts(locale)).slice(0, 3);
  if (!posts.length) return null;
  const t = getDictionary(locale).blog;
  return (
    <section aria-labelledby="latest-posts" className="container-x pb-24 md:pb-40">
      <SectionHeader id="latest-posts" label={t.latestLabel} title={t.latestTitle} link={{ href: `/${locale}/blog`, label: t.all }} />
      <ul className="grid gap-5 md:grid-cols-3">
        {posts.map((p, i) => (
          <PostCard key={p.slug} post={p} locale={locale} index={i} />
        ))}
      </ul>
    </section>
  );
}

// Testimonials and client logos appear only once real entries exist in the CMS.
export async function Trust({ locale }: { locale: Locale }) {
  const [testimonials, clients] = await Promise.all([getTestimonials(), getClients()]);
  if (!testimonials.length && !clients.length) return null;
  const t = getDictionary(locale).trust;
  return (
    <section aria-labelledby="trust-title" className="container-x pb-24 md:pb-40">
      {testimonials.length > 0 && (
        <>
          <SectionHeader id="trust-title" label={t.testimonialsLabel} title={t.testimonialsTitle} />
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item, i) => (
              <li key={item.slug} className="flex flex-col rounded-[28px] bg-ink p-8 text-paper md:p-10" data-reveal style={delay(i * 80)}>
                <span aria-hidden="true" className="display text-6xl text-accent">
                  “
                </span>
                <blockquote className="mt-2 text-lg leading-relaxed md:text-xl">{pick(item.quote, locale)}</blockquote>
                <p className="mt-auto pt-8 font-medium">
                  {item.author}
                  {item.role && <span className="block text-sm font-normal text-paper/60">{item.role}</span>}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
      {clients.length > 0 && (
        <div className={testimonials.length ? "mt-20" : ""}>
          <Label as={testimonials.length ? "p" : "h2"} id={testimonials.length ? undefined : "trust-title"} className="text-muted">
            {t.clientsLabel}
          </Label>
          <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
            {clients.map((c) => {
              const logo = c.logo ? (
                <Image src={c.logo} alt={c.name} width={160} height={64} className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
              ) : (
                <span className="font-medium">{c.name}</span>
              );
              return (
                <li key={c.slug} className="grid h-28 place-items-center bg-paper px-6">
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer">
                      {logo}
                    </a>
                  ) : (
                    logo
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
