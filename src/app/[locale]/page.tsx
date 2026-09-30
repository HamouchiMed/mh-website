import type { CSSProperties } from "react";
import { LatestPosts, Trust } from "@/components/blocks";
import HeroCanvas from "@/components/HeroCanvas";
import { FaqSection, Process, ProjectsGrid, SectionHeader, ServicesList } from "@/components/sections";
import { Faq, JsonLd, Label, Marquee, Pill, ScrollText, SplitHeadline } from "@/components/ui";
import { services } from "@/content/services";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata, samePath } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale as Locale);
  return pageMetadata({
    locale: locale as Locale,
    paths: samePath(""),
    title: t.meta.title,
    description: t.meta.description,
    absoluteTitle: true,
  });
}

export default async function Home({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw;
  const t = getDictionary(locale);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={faqLd} />

      {/* Hero */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(60%_60%_at_75%_35%,rgba(46,59,255,0.16),transparent_70%),radial-gradient(40%_40%_at_10%_90%,rgba(255,122,69,0.10),transparent_70%)] rtl:-scale-x-100"
        />
        <HeroCanvas className="absolute inset-0 -z-10 h-full w-full" mirror={locale === "ar"} />

        <div className="container-x flex flex-1 flex-col justify-end pb-10 pt-32 md:pb-14">
          <Label className="text-muted">{t.hero.eyebrow}</Label>
          <SplitHeadline
            text={t.hero.title}
            className="display mt-6 max-w-[14ch] text-[clamp(2.9rem,8.4vw,9rem)] [text-wrap:balance] rtl:max-w-[16ch] rtl:text-[clamp(2.5rem,6.2vw,6.5rem)]"
          />
          <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
            <p
              className="max-w-md text-lg leading-relaxed text-ink/75 md:col-span-5 md:text-xl"
              data-reveal
              style={{ "--delay": "500ms" } as CSSProperties}
            >
              {t.hero.lead}
            </p>
            <div
              className="flex flex-wrap gap-3 md:col-span-7 md:justify-end"
              data-reveal
              style={{ "--delay": "650ms" } as CSSProperties}
            >
              <Pill href={`/${locale}/contact`}>{t.hero.primary}</Pill>
              <Pill href={`/${locale}/services`} variant="outline">
                {t.hero.secondary}
              </Pill>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="container-x flex items-center justify-between border-t border-line py-4 eyebrow text-muted">
          <span>{t.hero.scroll} ↓</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </section>

      {/* Marquee */}
      <section aria-label={t.nav.services} className="bg-accent py-6 text-white md:py-8">
        <Marquee
          items={services.map((s) => s[locale].title)}
          className="display text-[clamp(2rem,5vw,4.5rem)]"
        />
      </section>

      {/* Intro */}
      <section aria-labelledby="intro-label" className="container-x py-24 md:py-40">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <Label as="h2" id="intro-label" className="text-muted">
              {t.intro.label}
            </Label>
          </div>
          <div className="md:col-span-9">
            <ScrollText text={t.intro.text} className="text-[clamp(1.75rem,3.6vw,3.5rem)] font-medium leading-[1.12] tracking-[-0.03em]" />
            <div className="mt-12">
              <Pill href={`/${locale}/about`} variant="ink">
                {t.intro.link}
              </Pill>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section aria-labelledby="services-title" className="container-x pb-24 md:pb-40">
        <SectionHeader
          id="services-title"
          label={t.servicesSection.label}
          title={t.servicesSection.title}
          link={{ href: `/${locale}/services`, label: t.servicesSection.link }}
        />
        <ServicesList locale={locale} />
      </section>

      {/* Work */}
      <section aria-labelledby="work-title" className="container-x pb-24 md:pb-40">
        <SectionHeader
          id="work-title"
          label={t.workSection.label}
          title={t.workSection.title}
          link={{ href: `/${locale}/work`, label: t.workSection.link }}
        />
        <ProjectsGrid locale={locale} featuredOnly />
      </section>

      <Trust locale={locale} />

      <Process locale={locale} />

      {/* Why us */}
      <section aria-labelledby="why-title" className="container-x py-24 md:py-40">
        <SectionHeader id="why-title" label={t.why.label} title={t.why.title} />
        <ul className="grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {t.why.items.map((item, i) => (
            <li key={item.title} className="flex flex-col bg-paper p-8 md:p-10" data-reveal style={{ "--delay": `${i * 80}ms` } as CSSProperties}>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 font-mono text-sm text-accent">0{i + 1}</span>
              <h3 className="mt-12 text-2xl font-medium tracking-[-0.02em]">{item.title}</h3>
              <p className="mt-3 text-muted">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <LatestPosts locale={locale} />

      <FaqSection id="faq-title" label={t.faq.label} title={t.faq.title}>
        <Faq items={t.faq.items} />
      </FaqSection>
    </>
  );
}
