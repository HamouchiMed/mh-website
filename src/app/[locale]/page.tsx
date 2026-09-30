import type { CSSProperties } from "react";
import { LatestPosts, Trust } from "@/components/blocks";
import HorizontalWork from "@/components/HorizontalWork";
import SceneCanvas from "@/components/SceneCanvas";
import { FaqSection, Process, SectionHeader, ServicesList, WorkRail } from "@/components/sections";
import Showreel from "@/components/Showreel";
import { Stats } from "@/components/StudioBlocks";
import { Faq, JsonLd, Label, Pill, ScrollText, SplitHeadline } from "@/components/ui";
import VelocityMarquee from "@/components/VelocityMarquee";
import { services } from "@/content/services";
import { getStudio } from "@/lib/content";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { faqLd, pageMetadata, samePath } from "@/lib/seo";

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
  const studio = await getStudio();

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", ...faqLd(t.faq.items) }} />

      {/* One 3D scene for the whole page: it glides to a new pose for every [data-scene] section. */}
      <SceneCanvas mode="scroll" mirror={locale === "ar"} />

      {/* Hero */}
      <section data-scene="hero" className="relative flex min-h-[100svh] flex-col">
        <div className="container-x flex flex-1 flex-col justify-end pb-10 pt-32 md:pb-14">
          <Label className="text-muted">{t.hero.eyebrow}</Label>
          <SplitHeadline
            text={t.hero.title}
            className="display mt-6 max-w-[14ch] text-[clamp(2.9rem,8.4vw,9rem)] [text-wrap:balance] rtl:max-w-[16ch] rtl:text-[clamp(2.5rem,6.2vw,6.5rem)]"
          />
          <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
            <div className="flex flex-col items-start gap-6 md:col-span-5" data-reveal style={{ "--delay": "500ms" } as CSSProperties}>
              <p className="max-w-md text-lg leading-relaxed text-ink/75 md:text-xl">{t.hero.lead}</p>
              {studio.showreel && (
                <Showreel src={studio.showreel} poster={studio.showreelPoster} labels={{ open: t.studio.showreel, close: t.studio.close }} />
              )}
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-7 md:justify-end" data-reveal style={{ "--delay": "650ms" } as CSSProperties}>
              <Pill href={`/${locale}/contact`}>{t.hero.primary}</Pill>
              <Pill href={`/${locale}/services`} variant="outline">
                {t.hero.secondary}
              </Pill>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="container-x eyebrow flex items-center justify-between border-t border-line py-4 text-muted">
          <span>{t.hero.scroll} ↓</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </section>

      {/* Marquee: drifts, speeds up and leans with the scroll */}
      <section aria-label={t.nav.services} className="bg-accent py-6 text-white md:py-8">
        <VelocityMarquee items={services.map((s) => s[locale].title)} className="display text-[clamp(2rem,5vw,4.5rem)]" />
      </section>

      {/* Intro */}
      <section aria-labelledby="intro-label" data-scene="intro" className="container-x py-24 md:py-40">
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
      <section aria-labelledby="services-title" data-scene="services" className="container-x pb-24 md:pb-40">
        <SectionHeader
          id="services-title"
          label={t.servicesSection.label}
          title={t.servicesSection.title}
          link={{ href: `/${locale}/services`, label: t.servicesSection.link }}
        />
        <ServicesList locale={locale} />
      </section>

      {/* Work: pinned, slides sideways while the page scrolls */}
      <HorizontalWork
        rtl={locale === "ar"}
        header={
          <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div>
              <Label className="text-muted">{t.workSection.label}</Label>
              <h2 id="work-title" className="display mt-6 text-[clamp(2.25rem,5vw,4.75rem)]">
                {t.workSection.title}
              </h2>
            </div>
            <p className="eyebrow hidden text-muted lg:block">{t.workSection.hint} ↓</p>
          </div>
        }
      >
        <WorkRail locale={locale} />
      </HorizontalWork>

      <Trust locale={locale} />

      <Process locale={locale} theme="accent" />

      {/* Why us */}
      <section aria-labelledby="why-title" data-scene="why" className="container-x py-24 md:py-40">
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

      <Stats locale={locale} />

      <div data-scene="blog">
        <LatestPosts locale={locale} />

        <FaqSection id="faq-title" label={t.faq.label} title={t.faq.title}>
          <Faq items={t.faq.items} />
        </FaqSection>
      </div>
    </>
  );
}
