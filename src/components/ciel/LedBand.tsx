"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../motion/stage";
import { drawLed, fitCanvas, rasterize, type Raster } from "./led";

// The services band as an LED panel: the text scrolls on its own, faster
// (and backwards) with the page scroll, and the dots light up around the
// pointer. With motion turned off it is a still panel.
export default function LedBand({ items, label, rtl = false }: { items: string[]; label: string; rtl?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const text = items.map((s) => (rtl ? s : s.toLocaleUpperCase("fr"))).join("  ·  ") + "  ·  ";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const still = prefersReducedMotion();
    let raster: Raster | null = null;
    let raf = 0, visible = false, last = 0, offset = 0, speed = 0, lastY = window.scrollY;
    const pointer = { x: -1e4, y: -1e4 };

    const draw = (now: number) => {
      const { w, h, scale, rect } = fitCanvas(canvas);
      raster ??= rasterize(text, 13);
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const y = window.scrollY;
      const v = dt ? (y - lastY) / dt : 0;
      lastY = y;
      speed += (Math.max(-4000, Math.min(4000, v)) * 0.02 - speed) * Math.min(1, dt * 6);
      if (!still) offset += (rtl ? -1 : 1) * (6 + speed) * dt;
      drawLed(ctx, w, h, raster, {
        pitch: h / (raster.rows + 3),
        offset,
        loop: true,
        mx: still ? -1e4 : (pointer.x - rect.left) * scale,
        my: still ? -1e4 : (pointer.y - rect.top) * scale,
        reach: 110 * scale,
        t: now / 1000,
      });
    };
    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      draw(now);
      if (!still) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      last = 0;
      start();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      if (still) start();
    });
    ro.observe(canvas);
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.fonts?.ready.then(() => {
      raster = null;
      start();
    });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [text, rtl]);

  return (
    <section aria-label={label} data-theme="dark" className="relative h-[clamp(6.5rem,13vw,11rem)] overflow-hidden bg-[#050509]">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      <p className="sr-only">{items.join(", ")}</p>
    </section>
  );
}
