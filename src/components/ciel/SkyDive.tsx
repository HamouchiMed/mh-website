"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { isSmallScreen, prefersReducedMotion, runThreeStage } from "../motion/stage";
import { BLOB_FRAG, SKY_FRAG, VERT } from "./glsl";

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

    const stop = runThreeStage(host, { alpha: false, antialias: false, dprCap: small ? 0.55 : 0.75 }, (THREE, pointer, draw) => {
      redraw = draw;
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geometry = new THREE.PlaneGeometry(2, 2);
      const target = small ? null : new THREE.WebGLRenderTarget(512, 512);
      const look = new THREE.Vector2();
      const blobMaterial = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uLook: { value: look } },
        vertexShader: VERT,
        fragmentShader: BLOB_FRAG,
      });
      const blobScene = new THREE.Scene();
      blobScene.add(new THREE.Mesh(geometry, blobMaterial));
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
        uArea: { value: new THREE.Vector4(0, 0, 1, 1) },
        uBlob: { value: target?.texture ?? null },
        uHasBlob: { value: target ? 1 : 0 },
      };
      const skyMaterial = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: SKY_FRAG });
      const scene = new THREE.Scene();
      scene.add(new THREE.Mesh(geometry, skyMaterial));
      const ease = (dt: number, k: number) => 1 - Math.exp(-dt * k);

      return {
        resize() {},
        frame(t, dt, renderer) {
          renderer.getDrawingBufferSize(size);
          const p = progress();
          const r = host.getBoundingClientRect();
          const tx = pointer.inside ? (pointer.x / Math.max(r.width, 1)) * 2 - 1 : Math.sin(t * 0.3) * 0.35;
          const ty = pointer.inside ? -((pointer.y / Math.max(r.height, 1)) * 2 - 1) : Math.sin(t * 0.22) * 0.2;
          look.x += (tx - look.x) * ease(dt, 3);
          look.y += (ty - look.y) * ease(dt, 3);
          u.uRes.value.copy(size);
          u.uTime.value = t;
          u.uScale.value = renderer.getPixelRatio();
          u.uPageTop.value = r.top + window.scrollY;
          u.uView.value = window.innerWidth;
          u.uMouse.value.set(r.left + pointer.x, r.top + pointer.y + window.scrollY);
          u.uMouseK.value += ((pointer.inside ? 1 : 0) - u.uMouseK.value) * (still ? 1 : ease(dt, 4));
          u.uP.value = p;
          const W = size.x, H = size.y;
          u.uArea.value.set(mirror ? W * 0.06 : W * 0.5, H * 0.1, W * 0.44, H * 0.78);
          if (target && p < 0.6) {
            blobMaterial.uniforms.uTime.value = t;
            renderer.setRenderTarget(target);
            renderer.render(blobScene, camera);
            renderer.setRenderTarget(null);
          }
          renderer.render(scene, camera);
        },
        dispose() {
          geometry.dispose();
          blobMaterial.dispose();
          skyMaterial.dispose();
          target?.dispose();
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
