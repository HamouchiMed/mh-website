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
