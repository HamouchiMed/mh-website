import Image from "next/image";
import { getStudio, getTeam } from "@/lib/content";
import { getDictionary, pick, type Locale } from "@/lib/i18n";
import { delay, SectionHeader } from "./sections";
import { Label } from "./ui";

// Key figures and team: both stay hidden until real entries exist in the CMS.

export async function Stats({ locale }: { locale: Locale }) {
  const { stats } = await getStudio();
  if (!stats.length) return null;
  const t = getDictionary(locale).studio;
  return (
    <section aria-labelledby="stats-title" className="container-x pb-24 md:pb-36">
      <Label as="h2" id="stats-title" className="text-muted">
        {t.statsLabel}
      </Label>
      <dl className="mt-8 grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col-reverse gap-3 bg-paper p-8 md:p-10" data-reveal style={delay(i * 80)}>
            <dt className="text-muted">{pick(s.label, locale)}</dt>
            <dd className="display text-[clamp(3rem,6vw,5.5rem)]">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export async function Team({ locale }: { locale: Locale }) {
  const team = await getTeam();
  if (!team.length) return null;
  const t = getDictionary(locale).studio;
  return (
    <section aria-labelledby="team-title" className="container-x pb-24 md:pb-36">
      <SectionHeader id="team-title" label={t.teamLabel} title={t.teamTitle} />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((m, i) => (
          <li key={m.slug} data-reveal style={delay((i % 4) * 80)}>
            <div data-liquid className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-paper-2">
              {m.photo && <Image src={m.photo} alt={m.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />}
            </div>
            <p className="mt-4 text-xl font-medium">{m.name}</p>
            <p className="text-muted">{pick(m.role, locale)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
