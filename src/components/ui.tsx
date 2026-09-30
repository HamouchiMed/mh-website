import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

// Small nudge for arrows inside a `group` on hover (mirrored in RTL).
export const arrowHover = "transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5";

// Diagonal arrow, mirrored in right-to-left layouts.
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`h-[1em] w-[1em] rtl:-scale-x-100 ${className}`}>
      <path d="M5 19 19 5M8 5h11v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type PillProps = ComponentProps<typeof Link> & { variant?: "accent" | "ink" | "outline" | "light" };

const pillStyles = {
  accent: "bg-accent text-white hover:bg-[#2330e6]",
  ink: "bg-ink text-paper hover:bg-ink/85",
  outline: "border border-line bg-paper hover:border-ink/40",
  light: "bg-paper text-ink hover:bg-paper-2",
};

export function Pill({ variant = "accent", className = "", children, ...props }: PillProps) {
  return (
    <Link
      {...props}
      className={`group inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-[15px] font-medium transition-colors duration-200 ${pillStyles[variant]} ${className}`}
    >
      <span>{children}</span>
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

// Page and hero headings (kept as a component so pages stay uniform).
export function SplitHeadline({
  text,
  as: Tag = "h1",
  className = "",
}: {
  text: string;
  as?: "h1" | "h2";
  className?: string;
}) {
  return <Tag className={className}>{text}</Tag>;
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-line">
          <summary className="flex cursor-pointer items-start justify-between gap-6 py-5 text-base font-medium md:py-6 md:text-lg">
            <span>{item.q}</span>
            <span
              aria-hidden="true"
              className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-lg leading-none transition-transform duration-300 group-open:rotate-45"
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

// Generative cover art used when a project has no image yet.
export function Cover({ palette, index = 0 }: { palette: [string, string, string]; index?: number }) {
  const [a, b, c] = palette;
  const angle = (index * 67) % 360;
  return (
    <div
      aria-hidden="true"
      className="grain relative aspect-[4/3] overflow-hidden rounded-2xl"
      style={{
        background: `radial-gradient(120% 90% at ${20 + ((index * 23) % 60)}% ${15 + ((index * 37) % 50)}%, ${b} 0%, transparent 55%),
          radial-gradient(90% 80% at ${80 - ((index * 19) % 50)}% 85%, ${a} 0%, transparent 60%),
          conic-gradient(from ${angle}deg at 60% 40%, ${c}, ${a}, ${b}, ${c})`,
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 aspect-square w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle at 32% 28%, #fff 0%, ${b} 18%, ${a} 55%, ${c} 100%)`,
          boxShadow: `0 40px 80px -20px ${c}`,
        }}
      />
    </div>
  );
}

// Project image with a gentle zoom on hover; falls back to the generative cover.
export function ProjectMedia({
  src,
  alt,
  palette,
  index = 0,
  sizes = "(min-width: 768px) 50vw, 100vw",
  preload = false,
  className = "",
}: {
  src?: string | null;
  alt: string;
  palette: [string, string, string];
  index?: number;
  sizes?: string;
  preload?: boolean;
  className?: string;
}) {
  if (!src) return <Cover palette={palette} index={index} />;
  return (
    <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper-2 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
      />
    </div>
  );
}
