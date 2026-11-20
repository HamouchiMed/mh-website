"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Dictionary } from "@/content/fr";
import { prefersReducedMotion } from "../motion/stage";
import { Arrow, arrowHover, Label } from "../ui";

export type PlanItem = { id: string; title: string; href: string; note: string };
type Labels = Dictionary["ciel"]["plan"];

const REF: Record<string, string> = { web: "W", mobile: "M", ecommerce: "E", software: "L", design: "D", seo: "S", "access-control": "A", cctv: "V" };

// Legend symbols, also drawn on the plan (24 × 24, centred on 0,0).
function Glyph({ id }: { id: string }) {
  switch (id) {
    case "web":
      return (<><rect x="-10" y="-7" width="20" height="12" rx="1.5" /><path d="M-4 9 H4 M0 5 V9" /></>);
    case "mobile":
      return (<><rect x="-6" y="-11" width="12" height="22" rx="2.5" /><path d="M-2 7 H2" /></>);
    case "ecommerce":
      return (<><path d="M-11 -7 H-7 L-4 6 H8 L10 -3 H-6" /><circle cx="-2" cy="10" r="1.6" /><circle cx="6" cy="10" r="1.6" /></>);
    case "software":
      return (<><rect x="-9" y="-11" width="18" height="22" rx="1" /><path d="M-6 -5 H6 M-6 0 H6 M-6 5 H6" /></>);
    case "design":
      return <path d="M0 -11 V11 M-8 -8 H6 L9 -5 L6 -2 H-8 Z M8 1 H-6 L-9 4 L-6 7 H8 Z" />;
    case "seo":
      return (<><path d="M0 11 C-6 4 -8 0 -8 -3 A8 8 0 0 1 8 -3 C8 0 6 4 0 11 Z" /><circle cx="0" cy="-3" r="2.6" /></>);
    case "access-control":
      return (<><rect x="-6" y="-10" width="12" height="20" rx="2" /><rect x="-3" y="-6" width="6" height="4" rx=".8" /><path d="M-2 4 H2" /></>);
    default:
      return (<><path d="M-10 -5 L6 -5 L9 -1 L6 3 L-10 3 Z M-6 3 V9 H-10" /><circle cx="4" cy="-1" r="1.4" /></>);
  }
}
const Sym = ({ id, x, y, s = 1 }: { id: string; x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={1.4} strokeLinejoin="round">
    <Glyph id={id} />
  </g>
);
const Camera = ({ x, y, rot, cls }: { x: number; y: number; rot: number; cls: string }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <g className={`plan-cone ${cls}`}>
      <path d="M0 0 L92 -32 A97 97 0 0 1 92 32 Z" fill="currentColor" fillOpacity={0.12} strokeWidth={0.7} strokeDasharray="3 3" />
    </g>
    <rect x="-7" y="-4.5" width="14" height="9" rx="2" fill="#1a2bb5" strokeWidth={1.4} />
    <circle cx="7.5" cy="0" r="2" fill="currentColor" stroke="none" />
  </g>
);
const Reader = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="-5" y="-7" width="10" height="14" rx="1.6" fill="#1a2bb5" strokeWidth={1.3} />
    <rect x="-2.6" y="-4" width="5.2" height="3.2" rx=".6" fill="currentColor" stroke="none" />
  </g>
);
const Desk = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="-17" y="-9" width="34" height="18" rx="1.5" strokeWidth={1} />
    <path d="M-9 -5 H9" strokeWidth={2.2} />
    <circle cx="0" cy="15" r="5" strokeWidth={0.9} />
  </g>
);
const Tag = ({ x, y, children }: { x: number; y: number; children: ReactNode }) => (
  <text x={x} y={y} fill="currentColor" stroke="none" fontSize={7.5}>
    {children}
  </text>
);

