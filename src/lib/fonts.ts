import localFont from "next/font/local";

// Arabic typeface (self-hosted from @fontsource-variable/readex-pro). Only the
// Arabic subset is loaded: Latin characters fall through to Geist.
export const readex = localFont({
  src: "../../node_modules/@fontsource-variable/readex-pro/files/readex-pro-arabic-wght-normal.woff2",
  weight: "160 700",
  variable: "--font-readex",
  display: "swap",
  preload: false,
});

// Monospace for small labels. Same file as geist/font/mono, but not preloaded:
// it is never the main text, so it should not compete with the headline font
// on slow mobile connections.
export const geistMono = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Roboto Mono", "Menlo", "Monaco", "Liberation Mono", "DejaVu Sans Mono", "Courier New", "monospace"],
  weight: "100 900",
  preload: false,
});
