"use client";

import { useEffect, useRef } from "react";
import { ease, isSmallScreen, prefersReducedMotion, runThreeStage } from "./stage";

// Particles that change shape. Inside the element with id `watch`, hovering an
// item with data-shape="<service id>" morphs the cloud into that service's
// shape; otherwise the shapes cycle on their own. With motion turned off on
// the device the shape is drawn already formed and a hover swaps it at once.

type ShapeId = "web" | "mobile" | "ecommerce" | "software" | "design" | "seo";
const ORDER: ShapeId[] = ["web", "mobile", "ecommerce", "software", "design", "seo"];

const rand = (a: number) => (Math.random() - 0.5) * a;

function sphere(n: number) {
  const a = new Float32Array(n * 3);
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    a.set([Math.cos(i * g) * r * 2.4, y * 2.4, Math.sin(i * g) * r * 2.4], i * 3);
  }
  return a;
}

// A phone: rounded outline, a notch and a grid of app icons on the screen.
function phone(n: number) {
  const a = new Float32Array(n * 3);
  const W = 2.3, H = 4.4, R = 0.45;
  const outline = (u: number): [number, number] => {
    const sx = W - 2 * R, sy = H - 2 * R, arc = (Math.PI / 2) * R, per = 2 * sx + 2 * sy + 4 * arc;
    let d = u * per;
    const segs: [number, (d: number) => [number, number]][] = [
      [sx, (d) => [-sx / 2 + d, H / 2]],
      [arc, (d) => { const t = d / R; return [sx / 2 + Math.sin(t) * R, sy / 2 + Math.cos(t) * R]; }],
      [sy, (d) => [W / 2, sy / 2 - d]],
      [arc, (d) => { const t = d / R; return [sx / 2 + Math.cos(t) * R, -sy / 2 - Math.sin(t) * R]; }],
      [sx, (d) => [sx / 2 - d, -H / 2]],
      [arc, (d) => { const t = d / R; return [-sx / 2 - Math.sin(t) * R, -sy / 2 - Math.cos(t) * R]; }],
      [sy, (d) => [-W / 2, -sy / 2 + d]],
      [arc, (d) => { const t = d / R; return [-sx / 2 - Math.cos(t) * R, sy / 2 + Math.sin(t) * R]; }],
    ];
    for (const [len, f] of segs) {
      if (d <= len) return f(d);
      d -= len;
    }
    return [0, H / 2];
  };
  for (let i = 0; i < n; i++) {
    const k = i / n;
    let x: number, y: number;
    if (k < 0.5) {
      [x, y] = outline(Math.random());
      x += rand(0.06);
      y += rand(0.06);
    } else if (k < 0.55) {
      x = rand(0.7);
      y = H / 2 - 0.3 + rand(0.08);
    } else {
      const icon = Math.floor(Math.random() * 12), col = icon % 3, row = Math.floor(icon / 3);
      const s = 0.42, ex = Math.random() < 0.5;
      const t = Math.random() * s;
      const ix = -0.62 + col * 0.62, iy = 1.15 - row * 0.72;
      x = ix + (ex ? t - s / 2 : (Math.random() < 0.5 ? -s / 2 : s / 2));
      y = iy + (ex ? (Math.random() < 0.5 ? -s / 2 : s / 2) : t - s / 2);
    }
    a.set([x * 0.95, y * 0.95, rand(0.15)], i * 3);
  }
  return a;
}

// A shipping box: points on the faces, denser on the edges.
function cube(n: number) {
  const a = new Float32Array(n * 3);
  const s = 1.6;
  for (let i = 0; i < n; i++) {
    const p = [rand(2 * s), rand(2 * s), rand(2 * s)];
    const axis = Math.floor(Math.random() * 3);
    p[axis] = Math.random() < 0.5 ? -s : s;
    if (Math.random() < 0.45) {
      const other = (axis + 1 + Math.floor(Math.random() * 2)) % 3;
      p[other] = Math.random() < 0.5 ? -s : s;
    }
    a.set(p, i * 3);
  }
  return a;
}

