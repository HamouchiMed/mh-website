"use client";

import { useEffect } from "react";

// Interface sounds, on for every visitor and independent of the music
// (Sound.tsx): a soft tick when the mouse moves onto a link or button, and a
// click when one is pressed with the mouse, a finger or the keyboard.
// Browsers only allow sound after the visitor's first click or key press, so
// the very first hover is silent. Synthesised with the Web Audio API.
const TARGET = "a[href], button:not(:disabled), summary, [role='button'], [data-cursor-label]";

export default function UiSounds() {
  useEffect(() => {
    let ctx: AudioContext | null = null;
    let out: GainNode | null = null;

    const unlock = () => {
      if (!ctx) {
        ctx = new AudioContext();
        out = ctx.createGain();
        out.connect(ctx.destination);
      }
      if (ctx.state !== "running") void ctx.resume();
      return ctx;
    };
    const tone = (freq: number, end: number, duration: number, volume: number, type: OscillatorType, delay = 0) => {
      if (!ctx || !out) return;
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(end, t + duration);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain).connect(out);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    };
    const tick = () => tone(2100, 1500, 0.035, 0.035, "sine");
    const click = () => {
      tone(640, 380, 0.07, 0.09, "triangle");
      tone(1250, 900, 0.05, 0.035, "sine", 0.012);
    };
    // Plays now, or as soon as the browser lets the audio start.
    const play = (sound: () => void) => {
      const c = unlock();
      if (c.state === "running") sound();
      else void c.resume().then(sound, () => {});
    };

    let lastEl: Element | null = null;
    let lastTick = 0;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest(TARGET) ?? null;
      if (el && el !== lastEl && ctx?.state === "running") {
        const now = performance.now();
        if (now - lastTick > 45) {
          tick();
          lastTick = now;
        }
      }
      lastEl = el;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest(TARGET)) play(click);
      else unlock();
    };
    const onKey = (e: KeyboardEvent) => {
      const focused = document.activeElement;
      if ((e.key === "Enter" || e.key === " ") && focused instanceof Element && focused.closest(TARGET)) play(click);
      else unlock();
    };
    // Touch only counts as a user gesture on release: unlock there too.
    const onUp = () => unlock();

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("keydown", onKey);
      void ctx?.close();
    };
  }, []);

  return null;
}
