import { ImageResponse } from "next/og";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Social preview card shared by every page of a language.
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // The image renderer can't shape Arabic script, so Arabic pages reuse the
  // French card (widely read in Morocco); the page itself stays in Arabic.
  const t = getDictionary(isLocale(locale) && locale !== "ar" ? locale : "fr");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#edeef1",
          color: "#0b0b12",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -170,
            top: -200,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #8fa2ff 18%, #2e3bff 55%, #0b0b12 100%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 9999,
              background: "#2e3bff",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            MH
          </div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
          <div style={{ fontSize: 26, color: "#2e3bff", textTransform: "uppercase", letterSpacing: 2 }}>{t.meta.tagline}</div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2, marginTop: 20 }}>{t.hero.title}</div>
        </div>
      </div>
    ),
    size,
  );
}
