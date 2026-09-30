"use client";

import { useEffect, useRef } from "react";

// Interactive experiments for the /lab page. Each one only animates while it
// is on screen, and accepts mouse and touch input.

type Kind = "liquid" | "particles" | "glass";

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const LIQUID_FRAG = `
precision highp float;
uniform vec2 uRes;
uniform vec3 uPts[20];
void main() {
  float m = min(uRes.x, uRes.y);
  vec2 p = gl_FragCoord.xy / m;
  float f = 0.0;
  vec2 grad = vec2(0.0);
  for (int i = 0; i < 20; i++) {
    vec2 d = p - uPts[i].xy;
    float r2 = uPts[i].z * uPts[i].z;
    float dd = dot(d, d) + 1e-4;
    f += r2 / dd;
    grad += -2.0 * r2 * d / (dd * dd);
  }
  float edge = smoothstep(0.92, 1.08, f);
  vec3 n = normalize(vec3(-grad * 0.035, 1.0));
  vec3 L = normalize(vec3(-0.5, 0.6, 0.8));
  float dif = clamp(dot(n, L), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 40.0);
  float fre = pow(1.0 - n.z, 2.0);
  vec3 base = mix(vec3(0.1, 0.13, 0.75), vec3(0.55, 0.62, 1.0), dif);
  vec3 col = base + fre * vec3(1.0, 0.55, 0.35) * 0.6 + spec * 1.2;
  gl_FragColor = vec4(col * edge, edge);
}
`;

