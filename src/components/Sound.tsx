"use client";

import { useEffect, useRef, useState } from "react";

// Optional interface sounds, synthesised with the Web Audio API (no audio
// files). Off by default; the choice is remembered in this browser only.
const STORAGE_KEY = "mh-sound";

export default function SoundToggle({ labels }: { labels: { on: string; off: string } }) {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "on") setEnabled(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const ctx = (ctxRef.current ??= new AudioContext());

    const blip = (freq: number, duration: number, volume: number, type: OscillatorType = "sine", delay = 0) => {
      if (ctx.state === "suspended") void ctx.resume();
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.72, t + duration);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    };

    let last: Element | null = null;
    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest("a, button, summary, [data-cursor-label]") ?? null;
      if (el && el !== last) blip(1320, 0.05, 0.018);
      last = el;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest("a, button, summary")) {
        blip(520, 0.09, 0.045, "triangle");
        blip(780, 0.08, 0.025, "sine", 0.03);
      }
    };
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [enabled]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {}
    if (next) {
      const ctx = (ctxRef.current ??= new AudioContext());
      void ctx.resume();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? labels.on : labels.off}
      title={enabled ? labels.on : labels.off}
      data-magnetic
      className="grid h-11 w-11 place-items-center rounded-full border border-line transition-colors hover:border-ink"
    >
      <span aria-hidden="true" className={`sound-bars ${enabled ? "is-on" : ""}`}>
        <span />
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}
