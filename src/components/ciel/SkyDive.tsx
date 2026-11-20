"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { BUBBLE_FRAGMENT, BUBBLE_VERTEX } from "../motion/bubble";
import { isSmallScreen, prefersReducedMotion, runThreeStage } from "../motion/stage";
import { CLOUDS_FRAG, SKY_FRAG, VERT } from "./glsl";

// The hero as a sky: clouds drift around the 3D bubble. The section is tall
// and its screen sticks, so scrolling dives through the cloud layer (it
// whites out) and lands on the topographic map that the next section
// continues. With motion turned off it is a still sky of normal height; on
// phones the bubble is left out.
export default function SkyDive({ children, hint, mirror = false }: { children: ReactNode; hint: string; mirror?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const host = hostRef.current;
    if (!section || !host) return;
    const still = prefersReducedMotion();
    const small = isSmallScreen();
    const progress = () => {
      if (still) return 0;
      const r = section.getBoundingClientRect();
      return Math.min(Math.max(-r.top / Math.max(1, r.height - window.innerHeight), 0), 1);
    };

    // The text fades out as the dive starts; past the clouds the page colour
    // (and the header) turn light, like the ground. When the sky is drawn on
    // demand (no graphics card), it is redrawn as the page scrolls.
    let raf = 0;
    let redraw = () => {};
    const update = () => {
      raf = 0;
      const p = progress();
      const content = contentRef.current;
      if (content) {
        content.style.opacity = String(Math.max(0, 1 - p / 0.22));
        content.style.transform = p > 0 ? `translateY(${-p * 120}px)` : "";
        content.style.visibility = p > 0.3 ? "hidden" : "";
      }
      if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - p / 0.08));
      const theme = p > 0.72 ? "light" : "accent";
      if (section.dataset.theme !== theme) section.dataset.theme = theme;
      if (!still) redraw();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    // The clouds are drawn small and stretched (they are soft); the ground's
    // contour lines and the bubble (a mesh) are drawn at screen resolution.
    // While the page is still everything redraws at 30 fps, and on every
    // frame while it scrolls.
    const stop = runThreeStage(host, { alpha: false, antialias: true, dprCap: small ? 0.55 : 0.75 }, (THREE, pointer, draw, isStill) => {
      redraw = draw;
      const flat = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const quad = new THREE.PlaneGeometry(2, 2);
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
        uP: { value: 0 },
      };
      const clouds = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
      const c = {
        uRes: { value: new THREE.Vector2(1, 1) },
        uTime: u.uTime,
        uP: u.uP,
        uView: u.uView,
        uMouse: u.uMouse,
        uMirror: u.uMirror,
      };
      const cloudMaterial = new THREE.ShaderMaterial({ uniforms: c, vertexShader: VERT, fragmentShader: CLOUDS_FRAG, depthTest: false, depthWrite: false });
      const cloudScene = new THREE.Scene();
      cloudScene.add(new THREE.Mesh(quad, cloudMaterial));
      const skyMaterial = new THREE.ShaderMaterial({
        uniforms: { ...u, tClouds: { value: clouds.texture } },
        vertexShader: VERT,
        fragmentShader: SKY_FRAG,
        depthTest: false,
        depthWrite: false,
      });
      const sky = new THREE.Scene();
      sky.add(new THREE.Mesh(quad, skyMaterial));

      // The bubble, as on the classic home page (left out on phones).
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.z = 8;
      const look = new THREE.Vector2();
      const b = {
        uTime: { value: 0 },
        uMouse: { value: look },
        uAmp: { value: 0.26 },
        uColor: { value: new THREE.Color().setRGB(0.14, 0.2, 0.92) },
        uAlpha: { value: 1 },
      };
      const sphere = small ? null : new THREE.IcosahedronGeometry(1, 32);
      const bubbleMaterial = new THREE.ShaderMaterial({ uniforms: b, vertexShader: BUBBLE_VERTEX, fragmentShader: BUBBLE_FRAGMENT });
      const bubbles = new THREE.Scene();
      const bubble = sphere ? new THREE.Mesh(sphere, bubbleMaterial) : null;
      if (bubble) bubbles.add(bubble);
      let halfW = 1, halfH = 1;
      let drawnAt = -1, drawnP = -1;
      const ease = (dt: number, k: number) => 1 - Math.exp(-dt * k);

      return {
        resize(w, h) {
          camera.aspect = w / Math.max(h, 1);
          camera.updateProjectionMatrix();
          halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
          halfW = halfH * camera.aspect;
        },
        frame(t, dt, renderer) {
          const p = progress();
          const r = host.getBoundingClientRect();
          const tx = pointer.inside ? (pointer.x / Math.max(r.width, 1)) * 2 - 1 : Math.sin(t * 0.3) * 0.35;
          const ty = pointer.inside ? -((pointer.y / Math.max(r.height, 1)) * 2 - 1) : Math.sin(t * 0.22) * 0.2;
          look.x += (tx - look.x) * ease(dt, 3);
          look.y += (ty - look.y) * ease(dt, 3);
          u.uMouseK.value += ((pointer.inside ? 1 : 0) - u.uMouseK.value) * (isStill() ? 1 : ease(dt, 4));
          // Skip this frame when nothing scrolled and the last one is recent.
          const now = performance.now();
          if (!isStill() && p === drawnP && now - drawnAt < 32) return;
          drawnAt = now;
          drawnP = p;

          renderer.getDrawingBufferSize(size);
          u.uRes.value.copy(size);
          const cw = Math.max(1, Math.round(size.x * 0.4)), ch = Math.max(1, Math.round(size.y * 0.4));
          if (clouds.width !== cw || clouds.height !== ch) clouds.setSize(cw, ch);
          c.uRes.value.set(cw, ch);
          u.uTime.value = t;
          u.uScale.value = renderer.getPixelRatio();
          u.uPageTop.value = r.top + window.scrollY;
          u.uView.value = window.innerWidth;
          u.uMouse.value.set(r.left + pointer.x, r.top + pointer.y + window.scrollY);
          u.uP.value = p;
          renderer.autoClear = false;
          if (p < 0.9) {
            renderer.setRenderTarget(clouds);
            renderer.render(cloudScene, flat);
            renderer.setRenderTarget(null);
          }
          renderer.clear();
          renderer.render(sky, flat);
          // The bubble floats right of the title (left in Arabic) and rises
          // out of view as the dive starts.
          if (bubble && p < 0.5) {
            b.uTime.value = t;
            bubble.position.set((mirror ? -1 : 1) * 0.5 * halfW, 0.04 * halfH + p * 3 * halfH + Math.sin(t * 0.8) * 0.06, 0);
            bubble.scale.setScalar(Math.min(1.25, halfW * 0.34));
            bubble.rotation.set(-look.y * 0.3, t * 0.15 + look.x * 0.4, 0);
            renderer.render(bubbles, camera);
          }
        },
        dispose() {
          quad.dispose();
          sphere?.dispose();
          skyMaterial.dispose();
          cloudMaterial.dispose();
          clouds.dispose();
          bubbleMaterial.dispose();
        },
      };
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      stop();
    };
  }, [mirror]);

  return (
    <section ref={sectionRef} id="sky" data-theme="accent" data-zone="0" className="relative h-[240svh] motion-reduce:h-[100svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={hostRef} aria-hidden="true" className="gl-fade absolute inset-0 bg-[linear-gradient(180deg,#2433d6_0%,#3b4cf0_45%,#a9b7ff_100%)]" />
        <div ref={contentRef} className="relative z-10 flex h-full flex-col">
          {children}
        </div>
        <p
          ref={hintRef}
          aria-hidden="true"
          className="eyebrow absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/85"
        >
          {hint}
          <span className="h-9 w-px bg-gradient-to-b from-white to-transparent" />
        </p>
      </div>
    </section>
  );
}
