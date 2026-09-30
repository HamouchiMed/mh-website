import Link from "next/link";
import { services } from "@/content/services";
import { getDictionary, type Locale } from "@/lib/i18n";
import { activeSocials, site } from "@/lib/site";
import { Logo } from "./Header";
import { Arrow, Label } from "./ui";

export default function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <section aria-labelledby="footer-cta" className="container-x border-b border-line-dark pb-20 pt-24 md:pb-28 md:pt-36">
        <Label className="text-paper/60">{t.cta.label}</Label>
        <Link
          href={`/${locale}/contact`}
          id="footer-cta"
          className="group mt-6 flex items-end justify-between gap-6"
          data-reveal
        >
          <span className="display text-[clamp(4rem,16vw,15rem)] transition-colors duration-500 group-hover:text-accent">
            {t.cta.title}
          </span>
          <span className="mb-[3%] grid aspect-square w-[clamp(64px,10vw,150px)] shrink-0 place-items-center rounded-full bg-accent text-[clamp(1.5rem,3vw,3rem)] text-white transition-transform duration-500 group-hover:rotate-45">
            <Arrow />
          </span>
        </Link>
        <p className="mt-8 text-paper/60">
          {t.cta.or}{" "}
          <a href={`mailto:${site.email}`} className="text-paper underline decoration-paper/30 underline-offset-4 hover:decoration-accent">
            {site.email}
          </a>
        </p>
      </section>

      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-5 max-w-xs text-paper/60">{t.footer.tagline}</p>
        </div>
        <nav aria-label={t.footer.navigation} className="md:col-span-2">
          <h2 className="eyebrow text-paper/50">{t.footer.navigation}</h2>
          <ul className="mt-5 space-y-2.5">
            {[
              [`/${locale}`, t.nav.home],
              [`/${locale}/services`, t.nav.services],
              [`/${locale}/work`, t.nav.work],
              [`/${locale}/about`, t.nav.about],
              [`/${locale}/contact`, t.nav.contact],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-paper/80 transition-colors hover:text-paper">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.footer.services} className="md:col-span-3">
          <h2 className="eyebrow text-paper/50">{t.footer.services}</h2>
          <ul className="mt-5 space-y-2.5">
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/${locale}/services/${s[locale].slug}`} className="text-paper/80 transition-colors hover:text-paper">
                  {s[locale].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <h2 className="eyebrow text-paper/50">{t.footer.contact}</h2>
          <ul className="mt-5 space-y-2.5 text-paper/80">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-paper">
                {site.email}
              </a>
            </li>
            {site.phone && (
              <li>
                <a href={`tel:${site.phone}`} className="hover:text-paper">
                  {site.phone}
                </a>
              </li>
            )}
            <li>{t.contactPage.info.locationValue}</li>
          </ul>
          {activeSocials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={t.footer.follow}>
              {activeSocials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line-dark px-4 py-1.5 text-sm capitalize hover:border-paper">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="container-x flex flex-col gap-3 border-t border-line-dark py-8 text-sm text-paper/50 md:flex-row md:items-center md:justify-between">
        <p>
          © {year} {site.name}. {t.footer.rights}
        </p>
        <p>{t.footer.made}</p>
      </div>
    </footer>
  );
}