function knot(n: number) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = (i / n) * Math.PI * 2, rr = Math.cos(3 * u) + 2.2;
    a.set([rr * Math.cos(2 * u) * 0.9 + rand(0.28), rr * Math.sin(2 * u) * 0.9 + rand(0.28), -Math.sin(3 * u) * 0.9 + rand(0.28)], i * 3);
  }
  return a;
}

function logo(n: number) {
  const c = document.createElement("canvas");
  const w = 420, h = 220;
  c.width = w;
  c.height = h;
  const x = c.getContext("2d", { willReadFrequently: true });
  const a = new Float32Array(n * 3);
  if (!x) return a;
  x.fillStyle = "#fff";
  x.textBaseline = "middle";
  x.font = `700 180px ${getComputedStyle(document.body).fontFamily || "sans-serif"}`;
  const mw = x.measureText("M").width, hw = x.measureText("H").width, gap = 34;
  const left = w / 2 - (mw + gap + hw) / 2;
  x.fillText("M", left, h / 2 + 6);
  x.fillText("H", left + mw + gap, h / 2 + 6);
  const data = x.getImageData(0, 0, w, h).data;
  const pts: [number, number][] = [];
  for (let yy = 0; yy < h; yy += 2) for (let xx = 0; xx < w; xx += 2) if (data[(yy * w + xx) * 4 + 3] > 128) pts.push([xx, yy]);
  for (let i = 0; i < n; i++) {
    const p = pts.length ? pts[Math.floor(Math.random() * pts.length)] : [w / 2, h / 2];
    a.set([((p[0] - w / 2) / w) * 6.4, (-(p[1] - h / 2) / w) * 6.4, rand(0.4)], i * 3);
  }
  return a;
}

function galaxy(n: number) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = Math.pow(Math.random(), 0.7) * 3.2;
    const ang = r * 1.7 + ((i % 3) * Math.PI * 2) / 3 + rand(0.6);
    a.set([Math.cos(ang) * r + rand(0.25), rand(0.35) * (1.2 - r / 3.2), Math.sin(ang) * r + rand(0.25)], i * 3);
  }
  return a;
}

const BUILDERS: Record<ShapeId, (n: number) => Float32Array> = { web: sphere, mobile: phone, ecommerce: cube, software: knot, design: logo, seo: galaxy };

