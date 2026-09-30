import Link from "next/link";
import { notFound } from "next/navigation";
import { delay } from "@/components/sections";
import Image from "next/image";
import { Arrow, arrowHover, JsonLd, Label, Pill, ProjectMedia, SplitHeadline } from "@/components/ui";
import { services } from "@/content/services";
import { getProject, getProjects, localizeProject } from "@/lib/content";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { absoluteUrl, breadcrumbLd, pageMetadata, samePath } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = await getProject(slug);
  if (!project) return {};
  const p = localizeProject(project, locale);
  return pageMetadata({
    locale,
    paths: samePath(`/work/${slug}`),
    title: `${p.name} — ${p.category}`,
    description: p.summary,
  });
}

export default async function CaseStudy({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const all = await getProjects();
  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const p = localizeProject(all[index], locale);
  const next = localizeProject(all[(index + 1) % all.length], locale);
  const t = getDictionary(locale);
  const w = t.workDetail;
  const related = services.filter((s) => p.services.includes(s.id as (typeof p.services)[number]));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: p.name,
        headline: `${p.name} — ${p.category}`,
        description: p.summary,
        url: absoluteUrl(`/${locale}/work/${slug}`),
        inLanguage: locale,
        creator: { "@id": `${site.url}/#organization` },
        keywords: [...p.tags, ...p.stack].join(", "),
        ...(p.url ? { sameAs: p.url } : {}),
      },
      breadcrumbLd([
        { name: t.nav.home, path: `/${locale}` },
        { name: t.nav.work, path: `/${locale}/work` },
        { name: p.name, path: `/${locale}/work/${slug}` },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="container-x pb-12 pt-32 md:pb-16 md:pt-44">
        <nav aria-label="Breadcrumb">
          <ol className="eyebrow flex flex-wrap items-center gap-2 text-muted">
            <li>
              <Link href={`/${locale}/work`} className="hover:text-ink">
                {t.nav.work}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {p.name}
            </li>
          </ol>
        </nav>
        <p className="eyebrow mt-10 text-accent">{p.category}</p>
        <SplitHeadline text={p.name} className="display mt-4 text-[clamp(3rem,10vw,10rem)]" />
        <p className="mt-8 max-w-3xl text-xl leading-relaxed text-ink/75 md:text-2xl" data-reveal style={delay(300)}>
          {p.summary}
        </p>
      </section>

      <section className="container-x" data-reveal>
        <ProjectMedia
          src={p.cover}
          alt={`${p.name} — ${p.category}`}
          palette={p.palette}
          index={index}
          sizes="(min-width: 1600px) 1500px, 100vw"
          preload
          className="md:aspect-[16/9]"
        />
      </section>

      <section className="container-x py-16 md:py-24">
        <dl className="grid gap-8 border-y border-line py-10 sm:grid-cols-2 lg:grid-cols-4">
          {p.client && (
            <div>
              <dt className="eyebrow text-muted">{w.client}</dt>
              <dd className="mt-3 text-lg font-medium">{p.client}</dd>
            </div>
          )}
          <div>
            <dt className="eyebrow text-muted">{w.services}</dt>
            <dd className="mt-3 flex flex-col gap-1.5">
              {related.map((s) => (
                <Link key={s.id} href={`/${locale}/services/${s[locale].slug}`} className="text-lg font-medium hover:text-accent">
                  {s[locale].title}
                </Link>
              ))}
            </dd>
          </div>
          <div className={p.client ? "" : "lg:col-span-2"}>
            <dt className="eyebrow text-muted">{w.stack}</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {p.stack.map((tech) => (
                <span key={tech} className="rounded-full border border-line px-3.5 py-1.5 text-sm">
                  {tech}
                </span>
              ))}
            </dd>
          </div>
          {p.url && (
            <div className="flex items-end lg:justify-end">
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="group inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper transition-colors hover:bg-accent"
              >
                {w.visit}
                <Arrow className={arrowHover} />
              </a>
            </div>
          )}
        </dl>
      </section>

      <section className="container-x grid gap-16 pb-24 md:grid-cols-12 md:pb-36">
        {p.challenge && (
          <div className="md:col-span-6" data-reveal>
            <Label as="h2" className="text-muted">
              {w.challenge}
            </Label>
            <p className="mt-6 text-2xl font-medium leading-snug tracking-[-0.02em] md:text-3xl">{p.challenge}</p>
          </div>
        )}
        {p.solution && (
          <div className="md:col-span-6" data-reveal style={delay(120)}>
            <Label as="h2" className="text-muted">
              {w.solution}
            </Label>
            <p className="mt-6 text-lg leading-relaxed text-ink/80 md:text-xl">{p.solution}</p>
          </div>
        )}
        {p.features.length > 0 && (
          <div className="md:col-span-12">
            <Label as="h2" className="text-muted">
              {w.features}
            </Label>
            <ul className="mt-8 grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {p.features.map((f, i) => (
                <li key={f} className="flex items-start gap-5 bg-paper p-7 md:p-9" data-reveal style={delay((i % 3) * 70)}>
                  <span className="font-mono text-sm text-accent">0{i + 1}</span>
                  <span className="text-lg font-medium tracking-[-0.01em]">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {p.gallery.length > 0 && (
        <section aria-label={p.name} data-theme="dark" className="py-20 md:py-28">
          <ul className="container-x grid items-end gap-8 md:grid-cols-12">
            {p.gallery.map((g, i) =>
              g.device === "mobile" ? (
                <li key={i} className="md:col-span-4" data-reveal style={delay((i % 3) * 90)}>
                  <div className="mx-auto w-full max-w-[320px] rounded-[44px] border-[10px] border-[#1c1c24] bg-[#1c1c24] shadow-2xl">
                    <div data-liquid className="relative aspect-[9/19.5] overflow-hidden rounded-[34px]">
                      <Image src={g.image as string} alt={`${p.name} — ${i + 1}`} fill sizes="320px" className="object-cover object-top" />
                    </div>
                  </div>
                </li>
              ) : (
                <li key={i} className="md:col-span-8" data-reveal style={delay((i % 3) * 90)}>
                  <div className="overflow-hidden rounded-2xl border border-line bg-[#1c1c24] shadow-2xl">
                    <div aria-hidden="true" className="flex items-center gap-1.5 px-4 py-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    </div>
                    <div data-liquid className="relative aspect-[16/10] overflow-hidden">
                      <Image src={g.image as string} alt={`${p.name} — ${i + 1}`} fill sizes="(min-width: 768px) 66vw, 100vw" className="object-cover object-top" />
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      {next.slug !== p.slug && (
        <section className="border-t border-line">
          <Link
            href={`/${locale}/work/${next.slug}`}
            className="group container-x flex flex-col gap-4 py-20 md:flex-row md:items-end md:justify-between md:py-28"
            data-cursor-label={w.view}
          >
            <div>
              <p className="eyebrow text-muted">{w.next}</p>
              <p className="display mt-4 text-[clamp(2.75rem,8vw,7rem)] transition-colors duration-500 group-hover:text-accent">
                {next.name}
              </p>
            </div>
            <span className="text-muted">{next.category}</span>
          </Link>
        </section>
      )}

      <section className="container-x pb-24">
        <Pill href={`/${locale}/work`} variant="outline">
          {w.all}
        </Pill>
      </section>
    </>
  );
}
