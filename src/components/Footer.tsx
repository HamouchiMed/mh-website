import Link from "next/link";
import { cities } from "@/content/cities";
import { services } from "@/content/services";
import { cityFolder, getDictionary, type Locale } from "@/lib/i18n";
import { activeSocials, site } from "@/lib/site";
import { Logo } from "./Header";
import { Arrow, Label, RollText } from "./ui";

export default function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();
  const cityBase = `/${locale}/${cityFolder[locale]}`;

  return (
    <footer data-theme="dark" data-scene="cta" className="relative overflow-hidden">
      <section aria-labelledby="footer-cta" className="container-x border-b border-line pb-20 pt-24 md:pb-28 md:pt-36">
        <Label className="text-muted">{t.cta.label}</Label>
        <Link href={`/${locale}/contact`} id="footer-cta" className="group mt-6 flex items-end justify-between gap-6" data-reveal>
          <span className="display text-[clamp(4rem,16vw,15rem)] transition-colors duration-500 group-hover:text-accent">
            {t.cta.title}
          </span>
          <span
            data-magnetic
            className="mb-[3%] grid aspect-square w-[clamp(64px,10vw,150px)] shrink-0 place-items-center rounded-full bg-accent text-[clamp(1.5rem,3vw,3rem)] text-white transition-transform duration-500 group-hover:rotate-45 rtl:group-hover:-rotate-45"
          >
            <Arrow />
          </span>
        </Link>
        <p className="mt-8 text-muted">
          {t.cta.or}{" "}
          <a href={`mailto:${site.email}`} className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-accent">
            {site.email}
          </a>
        </p>
      </section>

      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-5 max-w-xs text-muted">{t.footer.tagline}</p>
          {activeSocials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={t.footer.follow}>
              {activeSocials.map(([name, url]) => (
                <li key={name}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-line px-4 py-1.5 text-sm capitalize hover:border-ink"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label={t.footer.navigation} className="md:col-span-2">
          <h2 className="eyebrow text-muted">{t.footer.navigation}</h2>
          <ul className="mt-5 space-y-2.5">
            {[
              [`/${locale}`, t.nav.home],
              [`/${locale}/services`, t.nav.services],
              [`/${locale}/work`, t.nav.work],
              [`/${locale}/pricing`, t.nav.pricing],
              [`/${locale}/blog`, t.nav.blog],
              [`/${locale}/lab`, t.nav.lab],
              [`/${locale}/about`, t.nav.about],
              [`/${locale}/contact`, t.nav.contact],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-ink/80 transition-colors hover:text-ink">
                  <RollText text={label} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.footer.services} className="md:col-span-3">
          <h2 className="eyebrow text-muted">{t.footer.services}</h2>
          <ul className="mt-5 space-y-2.5">
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/${locale}/services/${s[locale].slug}`} className="text-ink/80 transition-colors hover:text-ink">
                  {s[locale].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <h2 className="eyebrow text-muted">{t.footer.contact}</h2>
          <ul className="mt-5 space-y-2.5 text-ink/80">
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

      <nav aria-label={t.footer.cities} className="container-x border-t border-line py-8">
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <li className="eyebrow text-muted/70">{t.footer.cities}</li>
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

      <div className="container-x flex flex-col gap-3 border-t border-line py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
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