export default function ParticleMorph({ watch, className = "" }: { watch?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const still = prefersReducedMotion();
    let hovered: ShapeId | null = null;
    let redraw = () => {};
    const list = watch ? document.getElementById(watch) : null;
    const onOver = (e: Event) => {
      const id = (e.target as Element | null)?.closest<HTMLElement>("[data-shape]")?.dataset.shape as ShapeId | undefined;
      const next = id && id in BUILDERS ? id : null;
      if (next === hovered) return;
      hovered = next;
      redraw();
    };
    const onLeave = () => {
      hovered = null;
      redraw();
    };
    list?.addEventListener("pointerover", onOver);
    list?.addEventListener("pointerleave", onLeave);
    list?.addEventListener("focusin", onOver);

    const stop = runThreeStage(host, { alpha: true, antialias: false }, (THREE, pointer, draw) => {
      redraw = draw;
      const COUNT = isSmallScreen() ? 3200 : 6500;
      const shapes = new Map<ShapeId, Float32Array>();
      const shapeOf = (id: ShapeId) => {
        let s = shapes.get(id);
        if (!s) {
          s = BUILDERS[id](COUNT);
          shapes.set(id, s);
        }
        return s;
      };
      const cur = new Float32Array(COUNT * 3);
      const rnd = new Float32Array(COUNT);
      const speed = new Float32Array(COUNT);
      for (let i = 0; i < COUNT; i++) {
        rnd[i] = Math.random();
        speed[i] = 1.8 + Math.random() * 2.6;
      }
      // Starts spread out and gathers into the first shape (already formed
      // when motion is off).
      cur.set(shapeOf("web"));
      if (!still) for (let i = 0; i < cur.length; i++) cur[i] *= 1.8;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.z = 9;
      const geometry = new THREE.BufferGeometry();
      const position = new THREE.BufferAttribute(cur, 3);
      position.setUsage(THREE.DynamicDrawUsage);
      geometry.setAttribute("position", position);
      geometry.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
      const uniforms = { uTime: { value: 0 }, uPix: { value: Math.min(window.devicePixelRatio || 1, 2) } };
      const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        vertexShader: `
          attribute float aRand; uniform float uTime; uniform float uPix; varying float vR;
          void main() {
            vec3 p = position;
            float w = sin(p.x * 2.1 + uTime * 1.3 + aRand * 6.28) * 0.035 + sin(p.y * 1.7 + uTime) * 0.035;
            p += normalize(p + vec3(0.0001)) * w;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = uPix * (1.7 + aRand * 1.9) * (9.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
            vR = aRand;
          }`,
        fragmentShader: `
          varying float vR;
          void main() {
            float r = length(gl_PointCoord - 0.5);
            if (r > 0.5) discard;
            vec3 col = mix(vec3(0.18, 0.23, 1.0), vec3(0.55, 0.64, 1.0), smoothstep(0.55, 1.0, vR));
            gl_FragColor = vec4(col, (1.0 - smoothstep(0.15, 0.5, r)) * 0.95);
          }`,
      });
      const group = new THREE.Group();
      group.add(new THREE.Points(geometry, material));
      scene.add(group);

      let auto = 0;
      let autoAt = 0;
      let shown: ShapeId = "web";
      let tiltX = 0;
      let tiltY = 0;
      return {
        resize(w, h) {
          camera.aspect = w / h;
          camera.position.z = camera.aspect < 0.9 ? 11 : 9;
          camera.updateProjectionMatrix();
        },
        frame(t, dt, renderer) {
          if (!still && !hovered && t - autoAt > 4.5) {
            auto = (auto + 1) % ORDER.length;
            autoAt = t;
          }
          if (hovered) autoAt = t;
          shown = hovered ?? ORDER[auto];
          const target = shapeOf(shown);
          for (let i = 0; i < COUNT; i++) {
            const k = still ? 1 : ease(dt, speed[i]);
            const j = i * 3;
            cur[j] += (target[j] - cur[j]) * k;
            cur[j + 1] += (target[j + 1] - cur[j + 1]) * k;
            cur[j + 2] += (target[j + 2] - cur[j + 2]) * k;
          }
          position.needsUpdate = true;
          uniforms.uTime.value = t;
          const flat = shown === "design" || shown === "mobile";
          const mx = pointer.inside && !still ? pointer.x / Math.max(host.clientWidth, 1) - 0.5 : 0;
          const my = pointer.inside && !still ? pointer.y / Math.max(host.clientHeight, 1) - 0.5 : 0;
          const tilt = still ? 1 : ease(dt, 3);
          // Still: 3D shapes are shown at an angle so their depth reads.
          const baseX = shown === "seo" ? 0.55 : still && !flat ? 0.3 : 0;
          tiltX += (baseX + my * 0.5 - tiltX) * tilt;
          tiltY += (mx * 0.8 - tiltY) * tilt;
          group.rotation.x = tiltX;
          group.rotation.y = still ? (flat ? 0 : 0.6) : (flat ? Math.sin(t * 0.6) * 0.3 : t * 0.2) + tiltY;
          renderer.render(scene, camera);
        },
        dispose() {
          geometry.dispose();
          material.dispose();
        },
      };
    });

    return () => {
      stop();
      list?.removeEventListener("pointerover", onOver);
      list?.removeEventListener("pointerleave", onLeave);
      list?.removeEventListener("focusin", onOver);
    };
  }, [watch]);

  return <div ref={ref} aria-hidden="true" className={`relative ${className}`} />;
}
