import LabExperiment from "@/components/LabExperiment";
import { delay, PageHero } from "@/components/sections";
import { Pill } from "@/components/ui";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata, samePath } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale as Locale).lab;
  return pageMetadata({ locale: locale as Locale, paths: samePath("/lab"), title: t.metaTitle, description: t.metaDescription });
}

export default async function LabPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const t = getDictionary(locale);
  const [first, ...rest] = t.lab.experiments;

  const card = (exp: (typeof t.lab.experiments)[number], i: number, big = false) => (
    <li key={exp.id} className={big ? "md:col-span-2" : ""} data-reveal style={delay(i * 100)}>
      <figure>
        <div className={`relative overflow-hidden rounded-2xl bg-[#0b0b12] ${big ? "aspect-[4/3] md:aspect-[21/9]" : "aspect-[4/3]"}`}>
          <LabExperiment kind={exp.id as "liquid" | "particles" | "glass"} label={exp.title} />
          <span className="eyebrow pointer-events-none absolute start-6 top-6 rounded-full bg-white/10 px-3 py-1 text-white/80 backdrop-blur">
            0{i + 1} · {t.lab.hint}
          </span>
        </div>
        <figcaption className="mt-5 flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
          <span className="text-xl font-semibold tracking-[-0.01em]">{exp.title}</span>
          <span className="max-w-md text-muted">{exp.text}</span>
        </figcaption>
      </figure>
    </li>
  );

  return (
    <>
      <PageHero label={t.lab.label} title={t.lab.h1} lead={t.lab.lead} />
      <section aria-label={t.lab.label} data-theme="dark" className="py-16 md:py-24">
        <ul className="container-x grid gap-x-6 gap-y-16 md:grid-cols-2">
          {card(first, 0, true)}
          {rest.map((exp, i) => card(exp, i + 1))}
        </ul>
        <div className="container-x mt-20 flex flex-col items-start gap-6">
          <p className="h-section">{t.lab.cta}</p>
          <Pill href={`/${locale}/contact`}>{t.nav.cta}</Pill>
        </div>
      </section>
    </>
  );
}
