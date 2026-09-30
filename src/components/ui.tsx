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

// Project screenshot in a light frame (16:10). Without an image, a plain
// tinted panel in the project's colours stands in.
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
    <div className={frame}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
      />
    </div>
  );
}
