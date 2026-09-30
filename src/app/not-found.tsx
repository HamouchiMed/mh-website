import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Link from "next/link";
import { fr } from "@/content/fr";
import { en } from "@/content/en";

// Catches URLs outside any locale (e.g. /xyz). Renders its own <html> because
// the root layout is a pass-through.
export default function GlobalNotFound() {
  return (
    <html lang="fr" className={GeistSans.variable}>
      <body className="grid min-h-screen place-items-center bg-paper p-6 text-ink">
        <main className="max-w-xl text-center">
          <p className="eyebrow text-accent">404</p>
          <h1 className="h-page mt-4">{fr.notFound.title}</h1>
          <p className="mt-4 text-muted">{fr.notFound.text}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/fr" className="rounded-full bg-accent px-6 py-3 font-medium text-white">
              {fr.notFound.back}
            </Link>
            <Link href="/en" lang="en" className="rounded-full border border-ink px-6 py-3 font-medium">
              {en.notFound.back}
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
