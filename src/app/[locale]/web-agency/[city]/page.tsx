import { CityPage, cityMetadata, cityStaticParams } from "@/components/CityPages";
import { isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; city: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return cityStaticParams();
}

export async function generateMetadata({ params }: Props) {
  const { locale, city } = await params;
  return isLocale(locale) ? cityMetadata(locale, city) : {};
}

export default async function Page({ params }: Props) {
  const { locale, city } = await params;
  if (!isLocale(locale)) return null;
  return <CityPage locale={locale} folder="web-agency" slug={city} />;
}
