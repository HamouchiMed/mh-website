import type { Metadata } from "next";
import { useGithub } from "../../../keystatic.config";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = { title: "MH Group — Contenu", robots: { index: false, follow: false } };

// The editor runs locally (`npm run dev`, edits files in /content) or in
// production once the Keystatic GitHub app is configured.
const enabled = process.env.NODE_ENV !== "production" || useGithub;

export default function KeystaticLayout() {
  return (
    <html lang="fr">
      <body>
        {enabled ? (
          <KeystaticApp />
        ) : (
          <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 560, margin: "15vh auto", padding: 24, lineHeight: 1.6 }}>
            <h1>Éditeur de contenu</h1>
            <p>
              L&apos;éditeur est disponible en local avec <code>npm run dev</code> puis <code>/keystatic</code>. Pour
              l&apos;utiliser en ligne, connectez l&apos;application GitHub Keystatic (voir le README, section « Content editor »).
            </p>
          </main>
        )}
      </body>
    </html>
  );
}
