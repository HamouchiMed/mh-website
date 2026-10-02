import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { services } from "@/content/services";
import { getProjects, localizeProject } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import DotWave from "./motion/DotWave";
import Decode from "./motion/Decode";
import { Arrow, arrowHover, Label, ProjectMedia, SplitHeadline } from "./ui";

export const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function PageHero({ label, title, lead }: { label: string; title: string; lead?: string }) {
  return (
    <section className="container-x pb-12 pt-32 md:pb-16 md:pt-40">
      <Label className="text-muted">{label}</Label>
      <SplitHeadline text={title} className="h-page mt-5 max-w-[22ch] [text-wrap:balance]" />
      {lead && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted" data-reveal style={delay(300)}>
          {lead}
        </p>
      )}
    </section>
  );
}

// Services as rows: on hover the accent colour sweeps up from the bottom and
// the title decodes. Each row carries data-shape for <ParticleMorph>.
// `compact` stacks title and summary for a narrower column.
export function ServicesList({
  locale,
  headingLevel = "h3",
  only,
  compact = false,
  id,
}: {
  locale: Locale;
  headingLevel?: "h2" | "h3";
  only?: string[];
  compact?: boolean;
  id?: string;
}) {
  const H = headingLevel;
  const list = only ? services.filter((s) => only.includes(s.id)) : services;
  return (
    <ul id={id} className="border-t border-line">
      {list.map((s, i) => (
        <li key={s.id} className="border-b border-line" data-reveal data-shape={s.id} style={delay(i * 50)}>
          <Link
            href={`/${locale}/services/${s[locale].slug}`}
            className={`group relative isolate grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-2 overflow-hidden py-6 md:gap-x-8 md:py-7 ${
              compact ? "" : "md:grid-cols-[4rem_1fr_1fr_auto]"
            }`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100"
            />
            <span className="font-mono text-xs text-muted transition-colors group-hover:text-white/70 md:ps-4">0{services.indexOf(s) + 1}</span>
            <H className="h-card transition-colors group-hover:text-white">
              <Decode text={s[locale].title} trigger="hover" />
            </H>
            <p
              className={`max-w-md text-[0.9375rem] text-muted transition-colors group-hover:text-white/80 ${
                compact ? "col-start-2 row-start-2" : "col-span-3 md:col-span-1"
              }`}
            >
              {s[locale].short}
            </p>
            <span className="col-start-3 row-start-1 grid h-10 w-10 place-items-center rounded-full border border-line transition-all duration-500 group-hover:border-white group-hover:bg-white group-hover:text-accent md:col-start-auto md:row-start-auto md:me-4">
              <Arrow className={arrowHover} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export async function ProjectsGrid({ locale, featuredOnly = false, exclude }: { locale: Locale; featuredOnly?: boolean; exclude?: string }) {
  const t = getDictionary(locale).workDetail;
  const all = await getProjects();
  const list = all
    .filter((p) => (!featuredOnly || p.featured) && p.slug !== exclude)
    .map((p) => localizeProject(p, locale));
  return (
    <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p, i) => (
        <li key={p.slug} className={`group ${i % 3 === 1 ? "lg:mt-16" : ""}`} data-reveal style={delay((i % 3) * 90)}>
          <Link href={`/${locale}/work/${p.slug}`} className="block" data-cursor-label={t.view}>
            <ProjectMedia src={p.cover} alt={`${p.name} — ${p.category}`} palette={p.palette} />
            <h3 className="mt-4 text-lg font-semibold">{p.name}</h3>
            <p className="mt-1 text-[0.9375rem] text-muted">{p.category}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Method steps in a coloured section: the page background shifts to its
// colour as it reaches the middle of the screen.
export function Process({ locale, title, theme = "dark" }: { locale: Locale; title?: string; theme?: "dark" | "accent" }) {
  const t = getDictionary(locale).process;
  return (
    <section aria-labelledby="process-title" data-theme={theme} data-scene="process" className="relative isolate overflow-hidden">
      <DotWave className="absolute inset-0 -z-10" />
      <div className="container-x grid gap-10 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <Label className="text-muted">{t.label}</Label>
            <h2 id="process-title" className="h-section mt-5 max-w-[16ch]" data-reveal>
              {title ?? t.title}
            </h2>
          </div>
        </div>
        <ol className="grid gap-4 md:col-span-7">
          {t.steps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl border border-line bg-paper-2/80 p-6 backdrop-blur-sm transition-colors duration-500 hover:border-accent-soft md:p-8"
              data-reveal
              style={delay(i * 80)}
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow text-accent-soft">0{i + 1}</span>
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
              </div>
              <h3 className="h-card mt-6">{step.title}</h3>
              <p className="mt-2 max-w-lg text-[0.9375rem] leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function SectionHeader({
  id,
  label,
  title,
  link,
}: {
  id: string;
  label: string;
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div>
        <Label className="text-muted">{label}</Label>
        <h2 id={id} className="h-section mt-5 max-w-[22ch]" data-reveal>
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-[0.9375rem] font-medium underline decoration-line underline-offset-8 transition-colors hover:decoration-accent"
        >
          {link.label}
          <Arrow className={`text-[0.8em] ${arrowHover}`} />
        </Link>
      )}
    </div>
  );
}

export function FaqSection({ id, label, title, children }: { id: string; label?: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="container-x py-20 md:py-28">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          {label && <Label className="text-muted">{label}</Label>}
          <h2 id={id} className="h-section mt-5" data-reveal>
            {title}
          </h2>
        </div>
        <div className="md:col-span-8">{children}</div>
      </div>
    </section>
  );
}

// Cards for the sideways-scrolling work section on the home page.
export async function WorkRail({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const all = await getProjects();
  const list = all.filter((p) => p.featured).map((p) => localizeProject(p, locale));
  return (
    <>
      {list.map((p, i) => (
        <article key={p.slug} className="group w-[min(82vw,35rem)] shrink-0 snap-start">
          <Link href={`/${locale}/work/${p.slug}`} className="block" data-cursor-label={t.workDetail.view}>
            <ProjectMedia src={p.cover} alt={`${p.name} — ${p.category}`} palette={p.palette} sizes="(min-width: 1024px) 560px, 82vw" />
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-muted">0{i + 1}</p>
                <h3 className="h-card mt-2">{p.name}</h3>
                <p className="mt-1 text-[0.9375rem] text-muted">{p.category}</p>
              </div>
              <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                <Arrow className={arrowHover} />
              </span>
            </div>
          </Link>
        </article>
      ))}
      <article className="w-[min(70vw,22.5rem)] shrink-0 snap-start">
        <Link
          href={`/${locale}/work`}
          className="group flex aspect-[16/10] flex-col justify-between rounded-xl border border-line p-6 transition-colors hover:border-ink md:p-8"
        >
          <span className="eyebrow text-muted">{t.workSection.label}</span>
          <span className="h-section transition-colors group-hover:text-accent-soft">{t.workSection.link}</span>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-lg text-paper">
            <Arrow className={arrowHover} />
          </span>
        </Link>
      </article>
    </>
  );
}
