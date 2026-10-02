"use client";

import { useEffect, useRef } from "react";
import { scrollPageTo } from "@/lib/scroll";

// The site's scrollbar: a ring in the header capsule that fills as the page
// scrolls and shows the percentage read. On hover, and once the end is
// reached, it turns into an arrow; a click goes back to the top. On
// computers with a mouse it replaces the native scrollbar.
const R = 15;
const C = 2 * Math.PI * R;

export default function ScrollRing({ label }: { label: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const mouse = window.matchMedia("(pointer: fine) and (min-width: 768px)");
    let raf = 0;
    const paint = () => {
      raf = 0;
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      arcRef.current?.style.setProperty("stroke-dashoffset", (C * (1 - p)).toFixed(2));
      if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100));
      buttonRef.current?.setAttribute("data-end", String(p > 0.96));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const toggle = () => root.classList.toggle("own-scrollbar", mouse.matches);

    toggle();
    paint();
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    mouse.addEventListener("change", toggle);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      mouse.removeEventListener("change", toggle);
      root.classList.remove("own-scrollbar");
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => scrollPageTo(0)}
      aria-label={label}
      title={label}
      data-end="false"
      className="scroll-ring relative grid h-9 w-9 shrink-0 place-items-center rounded-full"
    >
      <svg viewBox="0 0 36 36" aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="18" cy="18" r={R} className="ring-track" />
        <circle ref={arcRef} cx="18" cy="18" r={R} className="ring-value" strokeDasharray={C.toFixed(2)} strokeDashoffset={C.toFixed(2)} />
      </svg>
      <span ref={pctRef} aria-hidden="true" className="ring-pct">
        0
      </span>
      <span aria-hidden="true" className="ring-up">
        ↑
      </span>
    </button>
  );
}
