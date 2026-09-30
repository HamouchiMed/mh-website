import { PageHero, ProjectsGrid } from "@/components/sections";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata, samePath } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale as Locale);
  return pageMetadata({
    locale: locale as Locale,
    paths: samePath("/work"),
    title: t.workPage.metaTitle,
    description: t.workPage.metaDescription,
  });
}

export default async function WorkPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const t = getDictionary(locale);
  return (
    <>
      <PageHero label={t.workPage.label} title={t.workPage.h1} lead={t.workPage.lead} />
      <section aria-label={t.workPage.label} className="container-x pb-20 md:pb-28">
        <ProjectsGrid locale={locale} />
      </section>
    </>
  );
}
