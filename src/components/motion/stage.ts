import type * as ThreeNS from "three";

export type Three = typeof ThreeNS;

// Pointer position relative to the stage; tracked on the window so it works
// even when the canvas sits behind the page content.
export type Pointer = { x: number; y: number; inside: boolean; down: boolean; moved: number };

export type Scene3 = {
  resize(w: number, h: number): void;
  frame(t: number, dt: number, renderer: ThreeNS.WebGLRenderer): void;
  down?(x: number, y: number): void;
  up?(): void;
  dispose?(): void;
};

type Options = {
  // Transparent canvas over the page (true) or an opaque clear colour.
  alpha?: boolean;
  clear?: number;
  antialias?: boolean;
  dprCap?: number;
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isSmallScreen = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

/**
 * Runs a three.js scene inside `host`. three is imported on demand (it never
 * blocks the first paint), the renderer is created once the host comes near
 * the screen, the loop pauses off-screen or in a hidden tab, and with reduced
 * motion a single still frame is drawn (`redraw` draws a new one after a
 * change, such as a hover). Returns a cleanup function.
 */
export function runThreeStage(
  host: HTMLElement,
  options: Options,
  build: (THREE: Three, pointer: Pointer, redraw: () => void) => Scene3,
) {
  const reduced = prefersReducedMotion();
  const pointer: Pointer = { x: 0, y: 0, inside: false, down: false, moved: 0 };
  // A fresh canvas per run, so a lost context is never reused.
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  host.appendChild(canvas);

  let disposed = false;
  let started = false;
  let visible = false;
  let renderer: ThreeNS.WebGLRenderer | null = null;
  let scene: Scene3 | null = null;
  let raf = 0;
  let last = 0;
  let t = 0;
  let w = 1;
  let h = 1;

  const measure = () => {
    const r = host.getBoundingClientRect();
    w = Math.max(1, r.width);
    h = Math.max(1, r.height);
  };
  const draw = () => {
    if (!renderer || !scene) return;
    const now = performance.now();
    const dt = last ? Math.min(Math.max((now - last) / 1000, 0), 0.05) : 1 / 60;
    last = now;
    t += dt;
    scene.frame(t, dt, renderer);
  };
  const running = () => visible && !document.hidden && !reduced && !!renderer;
  const loop = () => {
    raf = 0;
    if (!running()) {
      last = 0;
      return;
    }
    draw();
    raf = requestAnimationFrame(loop);
  };
  const schedule = () => {
    if (!raf && running()) raf = requestAnimationFrame(loop);
  };

  const init = async () => {
    const THREE = await import("three");
    if (disposed) return;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: options.antialias ?? true, alpha: options.alpha ?? false });
    } catch (err) {
      console.warn("WebGL unavailable, decorative animation skipped.", err);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.dprCap ?? 2));
    renderer.setClearColor(options.clear ?? 0x000000, options.alpha ? 0 : 1);
    measure();
    scene = build(THREE, pointer, () => {
      if (reduced) draw();
    });
    renderer.setSize(w, h, false);
    scene.resize(w, h);
    host.dataset.ready = "true";
    draw();
    schedule();
  };

  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
    if (pointer.inside && inside) pointer.moved += Math.hypot(x - pointer.x, y - pointer.y);
    pointer.x = x;
    pointer.y = y;
    pointer.inside = inside;
  };
  const onDown = (e: PointerEvent) => {
    onMove(e);
    if (!pointer.inside) return;
    pointer.down = true;
    scene?.down?.(pointer.x, pointer.y);
  };
  const onUp = () => {
    if (!pointer.down) return;
    pointer.down = false;
    scene?.up?.();
  };
  const onLeave = () => {
    pointer.inside = false;
  };
  const onVisibility = () => schedule();

  const ro = new ResizeObserver(() => {
    measure();
    if (!renderer || !scene) return;
    renderer.setSize(w, h, false);
    scene.resize(w, h);
    if (reduced) draw();
  });
  ro.observe(host);
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !started) {
        started = true;
        void init();
      }
      schedule();
    },
    { rootMargin: "200px" },
  );
  io.observe(host);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  window.addEventListener("pointercancel", onUp, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    scene?.dispose?.();
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
    canvas.remove();
  };
}

export const ease = (dt: number, speed: number) => 1 - Math.exp(-dt * speed);

// 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT), shared by shaders.
export const SNOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;
