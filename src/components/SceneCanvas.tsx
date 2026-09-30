"use client";

import { useEffect, useRef } from "react";

// A slowly moving cluster of glossy blobs, drawn by a single WebGL fragment
// shader (no three.js, so the bundle stays tiny). It fills its parent, leans a
// little towards the pointer, pauses off-screen and is static for visitors who
// prefer reduced motion.

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

export default function SceneCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true });
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
    const uRes = u("uRes"), uTime = u("uTime"), uMouse = u("uMouse");
    gl.uniform2f(u("uCenter"), 0, 0);
    gl.uniform1f(u("uSpread"), 0.8);
    gl.uniform3f(u("uColor"), 0.18, 0.23, 1.0);
    gl.uniform1f(u("uAlpha"), 1);
    const uScale = u("uScale");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const WORLD = 4.5 / 2.2;
    let aspect = 1;
    const cursor = { x: 0, y: 0, active: false };
    const blob = { x: 0, y: 0 };

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr * 0.75));
      canvas.height = Math.max(1, Math.round(height * dpr * 0.75));
      gl.viewport(0, 0, canvas.width, canvas.height);
      aspect = width / Math.max(height, 1);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uScale, Math.min(0.72, aspect * 0.62));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursor.x = (((e.clientX - rect.left) / rect.width) * 2 - 1) * aspect * WORLD;
      cursor.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1) * WORLD;
      cursor.active = true;
    };
    if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let last = 0;
    const start = performance.now();
    const draw = (time: number) => {
      const dt = Math.min(Math.max(time - last, 0), 0.1);
      last = time;
      const tx = cursor.active ? cursor.x * 0.25 : Math.sin(time * 0.4) * 0.5;
      const ty = cursor.active ? cursor.y * 0.25 : Math.cos(time * 0.3) * 0.35;
      const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 3);
      blob.x += (tx - blob.x) * k;
      blob.y += (ty - blob.y) * k;
      gl.uniform1f(uTime, time * 0.8);
      gl.uniform2f(uMouse, blob.x, blob.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let visible = true;
    const loop = () => {
      cancelAnimationFrame(raf);
      const tick = () => {
        if (!visible || document.hidden) return;
        draw((performance.now() - start) / 1000);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduceMotion) loop();
    });
    io.observe(canvas);
    const onVisibility = () => !document.hidden && visible && !reduceMotion && loop();
    document.addEventListener("visibilitychange", onVisibility);

    if (reduceMotion) draw(4);
    else loop();
    canvas.dataset.ready = "true";

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000 data-[ready=true]:opacity-100 ${className}`}
    />
  );
}
