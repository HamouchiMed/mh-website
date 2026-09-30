"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Global motion layer: smooth scrolling, scroll-triggered reveals and the
// scroll-linked text highlight. Everything degrades to native behaviour when
// the visitor prefers reduced motion.
export default function Effects() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    lenisRef.current = lenis;
    let raf = requestAnimationFrame(function frame(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(frame);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));

    const scrollTexts = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-text]"));
    const update = () => {
      const vh = window.innerHeight;
      for (const el of scrollTexts) {
        const r = el.getBoundingClientRect();
        const p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
        el.style.setProperty("--p", p.toFixed(3));
      }
    };
    if (scrollTexts.length) {
      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    }

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return null;
}
