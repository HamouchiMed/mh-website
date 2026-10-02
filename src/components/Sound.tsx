"use client";

import { useEffect, useRef, useState } from "react";
import { Ambient } from "@/lib/ambient";

// The music (see lib/ambient.ts), synthesised in the browser; moving the
// mouse plays along. Button ticks and clicks are separate (UiSounds.tsx).
// Off by default; browsers only allow audio after a click, so a remembered
// "on" starts on the visitor's first interaction. While it plays, the
// button's bars follow the music.
const STORAGE_KEY = "mh-sound";
const HINT_KEY = "mh-sound-hint";

export default function SoundToggle({ labels }: { labels: { on: string; off: string } }) {
  const [enabled, setEnabled] = useState(false);
  const [hint, setHint] = useState(false);
  const engineRef = useRef<Ambient | null>(null);
  const barsRef = useRef<HTMLSpanElement>(null);

  // The audio engine is created inside a user gesture (click or key), which
  // is what browsers, iOS Safari in particular, require to play sound.
  const createEngine = () => (engineRef.current ??= new Ambient(new AudioContext()));

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "on") setEnabled(true);
      // First visit: the bars wave for a while to show sound is available.
      if (!localStorage.getItem(HINT_KEY)) {
        setHint(true);
        localStorage.setItem(HINT_KEY, "1");
        const id = window.setTimeout(() => setHint(false), 12000);
        return () => window.clearTimeout(id);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!enabled) {
      const engine = engineRef.current;
      if (engine) {
        engine.stop();
        const id = window.setTimeout(() => void engine.ctx.suspend(), 900);
        return () => window.clearTimeout(id);
      }
      return;
    }

    let raf = 0;
    const begin = () => {
      const engine = createEngine();
      void engine.ctx.resume();
      engine.start();
    };
    // Turned on by a click: the engine already exists, start now. Remembered
    // "on" from a previous visit: start on the first click or key press.
    const onGesture = () => begin();
    if (engineRef.current) begin();
    else {
      window.addEventListener("pointerdown", onGesture, { once: true });
      window.addEventListener("keydown", onGesture, { once: true });
    }

    const vw = () => Math.max(window.innerWidth, 1);
    const vh = () => Math.max(window.innerHeight, 1);
    let lastX = -1;
    let lastY = -1;
    let travelled = 0;
    let lastNote = 0;
    const onMove = (e: PointerEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      const x = e.clientX / vw();
      const y = e.clientY / vh();
      engine.setPointer(x, y);
      if (lastX >= 0) {
        const d = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        travelled += d;
        const now = performance.now();
        if (travelled > 110 && now - lastNote > 110) {
          engine.spark(x, y, Math.min(d / 60, 1));
          travelled = 0;
          lastNote = now;
        }
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };
    // Scroll speed feeds the wind; the bars follow the music.
    let lastScroll = window.scrollY;
    let speed = 0;
    const bins = new Uint8Array(32);
    const frame = () => {
      const engine = engineRef.current;
      const y = window.scrollY;
      speed += (Math.min(Math.abs(y - lastScroll) / 40, 1) - speed) * 0.2;
      lastScroll = y;
      if (engine) {
        engine.setScroll(speed);
        const spans = barsRef.current?.children;
        if (spans) {
          engine.analyser.getByteFrequencyData(bins);
          for (let i = 0; i < spans.length; i++) {
            const v = bins[1 + i * 3] / 255;
            (spans[i] as HTMLElement).style.height = `${3 + v * 9}px`;
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Silence in background tabs.
    const onVisibility = () => {
      const engine = engineRef.current;
      if (!engine) return;
      if (document.hidden) void engine.ctx.suspend();
      else void engine.ctx.resume();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      const spans = barsRef.current?.children;
      if (spans) for (const s of Array.from(spans)) (s as HTMLElement).style.height = "";
    };
  }, [enabled]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setHint(false);
    if (next) void createEngine().ctx.resume();
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? labels.on : labels.off}
      title={enabled ? labels.on : labels.off}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line transition-colors hover:border-ink"
    >
      <span ref={barsRef} aria-hidden="true" className={`sound-bars ${enabled ? "is-live" : hint ? "is-hint" : ""}`}>
        <span />
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}
