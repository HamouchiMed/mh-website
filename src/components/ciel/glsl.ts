import { SNOISE } from "../motion/stage";

// Shaders for the "Du ciel au code" home page (SkyDive, TopoMap). They draw a
// full-screen quad; gl_FragCoord is in drawing-buffer pixels.

export const VERT = `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const COMMON = `${SNOISE}
const vec3 PAPER = vec3(0.98);
const vec3 ACC = vec3(0.180, 0.231, 1.0);
float fbm(vec3 p) { float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * snoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= .5; } return s; }
float fbm4(vec3 p) { float a = .5, s = 0.; for (int i = 0; i < 4; i++) { s += a * snoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= .5; } return s; }
mat2 r2(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
`;

// Contour lines in page coordinates (CSS px), so the end of the dive and the
// terrain section below it draw one continuous map. Lines fade behind the
// text column (on the left, or on the right in Arabic).
const TOPO = `
uniform vec2 uRes; uniform float uTime; uniform float uScale; uniform float uPageTop; uniform float uView;
uniform vec2 uMouse; uniform float uMouseK; uniform vec2 uHill; uniform float uHillK; uniform float uMirror;
vec3 topo(vec2 f) {
  vec2 pg = vec2(f.x / uScale, uPageTop + (uRes.y - f.y) / uScale);
  vec2 uv = vec2(pg.x, -pg.y) / 720.;
  float h = fbm4(vec3(uv * .95 + vec2(3., 1.), uTime * .018));
  vec2 dm = (pg - uMouse) / 230.; h += .5 * exp(-dot(dm, dm) * 2.) * uMouseK;
  vec2 dh = (pg - uHill) / 150.; h += .75 * exp(-dot(dh, dh) * 2.) * uHillK;
  float v = h * 11.; float fv = fract(v); float w = fwidth(v);
  float line = 1. - smoothstep(0., w * 1.3, min(fv, 1. - fv));
  float major = step(mod(floor(v + .5), 5.), .5);
  float x = pg.x / uView; if (uMirror > .5) x = 1. - x;
  float fade = mix(.4, 1., smoothstep(.15, .55, x));
  return mix(PAPER, ACC, line * mix(.28, .8, major) * fade);
}
`;

export const TOPO_FRAG = `${COMMON}${TOPO}
void main() { gl_FragColor = vec4(topo(gl_FragCoord.xy), 1.); }`;

// The iridescent bubble (as in SceneCanvas), ray-marched into a 512² target.
export const BLOB_FRAG = `${COMMON}
uniform float uTime; uniform vec2 uLook;
float map(vec3 q) {
  q.xz *= r2(uTime * .18 + uLook.x * .7); q.yz *= r2(uLook.y * .45);
  float n = snoise(q * 1.1 + vec3(0., 0., uTime * .22)) * .24 + snoise(q * 2.6 + vec3(uTime * .3, 0., 0.)) * .06;
  return (length(q) - 1. - n) * .6;
}
void main() {
  vec2 p = (gl_FragCoord.xy / 512.) * 2. - 1.; p *= 1.42;
  vec3 ro = vec3(p, 3.), rd = vec3(0., 0., -1.);
  float t = 1.4; bool hit = false;
  for (int i = 0; i < 64; i++) { float d = map(ro + rd * t); if (d < .002) { hit = true; break; } t += d; if (t > 4.6) break; }
  if (!hit) { gl_FragColor = vec4(0.); return; }
  vec3 pos = ro + rd * t; vec2 e = vec2(.004, 0.);
  vec3 n = normalize(vec3(map(pos + e.xyy) - map(pos - e.xyy), map(pos + e.yxy) - map(pos - e.yxy), map(pos + e.yyx) - map(pos - e.yyx)));
  vec3 v = -rd; vec3 L = normalize(vec3(-.4, .8, .6));
  float dif = max(dot(n, L), 0.); float spec = pow(max(dot(reflect(-L, n), v), 0.), 60.);
  float fr = pow(1. - max(dot(n, v), 0.), 2.);
  float vn = snoise(pos * 1.1 + vec3(0., 0., uTime * .22));
  vec3 irid = .5 + .5 * cos(6.2831 * (fr * .8 + vn * .3 + vec3(0., .33, .67)) + uTime * .4);
  vec3 col = vec3(.14, .2, .92) * (.25 + .75 * dif); col = mix(col, irid, fr * .8); col += spec * .55;
  gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
}`;

// The sky: clouds that rise past the camera as you dive (uP 0 -> 1), a
// white-out inside the cloud layer, then the ground (the topographic map).
// uBlob holds the bubble (premultiplied), placed in uArea.
export const SKY_FRAG = `${COMMON}${TOPO}
uniform float uP; uniform vec4 uArea; uniform sampler2D uBlob; uniform float uHasBlob;
vec4 blobAt(vec2 f) {
  if (uHasBlob < .5) return vec4(0.);
  float s = min(uArea.z, uArea.w); vec2 c = uArea.xy + uArea.zw * .5; vec2 uv = (f - c) / s + .5;
  if (uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) return vec4(0.);
  return texture2D(uBlob, uv);
}
void main() {
  vec2 f = gl_FragCoord.xy; vec2 uv = f / uRes.y; float y = f.y / uRes.y; float p = uP;
  float asp = uRes.x / uRes.y;
  vec3 sky = mix(vec3(.64, .71, 1.), vec3(.13, .2, .92), y);
  float zoom = 1. + p * 1.8;
  vec2 q = (uv - vec2(asp * .5, .5)) / zoom + vec2(asp * .5, .5);
  q = q * vec2(1., 1.8) + vec2(uTime * .03 + (uMouse.x / uView - .5) * .04, -p * 3.4);
  float c = fbm(vec3(q * 1.2, uTime * .03));
  float c2 = fbm(vec3(q * 1.2 + vec2(.03, .05), uTime * .03));
  float thick = p * 1.1 * (1. - smoothstep(.5, .72, p));
  float dens = smoothstep(-.05, .55, c + .3 * (1. - y) - .12 + thick);
  float xx = f.x / uRes.x; if (uMirror > .5) xx = 1. - xx;
  dens *= mix(mix(.25, 1., smoothstep(.2, .75, xx + (1. - y) * .45)), 1., smoothstep(.05, .25, p));
  float light = clamp((c - c2) * 6. + .6, 0., 1.);
  vec3 cloud = mix(vec3(.70, .75, .93), vec3(1.), light);
  vec3 col = mix(sky, cloud, dens * .92);
  float fog = smoothstep(.32, .52, p) * (1. - smoothstep(.62, .82, p));
  col = mix(col, vec3(.95, .96, 1.), fog * .9);
  vec4 b = blobAt(f - vec2(0., p * uRes.y * 1.5));
  col = col * (1. - b.a) + b.rgb;
  float g = smoothstep(.6, .9, p);
  if (g > 0.) col = mix(col, topo(f), g);
  gl_FragColor = vec4(col, 1.);
}`;
