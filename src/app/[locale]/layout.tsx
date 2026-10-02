import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "lenis/dist/lenis.css";
import "../globals.css";
import Cursor from "@/components/Cursor";
import Effects from "@/components/Effects";
import UiSounds from "@/components/UiSounds";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Liquid from "@/components/Liquid";
import { IntroLoader, introScript, WhatsAppButton } from "@/components/Overlays";
import { JsonLd } from "@/components/ui";
import { services, serviceSlugMap } from "@/content/services";
import { getPostSlugMap, getProjects } from "@/lib/content";
import { geistMono, readex } from "@/lib/fonts";
import { dir, getDictionary, isLocale, locales } from "@/lib/i18n";
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
    // Google Search Console: set GOOGLE_SITE_VERIFICATION on Vercel.
    verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: "#fafafa",
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
  const maps = { services: serviceSlugMap(), posts: await getPostSlugMap() };
  const previews = (await getProjects()).filter((p) => p.cover).map((p) => ({ src: p.cover as string }));

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
    <html
      lang={locale}
      dir={dir(locale)}
      className={`${GeistSans.variable} ${geistMono.variable} ${readex.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Enables reveal animations only when JS runs; content is visible without it. */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js');${introScript}` }} />
        <JsonLd data={organization} />
      </head>
      <body className="min-h-screen overflow-x-clip">
        <IntroLoader tagline={t.meta.tagline} />
        <Header locale={locale} nav={t.nav} sound={t.sound} maps={maps} previews={previews} />
        <main id="main">{children}</main>
        <Footer locale={locale} />
        <WhatsAppButton t={t.whatsapp} />
        <Effects />
        <UiSounds />
        <Cursor />
        <Liquid />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
