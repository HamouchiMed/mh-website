import { PageHero, Process, ServicesList } from "@/components/sections";
import { Faq, JsonLd, Label } from "@/components/ui";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { absoluteUrl, pageMetadata, samePath } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale as Locale);
  return pageMetadata({
    locale: locale as Locale,
    paths: samePath("/services"),
    title: t.servicesPage.metaTitle,
    description: t.servicesPage.metaDescription,
  });
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const t = getDictionary(locale);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.nav.home, item: absoluteUrl(`/${locale}`) },
      { "@type": "ListItem", position: 2, name: t.nav.services, item: absoluteUrl(`/${locale}/services`) },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <PageHero label={t.servicesPage.label} title={t.servicesPage.h1} lead={t.servicesPage.lead} />
      <section aria-label={t.nav.services} className="container-x pb-20 md:pb-28">
        <ServicesList locale={locale} headingLevel="h2" />
      </section>
      <Process locale={locale} />
      <section aria-labelledby="faq-title" className="container-x py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Label className="text-muted">{t.faq.label}</Label>
            <h2 id="faq-title" className="h-section mt-5">
              {t.faq.title}
            </h2>
          </div>
          <div className="md:col-span-8">
            <Faq items={t.faq.items} />
          </div>
        </div>
      </section>
    </>
  );
}
