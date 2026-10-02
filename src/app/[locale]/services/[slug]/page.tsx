import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Process } from "@/components/sections";
import { Arrow, arrowHover, Faq, JsonLd, Label, Pill, SplitHeadline } from "@/components/ui";
import { findServiceBySlug, services } from "@/content/services";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  return services.map((s) => ({ slug: s[locale].slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const service = findServiceBySlug(locale, slug);
  if (!service) return {};
  return pageMetadata({
    locale,
    paths: Object.fromEntries(locales.map((l) => [l, `/services/${service[l].slug}`])) as Record<Locale, string>,
    title: service[locale].metaTitle,
    description: service[locale].metaDescription,
  });
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const service = findServiceBySlug(locale, slug);
  if (!service) notFound();
  const t = getDictionary(locale);
  const s = service[locale];
  const url = absoluteUrl(`/${locale}/services/${s.slug}`);
  const index = services.indexOf(service);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: s.title,
        serviceType: s.title,
        description: s.metaDescription,
        url,
        provider: { "@id": `${site.url}/#organization` },
        areaServed: [{ "@type": "Country", name: "Morocco" }, "Worldwide"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: t.serviceDetail.deliverables,
          itemListElement: s.deliverables.map((d) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: d } })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.nav.home, item: absoluteUrl(`/${locale}`) },
          { "@type": "ListItem", position: 2, name: t.nav.services, item: absoluteUrl(`/${locale}/services`) },
          { "@type": "ListItem", position: 3, name: s.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: s.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -end-[10%] -top-[14%] -z-10 aspect-square w-[38vw] max-w-[35rem] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff_0%,#8fa2ff_18%,#2e3bff_55%,#0b0b12_100%)] opacity-90"
        />
        <div className="container-x pb-16 pt-32 md:pb-24 md:pt-44">
          <nav aria-label="Breadcrumb">
            <ol className="eyebrow flex flex-wrap items-center gap-2 text-muted">
              <li>
                <Link href={`/${locale}`} className="hover:text-ink">
                  {t.nav.home}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/${locale}/services`} className="hover:text-ink">
                  {t.nav.services}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                {s.title}
              </li>
            </ol>
          </nav>
          <p className="eyebrow mt-10 text-accent">0{index + 1}</p>
          <SplitHeadline text={s.h1} className="h-page mt-4 max-w-[22ch] [text-wrap:balance]" />
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted" data-rise style={{ "--delay": "150ms" } as CSSProperties}>
            {s.lead}
          </p>
          <div className="mt-10" data-rise style={{ "--delay": "250ms" } as CSSProperties}>
            <Pill href={`/${locale}/contact`}>{t.serviceDetail.cta}</Pill>
          </div>
        </div>
      </section>

      <section aria-labelledby="deliverables" className="container-x py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Label as="h2" id="deliverables" className="text-muted">
              {t.serviceDetail.deliverables}
            </Label>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 md:col-span-8">
            {s.deliverables.map((d, i) => (
              <li key={d} className="flex items-start gap-5 bg-paper p-6 md:p-7" data-reveal style={{ "--delay": `${(i % 2) * 80}ms` } as CSSProperties}>
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <span className="text-lg font-medium">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="stack" className="container-x pb-16 md:pb-24">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Label as="h2" id="stack" className="text-muted">
              {t.serviceDetail.stack}
            </Label>
          </div>
          <ul className="flex flex-wrap gap-3 md:col-span-8">
            {service.stack.map((tech) => (
              <li key={tech} className="rounded-full border border-line px-5 py-2.5 text-lg" data-reveal>
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Process locale={locale} title={t.serviceDetail.process} />

      <section aria-labelledby="service-faq" className="container-x py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 id="service-faq" className="h-section">
              {t.serviceDetail.faq}
            </h2>
          </div>
          <div className="md:col-span-8">
            <Faq items={s.faqs} />
          </div>
        </div>
      </section>

      <section aria-labelledby="others" className="container-x pb-20 md:pb-28">
        <Label as="h2" id="others" className="text-muted">
          {t.serviceDetail.others}
        </Label>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {services
            .filter((o) => o.id !== service.id)
            .map((o) => (
              <li key={o.id}>
                <Link
                  href={`/${locale}/services/${o[locale].slug}`}
                  className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-line px-5 py-5 transition-colors hover:border-accent hover:bg-accent hover:text-white"
                >
                  <span className="font-medium">{o[locale].title}</span>
                  <Arrow className={arrowHover} />
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
