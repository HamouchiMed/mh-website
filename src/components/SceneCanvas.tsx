"use client";

import { useEffect, useRef } from "react";

// A raymarched cluster of glossy metaballs. Plain WebGL with a single fragment
// shader keeps the bundle tiny (no three.js), which matters for Core Web Vitals.
//
// mode "scroll": fixed behind the whole page. Each section can carry
//   data-scene="…" and the cluster glides to that section's preset (position,
//   size, how far the blobs split apart, colour, opacity) as you scroll.
// mode "playful": fills its parent; the pointer blob follows the cursor freely.

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uCenter;
uniform float uScale;
uniform float uSpread;
uniform vec3 uColor;
uniform float uAlpha;

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float map(vec3 p) {
  vec3 q = p;
  q.xy -= uCenter;
  float t = uTime;
  float d = 1e5;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec3 c = vec3(
      sin(t * 0.31 * (1.0 + fi * 0.13) + fi * 1.7) * 1.25,
      cos(t * 0.27 * (1.0 + fi * 0.11) + fi * 2.3) * 0.85,
      sin(t * 0.21 + fi * 0.9) * 0.7
    ) * uScale * uSpread;
    float r = (0.42 + 0.16 * sin(fi * 2.1)) * uScale;
    d = smin(d, length(q - c) - r, 0.55 * uScale);
  }
  d = smin(d, length(p - vec3(uMouse, 0.5)) - 0.46 * uScale, 0.75 * uScale);
  return d;
}

vec3 calcNormal(vec3 p) {
  const vec2 k = vec2(1.0, -1.0);
  const float e = 0.0015;
  return normalize(
    k.xyy * map(p + k.xyy * e) + k.yyx * map(p + k.yyx * e) +
    k.yxy * map(p + k.yxy * e) + k.xxx * map(p + k.xxx * e)
  );
}

