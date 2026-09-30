import { PageHero } from "@/components/sections";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata, samePath } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale as Locale).privacy;
  return pageMetadata({ locale: locale as Locale, paths: samePath("/privacy"), title: t.metaTitle, description: t.metaDescription });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const p = getDictionary(locale).privacy;
  const fill = (text: string) =>
    text.replaceAll("{name}", site.legal.companyName || site.name).replaceAll("{email}", site.email);

  return (
    <>
      <PageHero label={p.label} title={p.h1} />
      <section className="container-x pb-20 md:pb-28">
        <div className="prose-mh max-w-[72ch]">
          <p>{fill(p.intro)}</p>
          {p.sections.map((section) => (
            <div key={section.title}>
              <h2>{section.title}</h2>
              <p>{fill(section.text)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
