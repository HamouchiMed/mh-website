"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Dictionary } from "@/content/fr";
import { prefersReducedMotion, runThreeStage } from "../motion/stage";
import { TOPO_FRAG, VERT } from "./glsl";

export type CityPin = { slug: string; name: string; href: string; geo: [number, number] };

// Where each label sits around its dot, by hand where the northern cities
// crowd together: [side, vertical nudge in px].
const LABELS: Record<string, ["left" | "right", number]> = {
  tanger: ["left", -4],
  tetouan: ["right", 0],
  kenitra: ["left", -10],
  rabat: ["left", 8],
  casablanca: ["left", 20],
  fes: ["right", -12],
  meknes: ["right", 12],
  oujda: ["right", 0],
  marrakech: ["left", 0],
  agadir: ["left", 0],
  laayoune: ["left", 0],
  dakhla: ["right", 0],
};

// The intro on a topographic map that continues the end of the sky dive.
// The 12 city pages are pinned at their real coordinates; hovering a city
// raises a hill under it, and the pointer lifts the terrain as it moves.
export default function TopoMap({
  children,
  cities,
  labels,
  mirror = false,
}: {
  children: ReactNode;
  cities: CityPin[];
  labels: Dictionary["ciel"]["map"];
  mirror?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const hill = useRef({ x: -9999, y: -9999, target: 0, k: 0 });
  const redrawRef = useRef<() => void>(() => {});
  const [tip, setTip] = useState<{ slug: string; left: number; top: number; width: number } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = prefersReducedMotion();
    // Thin lines at a reduced resolution, redrawn at most 30 times a second.
    return runThreeStage(host, { alpha: false, antialias: false, dprCap: 0.7 }, (THREE, pointer, redraw, isStill) => {
      redrawRef.current = redraw;
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geometry = new THREE.PlaneGeometry(2, 2);
      const size = new THREE.Vector2();
      const u = {
        uRes: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uScale: { value: 1 },
        uPageTop: { value: 0 },
        uView: { value: 1 },
        uMouse: { value: new THREE.Vector2(-9999, -9999) },
        uMouseK: { value: 0 },
        uHill: { value: new THREE.Vector2(-9999, -9999) },
        uHillK: { value: 0 },
        uMirror: { value: mirror ? 1 : 0 },
      };
      const material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: TOPO_FRAG });
      const scene = new THREE.Scene();
      scene.add(new THREE.Mesh(geometry, material));
      // Still frames (motion off, or no graphics card) jump straight to the target.
      const ease = (dt: number, k: number) => (isStill() ? 1 : 1 - Math.exp(-dt * k));
      let drawnAt = -1;
      return {
        resize() {},
        frame(t, dt, renderer) {
          const h = hill.current;
          h.k += (h.target - h.k) * ease(dt, 5);
          const now = performance.now();
          if (!isStill() && now - drawnAt < 32) return;
          drawnAt = now;
          renderer.getDrawingBufferSize(size);
          const r = host.getBoundingClientRect();
          u.uRes.value.copy(size);
          u.uTime.value = reduced ? 8 : t;
          u.uScale.value = renderer.getPixelRatio();
          u.uPageTop.value = r.top + window.scrollY;
          u.uView.value = window.innerWidth;
          u.uMouse.value.set(r.left + pointer.x, r.top + pointer.y + window.scrollY);
          u.uMouseK.value += ((pointer.inside && !isStill() ? 1 : 0) - u.uMouseK.value) * ease(dt, 4);
          u.uHill.value.set(h.x, h.y);
          u.uHillK.value = h.k;
          renderer.render(scene, camera);
        },
        dispose() {
          geometry.dispose();
          material.dispose();
        },
      };
    });
  }, [mirror]);

  const show = (slug: string, el: HTMLElement) => {
    const dot = el.parentElement!.querySelector("[data-dot]")!.getBoundingClientRect();
    const box = el.closest("[data-map]")!.getBoundingClientRect();
    hill.current.x = dot.left + dot.width / 2;
    hill.current.y = dot.top + dot.height / 2 + window.scrollY;
    hill.current.target = 1;
    setTip({ slug, left: dot.left + dot.width / 2 - box.left, top: dot.top - box.top, width: box.width });
    redrawRef.current();
  };
  const hide = () => {
    hill.current.target = 0;
    setTip(null);
    redrawRef.current();
  };
  const coords = ([lat, lon]: [number, number]) =>
    `${lat.toFixed(2).replace(".", labels.decimal)}° ${labels.lat} · ${Math.abs(lon).toFixed(2).replace(".", labels.decimal)}° ${labels.lon}`;
  const tipCity = tip && cities.find((c) => c.slug === tip.slug);

  return (
    <section aria-labelledby="intro-label" data-zone="1" className="relative isolate overflow-hidden">
      <div ref={hostRef} aria-hidden="true" className="gl-fade absolute inset-0 -z-10" />
      <div className="container-x grid items-center gap-14 py-24 md:grid-cols-12 md:py-32">
        <div className="md:col-span-6 lg:col-span-5">{children}</div>
        <nav aria-label={labels.label} className="md:col-span-6 lg:col-span-7">
          {/* Geography keeps west on the left, whatever the language. */}
          <div dir="ltr" data-map className="relative mx-auto aspect-[7/8] w-full max-w-[34rem]">
            <span aria-hidden="true" className="absolute right-0 top-0 flex flex-col items-center gap-1 font-mono text-xs font-semibold text-accent">
              <svg viewBox="0 0 18 26" className="h-6 w-4">
                <path d="M9 0 L17 24 L9 18 L1 24 Z" fill="currentColor" />
              </svg>
              {labels.north}
            </span>
            {cities.map((c) => {
              const [side, nudge] = LABELS[c.slug] ?? ["right", 0];
              const x = (c.geo[1] + 17.2) / 16.2;
              const y = (36.4 - c.geo[0]) / 13.6;
              const on = tip?.slug === c.slug;
              // The dot sits on the city's coordinates; its name is the link,
              // set to one side and nudged apart from its neighbours.
              return (
                <div key={c.slug} className="absolute" style={{ left: `${6 + x * 86}%`, top: `${5 + y * 88}%` }}>
                  <span
                    data-dot
                    aria-hidden="true"
                    className={`absolute -left-[4.5px] -top-[4.5px] h-[9px] w-[9px] rounded-full shadow-[0_0_0_4px_rgb(46_59_255/0.18)] transition-colors ${on ? "bg-ink" : "bg-accent"}`}
                  />
                  <Link
                    href={c.href}
                    aria-label={`${labels.agency.replace("{city}", c.name)} (${coords(c.geo)})`}
                    onPointerEnter={(e) => show(c.slug, e.currentTarget)}
                    onPointerLeave={hide}
                    onFocus={(e) => show(c.slug, e.currentTarget)}
                    onBlur={hide}
                    style={{ transform: `translateY(calc(-50% + ${nudge}px))` }}
                    className={`absolute top-0 flex min-h-6 items-center whitespace-nowrap rounded bg-paper/85 px-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.04em] text-ink transition-colors hover:text-accent ${
                      side === "left" ? "right-[9px]" : "left-[9px]"
                    }`}
                  >
                    {c.name}
                  </Link>
                </div>
              );
            })}
            {tip && tipCity && (
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute z-10 -translate-y-[calc(100%_+_14px)] whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-sm text-paper ${
                  // Kept inside the map: anchored on its left or right edge near the sides.
                  tip.left < tip.width * 0.3 ? "-translate-x-4" : tip.left > tip.width * 0.7 ? "-translate-x-[calc(100%_-_1rem)]" : "-translate-x-1/2"
                }`}
                style={{ left: tip.left, top: tip.top }}
              >
                {labels.agency.replace("{city}", tipCity.name)} →
                <small className="mt-0.5 block font-mono text-[0.6875rem] opacity-65">{coords(tipCity.geo)}</small>
              </span>
            )}
            <p aria-hidden="true" className="absolute -bottom-9 left-0 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.05em] text-muted">
              <span>{labels.scale}</span>
              <span>{labels.interval}</span>
              <span>{labels.count}</span>
            </p>
          </div>
        </nav>
      </div>
    </section>
  );
}
