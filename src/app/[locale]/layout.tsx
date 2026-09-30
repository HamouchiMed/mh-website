import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "lenis/dist/lenis.css";
import Cursor from "@/components/Cursor";
import Effects from "@/components/Effects";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { JsonLd } from "@/components/ui";
import { services } from "@/content/services";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";
import { activeSocials, site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.title, template: `%s | ${site.name}` },
    description: t.meta.description,
    applicationName: site.name,
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    formatDetection: { telephone: false },
    icons: { apple: "/logo.png" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  };
}

export const viewport: Viewport = {
  themeColor: "#edeef1",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  const organization = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${site.url}/#organization`,
        name: site.name,
        url: site.url,
        logo: absoluteUrl("/logo.png"),
        image: absoluteUrl(`/${locale}/opengraph-image`),
        description: t.meta.description,
        email: site.email,
        ...(site.phone ? { telephone: site.phone } : {}),
        address: { "@type": "PostalAddress", addressCountry: site.country },
        areaServed: [{ "@type": "Country", name: "Morocco" }, "Worldwide"],
        knowsLanguage: ["fr", "en", "ar"],
        sameAs: activeSocials.map(([, url]) => url),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: t.nav.services,
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s[locale].title, url: absoluteUrl(`/${locale}/services/${s[locale].slug}`) },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: locale,
        publisher: { "@id": `${site.url}/#organization` },
      },
    ],
  };

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables reveal animations only when JS runs; content is visible without it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <JsonLd data={organization} />
      </head>
      <body className="min-h-screen overflow-x-clip">
        <Header locale={locale} nav={t.nav} />
        <main id="main">{children}</main>
        <Footer locale={locale} />
        <Effects />
        <Cursor />
      </body>
    </html>
  );
}
