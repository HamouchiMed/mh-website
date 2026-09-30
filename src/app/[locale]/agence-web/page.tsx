import { CitiesHub, citiesHubMetadata } from "@/components/CityPages";
import { isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return isLocale(locale) ? citiesHubMetadata(locale) : {};
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  return <CitiesHub locale={locale} folder="agence-web" />;
}
