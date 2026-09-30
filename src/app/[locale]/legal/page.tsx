import Link from "next/link";
import { PageHero } from "@/components/sections";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata, samePath } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale as Locale).legal;
  return pageMetadata({ locale: locale as Locale, paths: samePath("/legal"), title: t.metaTitle, description: t.metaDescription });
}

export default async function LegalPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const t = getDictionary(locale);
  const l = t.legal;
  const s = l.sections;
  const values = [
    site.legal.companyName || site.name,
    site.legal.legalForm,
    site.legal.address,
    site.legal.ice,
    site.legal.rc,
    site.legal.director,
    site.email,
  ];
  const fill = (text: string) => text.replaceAll("{name}", site.legal.companyName || site.name);

  return (
    <>
      <PageHero label={l.label} title={l.h1} />
      <section className="container-x pb-24 md:pb-36">
        <div className="prose-mh max-w-[72ch]">
          <h2>{s.publisher}</h2>
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[220px_1fr]">
            {s.publisherLines.map((label, i) => (
              <div key={label} className="contents">
                <dt className="font-medium text-ink">{label}</dt>
                <dd className={values[i] ? "" : "text-muted italic"}>{values[i] || l.toComplete}</dd>
              </div>
            ))}
          </dl>
          <h2>{s.hosting}</h2>
          <p>{s.hostingText}</p>
          <h2>{s.ip}</h2>
          <p>{fill(s.ipText)}</p>
          <h2>{s.liability}</h2>
          <p>{fill(s.liabilityText)}</p>
          <h2>{s.data}</h2>
          <p>
            {s.dataText} <Link href={`/${locale}/privacy`}>{t.footer.privacy}</Link>
          </p>
        </div>
      </section>
    </>
  );
}