// Services as the legend of an installation drawing: the plan draws itself
// when it comes into view, and hovering (or focusing) a service lights up
// its part of the plan. While nobody points at it, the highlight walks
// through the services on its own.
export default function BlueprintPlan({ items, labels, viewAll }: { items: PlanItem[]; labels: Labels; viewAll: { href: string; label: string } }) {
  const [active, setActive] = useState<string | null>(null);
  const [drawn, setDrawn] = useState(false);
  const drawingRef = useRef<HTMLDivElement>(null);
  const userRef = useRef(false);

  useEffect(() => {
    const el = drawingRef.current;
    if (!el) return;
    const still = prefersReducedMotion();
    let visible = false;
    let i = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) setDrawn(true);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    const id = still
      ? 0
      : window.setInterval(() => {
          if (!visible || userRef.current) return;
          setActive(items[i % items.length].id);
          i++;
        }, 2600);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [items]);

  const pick = (id: string) => {
    userRef.current = true;
    setActive(id);
  };
  const release = () => {
    userRef.current = false;
  };
  const hit = (id: string) => (active === id ? "is-hit" : "");
  const current = items.find((s) => s.id === active);
  const r = labels.rooms, tg = labels.tags, b = labels.block;

  return (
    <section aria-labelledby="plan-title" data-theme="blueprint" data-zone="2" className="bg-blueprint relative overflow-hidden">
      <div className="container-x grid gap-12 py-20 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Label className="text-muted">{labels.label}</Label>
          <h2 id="plan-title" className="h-section mt-5 max-w-[18ch]" data-reveal>
            {labels.title}
          </h2>
          <ul className="mt-8 border-t border-line" onPointerLeave={release}>
            {items.map((s) => (
              <li key={s.id} className="border-b border-line">
                <Link
                  href={s.href}
                  onPointerEnter={() => pick(s.id)}
                  onFocus={() => pick(s.id)}
                  onBlur={release}
                  className={`grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-md px-1.5 py-3 text-[0.9375rem] font-medium transition-colors ${
                    active === s.id ? "bg-white/10 text-accent-soft" : "hover:bg-white/5"
                  }`}
                >
                  <svg viewBox="-12 -12 24 24" aria-hidden="true" className="h-7 w-7 overflow-visible" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round">
                    <Glyph id={s.id} />
                  </svg>
                  <span>{s.title}</span>
                  <span className="font-mono text-[0.6875rem] tracking-[0.06em] opacity-60">
                    {labels.ref} {REF[s.id]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={viewAll.href} className="group mt-6 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium underline decoration-line underline-offset-8 hover:decoration-accent-soft">
            {viewAll.label}
            <Arrow className={`text-[0.8em] ${arrowHover}`} />
          </Link>
        </div>

        <div className="lg:col-span-8">
          <div ref={drawingRef} dir="ltr" onPointerLeave={release}>
            <svg
              viewBox="0 0 600 420"
              role="img"
              aria-label={labels.aria}
              className={`plan-svg h-auto w-full overflow-visible font-mono ${drawn ? "is-drawn" : ""} ${active ? "has-focus" : ""}`}
            >
              <g stroke="currentColor" fill="none">
                <path className="plan-draw" pathLength={1} strokeWidth={4} d="M60 40 H560 V350 H60 V170 M60 120 V40" />
                <path className="plan-draw" pathLength={1} strokeWidth={2.2} d="M220 40 V80 M220 120 V350 M60 230 H140 M180 230 H220 M420 40 V160 M420 200 V250 M420 290 V350 M420 210 H560" />
                <g className="plan-fade" strokeWidth={0.9} opacity={0.8}>
                  <path d="M60 120 A50 50 0 0 1 110 170" />
                  <path d="M220 80 A40 40 0 0 1 260 120" />
                  <path d="M420 160 A40 40 0 0 0 380 200" />
                  <path d="M140 230 A40 40 0 0 0 180 270" />
                  <path d="M420 250 A40 40 0 0 1 380 290" />
                </g>
                <g className="plan-fade" strokeWidth={0.7} opacity={0.75}>
                  <path d="M60 22 H560 M60 16 V28 M560 16 V28" />
                  <path d="M582 40 V350 M576 40 H588 M576 350 H588" />
                </g>
              </g>
              <g className="plan-fade" fill="currentColor" fontSize={9} letterSpacing={1}>
                <text x="310" y="17" textAnchor="middle">{labels.width}</text>
                <text x="596" y="200" textAnchor="middle" transform="rotate(90 596 200)">{labels.depth}</text>
                <text x="74" y="62">{r.reception.toLocaleUpperCase()}</text>
                <text x="236" y="62">{r.open.toLocaleUpperCase()}</text>
                <text x="74" y="252">{r.meeting.toLocaleUpperCase()}</text>
                <text x="434" y="62">{r.servers.toLocaleUpperCase()}</text>
                <text x="434" y="232">{r.storage.toLocaleUpperCase()}</text>
              </g>
              <g className="plan-fade" stroke="currentColor" fill="none">
                <g data-svc="web" className={hit("web")}>
                  {[262, 322, 382].flatMap((x) => [<Desk key={`a${x}`} x={x} y={150} />, <Desk key={`b${x}`} x={x} y={230} />])}
                </g>
                <g data-svc="ecommerce" className={hit("ecommerce")}>
                  <path d="M96 76 H186 V112" strokeWidth={2} />
                  <Sym id="ecommerce" x={150} y={96} s={0.8} />
                  <Tag x={100} y={128}>{tg.counter.toLocaleUpperCase()}</Tag>
                </g>
                <g data-svc="design" className={hit("design")}>
                  <Sym id="design" x={120} y={196} s={0.9} />
                  <rect x="230" y="318" width="70" height="20" rx="2" strokeWidth={1.2} />
                  <Tag x={236} y={331}>{tg.screen.toLocaleUpperCase()}</Tag>
                </g>
                <g data-svc="seo" className={hit("seo")}>
                  <Sym id="seo" x={28} y={210} s={1.1} />
                  <Tag x={8} y={238}>{tg.google.toLocaleUpperCase()}</Tag>
                  <Tag x={16} y={248}>★ 4,9</Tag>
                </g>
                <g data-svc="mobile" className={hit("mobile")}>
                  <Sym id="mobile" x={30} y={120} s={0.85} />
                  <path d="M40 120 Q48 120 50 128" strokeWidth={1} strokeDasharray="2 2" />
                  <Tag x={6} y={104}>NFC</Tag>
                </g>
                <g data-svc="software" className={hit("software")}>
                  <rect x="460" y="76" width="70" height="26" rx="2" strokeWidth={1.4} />
                  <path d="M466 84 H524 M466 90 H524 M466 96 H524" strokeWidth={0.8} />
                  <Tag x={460} y={118}>{tg.rack.toLocaleUpperCase()}</Tag>
                  <path className="plan-cable" d="M460 89 H440 V140 H262 V141 M440 140 V220 H262 M322 140 V141 M382 140 V141 M322 220 V221 M382 220 V221" strokeWidth={1} />
                </g>
                <g data-svc="access-control" className={hit("access-control")}>
                  <Reader x={48} y={100} />
                  <Reader x={408} y={150} />
                  <Reader x={408} y={300} />
                  <g transform="translate(84 145)" strokeWidth={1.3}>
                    <circle cx="0" cy="-10" r="4" />
                    <circle cx="0" cy="10" r="4" />
                    <path d="M0 -6 V6" />
                  </g>
                  <Tag x={94} y={149}>{tg.turnstile.toLocaleUpperCase()}</Tag>
                  <path className="plan-cable" d="M460 96 H448 V300 H414 M448 150 H414 M448 56 H72 V100 H54" strokeWidth={1} />
                </g>
                <g data-svc="cctv" className={hit("cctv")}>
                  <Camera x={66} y={46} rot={42} cls="a" />
                  <Camera x={554} y={46} rot={138} cls="b" />
                  <Camera x={226} y={344} rot={-38} cls="c" />
                  <Camera x={554} y={344} rot={215} cls="d" />
                  <rect x="460" y="130" width="70" height="16" rx="2" strokeWidth={1.3} />
                  <Tag x={471} y={141}>{tg.nvr.toLocaleUpperCase()}</Tag>
                </g>
              </g>
              <g className="plan-fade" stroke="currentColor" fill="none" strokeWidth={0.8}>
                <rect x="350" y="366" width="210" height="46" />
                <path d="M350 382 H560 M470 382 V412" />
              </g>
              <g className="plan-fade" fill="currentColor" fontSize={7.5} letterSpacing={0.6}>
                <text x="356" y="377">{b.title.toLocaleUpperCase()}</text>
                <text x="356" y="396">{b.sheet.toLocaleUpperCase()}</text>
                <text x="356" y="407">{b.by.toLocaleUpperCase()}</text>
                <text x="476" y="396">{b.scale.toLocaleUpperCase()}</text>
                <text x="476" y="407">{b.format.toLocaleUpperCase()}</text>
              </g>
            </svg>
          </div>
          <p aria-live="polite" className="mt-5 min-h-[3.75rem] rounded-lg border-s-[3px] border-accent-soft bg-black/30 px-4 py-3 text-[0.9375rem] leading-snug">
            {current ? (
              <>
                <b className="me-1.5 font-semibold text-accent-soft">{current.title}</b>
                {current.note}
              </>
            ) : (
              labels.hint
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
