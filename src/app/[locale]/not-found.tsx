import { Pill } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";

// Rendered for notFound() inside a locale (e.g. an unknown service slug).
// The layout params aren't available here, so French is used as the default.
export default function LocaleNotFound() {
  const t = getDictionary("fr");
  return (
    <section className="container-x flex min-h-[80svh] flex-col justify-center pt-32">
      <p className="eyebrow text-accent">404</p>
      <h1 className="display mt-6 text-[clamp(3rem,9vw,8rem)]">{t.notFound.title}</h1>
      <p className="mt-6 max-w-xl text-lg text-muted">{t.notFound.text}</p>
      <div className="mt-10">
        <Pill href="/fr">{t.notFound.back}</Pill>
      </div>
    </section>
  );
}
