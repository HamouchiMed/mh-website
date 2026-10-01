"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const pageColors = { light: "#fafafa", dark: "#0b0b12", accent: "#2e3bff" } as const;
type PageTheme = keyof typeof pageColors;

// Global motion layer: smooth scrolling, scroll-triggered reveals, the
// scroll-linked text highlight and the page colour that follows the section in
// the middle of the viewport. Everything degrades to native behaviour when the
// visitor prefers reduced motion.
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

    // Page theme: the [data-theme] section crossing the middle of the screen
    // sets the page background (sections themselves turn transparent).
    const root = document.documentElement;
    const themed = Array.from(document.querySelectorAll<HTMLElement>("#main [data-theme], footer[data-theme]"));
    let current: PageTheme | null = null;
    let ticking = false;
    const applyTheme = () => {
      ticking = false;
      const mid = window.innerHeight / 2;
      const hit = themed.find((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= mid && r.bottom >= mid;
      });
      const next = hit?.dataset.theme;
      const theme: PageTheme = next && next in pageColors ? (next as PageTheme) : "light";
      if (theme === current) return;
      current = theme;
      root.dataset.pageTheme = theme;
      root.style.setProperty("--page-bg", pageColors[theme]);
    };
    const onThemeScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyTheme);
      }
    };
    applyTheme();
    root.classList.add("themed");
    window.addEventListener("scroll", onThemeScroll, { passive: true });
    window.addEventListener("resize", onThemeScroll);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", onThemeScroll);
      window.removeEventListener("resize", onThemeScroll);
    };
  }, [pathname]);

  return null;
}
