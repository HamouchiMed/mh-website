"use client";

import { useEffect, useRef } from "react";

// A raymarched cluster of glossy metaballs that follows the pointer. Plain
// WebGL with a single fragment shader keeps the bundle tiny (no three.js),
// which matters for Core Web Vitals and therefore SEO.

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
uniform float uScroll;

const vec3 ACCENT = vec3(0.18, 0.23, 1.0);

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float map(vec3 p) {
  vec3 q = p;
  q.xy -= uCenter;
  q.y += uScroll * 1.6;
  float t = uTime;
  float d = 1e5;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec3 c = vec3(
      sin(t * 0.31 * (1.0 + fi * 0.13) + fi * 1.7) * 1.25,
      cos(t * 0.27 * (1.0 + fi * 0.11) + fi * 2.3) * 0.85,
      sin(t * 0.21 + fi * 0.9) * 0.7
    ) * uScale;
    float r = (0.42 + 0.16 * sin(fi * 2.1)) * uScale;
    d = smin(d, length(q - c) - r, 0.55 * uScale);
  }
  // uMouse is already in world space, tethered to the cluster by the JS side.
  d = smin(d, length(p - vec3(uMouse.x, uMouse.y - uScroll * 1.6, 0.5)) - 0.46 * uScale, 0.75 * uScale);
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
  col += ACCENT * 1.4 * smoothstep(0.55, 1.0, dot(r, normalize(vec3(0.9, -0.15, 0.3))));
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
    // Faint accent halo around the blobs (premultiplied alpha).
    float a = (1.0 - smoothstep(0.0, 0.35, minD)) * 0.14;
    gl_FragColor = vec4(ACCENT * a, a);
    return;
  }

  vec3 p = ro + rd * t;
  vec3 n = calcNormal(p);
  vec3 r = reflect(rd, n);
  vec3 L = normalize(vec3(-0.5, 0.8, 0.6));
  float fre = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
  float dif = clamp(dot(n, L), 0.0, 1.0);
  vec3 irid = 0.5 + 0.5 * cos(6.2831 * (fre * 0.9 + n.y * 0.15 + vec3(0.0, 0.33, 0.67)) + uTime * 0.25);

  vec3 col = ACCENT * (0.18 + 0.82 * dif);
  col = mix(col, env(r), 0.28 + 0.72 * fre);
  col += irid * fre * 0.35;
  col += pow(max(dot(r, L), 0.0), 80.0) * 1.4;
  col = col / (1.0 + col * 0.25);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function HeroCanvas({ className = "" }: { className?: string }) {
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
    const uRes = u("uRes"), uTime = u("uTime"), uMouse = u("uMouse");
    const uCenter = u("uCenter"), uScale = u("uScale"), uScroll = u("uScroll");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    // World units per unit of screen-space y at the depth of the pointer blob
    // (camera at z=5, focal length 2.2, blob at z=0.5).
    const WORLD = 4.5 / 2.2;
    const center = { x: 0, y: 0 };
    let blobScale = 1;
    const target = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };
    let aspect = 1;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      // Render below device resolution: the soft, glossy look hides it and it
      // keeps the fragment shader cheap on laptops and phones.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = width < 768 ? dpr * 0.55 : dpr >= 2 ? 1.1 : 0.85;
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      aspect = width / Math.max(height, 1);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      // Desktop: cluster sits to the right of the headline. Mobile: top centre.
      if (aspect > 1.1) {
        center.x = aspect * WORLD * 0.52;
        center.y = 0.3;
        blobScale = 1;
      } else {
        center.x = 0;
        center.y = 1.05;
        blobScale = Math.min(1, Math.max(0.55, aspect * 1.05));
      }
      gl.uniform2f(uCenter, center.x, center.y);
      gl.uniform1f(uScale, blobScale);
      target.x = mouse.x = center.x;
      target.y = mouse.y = center.y;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // The pointer blob leans towards the cursor but stays tethered to the
    // cluster so it never covers the headline.
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (((e.clientX - rect.left) / rect.width) * 2 - 1) * aspect * WORLD;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1) * WORLD;
      target.x = center.x + (x - center.x) * 0.5;
      target.y = center.y + (y - center.y) * 0.5;
    };
    if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) loop();
    });
    io.observe(canvas);

    let raf = 0;
    const start = performance.now();
    const draw = (time: number) => {
      if (!finePointer) {
        target.x = center.x + Math.sin(time * 0.4) * 0.9 * blobScale;
        target.y = center.y + Math.cos(time * 0.3) * 0.6 * blobScale;
      }
      mouse.x += (target.x - mouse.x) * 0.06;
      mouse.y += (target.y - mouse.y) * 0.06;
      const rect = canvas.getBoundingClientRect();
      const scroll = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = () => {
      cancelAnimationFrame(raf);
      const tick = () => {
        if (!visible || document.hidden) return;
        draw((performance.now() - start) / 1000);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const onVisibility = () => !document.hidden && visible && loop();
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
      className={`opacity-0 transition-opacity duration-[1500ms] data-[ready=true]:opacity-100 ${className}`}
    />
  );
}
