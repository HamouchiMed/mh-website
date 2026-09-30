import Link from "next/link";
import { cities } from "@/content/cities";
import { services } from "@/content/services";
import { cityFolder, getDictionary, type Locale } from "@/lib/i18n";
import { activeSocials, site } from "@/lib/site";
import { Logo } from "./Header";
import { Pill } from "./ui";

export default function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();
  const cityBase = `/${locale}/${cityFolder[locale]}`;
  const linkClass = "text-[15px] text-muted transition-colors hover:text-ink";

  return (
    <footer data-theme="dark" className="relative">
      <section aria-labelledby="footer-cta" className="container-x flex flex-col gap-8 border-b border-line py-16 md:flex-row md:items-end md:justify-between md:py-20">
        <div>
          <p className="eyebrow text-muted">{t.cta.label}</p>
          <h2 id="footer-cta" className="h-page mt-4">
            {t.cta.title}
          </h2>
          <p className="mt-4 text-muted">
            {t.cta.or}{" "}
            <a href={`mailto:${site.email}`} className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              {site.email}
            </a>
          </p>
        </div>
        <Pill href={`/${locale}/contact`}>
          {t.cta.button}
        </Pill>
      </section>

      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-4 max-w-xs text-[15px] text-muted">{t.footer.tagline}</p>
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
          <ul className="mt-4 space-y-2.5 text-[15px] text-muted">
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
