"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Pinned section whose track slides sideways while the page scrolls down.
// On small screens, with reduced motion or without JS it is a plain
// horizontally scrollable row with snap points.
export default function HorizontalWork({
  header,
  children,
  rtl = false,
}: {
  header: ReactNode;
  children: ReactNode;
  rtl?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let distance = 0;
    let raf = 0;

    const measure = () => {
      const enabled = wide.matches && !reduced.matches;
      setPinned(enabled);
      if (!enabled) {
        section.style.height = "";
        track.style.transform = "";
        return;
      }
      distance = Math.max(0, track.scrollWidth - track.clientWidth);
      section.style.height = `${window.innerHeight + distance}px`;
      update();
    };
    const update = () => {
      raf = 0;
      if (!wide.matches || reduced.matches) return;
      const top = section.getBoundingClientRect().top;
      const progress = Math.min(Math.max(-top / Math.max(distance, 1), 0), 1);
      track.style.transform = `translate3d(${(rtl ? 1 : -1) * progress * distance}px, 0, 0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    wide.addEventListener("change", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      wide.removeEventListener("change", measure);
    };
  }, [rtl]);

  return (
    <section ref={sectionRef} aria-labelledby="work-title" data-theme="dark" data-scene="work" className="relative">
      <div className={pinned ? "sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden py-16" : "py-20 md:py-28"}>
        <div className="container-x">{header}</div>
        <div
          ref={trackRef}
          className={`flex gap-5 px-[max(clamp(20px,4vw,40px),calc((100vw_-_1280px)/2_+_40px))] md:gap-7 ${
            pinned ? "will-change-transform" : "snap-x snap-mandatory overflow-x-auto pb-6 [scrollbar-width:none]"
          }`}
        >
          {children}
        </div>
        {pinned && (
          <div className="container-x mt-8">
            <div className="h-px w-full bg-line">
              <span ref={barRef} className="block h-px origin-left bg-ink rtl:origin-right" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
