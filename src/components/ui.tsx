import Link from "next/link";
import { Fragment, type ComponentProps, type CSSProperties, type ReactNode } from "react";

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`h-[1em] w-[1em] ${className}`}>
      <path d="M5 19 19 5M8 5h11v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type PillProps = ComponentProps<typeof Link> & { variant?: "accent" | "ink" | "outline" | "light" };

const pillStyles = {
  accent: "bg-accent text-white hover:bg-ink",
  ink: "bg-ink text-paper hover:bg-accent",
  outline: "border border-current hover:bg-ink hover:text-paper hover:border-ink",
  light: "bg-paper text-ink hover:bg-accent hover:text-white",
};

export function Pill({ variant = "accent", className = "", children, ...props }: PillProps) {
  return (
    <Link
      {...props}
      className={`group inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-[15px] font-medium transition-colors duration-300 ${pillStyles[variant]} ${className}`}
    >
      <span>{children}</span>
      <Arrow className="transition-transform duration-300 group-hover:rotate-45" />
    </Link>
  );
}

export function Label({
  children,
  className = "",
  as: Tag = "p",
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "h2";
  id?: string;
}) {
  return (
    <Tag id={id} className={`eyebrow flex items-center gap-2 ${className}`}>
      <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </Tag>
  );
}

// Headline whose words rise from a mask on load. The full text stays in the
// DOM as plain words, so search engines read it normally.
export function SplitHeadline({
  text,
  as: Tag = "h1",
  className = "",
}: {
  text: string;
  as?: "h1" | "h2";
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="word-mask">
            <span style={{ "--i": i } as CSSProperties}>{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}

// Paragraph whose words light up as it scrolls through the viewport.
export function ScrollText({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <p data-scroll-text className={className} style={{ "--n": words.length } as CSSProperties}>
      {words.map((word, i) => (
        <span key={i} className="scroll-word" style={{ "--i": i } as CSSProperties}>
          {word}
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </p>
  );
}

export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item} className="flex items-center whitespace-nowrap">
          <span className="px-6 md:px-10">{item}</span>
          <span aria-hidden="true" className="text-[0.5em]">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-line" data-reveal>
          <summary className="flex cursor-pointer items-start justify-between gap-6 py-6 text-lg font-medium md:py-8 md:text-2xl">
            <span>{item.q}</span>
            <span
              aria-hidden="true"
              className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-xl transition-transform duration-300 group-open:rotate-45 group-open:bg-accent group-open:text-white group-open:border-accent"
            >
              +
            </span>
          </summary>
          <p className="max-w-3xl pb-8 text-base leading-relaxed text-muted md:text-lg">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

// Generative cover art for project cards: layered gradients, no image files.
export function Cover({ palette, index = 0 }: { palette: [string, string, string]; index?: number }) {
  const [a, b, c] = palette;
  const angle = (index * 67) % 360;
  return (
    <div
      aria-hidden="true"
      className="grain relative aspect-[4/3] overflow-hidden rounded-[28px]"
      style={{
        background: `radial-gradient(120% 90% at ${20 + ((index * 23) % 60)}% ${15 + ((index * 37) % 50)}%, ${b} 0%, transparent 55%),
          radial-gradient(90% 80% at ${80 - ((index * 19) % 50)}% 85%, ${a} 0%, transparent 60%),
          conic-gradient(from ${angle}deg at 60% 40%, ${c}, ${a}, ${b}, ${c})`,
      }}
    >
      <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-110">
        <div
          className="absolute left-1/2 top-1/2 aspect-square w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: `radial-gradient(circle at 32% 28%, #fff 0%, ${b} 18%, ${a} 55%, ${c} 100%)`,
            boxShadow: `0 40px 80px -20px ${c}`,
          }}
        />
      </div>
    </div>
  );
}
