import Link from "next/link";
import type { CSSProperties } from "react";
import { projects } from "@/content/projects";
import { services } from "@/content/services";
import { getDictionary, type Locale } from "@/lib/i18n";
import { Arrow, Cover, Label, SplitHeadline } from "./ui";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function PageHero({ label, title, lead }: { label: string; title: string; lead?: string }) {
  return (
    <section className="container-x pb-16 pt-36 md:pb-24 md:pt-48">
      <Label className="text-muted">{label}</Label>
      <SplitHeadline text={title} className="display mt-6 max-w-[16ch] text-[clamp(2.75rem,7.5vw,7.5rem)]" />
      {lead && (
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl" data-reveal style={delay(300)}>
          {lead}
        </p>
      )}
    </section>
  );
}

export function ServicesList({ locale, headingLevel = "h3" }: { locale: Locale; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <ul className="border-t border-line">
      {services.map((s, i) => (
        <li key={s.id} className="border-b border-line" data-reveal style={delay(i * 60)}>
          <Link
            href={`/${locale}/services/${s[locale].slug}`}
            className="group relative isolate grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-2 overflow-hidden py-7 md:grid-cols-[80px_1.1fr_1fr_auto] md:gap-x-8 md:py-10"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100"
            />
            <span className="eyebrow text-muted transition-colors group-hover:text-white/70 md:pl-4">0{i + 1}</span>
            <H className="text-[clamp(1.6rem,3.4vw,3rem)] font-medium tracking-[-0.03em] transition-colors group-hover:text-white">
              {s[locale].title}
            </H>
            <p className="col-span-3 max-w-md text-muted transition-colors group-hover:text-white/80 md:col-span-1">
              {s[locale].short}
            </p>
            <span className="col-start-3 row-start-1 grid h-12 w-12 place-items-center rounded-full border border-line text-xl transition-all duration-500 group-hover:rotate-45 group-hover:border-white group-hover:bg-white group-hover:text-accent md:col-start-auto md:row-start-auto md:mr-4">
              <Arrow />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ProjectsGrid({ locale, limit }: { locale: Locale; limit?: number }) {
  const list = limit ? projects.slice(0, limit) : projects;
  return (
    <ul className="grid gap-x-6 gap-y-14 md:grid-cols-2">
      {list.map((p, i) => {
        const inner = (
          <>
            <Cover palette={p.palette} index={i} />
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-medium tracking-[-0.02em]">{p.name}</h3>
                <p className="mt-1 text-muted">{p.category[locale]}</p>
              </div>
              <ul className="flex flex-wrap justify-end gap-1.5">
                {p.tags.map((tag) => (
                  <li key={tag} className="rounded-full border border-line px-3 py-1 text-xs">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </>
        );
        return (
          <li key={p.id} className={`group ${i % 2 === 1 ? "md:mt-24" : ""}`} data-reveal style={delay((i % 2) * 120)}>
            {p.url ? (
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="block">
                {inner}
              </a>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Process({ locale, title }: { locale: Locale; title?: string }) {
  const t = getDictionary(locale).process;
  return (
    <section aria-labelledby="process-title" className="bg-ink text-paper">
      <div className="container-x grid gap-12 py-24 md:grid-cols-12 md:py-36">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <Label className="text-paper/60">{t.label}</Label>
            <h2 id="process-title" className="display mt-6 text-[clamp(2.25rem,5vw,4.75rem)]" data-reveal>
              {title ?? t.title}
            </h2>
          </div>
        </div>
        <ol className="grid gap-4 md:col-span-7">
          {t.steps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-[28px] border border-line-dark bg-ink-2 p-8 transition-colors duration-500 hover:border-accent md:p-10"
              data-reveal
              style={delay(i * 80)}
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow text-accent-soft">0{i + 1}</span>
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
              </div>
              <h3 className="mt-10 text-3xl font-medium tracking-[-0.03em] md:text-4xl">{step.title}</h3>
              <p className="mt-4 max-w-lg text-paper/65 md:text-lg">{step.text}</p>
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
    <div className="mb-12 flex flex-col gap-8 md:mb-20 md:flex-row md:items-end md:justify-between">
      <div>
        <Label className="text-muted">{label}</Label>
        <h2 id={id} className="display mt-6 max-w-[18ch] text-[clamp(2.25rem,5vw,4.75rem)]" data-reveal>
          {title}
        </h2>
      </div>
      {link && (
        <Link href={link.href} className="group inline-flex shrink-0 items-center gap-2 text-[15px] font-medium underline decoration-line underline-offset-8 hover:decoration-accent">
          {link.label}
          <Arrow className="transition-transform duration-300 group-hover:rotate-45" />
        </Link>
      )}
    </div>
  );
}
