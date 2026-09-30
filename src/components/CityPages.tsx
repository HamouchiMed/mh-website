import Link from "next/link";
import { notFound } from "next/navigation";
import { delay, FaqSection, PageHero, Process, ServicesList } from "@/components/sections";
import { Arrow, arrowHover, Faq, JsonLd, Label, Pill } from "@/components/ui";
import { cities, fill, findCity } from "@/content/cities";
import { cityFolder, getDictionary, locales, type Locale } from "@/lib/i18n";
import { absoluteUrl, breadcrumbLd, faqLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

// Shared by /[locale]/agence-web (fr, ar) and /[locale]/web-agency (en).

const hubPaths = () => Object.fromEntries(locales.map((l) => [l, `/${cityFolder[l]}`])) as Record<Locale, string>;
const cityPaths = (slug: string) =>
  Object.fromEntries(locales.map((l) => [l, `/${cityFolder[l]}/${slug}`])) as Record<Locale, string>;

export function citiesHubMetadata(locale: Locale) {
  const t = getDictionary(locale).cities;
  return pageMetadata({ locale, paths: hubPaths(), title: t.metaTitle, description: t.metaDescription });
}

export function cityMetadata(locale: Locale, slug: string) {
  const city = findCity(slug);
  if (!city) return {};
  const t = getDictionary(locale).cities.city;
  return pageMetadata({
    locale,
    paths: cityPaths(slug),
    title: fill(t.metaTitle, city, locale),
    description: fill(t.metaDescription, city, locale),
  });
}

export function CitiesHub({ locale, folder }: { locale: Locale; folder: string }) {
  if (cityFolder[locale] !== folder) notFound();
  const t = getDictionary(locale);
  const base = `/${locale}/${folder}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: t.cities.h1,
        description: t.cities.metaDescription,
        url: absoluteUrl(base),
        provider: { "@id": `${site.url}/#organization` },
        areaServed: cities.map((c) => ({ "@type": "City", name: c.name[locale] })),
      },
      breadcrumbLd([
        { name: t.nav.home, path: `/${locale}` },
        { name: t.cities.label, path: base },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero label={t.cities.label} title={t.cities.h1} lead={t.cities.lead} />
      <section aria-labelledby="city-list" className="container-x pb-24 md:pb-36">
        <Label as="h2" id="city-list" className="text-muted">
          {t.cities.listTitle}
        </Label>
        <ul className="mt-8 grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c, i) => (
            <li key={c.slug} data-reveal style={delay((i % 3) * 60)}>
              <Link href={`${base}/${c.slug}`} className="group flex h-full items-center justify-between gap-4 bg-paper p-7 transition-colors hover:bg-accent hover:text-white md:p-9">
                <span>
                  <span className="block text-2xl font-medium tracking-[-0.02em] md:text-3xl">{c.name[locale]}</span>
                  <span className="mt-1 block text-sm text-muted transition-colors group-hover:text-white/70">{c.region[locale]}</span>
                </span>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line transition-colors group-hover:border-white">
                  <Arrow className={arrowHover} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-muted">
          {t.cities.notListed}{" "}
          <Link href={`/${locale}/contact`} className="font-medium text-ink underline underline-offset-4">
            {t.nav.contact}
          </Link>
        </p>
      </section>
      <section aria-labelledby="hub-services" className="container-x pb-24 md:pb-36">
        <Label as="h2" id="hub-services" className="mb-8 text-muted">
          {t.servicesSection.label}
        </Label>
        <ServicesList locale={locale} />
      </section>
      <Process locale={locale} />
    </>
  );
}

export function CityPage({ locale, folder, slug }: { locale: Locale; folder: string; slug: string }) {
  if (cityFolder[locale] !== folder) notFound();
  const city = findCity(slug);
  if (!city) notFound();
  const t = getDictionary(locale);
  const c = t.cities.city;
  const f = (s: string) => fill(s, city, locale);
  const base = `/${locale}/${folder}`;
  const faqs = [city.faq[locale], ...c.faq.map((q) => ({ q: f(q.q), a: f(q.a) }))];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: f(c.h1),
        description: f(c.metaDescription),
        url: absoluteUrl(`${base}/${slug}`),
        provider: { "@id": `${site.url}/#organization` },
        areaServed: {
          "@type": "City",
          name: city.name[locale],
          containedInPlace: { "@type": "AdministrativeArea", name: city.region[locale] },
          geo: { "@type": "GeoCoordinates", latitude: city.geo[0], longitude: city.geo[1] },
        },
        serviceType: t.nav.services,
      },
      breadcrumbLd([
        { name: t.nav.home, path: `/${locale}` },
        { name: t.cities.label, path: base },
        { name: city.name[locale], path: `${base}/${slug}` },
      ]),
      faqLd(faqs),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -end-[12%] -top-[16%] -z-10 aspect-square w-[48vw] max-w-[780px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff_0%,#8fa2ff_18%,#2e3bff_55%,#0b0b12_100%)] opacity-90"
        />
        <div className="container-x pb-16 pt-32 md:pb-24 md:pt-44">
          <nav aria-label="Breadcrumb">
            <ol className="eyebrow flex flex-wrap items-center gap-2 text-muted">
              <li>
                <Link href={base} className="hover:text-ink">
                  {t.cities.label}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                {city.name[locale]}
              </li>
            </ol>
          </nav>
          <h1 className="display mt-8 max-w-[14ch] text-[clamp(2.75rem,7vw,7rem)] [text-wrap:balance]">{f(c.h1)}</h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink/75 md:text-xl" data-reveal style={delay(200)}>
            {f(c.lead)}
          </p>
          <div className="mt-10" data-reveal style={delay(320)}>
            <Pill href={`/${locale}/contact`}>{c.cta}</Pill>
          </div>
        </div>
      </section>

      <section className="container-x py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <Label className="text-muted">{f(c.label)}</Label>
          </div>
          <p className="text-[clamp(1.4rem,2.6vw,2.4rem)] font-medium leading-[1.25] tracking-[-0.02em] md:col-span-9" data-reveal>
            {city.intro[locale]}
          </p>
        </div>
      </section>

      <section aria-labelledby="sectors" className="container-x pb-20 md:pb-32">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Label as="h2" id="sectors" className="text-muted">
              {f(c.sectorsTitle)}
            </Label>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2 md:col-span-8">
            {city.sectors[locale].map((s, i) => (
              <li key={s} className="flex items-start gap-5 bg-paper p-7 md:p-9" data-reveal style={delay((i % 2) * 80)}>
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <span className="text-xl font-medium tracking-[-0.02em]">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="city-services" className="container-x pb-24 md:pb-36">
        <h2 id="city-services" className="display mb-12 text-[clamp(2.25rem,5vw,4.5rem)]" data-reveal>
          {f(c.servicesTitle)}
        </h2>
        <ServicesList locale={locale} />
      </section>

      <Process locale={locale} />

      <FaqSection id="city-faq" title={f(c.faqTitle)}>
        <Faq items={faqs} />
      </FaqSection>

      <nav aria-labelledby="other-cities" className="container-x pb-24 md:pb-36">
        <Label as="h2" id="other-cities" className="text-muted">
          {c.otherCities}
        </Label>
        <ul className="mt-8 flex flex-wrap gap-2">
          {cities
            .filter((o) => o.slug !== slug)
            .map((o) => (
              <li key={o.slug}>
                <Link href={`${base}/${o.slug}`} className="inline-block rounded-full border border-line px-5 py-2.5 transition-colors hover:border-accent hover:bg-accent hover:text-white">
                  {o.name[locale]}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </>
  );
}

// Every city for every locale: a language whose folder doesn't match renders
// notFound() (Next skips a route entirely if one locale returns no params).
export const cityStaticParams = () => cities.map((c) => ({ city: c.slug }));
