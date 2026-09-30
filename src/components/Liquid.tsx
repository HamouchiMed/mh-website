"use client";

import { useEffect } from "react";

// Liquid hover for images: one shared WebGL canvas moves into whichever
// `[data-liquid]` element the pointer enters and redraws its <img> with a
// ripple + RGB split that follows the cursor. A single context for the whole
// page keeps it cheap; the plain <img> stays underneath for everyone else
// (touch, reduced motion, no WebGL).

const VERT = `
attribute vec2 p;
varying vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uStrength;
uniform float uTime;
uniform vec2 uCover;
uniform float uAspect;

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 d = (uv - uMouse) * vec2(uAspect, 1.0);
  float dist = length(d);
  float fall = smoothstep(0.55, 0.0, dist);
  vec2 dir = d / max(dist, 1e-4);
  float wave = sin(dist * 26.0 - uTime * 6.0) * 0.014 * fall;
  vec2 st = (uv - 0.5) * (1.0 - 0.05 * uStrength) + 0.5;
  st += (dir * wave - uVel * fall * 0.4) * uStrength;
  vec2 tuv = (st - 0.5) * uCover + 0.5;
  float ca = (length(uVel) * 0.5 + 0.004) * fall * uStrength;
  vec3 col;
  col.r = texture2D(uTex, tuv + dir * ca).r;
  col.g = texture2D(uTex, tuv).g;
  col.b = texture2D(uTex, tuv - dir * ca).b;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Liquid() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .35s;z-index:1;border-radius:inherit";
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
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
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uMouse = u("uMouse"), uVel = u("uVel"), uStrength = u("uStrength"), uTime = u("uTime"), uCover = u("uCover"), uAspect = u("uAspect");

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    for (const [k, v] of [
      [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
      [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
      [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
    ])
      gl.texParameteri(gl.TEXTURE_2D, k, v);

    let host: HTMLElement | null = null;
    let img: HTMLImageElement | null = null;
    let ready = false;
    let hovering = false;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const vel = { x: 0, y: 0 };
    let strength = 0;
    let raf = 0;
    const start = performance.now();

    const fit = () => {
      if (!host || !img) return;
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      // Emulate object-fit: cover.
      const boxAspect = r.width / r.height;
      const imgAspect = (img.naturalWidth || 4) / (img.naturalHeight || 3);
      const cover = boxAspect > imgAspect ? [1, imgAspect / boxAspect] : [boxAspect / imgAspect, 1];
      gl.uniform2f(uCover, cover[0], cover[1]);
      gl.uniform1f(uAspect, boxAspect);
    };

    const tick = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.15;
      mouse.y += (mouse.ty - mouse.y) * 0.15;
      vel.x += ((mouse.tx - mouse.x) - vel.x) * 0.2;
      vel.y += ((mouse.ty - mouse.y) - vel.y) * 0.2;
      strength += ((hovering ? 1 : 0) - strength) * 0.08;
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform2f(uVel, vel.x, vel.y);
      gl.uniform1f(uStrength, strength);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!hovering && strength < 0.01) {
        canvas.style.opacity = "0";
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const enter = (el: HTMLElement, e: PointerEvent) => {
      const image = el.querySelector("img");
      if (!image) return;
      const src = image.currentSrc || image.src;
      if (host !== el) {
        host = el;
        img = image;
        ready = false;
        canvas.style.opacity = "0";
        el.appendChild(canvas);
        const texImg = new Image();
        texImg.decoding = "async";
        texImg.onload = () => {
          if (host !== el) return;
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texImg);
          ready = true;
          fit();
          canvas.style.opacity = "1";
        };
        texImg.src = src;
      } else if (ready) {
        fit();
        canvas.style.opacity = "1";
      }
      const r = el.getBoundingClientRect();
      mouse.tx = mouse.x = (e.clientX - r.left) / r.width;
      mouse.ty = mouse.y = (e.clientY - r.top) / r.height;
      hovering = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-liquid]");
      if (el && !(hovering && el === host)) enter(el, e);
    };
    const onMove = (e: PointerEvent) => {
      if (!host || !hovering) return;
      const r = host.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = (e.clientY - r.top) / r.height;
      if (mouse.tx < 0 || mouse.tx > 1 || mouse.ty < 0 || mouse.ty > 1) hovering = false;
    };
    const onOut = (e: PointerEvent) => {
      if (!host) return;
      const to = e.relatedTarget as Node | null;
      if (!to || !host.contains(to)) hovering = false;
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("resize", fit);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("resize", fit);
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return null;
}
