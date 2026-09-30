import { LatestPosts, Trust } from "@/components/blocks";
import SceneCanvas from "@/components/SceneCanvas";
import { delay, FaqSection, Process, ProjectsGrid, SectionHeader, ServicesList } from "@/components/sections";
import Showreel from "@/components/Showreel";
import { Stats } from "@/components/StudioBlocks";
import { Faq, JsonLd, Label, Pill } from "@/components/ui";
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

      {/* Hero */}
      <section className="container-x grid items-center gap-10 pb-16 pt-28 md:pb-24 md:pt-36 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <Label className="text-muted">{t.hero.eyebrow}</Label>
          <h1 className="h-hero mt-5 max-w-[16ch] [text-wrap:balance]">{t.hero.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t.hero.lead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Pill href={`/${locale}/contact`}>{t.hero.primary}</Pill>
            <Pill href={`/${locale}/services`} variant="outline">
              {t.hero.secondary}
            </Pill>
          </div>
          {studio.showreel && (
            <div className="mt-8">
              <Showreel src={studio.showreel} poster={studio.showreelPoster} labels={{ open: t.studio.showreel, close: t.studio.close }} />
            </div>
          )}
        </div>
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-white to-paper-2 lg:aspect-square">
            <SceneCanvas />
          </div>
        </div>
      </section>

      {/* Intro */}
      <section aria-labelledby="intro-label" className="border-t border-line">
        <div className="container-x grid gap-6 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-3">
            <Label as="h2" id="intro-label" className="text-muted">
              {t.intro.label}
            </Label>
          </div>
          <div className="md:col-span-9">
            <p className="text-intro max-w-3xl">{t.intro.text}</p>
            <div className="mt-8">
              <Pill href={`/${locale}/about`} variant="outline">
                {t.intro.link}
              </Pill>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section aria-labelledby="services-title" className="container-x pb-20 md:pb-28">
        <SectionHeader
          id="services-title"
          label={t.servicesSection.label}
          title={t.servicesSection.title}
          link={{ href: `/${locale}/services`, label: t.servicesSection.link }}
        />
        <ServicesList locale={locale} />
      </section>

      {/* Work */}
      <section aria-labelledby="work-title" className="container-x pb-20 md:pb-28">
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
      <section aria-labelledby="why-title" className="container-x py-20 md:py-28">
        <SectionHeader id="why-title" label={t.why.label} title={t.why.title} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.why.items.map((item, i) => (
            <li key={item.title} className="rounded-2xl border border-line p-6" data-reveal style={delay(i * 60)}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/10 font-mono text-xs text-accent">0{i + 1}</span>
              <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <Stats locale={locale} />

      <LatestPosts locale={locale} />

      <FaqSection id="faq-title" label={t.faq.label} title={t.faq.title}>
        <Faq items={t.faq.items} />
      </FaqSection>
    </>
  );
}