vec3 env(vec3 r) {
  float y = r.y * 0.5 + 0.5;
  vec3 col = mix(vec3(0.03, 0.04, 0.16), vec3(0.93, 0.94, 0.97), smoothstep(0.15, 0.85, y));
  col += vec3(1.0) * smoothstep(0.82, 1.0, dot(r, normalize(vec3(-0.6, 0.7, 0.4)))) * 1.6;
  col += uColor * 1.4 * smoothstep(0.55, 1.0, dot(r, normalize(vec3(0.9, -0.15, 0.3))));
  col += vec3(1.0, 0.45, 0.25) * 0.5 * smoothstep(0.7, 1.0, dot(r, normalize(vec3(-0.8, -0.4, 0.3))));
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  vec3 ro = vec3(0.0, 0.0, 5.0);
  vec3 rd = normalize(vec3(uv, -2.2));

  float t = 0.0;
  float minD = 1e5;
  bool hit = false;
  for (int i = 0; i < 72; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    minD = min(minD, d);
    if (d < 0.0015) { hit = true; break; }
    t += d;
    if (t > 9.0) break;
  }

  if (!hit) {
    // Faint halo around the blobs (premultiplied alpha).
    float a = (1.0 - smoothstep(0.0, 0.35, minD)) * 0.14 * uAlpha;
    gl_FragColor = vec4(uColor * a, a);
    return;
  }

  vec3 p = ro + rd * t;
  vec3 n = calcNormal(p);
  vec3 r = reflect(rd, n);
  vec3 L = normalize(vec3(-0.5, 0.8, 0.6));
  float fre = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
  float dif = clamp(dot(n, L), 0.0, 1.0);
  vec3 irid = 0.5 + 0.5 * cos(6.2831 * (fre * 0.9 + n.y * 0.15 + vec3(0.0, 0.33, 0.67)) + uTime * 0.25);

  vec3 col = uColor * (0.18 + 0.82 * dif);
  col = mix(col, env(r), 0.28 + 0.72 * fre);
  col += irid * fre * 0.35;
  col += pow(max(dot(r, L), 0.0), 80.0) * 1.4;
  col = col / (1.0 + col * 0.25);

  gl_FragColor = vec4(col * uAlpha, uAlpha);
}
`;

type Preset = {
  x: number;
  y: number;
  scale: number;
  spread: number;
  color: [number, number, number];
  alpha: number;
  // How strongly the pointer blob leans towards the cursor (lower over text).
  pull: number;
};

const BLUE: Preset["color"] = [0.18, 0.23, 1.0];
const ORANGE: Preset["color"] = [1.0, 0.4, 0.18];
const CHROME: Preset["color"] = [0.82, 0.85, 0.95];

// x / y are fractions of the half-width / half-height of the screen. Over
// text-heavy sections the cluster shrinks and moves to an edge.
const PRESETS: Record<string, { desktop: Preset; mobile: Preset }> = {
  hero: {
    desktop: { x: 0.52, y: 0.15, scale: 1, spread: 1, color: BLUE, alpha: 1, pull: 0.5 },
    mobile: { x: 0, y: 0.5, scale: 0.6, spread: 1, color: BLUE, alpha: 1, pull: 0.5 },
  },
  intro: {
    desktop: { x: -0.84, y: 0.55, scale: 0.4, spread: 1.7, color: BLUE, alpha: 0.95, pull: 0.25 },
    mobile: { x: 0.6, y: 0.82, scale: 0.26, spread: 1.6, color: BLUE, alpha: 0.8, pull: 0.2 },
  },
  services: {
    desktop: { x: 0.9, y: 0.62, scale: 0.3, spread: 1.6, color: BLUE, alpha: 0.9, pull: 0.12 },
    mobile: { x: 0.72, y: 0.86, scale: 0.22, spread: 1.6, color: BLUE, alpha: 0.6, pull: 0.1 },
  },
  work: {
    desktop: { x: 0.72, y: 0.66, scale: 0.46, spread: 1.1, color: ORANGE, alpha: 1, pull: 0.2 },
    mobile: { x: 0.5, y: 0.84, scale: 0.28, spread: 1.1, color: ORANGE, alpha: 0.9, pull: 0.2 },
  },
  process: {
    desktop: { x: -0.7, y: -0.45, scale: 0.62, spread: 1.4, color: CHROME, alpha: 1, pull: 0.35 },
    mobile: { x: -0.4, y: -0.82, scale: 0.32, spread: 1.4, color: CHROME, alpha: 0.9, pull: 0.3 },
  },
  why: {
    desktop: { x: 0.86, y: 0.62, scale: 0.34, spread: 1.5, color: BLUE, alpha: 0.85, pull: 0.2 },
    mobile: { x: 0.62, y: 0.86, scale: 0.22, spread: 1.5, color: BLUE, alpha: 0.7, pull: 0.2 },
  },
  blog: {
    desktop: { x: -0.88, y: 0.64, scale: 0.32, spread: 1.2, color: ORANGE, alpha: 0.8, pull: 0.15 },
    mobile: { x: -0.62, y: 0.86, scale: 0.22, spread: 1.2, color: ORANGE, alpha: 0.6, pull: 0.15 },
  },
  cta: {
    desktop: { x: 0.74, y: -0.05, scale: 0.62, spread: 0.3, color: BLUE, alpha: 1, pull: 0.45 },
    mobile: { x: 0.45, y: 0.3, scale: 0.4, spread: 0.3, color: BLUE, alpha: 1, pull: 0.4 },
  },
};

export default function SceneCanvas({
  mode = "scroll",
  mirror = false,
  className = "",
}: {
  mode?: "scroll" | "playful";
  mirror?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uRes = u("uRes"), uTime = u("uTime"), uMouse = u("uMouse"), uCenter = u("uCenter");
    const uScale = u("uScale"), uSpread = u("uSpread"), uColor = u("uColor"), uAlpha = u("uAlpha");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    // World units per unit of screen-space y at the depth of the pointer blob
    // (camera at z=5, focal length 2.2, blob at z=0.5).
    const WORLD = 4.5 / 2.2;
    let aspect = 1;
    let mobile = false;
    const flip = mirror ? -1 : 1;

    const toState = (p: Preset) => ({
      x: p.x * flip,
      y: p.y,
      scale: p.scale,
      spread: p.spread,
      r: p.color[0],
      g: p.color[1],
      b: p.color[2],
      alpha: p.alpha,
      pull: p.pull,
    });
    const presetFor = (name: string) => {
      const set = PRESETS[name] ?? PRESETS.hero;
      return toState(mobile ? set.mobile : set.desktop);
    };
    let sceneName = "hero";
    let target = presetFor(sceneName);
    const state = { ...target };
    const cursor = { x: 0, y: 0, active: false };
    const blob = { x: 0, y: 0 };

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mobile = width < 768;
      const scale = mobile ? dpr * 0.5 : dpr >= 2 ? 1 : 0.8;
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      aspect = width / Math.max(height, 1);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      target = presetFor(sceneName);
    };
    resize();
    Object.assign(state, target);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursor.x = (((e.clientX - rect.left) / rect.width) * 2 - 1) * aspect * WORLD;
      cursor.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1) * WORLD;
      cursor.active = true;
    };
    if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });

    // Pick the preset of the [data-scene] section crossing the middle of the screen.
    const pickScene = () => {
      if (mode !== "scroll") return;
      const mid = window.innerHeight / 2;
      const hit = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]")).find((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= mid && r.bottom >= mid;
      });
      const name = hit?.dataset.scene;
      if (name && name !== sceneName && PRESETS[name]) {
        sceneName = name;
        target = presetFor(name);
        if (reduceMotion) {
          Object.assign(state, target);
          draw(4);
        }
      }
    };
    const onScroll = () => pickScene();
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    const start = performance.now();
    let lastTime = 0;
    const draw = (time: number) => {
      // Time-based easing: the same glide on 30 Hz and 120 Hz screens.
      const dt = Math.min(Math.max(time - lastTime, 0), 0.1);
      lastTime = time;
      const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 2.8);
      for (const key of Object.keys(state) as (keyof typeof state)[]) state[key] += (target[key] - state[key]) * k;
      const cx = state.x * aspect * WORLD;
      const cy = state.y * WORLD;
      // The pointer blob leans towards the cursor; in "playful" mode it follows it.
      const pull = mode === "playful" ? 1 : state.pull;
      let tx = cx, ty = cy;
      if (cursor.active) {
        tx = cx + (cursor.x - cx) * pull;
        ty = cy + (cursor.y - cy) * pull;
      } else if (!finePointer) {
        tx = cx + Math.sin(time * 0.4) * 0.9 * state.scale;
        ty = cy + Math.cos(time * 0.3) * 0.6 * state.scale;
      }
      const kb = reduceMotion ? 1 : 1 - Math.exp(-dt * 5);
      blob.x += (tx - blob.x) * kb;
      blob.y += (ty - blob.y) * kb;
      gl.uniform1f(uTime, time);
      gl.uniform2f(uCenter, cx, cy);
      gl.uniform2f(uMouse, blob.x, blob.y);
      gl.uniform1f(uScale, state.scale);
      gl.uniform1f(uSpread, state.spread);
      gl.uniform3f(uColor, state.r, state.g, state.b);
      gl.uniform1f(uAlpha, state.alpha);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduceMotion) loop();
    });
    io.observe(canvas);

    const loop = () => {
      cancelAnimationFrame(raf);
      const tick = () => {
        if (!visible || document.hidden) return;
        draw((performance.now() - start) / 1000);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const onVisibility = () => !document.hidden && visible && !reduceMotion && loop();
    document.addEventListener("visibilitychange", onVisibility);

    pickScene();
    Object.assign(state, target);
    blob.x = state.x * aspect * WORLD;
    blob.y = state.y * WORLD;
    if (reduceMotion) draw(4);
    else loop();
    canvas.dataset.ready = "true";

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [mode, mirror]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none opacity-0 transition-opacity duration-[1500ms] data-[ready=true]:opacity-100 ${
        mode === "scroll" ? "fixed inset-0 -z-10 h-[100lvh] w-full" : "absolute inset-0 h-full w-full"
      } ${className}`}
    />
  );
}
