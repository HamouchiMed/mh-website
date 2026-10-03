"use client";

import { useEffect, useRef } from "react";
import { ease, isSmallScreen, prefersReducedMotion, runThreeStage, SNOISE } from "./motion/stage";

// The iridescent liquid bubble that follows the home page. It sits fixed
// behind the content; each section can carry data-scene="…" and the bubble
// glides to that section's preset (position, size, wobble, tint, opacity).
// Sections with their own animation (services, method, footer) hide it.
// Desktop only: on phones the bubble is not loaded at all. With motion turned
// off on the device it stays a still picture in the hero and scrolls away
// with it, instead of staying on screen over the other sections.

type Preset = {
  x: number; // fraction of the half-width (−1 left … 1 right)
  y: number; // fraction of the half-height (−1 bottom … 1 top)
  scale: number;
  amp: number; // how liquid the surface is
  color: [number, number, number];
  alpha: number;
  pull: number; // how much it leans towards the cursor
};

const BLUE: Preset["color"] = [0.14, 0.2, 0.92];
const ORANGE: Preset["color"] = [0.85, 0.3, 0.1];
const PRESETS: Record<string, Preset> = {
  hero: { x: 0.52, y: 0.02, scale: 0.74, amp: 0.26, color: BLUE, alpha: 1, pull: 0.35 },
  intro: { x: -0.82, y: 0.52, scale: 0.36, amp: 0.38, color: BLUE, alpha: 1, pull: 0.2 },
  services: { x: 0.9, y: 0.8, scale: 0.2, amp: 0.3, color: BLUE, alpha: 0, pull: 0 },
  work: { x: 0.25, y: 0.7, scale: 0.3, amp: 0.36, color: ORANGE, alpha: 1, pull: 0.2 },
  process: { x: -0.7, y: -0.45, scale: 0.3, amp: 0.3, color: BLUE, alpha: 0, pull: 0 },
  why: { x: 0.86, y: 0.62, scale: 0.3, amp: 0.36, color: BLUE, alpha: 0.95, pull: 0.2 },
  blog: { x: -0.88, y: 0.64, scale: 0.28, amp: 0.36, color: ORANGE, alpha: 0.85, pull: 0.15 },
  cta: { x: 0.42, y: 0.62, scale: 0.3, amp: 0.3, color: BLUE, alpha: 0, pull: 0 },
};

const VERTEX = `${SNOISE}
uniform float uTime; uniform vec2 uMouse; uniform float uAmp;
varying vec3 vNormalW; varying vec3 vPosW; varying float vN;
float field(vec3 q) {
  return snoise(q * 0.85 + vec3(uMouse * 0.7, uTime * 0.22)) + snoise(q * 2.3 + vec3(0.0, uTime * 0.45, 0.0)) * 0.22;
}
vec3 displaced(vec3 dir) { return dir + dir * field(dir) * uAmp; }
void main() {
  // Smooth normals: displace this vertex and two close neighbours on the
  // sphere, and take the normal of the triangle they form.
  vec3 dir = normalize(position);
  vec3 helper = abs(dir.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 t1 = normalize(cross(dir, helper));
  vec3 t2 = cross(dir, t1);
  vec3 p0 = displaced(dir);
  vec3 p1 = displaced(normalize(dir + t1 * 0.012));
  vec3 p2 = displaced(normalize(dir + t2 * 0.012));
  vec3 nrm = normalize(cross(p1 - p0, p2 - p0));
  if (dot(nrm, dir) < 0.0) nrm = -nrm;
  vN = field(dir);
  vec4 wp = modelMatrix * vec4(p0, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize((modelMatrix * vec4(nrm, 0.0)).xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAGMENT = `
