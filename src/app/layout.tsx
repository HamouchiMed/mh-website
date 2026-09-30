import type { ReactNode } from "react";

// The <html> element lives in app/[locale]/layout.tsx so its `lang` and `dir`
// attributes match the page language. This root layout only exists so that
// app/not-found.tsx and the /keystatic editor can render outside any locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
