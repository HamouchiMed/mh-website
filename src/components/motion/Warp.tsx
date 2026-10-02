"use client";

import { useEffect, useRef } from "react";
import { isSmallScreen, prefersReducedMotion } from "./stage";

// A star field that drifts towards the viewer and steers with the pointer.
// It jumps to light speed while the pointer is over `boost` (a CSS selector)
// or, with `hold`, while the visitor holds the click anywhere on the stage.
// Transparent canvas: it sits on the section's own background.
export default function Warp({ boost, hold = false, className = "" }: { boost?: string; hold?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduced = prefersReducedMotion();
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => canvas.remove();

    const N = isSmallScreen() ? 260 : 520;
    type Star = { x: number; y: number; z: number; c: number };
    const stars: Star[] = [];
    const reset = (s: Star, far: boolean) => {
      s.x = (Math.random() - 0.5) * 2;
      s.y = (Math.random() - 0.5) * 2;
      s.z = far ? 1 : Math.random();
      s.c = Math.random();
    };
    for (let i = 0; i < N; i++) {
      const s = { x: 0, y: 0, z: 0, c: 0 };
      reset(s, false);
      stars.push(s);
    }

    let w = 1;
    let h = 1;
    let cx = 0;
    let cy = 0;
    let speed = 0.06;
    let fast = false;
    let px = 0;
    let py = 0;
    let inside = false;
    let visible = false;
    let raf = 0;
    let last = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = host.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2;
      draw(0);
    };
    const draw = (dt: number) => {
      speed += ((fast ? 1.7 : 0.06) - speed) * (1 - Math.exp(-dt * (fast ? 2.2 : 3.5)));
      ctx.clearRect(0, 0, w, h);
      const tx = inside ? w / 2 + (px - w / 2) * 0.3 : w / 2;
      const ty = inside ? h / 2 + (py - h / 2) * 0.3 : h / 2;
      cx += (tx - cx) * (1 - Math.exp(-dt * 3));
      cy += (ty - cy) * (1 - Math.exp(-dt * 3));
      const f = Math.max(w, h) * 0.35;
      const trail = 0.012 + speed * 0.09;
      ctx.lineCap = "round";
      for (const s of stars) {
        s.z -= speed * dt;
        if (s.z <= 0.02) {
          reset(s, true);
          continue;
        }
        const sx = cx + (s.x / s.z) * f;
        const sy = cy + (s.y / s.z) * f;
        if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) {
          reset(s, true);
          continue;
        }
        const tz = s.z + trail;
        const ox = cx + (s.x / tz) * f;
        const oy = cy + (s.y / tz) * f;
        const bright = Math.min(1, (1 - s.z) * 1.4);
        ctx.strokeStyle = s.c < 0.35 ? `rgba(120, 140, 255, ${bright})` : `rgba(235, 238, 255, ${bright})`;
        ctx.lineWidth = Math.max(0.6, (1 - s.z) * 2.2);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(sx + 0.01, sy);
        ctx.stroke();
      }
    };
    const loop = () => {
      raf = 0;
      if (!visible || document.hidden || reduced) {
        last = 0;
        return;
      }
      const now = performance.now();
      const dt = last ? Math.min(Math.max((now - last) / 1000, 0), 0.05) : 1 / 60;
      last = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    const schedule = () => {
      if (!raf && visible && !document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      inside = px >= 0 && py >= 0 && px <= r.width && py <= r.height;
      if (boost) fast = !!(e.target as Element | null)?.closest?.(boost);
    };
    const onDown = (e: PointerEvent) => {
      onMove(e);
      if (hold && inside) fast = true;
    };
    const onUp = () => {
      if (hold) fast = false;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    io.observe(host);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.addEventListener("visibilitychange", schedule);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("visibilitychange", schedule);
      canvas.remove();
    };
  }, [boost, hold]);

  return <div ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