const GLASS_FRAG = `
precision highp float;
uniform vec2 uRes;
uniform vec2 uPos;
uniform float uTime;

vec3 bg(vec2 q) {
  float s = sin((q.x * 0.8 + q.y) * 7.0 + uTime * 0.7);
  float stripes = smoothstep(-0.08, 0.08, s);
  vec3 a = vec3(0.06, 0.06, 0.09);
  vec3 b = vec3(0.18, 0.23, 1.0);
  vec3 col = mix(a, b, stripes);
  float dots = smoothstep(0.08, 0.0, length(fract(q * 3.0) - 0.5));
  return col + dots * vec3(1.0, 0.5, 0.3) * 0.5;
}

float hitSphere(vec3 ro, vec3 rd, vec3 c, float r, float sgn) {
  vec3 oc = ro - c;
  float b = dot(oc, rd);
  float h = b * b - dot(oc, oc) + r * r;
  if (h < 0.0) return -1.0;
  return -b + sgn * sqrt(h);
}

// Lens-like glass: one refraction at the surface, then straight to the
// background plane. A slightly different index per channel gives dispersion.
float channel(vec3 p, vec3 rd, vec3 n, float eta, int ch) {
  vec3 rin = refract(rd, n, 1.0 / eta);
  float tp = (-1.6 - p.z) / min(rin.z, -0.05);
  vec3 col = bg(p.xy + rin.xy * tp);
  return ch == 0 ? col.r : ch == 1 ? col.g : col.b;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = normalize(vec3(uv, -1.8));
  vec3 c = vec3(uPos, 0.0);
  float r = 0.72;
  float t = hitSphere(ro, rd, c, r, -1.0);
  vec3 col;
  if (t > 0.0) {
    vec3 p = ro + rd * t;
    vec3 n = normalize(p - c);
    col.r = channel(p, rd, n, 1.16, 0);
    col.g = channel(p, rd, n, 1.2, 1);
    col.b = channel(p, rd, n, 1.24, 2);
    float fre = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);
    vec3 refl = reflect(rd, n);
    float spec = pow(max(dot(refl, normalize(vec3(-0.5, 0.7, 0.5))), 0.0), 60.0);
    col = mix(col, vec3(0.9, 0.92, 1.0), fre * 0.5) + spec * 1.5;
  } else {
    float tp = (-1.6 - ro.z) / rd.z;
    col = bg(ro.xy + rd.xy * tp) * 0.75;
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

function setupGl(canvas: HTMLCanvasElement, frag: string) {
  const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: true, alpha: true });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return { gl, u: (n: string) => gl.getUniformLocation(prog, n) };
}

export default function LabExperiment({ kind, label }: { kind: Kind; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.5, active: false, down: false };
    let width = 1;
    let height = 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / r.width;
      pointer.y = (e.clientY - r.top) / r.height;
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);
    const onDown = (e: PointerEvent) => {
      onMove(e);
      pointer.down = true;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);

    let render: (time: number) => void = () => {};
    let resize = () => {};

    if (kind === "liquid") {
      const ctx = setupGl(canvas, LIQUID_FRAG);
      if (!ctx) return;
      const { gl, u } = ctx;
      const uRes = u("uRes"), uPts = u("uPts[0]");
      const N = 20;
      const pts = Array.from({ length: N }, () => ({ x: 0.5, y: 0.5 }));
      const data = new Float32Array(N * 3);
      resize = () => {
        const r = canvas.getBoundingClientRect();
        width = r.width;
        height = r.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, canvas.width, canvas.height);
      };
      render = (time) => {
        const m = Math.min(width, height);
        let tx: number, ty: number;
        if (pointer.active) {
          tx = (pointer.x * width) / m;
          ty = ((1 - pointer.y) * height) / m;
        } else {
          tx = (width / m) * (0.5 + Math.sin(time * 0.7) * 0.32);
          ty = (height / m) * (0.5 + Math.sin(time * 1.1) * 0.28);
        }
        pts[0].x += (tx - pts[0].x) * 0.2;
        pts[0].y += (ty - pts[0].y) * 0.2;
        for (let i = 1; i < N; i++) {
          pts[i].x += (pts[i - 1].x - pts[i].x) * 0.35;
          pts[i].y += (pts[i - 1].y - pts[i].y) * 0.35;
        }
        for (let i = 0; i < N; i++) {
          data[i * 3] = pts[i].x;
          data[i * 3 + 1] = pts[i].y;
          data[i * 3 + 2] = 0.042 * (1 - i / N) + 0.008 + Math.sin(time * 2 + i) * 0.003;
        }
        gl.uniform3fv(uPts, data);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
    }

    if (kind === "glass") {
      const ctx = setupGl(canvas, GLASS_FRAG);
      if (!ctx) return;
      const { gl, u } = ctx;
      const uRes = u("uRes"), uPos = u("uPos"), uTime = u("uTime");
      const pos = { x: 0, y: 0 };
      resize = () => {
        const r = canvas.getBoundingClientRect();
        width = r.width;
        height = r.height;
        canvas.width = Math.round(width * dpr * 0.75);
        canvas.height = Math.round(height * dpr * 0.75);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, canvas.width, canvas.height);
      };
      render = (time) => {
        const aspect = width / height;
        const tx = pointer.active ? (pointer.x * 2 - 1) * aspect * 1.2 : Math.sin(time * 0.5) * aspect * 0.7;
        const ty = pointer.active ? -(pointer.y * 2 - 1) * 1.2 : Math.cos(time * 0.4) * 0.35;
        pos.x += (tx - pos.x) * 0.08;
        pos.y += (ty - pos.y) * 0.08;
        gl.uniform2f(uPos, pos.x, pos.y);
        gl.uniform1f(uTime, time);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
    }

    if (kind === "particles") {
      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) return;
      type P = { x: number; y: number; hx: number; hy: number; vx: number; vy: number };
      let particles: P[] = [];
      resize = () => {
        const r = canvas.getBoundingClientRect();
        width = r.width;
        height = r.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Sample the logo into target positions.
        const off = document.createElement("canvas");
        off.width = Math.round(width);
        off.height = Math.round(height);
        const o = off.getContext("2d")!;
        o.fillStyle = "#fff";
        o.textAlign = "center";
        o.textBaseline = "middle";
        o.font = `700 ${Math.min(height * 0.62, width * 0.34)}px ui-sans-serif, system-ui, sans-serif`;
        o.fillText("MH", width / 2, height / 2);
        const img = o.getImageData(0, 0, off.width, off.height).data;
        const step = Math.max(4, Math.round(Math.sqrt((width * height) / 9000)));
        const next: P[] = [];
        for (let y = 0; y < off.height; y += step)
          for (let x = 0; x < off.width; x += step)
            if (img[(y * off.width + x) * 4 + 3] > 128) {
              const prev = particles[next.length];
              next.push({ x: prev?.x ?? Math.random() * width, y: prev?.y ?? Math.random() * height, hx: x, hy: y, vx: 0, vy: 0 });
            }
        particles = next;
      };
      render = () => {
        const px = pointer.x * width;
        const py = pointer.y * height;
        if (pointer.down) {
          for (const p of particles) {
            const a = Math.atan2(p.y - py, p.x - px);
            const f = 18 + Math.random() * 18;
            p.vx += Math.cos(a) * f;
            p.vy += Math.sin(a) * f;
          }
          pointer.down = false;
        }
        ctx2d.clearRect(0, 0, width, height);
        for (const p of particles) {
          if (pointer.active) {
            const dx = p.x - px;
            const dy = p.y - py;
            const d2 = dx * dx + dy * dy;
            if (d2 < 9000) {
              const f = (9000 - d2) / 9000;
              p.vx += dx * f * 0.08;
              p.vy += dy * f * 0.08;
            }
          }
          p.vx += (p.hx - p.x) * 0.045;
          p.vy += (p.hy - p.y) * 0.045;
          p.vx *= 0.84;
          p.vy *= 0.84;
          p.x += p.vx;
          p.y += p.vy;
          const speed = Math.min(1, Math.hypot(p.vx, p.vy) / 8);
          ctx2d.fillStyle = speed > 0.15 ? `rgb(${46 + speed * 209}, ${59 + speed * 63}, ${255 - speed * 186})` : "#8fa2ff";
          ctx2d.fillRect(p.x, p.y, 2.6, 2.6);
        }
      };
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let visible = false;
    const start = performance.now();
    const loop = () => {
      render((performance.now() - start) / 1000);
      if (visible && !reduced) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    if (reduced) {
      // One settled frame so the experiment is still visible.
      for (let i = 0; i < 120; i++) render(2 + i / 60);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [kind]);

  return <canvas ref={ref} role="img" aria-label={label} className="absolute inset-0 h-full w-full touch-pan-y" />;
}
