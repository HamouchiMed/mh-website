import Link from "next/link";
import { cities } from "@/content/cities";
import { services } from "@/content/services";
import { cityFolder, getDictionary, type Locale } from "@/lib/i18n";
import { activeSocials, site } from "@/lib/site";
import { Logo } from "./Header";
import { Arrow, Label } from "./ui";

export default function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();
  const cityBase = `/${locale}/${cityFolder[locale]}`;
  const linkClass = "text-[0.9375rem] text-muted transition-colors hover:text-ink";

  return (
    <footer data-theme="dark" data-scene="cta" className="relative overflow-hidden">
      <section aria-labelledby="footer-cta" className="container-x border-b border-line py-16 md:py-24">
        <Label className="text-muted">{t.cta.label}</Label>
        <Link href={`/${locale}/contact`} id="footer-cta" className="group mt-5 flex items-center justify-between gap-6" data-reveal>
          <span className="display text-[clamp(2.6rem,6.5vw,5.25rem)] transition-colors duration-500 group-hover:text-accent">{t.cta.title}</span>
          <span
            data-magnetic
            className="grid aspect-square w-[clamp(3.25rem,6.5vw,5.5rem)] shrink-0 place-items-center rounded-full bg-accent text-[clamp(1.25rem,2vw,1.8rem)] text-white transition-transform duration-500 group-hover:rotate-45 rtl:group-hover:-rotate-45"
          >
            <Arrow />
          </span>
        </Link>
        <p className="mt-6 text-muted">
          {t.cta.or}{" "}
          <a href={`mailto:${site.email}`} className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-accent">
            {site.email}
          </a>
        </p>
      </section>

      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-4 max-w-xs text-[0.9375rem] text-muted">{t.footer.tagline}</p>
          {activeSocials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-4" aria-label={t.footer.follow}>
              {activeSocials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className={`${linkClass} capitalize`}>
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label={t.footer.navigation} className="md:col-span-2">
          <h2 className="text-sm font-semibold">{t.footer.navigation}</h2>
          <ul className="mt-4 space-y-2.5">
            {[
              [`/${locale}`, t.nav.home],
              [`/${locale}/services`, t.nav.services],
              [`/${locale}/work`, t.nav.work],
              [`/${locale}/pricing`, t.nav.pricing],
              [`/${locale}/blog`, t.nav.blog],
              [`/${locale}/about`, t.nav.about],
              [`/${locale}/lab`, t.nav.lab],
              [`/${locale}/contact`, t.nav.contact],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.footer.services} className="md:col-span-3">
          <h2 className="text-sm font-semibold">{t.footer.services}</h2>
          <ul className="mt-4 space-y-2.5">
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/${locale}/services/${s[locale].slug}`} className={linkClass}>
                  {s[locale].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <h2 className="text-sm font-semibold">{t.footer.contact}</h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem] text-muted">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-ink">
                {site.email}
              </a>
            </li>
            {site.phone && (
              <li>
                <a href={`tel:${site.phone}`} dir="ltr" className="hover:text-ink">
                  {site.phone}
                </a>
              </li>
            )}
            <li>{t.contactPage.info.locationValue}</li>
          </ul>
        </div>
      </div>

      <nav aria-label={t.footer.cities} className="container-x border-t border-line py-6">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <li className="font-semibold text-ink">{t.footer.cities}</li>
          <li>
            <Link href={cityBase} className="hover:text-ink">
              {t.footer.allCities}
            </Link>
          </li>
          {cities.map((c) => (
            <li key={c.slug}>
              <Link href={`${cityBase}/${c.slug}`} className="hover:text-ink">
                {c.name[locale]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-x flex flex-col gap-3 border-t border-line py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          © {year} {site.name}. {t.footer.rights}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <Link href={`/${locale}/legal`} className="hover:text-ink">
              {t.footer.legal}
            </Link>
          </li>
          <li>
            <Link href={`/${locale}/privacy`} className="hover:text-ink">
              {t.footer.privacy}
            </Link>
          </li>
          <li>{t.footer.made}</li>
        </ul>
      </div>
    </footer>
  );
}
