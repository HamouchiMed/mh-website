import type Lenis from "lenis";

// The page's Lenis instance (set by Effects), so other components can scroll
// through it and keep the smooth easing. Null when smooth scrolling is off.
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function scrollPageTo(y: number, immediate = false) {
  if (lenis) lenis.scrollTo(y, { immediate });
  else window.scrollTo({ top: y, behavior: "auto" });
}
