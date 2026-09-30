import SceneCanvas from "@/components/SceneCanvas";
import { Pill } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";

// Rendered for notFound() inside a locale (e.g. an unknown service slug).
// The layout params aren't available here, so French is used as the default.
export default function LocaleNotFound() {
  const t = getDictionary("fr");
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-32">
      <div className="absolute inset-0 -z-10">
        <SceneCanvas mode="playful" />
      </div>
      <div className="container-x">
        <p aria-hidden="true" className="display select-none text-[clamp(8rem,32vw,28rem)] leading-none text-ink/[0.06]">
          404
        </p>
        <h1 className="display -mt-[0.5em] text-[clamp(3rem,8vw,7rem)]">{t.notFound.title}</h1>
        <p className="mt-6 max-w-xl text-lg text-muted">{t.notFound.text}</p>
        <p className="eyebrow mt-4 text-accent">{t.notFound.hint}</p>
        <div className="mt-10">
          <Pill href="/fr">{t.notFound.back}</Pill>
        </div>
      </div>
    </section>
  );
}
