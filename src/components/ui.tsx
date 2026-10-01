import Image from "next/image";
import Link from "next/link";
import { Fragment, type ComponentProps, type CSSProperties, type ReactNode } from "react";

// Hover rotation for arrows inside a `group` (reversed in RTL).
export const arrowHover = "transition-transform duration-300 group-hover:rotate-45 rtl:group-hover:-rotate-45";

// Diagonal arrow, mirrored in right-to-left layouts.
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`h-[1em] w-[1em] rtl:-scale-x-100 ${className}`}>
      <path d="M5 19 19 5M8 5h11v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Letters (words for Arabic, which must stay joined) roll up on hover of the
// closest link or button. The copy that rolls in is a text-shadow, so the text
// exists only once in the DOM for search engines and screen readers.
export function RollText({ text, className = "" }: { text: string; className?: string }) {
  const arabic = /[\u0600-\u06FF]/.test(text);
  const parts = arabic ? text.split(/(\s+)/) : Array.from(text);
  return (
    <span className={`roll ${className}`}>
      {parts.map((part, i) =>
        part.trim() === "" ? (
          <span key={i} className="roll-space">
            {part}
          </span>
        ) : (
          <span key={i} className="roll-char" style={{ "--i": i } as CSSProperties}>
            {part}
          </span>
        ),
      )}
    </span>
  );
}

type PillProps = ComponentProps<typeof Link> & { variant?: "accent" | "ink" | "outline" | "light" };

// Base colours + the colour that fills in from the pointer on hover.
const pillStyles = {
  accent: { base: "bg-accent text-white", fill: "bg-ink", text: "" },
  ink: { base: "bg-ink text-paper", fill: "bg-accent", text: "group-hover:text-white" },
  outline: { base: "border border-line", fill: "bg-ink", text: "group-hover:text-paper group-hover:border-ink" },
  light: { base: "bg-paper text-ink", fill: "bg-accent", text: "group-hover:text-white" },
};

// Magnetic pill button: letters roll and colour fills in from the pointer.
export function Pill({ variant = "accent", className = "", children, ...props }: PillProps) {
  const style = pillStyles[variant];
  return (
    <Link
      {...props}
      data-magnetic
      data-fill
      className={`group relative isolate inline-flex items-center gap-2.5 overflow-hidden rounded-full px-5 py-3 text-[0.9375rem] font-medium transition-colors duration-500 ${style.base} ${style.text} ${className}`}
    >
      <span aria-hidden="true" className={`pill-fill ${style.fill}`} />
      {typeof children === "string" ? <RollText text={children} /> : <span>{children}</span>}
      <Arrow className={`text-[0.85em] ${arrowHover}`} />
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

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-line" data-reveal>
          <summary className="flex cursor-pointer items-start justify-between gap-6 py-5 text-base font-medium md:py-6 md:text-lg">
            <span>{item.q}</span>
            <span
              aria-hidden="true"
              className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-lg leading-none transition-transform duration-300 group-open:rotate-45 group-open:border-accent group-open:bg-accent group-open:text-white"
            >
              +
            </span>
          </summary>
          <p className="max-w-3xl pb-6 leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

// Project screenshot in a light frame (16:10) with the liquid hover effect
// (see Liquid.tsx). Without an image, a plain tinted panel stands in.
export function ProjectMedia({
  src,
  alt,
  palette,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  preload = false,
  className = "",
}: {
  src?: string | null;
  alt: string;
  palette: [string, string, string];
  sizes?: string;
  preload?: boolean;
  className?: string;
}) {
  const frame = `relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-paper-2 ${className}`;
  if (!src) {
    return <div aria-hidden="true" className={frame} style={{ background: `linear-gradient(135deg, ${palette[1]}26, ${palette[0]}33)` }} />;
  }
  return (
    <div data-liquid className={frame}>
      <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className="object-cover object-top" />
    </div>
  );
}
