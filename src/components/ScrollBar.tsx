"use client";

import { useEffect, useRef } from "react";
import { scrollPageTo } from "@/lib/scroll";

// The site's own scrollbar, on computers with a mouse: a thin rail on the
// right whose thumb follows the page, grows on hover with the scroll
// percentage, and can be dragged or clicked. It fades while the page is
// still. Touch screens keep their native scrollbar. Colours follow the
// section theme (theme-follow), like the header.
export default function ScrollBar() {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const thumb = thumbRef.current;
    const label = labelRef.current;
    if (!rail || !thumb || !label) return;
    const root = document.documentElement;
    const mouse = window.matchMedia("(pointer: fine) and (min-width: 768px)");
    let max = 0;
    let thumbH = 0;
    let travel = 0;
    let raf = 0;
    let idle = 0;
    let drag: { startY: number; startScroll: number } | null = null;

    const paint = () => {
      raf = 0;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      thumb.style.transform = `translate3d(0, ${(p * travel).toFixed(1)}px, 0)`;
      label.textContent = `${Math.round(p * 100)}%`;
    };
    const measure = () => {
      const railH = rail.clientHeight;
      max = Math.max(0, root.scrollHeight - window.innerHeight);
      thumbH = max > 0 ? Math.max(48, (railH * window.innerHeight) / root.scrollHeight) : railH;
      travel = Math.max(0, railH - thumbH);
      thumb.style.height = `${thumbH}px`;
      rail.dataset.empty = String(max < 4);
      paint();
    };
    const wake = () => {
      rail.dataset.active = "true";
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        if (!drag) rail.dataset.active = "false";
      }, 1200);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
      wake();
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      if (thumb.contains(e.target as Node)) {
        drag = { startY: e.clientY, startScroll: window.scrollY };
        rail.setPointerCapture(e.pointerId);
        rail.dataset.dragging = "true";
      } else {
        // A click on the rail glides there, with the thumb centred on the pointer.
        const top = rail.getBoundingClientRect().top;
        const p = Math.min(Math.max((e.clientY - top - thumbH / 2) / Math.max(travel, 1), 0), 1);
        scrollPageTo(p * max);
      }
      wake();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const y = drag.startScroll + ((e.clientY - drag.startY) / Math.max(travel, 1)) * max;
      scrollPageTo(Math.min(Math.max(y, 0), max), true);
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      drag = null;
      rail.dataset.dragging = "false";
      if (rail.hasPointerCapture(e.pointerId)) rail.releasePointerCapture(e.pointerId);
      wake();
    };

    const toggle = () => {
      root.classList.toggle("own-scrollbar", mouse.matches);
      if (mouse.matches) measure();
    };
    toggle();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    rail.addEventListener("pointerdown", onDown);
    rail.addEventListener("pointermove", onMove);
    rail.addEventListener("pointerup", onUp);
    rail.addEventListener("pointercancel", onUp);
    mouse.addEventListener("change", toggle);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(idle);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      rail.removeEventListener("pointerdown", onDown);
      rail.removeEventListener("pointermove", onMove);
      rail.removeEventListener("pointerup", onUp);
      rail.removeEventListener("pointercancel", onUp);
      mouse.removeEventListener("change", toggle);
      root.classList.remove("own-scrollbar");
    };
  }, []);

  return (
    <div ref={railRef} aria-hidden="true" data-active="false" data-dragging="false" data-empty="true" className="scrollbar theme-follow">
      <span className="scrollbar-line" />
      <div ref={thumbRef} className="scrollbar-thumb">
        <span ref={labelRef} className="scrollbar-label" />
      </div>
    </div>
  );
}
