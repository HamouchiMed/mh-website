import type { ReactNode } from "react";
import "./globals.css";

// The <html> element lives in app/[locale]/layout.tsx so its `lang` attribute
// matches the page language. This root layout only exists so that
// app/not-found.tsx can handle URLs outside any locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
