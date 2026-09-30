import ContactForm from "@/components/ContactForm";
import { PageHero } from "@/components/sections";
import { JsonLd } from "@/components/ui";
import { services } from "@/content/services";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { absoluteUrl, pageMetadata, samePath } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale as Locale);
  return pageMetadata({
    locale: locale as Locale,
    paths: samePath("/contact"),
    title: t.contactPage.metaTitle,
    description: t.contactPage.metaDescription,
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const t = getDictionary(locale);
  const c = t.contactPage;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: absoluteUrl(`/${locale}/contact`),
    name: c.metaTitle,
    about: { "@id": `${site.url}/#organization` },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero label={c.label} title={c.h1} lead={c.lead} />
      <section className="container-x pb-24 md:pb-40">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8" data-reveal>
            <ContactForm t={c.form} serviceOptions={services.map((s) => s[locale].title)} />
          </div>
          <aside className="lg:col-span-4">
            <dl className="divide-y divide-line border-y border-line">
              <div className="py-6">
                <dt className="eyebrow text-muted">{c.info.email}</dt>
                <dd className="mt-2 text-xl font-medium">
                  <a href={`mailto:${site.email}`} className="underline decoration-line underline-offset-4 hover:decoration-accent">
                    {site.email}
                  </a>
                </dd>
              </div>
              {site.whatsapp && (
                <div className="py-6">
                  <dt className="eyebrow text-muted">{c.info.whatsapp}</dt>
                  <dd className="mt-2 text-xl font-medium">
                    <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:decoration-accent">
                      {site.whatsapp}
                    </a>
                  </dd>
                </div>
              )}
              <div className="py-6">
                <dt className="eyebrow text-muted">{c.info.location}</dt>
                <dd className="mt-2 text-xl font-medium">{c.info.locationValue}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}
