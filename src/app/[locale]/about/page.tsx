import type { CSSProperties } from "react";
import { PageHero, Process } from "@/components/sections";
import { Stats, Team } from "@/components/StudioBlocks";
import { Label, Pill } from "@/components/ui";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata, samePath } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale as Locale);
  return pageMetadata({
    locale: locale as Locale,
    paths: samePath("/about"),
    title: t.aboutPage.metaTitle,
    description: t.aboutPage.metaDescription,
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const t = getDictionary(locale);
  const a = t.aboutPage;

  return (
    <>
      <PageHero label={a.label} title={a.h1} lead={a.lead} />

      <section aria-labelledby="mission" className="container-x py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <Label as="h2" id="mission" className="text-muted">
              {a.missionLabel}
            </Label>
          </div>
          <div className="md:col-span-9">
            <p className="text-intro max-w-3xl">{a.mission}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="values" className="container-x pb-20 md:pb-28">
        <Label as="h2" id="values" className="text-muted">
          {a.valuesLabel}
        </Label>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {a.values.map((v, i) => (
            <li key={v.title} className="bg-paper p-6 md:p-8" data-reveal style={{ "--delay": `${i * 80}ms` } as CSSProperties}>
              <span className="font-mono text-sm text-accent">0{i + 1}</span>
              <h3 className="mt-8 text-xl font-semibold">{v.title}</h3>
              <p className="mt-3 text-muted">{v.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <Pill href={`/${locale}/contact`}>{t.nav.cta}</Pill>
        </div>
      </section>

      <Stats locale={locale} />
      <Team locale={locale} />

      <Process locale={locale} />
    </>
  );
}
