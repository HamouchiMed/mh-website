"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../motion/stage";
import { fitCanvas, ledPainter, rasterize, type Raster } from "./led";

// A large LED sign (the footer's "PARLONS-EN"): a light sweeps across it and
// the dots light up around the pointer. Still with motion turned off.
export default function LedSign({ text, className = "" }: { text: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const still = prefersReducedMotion();
    let raster: Raster | null = null;
    const paint = ledPainter();
    let raf = 0, visible = false;
    const pointer = { x: -1e4, y: -1e4 };

    const draw = (now: number) => {
      const { w, h, scale, rect } = fitCanvas(canvas);
      raster ??= rasterize(text, 17);
      const pitch = Math.min(h / (raster.rows + 2), w / (raster.w + 2));
      const cols = Math.ceil(w / pitch);
      paint(ctx, w, h, raster, {
        pitch,
        offset: 0,
        loop: false,
        startCol: Math.floor((cols - raster.w) / 2),
        mx: still ? -1e4 : (pointer.x - rect.left) * scale,
        my: still ? -1e4 : (pointer.y - rect.top) * scale,
        reach: 90 * scale,
        sweep: still ? null : (((now / 1000) * 22) % (cols + 30)) - 15,
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
  }, [text]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`block h-full w-full ${className}`} />;
}