uniform float uTime; uniform vec3 uColor; uniform float uAlpha;
varying vec3 vNormalW; varying vec3 vPosW; varying float vN;
void main() {
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(cameraPosition - vPosW);
  float fr = pow(1.0 - max(dot(n, v), 0.0), 2.0);
  vec3 irid = 0.5 + 0.5 * cos(6.2831 * (fr * 0.8 + vN * 0.3 + vec3(0.0, 0.33, 0.67)) + uTime * 0.4);
  vec3 L = normalize(vec3(-0.4, 0.8, 0.6));
  float dif = max(dot(n, L), 0.0);
  float spec = pow(max(dot(reflect(-L, n), v), 0.0), 60.0);
  vec3 col = uColor * (0.25 + 0.75 * dif);
  col = mix(col, irid, fr * 0.8);
  col += spec * 0.55;
  gl_FragColor = vec4(col, uAlpha);
}`;

export default function SceneCanvas({ mirror = false, className = "" }: { mirror?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host || isSmallScreen()) return;
    return runThreeStage(host, { alpha: true, dprCap: 1.5 }, (THREE, pointer) => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.z = 8;
      const uniforms = {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2() },
        uAmp: { value: 0.3 },
        uColor: { value: new THREE.Color().setRGB(...BLUE) },
        uAlpha: { value: 1 },
      };
      const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT, transparent: true });
      const geometry = new THREE.IcosahedronGeometry(1, 32);
      const blob = new THREE.Mesh(geometry, material);
      scene.add(blob);

      const flip = mirror ? -1 : 1;
      const presetFor = (name: string) => {
        const p = PRESETS[name] ?? PRESETS.hero;
        return { x: p.x * flip, y: p.y, scale: p.scale, amp: p.amp, r: p.color[0], g: p.color[1], b: p.color[2], alpha: p.alpha, pull: p.pull };
      };
      let sceneName = "hero";
      let target = presetFor(sceneName);
      const state = { ...target };
      const mouse = new THREE.Vector2();
      const lean = new THREE.Vector2();
      let halfH = 1;
      let halfW = 1;
      let speedAmp = 0;

      // The [data-scene] section crossing the middle of the screen sets the pose.
      const still = prefersReducedMotion();
      const pickScene = () => {
        if (still) return;
        const mid = window.innerHeight / 2;
        const hit = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]")).find((el) => {
          const r = el.getBoundingClientRect();
          return r.top <= mid && r.bottom >= mid;
        });
        const name = hit?.dataset.scene;
        if (name && name !== sceneName && PRESETS[name]) {
          sceneName = name;
          target = presetFor(name);
        }
      };
      window.addEventListener("scroll", pickScene, { passive: true });
      pickScene();
      Object.assign(state, target);

      return {
        resize(w, h) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
          halfW = halfH * camera.aspect;
        },
        frame(t, dt, renderer) {
          const k = ease(dt, 2.6);
          for (const key of Object.keys(state) as (keyof typeof state)[]) state[key] += (target[key] - state[key]) * k;
          if (state.alpha < 0.01) {
            renderer.clear();
            return;
          }
          const cx = state.x * halfW;
          const cy = state.y * halfH;
          // Pointer in world units, or a slow drift on touch screens.
          const px = pointer.inside ? ((pointer.x / Math.max(window.innerWidth, 1)) * 2 - 1) * halfW : cx + Math.sin(t * 0.4) * 0.6;
          const py = pointer.inside ? -((pointer.y / Math.max(window.innerHeight, 1)) * 2 - 1) * halfH : cy + Math.cos(t * 0.3) * 0.4;
          lean.lerp(new THREE.Vector2((px - cx) * state.pull * 0.35, (py - cy) * state.pull * 0.35), ease(dt, 4));
          mouse.lerp(new THREE.Vector2(px / halfW, py / halfH), ease(dt, 3));
          speedAmp += (Math.min((pointer.moved / Math.max(dt, 0.001)) * 0.00025, 0.35) - speedAmp) * ease(dt, 4);
          pointer.moved = 0;
          uniforms.uTime.value = t;
          uniforms.uMouse.value.copy(mouse);
          uniforms.uAmp.value = state.amp + speedAmp;
          uniforms.uColor.value.setRGB(state.r, state.g, state.b);
          uniforms.uAlpha.value = state.alpha;
          blob.position.set(cx + lean.x, cy + lean.y + Math.sin(t * 0.8) * 0.06, 0);
          blob.scale.setScalar(state.scale * 1.6);
          blob.rotation.set(-mouse.y * 0.3, t * 0.15 + mouse.x * 0.4, 0);
          renderer.render(scene, camera);
        },
        dispose() {
          window.removeEventListener("scroll", pickScene);
          geometry.dispose();
          material.dispose();
        },
      };
    });
  }, [mirror]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 h-[100lvh] w-full opacity-0 max-md:hidden motion-reduce:absolute transition-opacity duration-[1500ms] data-[ready=true]:opacity-100 ${className}`}
    />
  );
}
