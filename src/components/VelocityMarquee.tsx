"use client";

import { useEffect, useRef } from "react";

// Marquee that drifts on its own, speeds up and leans with the scroll
// velocity, and reverses when scrolling back up.
export default function VelocityMarquee({ items, className = "" }: { items: string[]; className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let lastY = window.scrollY;
    let velocity = 0;
    let direction = 1;
    let visible = true;
    let raf = 0;

    const tick = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      velocity += (dy - velocity) * 0.12;
      if (Math.abs(dy) > 0.5) direction = dy > 0 ? 1 : -1;
      const half = track.scrollWidth / 2;
      x -= direction * 0.7 + velocity * 0.45;
      if (half > 0) {
        if (x <= -half) x += half;
        if (x > 0) x -= half;
      }
      const skew = Math.max(-12, Math.min(12, -velocity * 0.4));
      track.style.transform = `translate3d(${x}px, 0, 0) skewX(${skew}deg)`;
      if (visible) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        lastY = window.scrollY;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(track);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item} className="flex items-center whitespace-nowrap">
          <span className="px-6 md:px-10">{item}</span>
          <span aria-hidden="true" className="text-[0.5em]">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div dir="ltr" className={`overflow-hidden ${className}`}>
      <div ref={trackRef} className="flex w-max will-change-transform">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
