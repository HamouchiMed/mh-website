import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Link from "next/link";
import SceneCanvas from "@/components/SceneCanvas";
import { fr } from "@/content/fr";
import { en } from "@/content/en";

// Catches URLs outside any locale (e.g. /xyz). Renders its own <html> because
// the root layout is a pass-through.
export default function GlobalNotFound() {
  return (
    <html lang="fr" className={GeistSans.variable}>
      <body className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-paper p-6 text-ink">
        <div className="absolute inset-0 -z-10">
          <SceneCanvas mode="playful" />
        </div>
        <main className="max-w-xl text-center">
          <p className="eyebrow text-accent">404</p>
          <h1 className="display mt-6 text-6xl">{fr.notFound.title}</h1>
          <p className="mt-4 text-muted">{fr.notFound.text}</p>
          <p className="eyebrow mt-3 text-accent">{fr.notFound.hint}</p>
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
