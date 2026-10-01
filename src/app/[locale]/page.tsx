import { LatestPosts, Trust } from "@/components/blocks";
import HorizontalWork from "@/components/HorizontalWork";
import SceneCanvas from "@/components/SceneCanvas";
import { delay, FaqSection, Process, SectionHeader, ServicesList, WorkRail } from "@/components/sections";
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
        <div className="container-x flex flex-1 flex-col justify-end pb-10 pt-28 md:justify-center md:pb-12">
          <div className="max-w-[640px]">
            <Label className="text-muted">{t.hero.eyebrow}</Label>
            <SplitHeadline text={t.hero.title} className="h-hero mt-5 max-w-[16ch] [text-wrap:balance]" />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted" data-reveal style={delay(450)}>
              {t.hero.lead}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3" data-reveal style={delay(600)}>
              <Pill href={`/${locale}/contact`}>{t.hero.primary}</Pill>
              <Pill href={`/${locale}/services`} variant="outline">
                {t.hero.secondary}
              </Pill>
            </div>
            {studio.showreel && (
              <div className="mt-8" data-reveal style={delay(700)}>
                <Showreel src={studio.showreel} poster={studio.showreelPoster} labels={{ open: t.studio.showreel, close: t.studio.close }} />
              </div>
            )}
          </div>
        </div>
        <div aria-hidden="true" className="container-x eyebrow flex items-center justify-between border-t border-line py-4 text-muted">
          <span>{t.hero.scroll} ↓</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </section>

      {/* Marquee: drifts, speeds up and leans with the scroll */}
      <section aria-label={t.nav.services} className="bg-accent py-4 text-white md:py-5">
        <VelocityMarquee items={services.map((s) => s[locale].title)} className="text-[clamp(1.4rem,3vw,2.5rem)] font-semibold tracking-[-0.02em]" />
      </section>

      {/* Intro: words light up while scrolling */}
      <section aria-labelledby="intro-label" data-scene="intro" className="container-x py-20 md:py-32">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-3">
            <Label as="h2" id="intro-label" className="text-muted">
              {t.intro.label}
            </Label>
          </div>
          <div className="md:col-span-9">
            <ScrollText text={t.intro.text} className="max-w-4xl text-[clamp(1.4rem,2.6vw,2.25rem)] font-medium leading-[1.3] tracking-[-0.02em]" />
            <div className="mt-10">
              <Pill href={`/${locale}/about`} variant="ink">
                {t.intro.link}
              </Pill>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section aria-labelledby="services-title" data-scene="services" className="container-x pb-20 md:pb-32">
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
          <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <Label className="text-muted">{t.workSection.label}</Label>
              <h2 id="work-title" className="h-section mt-5">
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
      <section aria-labelledby="why-title" data-scene="why" className="container-x py-20 md:py-32">
        <SectionHeader id="why-title" label={t.why.label} title={t.why.title} />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {t.why.items.map((item, i) => (
            <li key={item.title} className="flex flex-col bg-paper p-6 md:p-8" data-reveal style={delay(i * 80)}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/10 font-mono text-xs text-accent">0{i + 1}</span>
              <h3 className="h-card mt-8">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.text}</p>
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
