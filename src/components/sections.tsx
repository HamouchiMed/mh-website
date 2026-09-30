import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { services } from "@/content/services";
import { getProjects, localizeProject } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { Arrow, arrowHover, Label, ProjectMedia } from "./ui";

export const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function PageHero({ label, title, lead }: { label: string; title: string; lead?: string }) {
  return (
    <section className="container-x pb-12 pt-32 md:pb-16 md:pt-40">
      <Label className="text-muted">{label}</Label>
      <h1 className="h-page mt-5 max-w-[22ch] [text-wrap:balance]">{title}</h1>
      {lead && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{lead}</p>}
    </section>
  );
}

export function ServicesList({
  locale,
  headingLevel = "h3",
  only,
}: {
  locale: Locale;
  headingLevel?: "h2" | "h3";
  only?: string[];
}) {
  const H = headingLevel;
  const list = only ? services.filter((s) => only.includes(s.id)) : services;
  const more = getDictionary(locale).servicesSection.more;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((s, i) => (
        <li key={s.id} data-reveal style={delay((i % 3) * 60)}>
          <Link
            href={`/${locale}/services/${s[locale].slug}`}
            className="group flex h-full flex-col rounded-2xl border border-line bg-white/60 p-6 transition-colors hover:border-ink/25 hover:bg-white md:p-7"
          >
            <span className="font-mono text-xs text-muted">0{services.indexOf(s) + 1}</span>
            <H className="h-card mt-6">{s[locale].title}</H>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{s[locale].short}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-accent">
              {more}
              <Arrow className={`text-[0.8em] ${arrowHover}`} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export async function ProjectsGrid({ locale, featuredOnly = false, exclude }: { locale: Locale; featuredOnly?: boolean; exclude?: string }) {
  const all = await getProjects();
  const list = all
    .filter((p) => (!featuredOnly || p.featured) && p.slug !== exclude)
    .map((p) => localizeProject(p, locale));
  return (
    <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p, i) => (
        <li key={p.slug} className="group" data-reveal style={delay((i % 3) * 70)}>
          <Link href={`/${locale}/work/${p.slug}`} className="block">
            <ProjectMedia src={p.cover} alt={`${p.name} — ${p.category}`} palette={p.palette} />
            <h3 className="mt-4 text-lg font-semibold transition-colors group-hover:text-accent">{p.name}</h3>
            <p className="mt-1 text-[15px] text-muted">{p.category}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Process({ locale, title }: { locale: Locale; title?: string }) {
  const t = getDictionary(locale).process;
  return (
    <section aria-labelledby="process-title" className="border-y border-line bg-paper-2/60">
      <div className="container-x py-20 md:py-28">
        <Label className="text-muted">{t.label}</Label>
        <h2 id="process-title" className="h-section mt-5 max-w-[22ch]">
          {title ?? t.title}
        </h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
          {t.steps.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-line bg-paper p-6" data-reveal style={delay(i * 60)}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/10 font-mono text-xs text-accent">0{i + 1}</span>
              <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.text}</p>
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
        <h2 id={id} className="h-section mt-5 max-w-[22ch]">
          {title}
        </h2>
      </div>
      {link && (
        <Link href={link.href} className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium hover:text-accent">
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
          <h2 id={id} className="h-section mt-5">
            {title}
          </h2>
        </div>
        <div className="md:col-span-8">{children}</div>
      </div>
    </section>
  );
}
