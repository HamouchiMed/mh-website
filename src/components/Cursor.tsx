"use client";

import { useEffect, useRef } from "react";

// Pointer effects for mouse users (the native cursor stays visible):
// - a follower ring that grows over links and shows a label over
//   `[data-cursor-label]` elements (e.g. "View" on project cards);
// - magnetic pull on `[data-magnetic]` elements;
// - 3D tilt with a light glare on `[data-tilt]` elements.
export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!ring || !label) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pos = { x: -100, y: -100 };
    const target = { x: -100, y: -100 };
    let scale = 1;
    let targetScale = 1;
    let raf = 0;
    let magnet: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;

    const releaseMagnet = () => {
      if (!magnet) return;
      magnet.style.transform = "";
      magnet = null;
    };
    const releaseTilt = () => {
      if (!tilt) return;
      tilt.style.removeProperty("--rx");
      tilt.style.removeProperty("--ry");
      tilt.classList.remove("is-tilting");
      tilt = null;
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      ring.style.opacity = "1";
      updateFor(e.target as Element | null);
    };
    // Scrolling changes what is under a still pointer: refresh the label.
    const onScroll = () => {
      if (target.x < 0) return;
      updateFor(document.elementFromPoint(target.x, target.y));
    };
    const updateFor = (el: Element | null) => {
      const labelled = el?.closest<HTMLElement>("[data-cursor-label]");
      if (labelled) {
        label.textContent = labelled.dataset.cursorLabel ?? "";
        ring.classList.add("has-label");
        targetScale = 1;
      } else {
        ring.classList.remove("has-label");
        targetScale = el?.closest("a, button, summary, select, [data-cursor]") ? 2.4 : 1;
      }

      const m = el?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (m !== magnet) releaseMagnet();
      if (m) {
        magnet = m;
        const r = m.getBoundingClientRect();
        const dx = (target.x - (r.left + r.width / 2)) * 0.25;
        const dy = (target.y - (r.top + r.height / 2)) * 0.3;
        m.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
        m.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }

      const t = el?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (t !== tilt) releaseTilt();
      if (t) {
        tilt = t;
        const r = t.getBoundingClientRect();
        const px = (target.x - r.left) / r.width;
        const py = (target.y - r.top) / r.height;
        t.classList.add("is-tilting");
        t.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
        t.style.setProperty("--ry", `${(px - 0.5) * 12}deg`);
        t.style.setProperty("--gx", `${px * 100}%`);
        t.style.setProperty("--gy", `${py * 100}%`);
      }
    };
    const onLeave = () => {
      ring.style.opacity = "0";
      releaseMagnet();
      releaseTilt();
    };

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      scale += (targetScale - scale) * 0.15;
      ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // A click usually navigates: drop the label until the pointer moves again.
    const onClick = () => {
      ring.classList.remove("has-label");
      targetScale = 1;
    };
    // Buttons fill with colour from the point where the pointer enters, and
    // empty towards the point where it leaves.
    const setFillOrigin = (el: HTMLElement, e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const fx = e.clientX - r.left;
      const fy = e.clientY - r.top;
      const fd = 2 * Math.hypot(Math.max(fx, r.width - fx), Math.max(fy, r.height - fy));
      el.style.setProperty("--fx", `${fx}px`);
      el.style.setProperty("--fy", `${fy}px`);
      el.style.setProperty("--fd", `${fd}px`);
    };
    const onFillOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-fill]");
      if (!el || el.classList.contains("is-filled")) return;
      setFillOrigin(el, e);
      requestAnimationFrame(() => el.classList.add("is-filled"));
    };
    const onFillOut = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-fill]");
      if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return;
      setFillOrigin(el, e);
      el.classList.remove("is-filled");
    };
    document.addEventListener("pointerover", onFillOver, { passive: true });
    document.addEventListener("pointerout", onFillOut, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", onClick);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerover", onFillOver);
      document.removeEventListener("pointerout", onFillOut);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      releaseMagnet();
      releaseTilt();
    };
  }, []);

  return (
    <div ref={ringRef} aria-hidden="true" className="cursor-ring">
      <span ref={labelRef} className="cursor-label" />
    </div>
  );
}
