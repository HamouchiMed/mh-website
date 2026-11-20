"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../motion/stage";

const RAMP = " .,:;-=+*#%@";

// A project screenshot drawn as coloured characters over the real image.
// With a mouse, the characters dissolve into the image around the pointer;
// on touch screens the image decodes once the card is in view. Dark
// screenshots are drawn on black, light ones on paper. With motion turned off
// only the image is shown.
export default function AsciiMedia({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    if (prefersReducedMotion()) {
      canvas.hidden = true;
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Hide the image until the characters are drawn (no flash of the photo).
    canvas.style.background = "#06060a";
    const fine = window.matchMedia("(pointer: fine)").matches;
    const seed = Math.random() * 1000;
    let cells: Uint8ClampedArray | null = null;
    let cache: HTMLCanvasElement | null = null;
    let cols = 0, rows = 0, cw = 0, ch = 0, light = false, lo = 0, span = 1;
    let w = 0, h = 0, scale = 1;
    let raf = 0, visible = false, last = 0, lastTick = -1, dirty = true, cleared = false;
    let hover = false, reveal = 0, target = 0, mx = 0, my = 0;
    const font = () => `600 ${ch}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    const colour = (i: number) => {
      const d = cells!, R = d[i], G = d[i + 1], B = d[i + 2];
      return light
        ? `rgb(${Math.round(R * 0.62)},${Math.round(G * 0.62)},${Math.round(B * 0.7)})`
        : `rgb(${Math.min(255, R * 1.25 + 20)},${Math.min(255, G * 1.25 + 20)},${Math.min(255, B * 1.25 + 30)})`;
    };
    // All the characters, drawn once per size into a hidden canvas.
    const paint = () => {
      cache = document.createElement("canvas");
      cache.width = w;
      cache.height = h;
      const x = cache.getContext("2d")!;
      x.fillStyle = light ? "#f4f4f8" : "#06060a";
      x.fillRect(0, 0, w, h);
      x.font = font();
      x.textBaseline = "top";
      const d = cells!;
      for (let r = 0; r < rows; r++) {
        for (let k = 0; k < cols; k++) {
          const i = (r * cols + k) * 4;
          const l = ((0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255 - lo) / span;
          const idx = Math.round(Math.pow(Math.max(0, light ? 1 - l : l), 0.8) * (RAMP.length - 1));
          if (idx <= 0) continue;
          x.fillStyle = colour(i);
          x.fillText(RAMP[idx], k * cw, r * ch);
        }
      }
    };

    const build = () => {
      const img = imgRef.current;
      if (!img || !img.complete || !img.naturalWidth) return false;
      scale = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale));
      h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w;
      canvas.height = h;
      ch = Math.max(7, 8 * scale);
      cw = ch * 0.6;
      cols = Math.floor(w / cw);
      rows = Math.floor(h / ch);
      const c = document.createElement("canvas");
      c.width = cols;
      c.height = rows;
      const x = c.getContext("2d", { willReadFrequently: true })!;
      // Same crop as the image (object-cover, anchored at the top).
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const k = Math.max(w / iw, h / ih);
      const sw = w / k, sh = h / k;
      x.drawImage(img, (iw - sw) / 2, 0, sw, sh, 0, 0, cols, rows);
      cells = x.getImageData(0, 0, cols, rows).data;
      let sum = 0, min = 1, max = 0;
      for (let i = 0; i < cells.length; i += 4) {
        const l = (0.299 * cells[i] + 0.587 * cells[i + 1] + 0.114 * cells[i + 2]) / 255;
        sum += l;
        min = Math.min(min, l);
        max = Math.max(max, l);
      }
      light = sum / (cols * rows) > 0.5;
      lo = min;
      span = Math.max(0.05, max - min);
      paint();
      lastTick = -1;
      dirty = true;
      canvas.style.background = "";
      return true;
    };

    // Each frame copies the characters and lets a few of them flicker (about
    // 8 times a second); fully decoded, the canvas is simply cleared.
    const draw = (now: number) => {
      if (!cells && !build()) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      reveal += (target - reveal) * Math.min(1, dt * (target > reveal ? 3.2 : 5));
      if (target === 1 && reveal > 0.995) {
        if (!cleared) ctx.clearRect(0, 0, w, h);
        cleared = true;
        return;
      }
      cleared = false;
      const tick = Math.floor(now / 120);
      const animating = Math.abs(target - reveal) > 0.002;
      if (tick === lastTick && !animating && !dirty) return;
      lastTick = tick;
      dirty = false;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(cache!, 0, 0);
      ctx.font = font();
      ctx.textBaseline = "top";
      const flicker = Math.max(4, Math.round(cols * rows * 0.012));
      for (let j = 0; j < flicker; j++) {
        const n = Math.sin(j * 12.9898 + tick * 78.233 + seed) * 43758.5453;
        const cell = Math.floor((n - Math.floor(n)) * cols * rows);
        const k = cell % cols, r = Math.floor(cell / cols);
        ctx.fillStyle = light ? "#f4f4f8" : "#06060a";
        ctx.fillRect(k * cw, r * ch, cw, ch);
        ctx.fillStyle = colour(cell * 4);
        ctx.fillText(RAMP[1 + ((tick + j) % (RAMP.length - 1))], k * cw, r * ch);
      }
      if (reveal > 0.002) {
        // Erase the characters around the pointer: the real image shows through.
        const rad = reveal * Math.hypot(w, h);
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(mx, my, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "rgba(255,216,77,0.9)";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(mx, my, rad, 0, Math.PI * 2);
        ctx.stroke();
      }
    };
    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) * scale;
      my = (e.clientY - r.top) * scale;
      hover = true;
      dirty = true;
      target = 1;
    };
    const onLeave = () => {
      if (!hover) return;
      hover = false;
      target = 0;
      dirty = true;
    };
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerleave", onLeave);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      last = 0;
      start();
    });
    io.observe(box);
    // Touch screens: decode once the card is well in view.
    const touchIo = fine
      ? null
      : new IntersectionObserver(
          ([e]) => {
            if (!e.isIntersecting) return;
            mx = w / 2;
            my = h / 2;
            window.setTimeout(() => (target = 1), 700);
            touchIo?.disconnect();
          },
          { threshold: 0.7 },
        );
    touchIo?.observe(box);
    const ro = new ResizeObserver(() => {
      cells = null;
    });
    ro.observe(box);
    const img = imgRef.current;
    const onLoad = () => {
      cells = null;
      start();
    };
    img?.addEventListener("load", onLoad);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      touchIo?.disconnect();
      ro.disconnect();
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
      img?.removeEventListener("load", onLoad);
    };
  }, [src]);

  return (
    <div ref={boxRef} className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-paper-2">
      <Image ref={imgRef} src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" />
      <canvas ref={canvasRef} aria-hidden="true" className="ascii-cover absolute inset-0 h-full w-full" />
    </div>
  );
}
