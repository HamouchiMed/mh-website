import Warp from "@/components/motion/Warp";
import { Pill } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";

// Rendered for notFound() inside a locale (e.g. an unknown service slug).
// The layout params aren't available here, so French is used as the default.
export default function LocaleNotFound() {
  const t = getDictionary("fr");
  return (
    <section data-theme="dark" className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pb-20 pt-32">
      <Warp hold className="absolute inset-0 -z-10" />
      <div className="container-x">
        <p aria-hidden="true" className="display select-none text-[clamp(7rem,22vw,18rem)] leading-none text-ink/[0.06]">
          404
        </p>
        <h1 className="h-page -mt-[0.4em]">{t.notFound.title}</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">{t.notFound.text}</p>
        <p className="eyebrow mt-4 text-accent">{t.notFound.hint}</p>
        <div className="mt-8">
          <Pill href="/fr">{t.notFound.back}</Pill>
        </div>
      </div>
    </section>
  );
}
