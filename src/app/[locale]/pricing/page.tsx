import Link from "next/link";
import { delay, FaqSection, PageHero } from "@/components/sections";
import { Arrow, arrowHover, Faq, JsonLd, Label } from "@/components/ui";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { absoluteUrl, breadcrumbLd, faqLd, pageMetadata, samePath } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale as Locale).pricingPage;
  return pageMetadata({ locale: locale as Locale, paths: samePath("/pricing"), title: t.metaTitle, description: t.metaDescription });
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const t = getDictionary(locale);
  const p = t.pricingPage;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OfferCatalog",
        name: p.label,
        url: absoluteUrl(`/${locale}/pricing`),
        itemListElement: p.plans.map((plan) => ({
          "@type": "Offer",
          name: plan.name,
          description: plan.tagline,
          seller: { "@id": `${site.url}/#organization` },
          url: absoluteUrl(`/${locale}/contact?package=${plan.id}`),
        })),
      },
      breadcrumbLd([
        { name: t.nav.home, path: `/${locale}` },
        { name: t.nav.pricing, path: `/${locale}/pricing` },
      ]),
      faqLd(p.faq),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero label={p.label} title={p.h1} lead={p.lead} />

      <section aria-label={p.label} className="container-x pb-20 md:pb-28">
        <ul className="grid gap-5 lg:grid-cols-3">
          {p.plans.map((plan, i) => {
            const popular = plan.id === "business";
            return (
              <li
                key={plan.id}
                data-reveal
                style={delay(i * 100)}
                className={`relative flex flex-col rounded-2xl p-6 md:p-8 ${
                  popular ? "bg-ink text-paper lg:-translate-y-4" : "border border-line bg-white/40"
                }`}
              >
                {popular && (
                  <span className="absolute end-8 top-8 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">{p.popular}</span>
                )}
                <p className={`eyebrow ${popular ? "text-accent-soft" : "text-accent"}`}>0{i + 1}</p>
                <h2 className="mt-5 text-2xl font-semibold">{plan.name}</h2>
                <p className={`mt-4 min-h-[3.5rem] ${popular ? "text-paper/70" : "text-muted"}`}>{plan.tagline}</p>
                <div className={`mt-8 border-t pt-8 ${popular ? "border-line-dark" : "border-line"}`}>
                  <p className="text-2xl font-semibold">{p.price}</p>
                  <p className={`mt-1 text-sm ${popular ? "text-paper/60" : "text-muted"}`}>{p.priceNote}</p>
                </div>
                <ul className="mt-8 space-y-3.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <span aria-hidden="true" className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${popular ? "bg-accent-soft" : "bg-accent"}`} />
                      <span className={popular ? "text-paper/85" : "text-ink/80"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${locale}/contact?package=${plan.id}`}
                    className={`group mt-10 inline-flex items-center justify-between gap-3 rounded-full px-6 py-4 text-[15px] font-medium transition-colors ${
                    popular ? "bg-accent text-white hover:bg-paper hover:text-ink" : "bg-ink text-paper hover:bg-accent"
                  }`}
                >
                  {p.cta}
                  <Arrow className={arrowHover} />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-20 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Label as="h2" className="text-muted">
              {p.includedTitle}
            </Label>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 md:col-span-8">
            {p.included.map((item, i) => (
              <li key={item} className="flex items-start gap-4 bg-paper p-6 md:p-7">
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FaqSection id="pricing-faq" label={t.faq.label} title={t.faq.title}>
        <Faq items={p.faq} />
      </FaqSection>
    </>
  );
}
