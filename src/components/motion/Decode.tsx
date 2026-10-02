"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./stage";

// Text that decodes letter by letter, like code being printed. The real text
// is rendered on the server, so search engines and screen readers get it as
// is; the effect only runs in the browser.

const GLYPHS = "!<>-_/[]{}=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const ARABIC = /[؀-ۿ]/;
const esc = (c: string) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c);

function scramble(el: HTMLElement, to: string, duration = 0.9) {
  const from = el.textContent ?? "";
  const len = Math.max(from.length, to.length);
  const chars = Array.from({ length: len }, (_, i) => {
    const st = Math.random() * duration * 0.5;
    return { from: from[i] ?? "", to: to[i] ?? "", st, en: st + duration * 0.3 + Math.random() * duration * 0.5, ch: "" };
  });
  const start = performance.now();
  let raf = 0;
  const tick = () => {
    const e = (performance.now() - start) / 1000;
    let html = "";
    let done = 0;
    for (const c of chars) {
      if (e >= c.en) {
        done++;
        html += esc(c.to);
      } else if (e >= c.st) {
        if (!c.ch || Math.random() < 0.28) c.ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        html += `<span class="decode-glyph">${esc(c.ch)}</span>`;
      } else html += esc(c.from);
    }
    if (done === chars.length) {
      el.textContent = to;
      return;
    }
    el.innerHTML = html;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    el.textContent = to;
  };
}

export default function Decode({
  text,
  cycle,
  trigger = "view",
  className,
}: {
  text: string;
  // Words to rotate through, each one decoding into the next.
  cycle?: string[];
  // "view": once when scrolled into view; "hover": when the enclosing link
  // or button is hovered; "none": only the cycle.
  trigger?: "view" | "hover" | "none";
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const words = cycle?.join("\u0000") ?? "";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const list = words ? words.split("\u0000") : [];
    const reduced = prefersReducedMotion();
    // Arabic letters must stay joined: no scrambling, words simply swap.
    const plain = reduced || ARABIC.test(text + words);
    let cancel: (() => void) | null = null;
    const run = (to: string) => {
      cancel?.();
      cancel = null;
      if (plain) el.textContent = to;
      else cancel = scramble(el, to);
    };
    const cleanups: (() => void)[] = [];
    if (!plain && trigger === "view") {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          run(text);
          io.disconnect();
        },
        { rootMargin: "0px 0px -10% 0px" },
      );
      io.observe(el);
      cleanups.push(() => io.disconnect());
    }
    if (!plain && trigger === "hover") {
      const target = el.closest("a, button") ?? el;
      const onEnter = () => run(text);
      target.addEventListener("pointerenter", onEnter);
      cleanups.push(() => target.removeEventListener("pointerenter", onEnter));
    }
    if (list.length > 1 && !reduced) {
      let i = Math.max(0, list.indexOf(text));
      const id = window.setInterval(() => {
        i = (i + 1) % list.length;
        run(list[i]);
      }, 2800);
      cleanups.push(() => window.clearInterval(id));
    }
    return () => {
      cleanups.forEach((f) => f());
      cancel?.();
    };
  }, [text, words, trigger]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
