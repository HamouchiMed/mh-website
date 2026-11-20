"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/content/fr";

// The home page's altimeter: a small pill that follows the dive, from the
// sky (3 200 m) to the terrain (1:50 000), the plan (1:100), the code (1:1)
// and the closing signal. Zones are the [data-zone] sections. Not shown on
// phones, where it would cover the text.
const SCALES = ["—", "1:50 000", "1:100", "1:1", "1:1"];

export default function Altimeter({ labels, locale }: { labels: Dictionary["ciel"]["hud"]; locale: string }) {
  const [zone, setZone] = useState(0);
  const altRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fmt = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : `${locale}-MA`);
    let raf = 0;
    let lastAlt = -1;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let z = 0;
      for (const el of document.querySelectorAll<HTMLElement>("[data-zone]")) {
        if (el.getBoundingClientRect().top <= mid) z = Math.max(z, Number(el.dataset.zone));
      }
      setZone(z);
      const sky = document.getElementById("sky");
      let alt = 0;
      if (sky && z === 0) {
        const r = sky.getBoundingClientRect();
        const p = Math.min(Math.max(-r.top / Math.max(1, r.height - window.innerHeight), 0), 1);
        alt = Math.round((3200 * (1 - Math.min(1, p / 0.9))) / 10) * 10;
      }
      if (alt !== lastAlt && altRef.current) {
        altRef.current.textContent = `${fmt.format(alt)} m`;
        lastAlt = alt;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [locale]);

  return (
    <aside
      aria-hidden="true"
      className="pointer-events-none fixed bottom-5 start-5 z-30 hidden items-center gap-3 rounded-full bg-[#0b0b12]/80 px-3.5 py-2 font-mono text-[0.6875rem] leading-none tracking-[0.05em] text-white shadow-[0_16px_34px_-20px_rgb(0_0_0/0.8)] backdrop-blur-md md:bottom-8 md:start-8 md:flex"
    >
      <span className="flex gap-[3px]">
        {labels.zones.map((name, i) => (
          <i key={name} className={`h-[3px] w-3 rounded-sm ${i <= zone ? "bg-[#ffd84d]" : "bg-white/25"}`} />
        ))}
      </span>
      <span>
        <span className="opacity-50">{labels.zone.toLocaleUpperCase()}</span> 0{zone + 1} {labels.zones[zone].toLocaleUpperCase()}
      </span>
      <span>
        <span className="opacity-50">{labels.alt.toLocaleUpperCase()}</span> <b ref={altRef} className="font-medium tabular-nums">3 200 m</b>
      </span>
      <span>
        <span className="opacity-50">{labels.scale.toLocaleUpperCase()}</span> {zone === 0 ? SCALES[0] : SCALES[zone]}
      </span>
    </aside>
  );
}
