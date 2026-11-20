import { SNOISE } from "../motion/stage";

// Shaders for the "Du ciel au code" home page (SkyDive, TopoMap). They draw a
// full-screen quad; gl_FragCoord is in drawing-buffer pixels. The bubble in
// the sky is the shared mesh shader (motion/bubble.ts).

export const VERT = `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const COMMON = `${SNOISE}
const vec3 PAPER = vec3(0.98);
const vec3 ACC = vec3(0.180, 0.231, 1.0);
float fbm(vec3 p) { float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * snoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= .5; } return s; }
float fbm4(vec3 p) { float a = .5, s = 0.; for (int i = 0; i < 4; i++) { s += a * snoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= .5; } return s; }
float fbm3(vec3 p) { float a = .5, s = 0.; for (int i = 0; i < 3; i++) { s += a * snoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= .5; } return s; }
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

// The sky: clouds that rise past the camera as you dive (uP 0 -> 1) and a
// white-out inside the cloud layer. Clouds are soft, so they are drawn into a
// small target (about a third of the screen's resolution) and stretched by
// SKY_FRAG, which adds the ground (the topographic map) at full resolution.
export const CLOUDS_FRAG = `${COMMON}
uniform vec2 uRes; uniform float uTime; uniform float uP; uniform float uView; uniform vec2 uMouse; uniform float uMirror;
void main() {
  vec2 f = gl_FragCoord.xy; float p = uP;
  vec2 uv = f / uRes.y; float y = f.y / uRes.y;
  float asp = uRes.x / uRes.y;
  vec3 sky = mix(vec3(.64, .71, 1.), vec3(.13, .2, .92), y);
  float zoom = 1. + p * 1.8;
  vec2 q = (uv - vec2(asp * .5, .5)) / zoom + vec2(asp * .5, .5);
  q = q * vec2(1., 1.8) + vec2(uTime * .03 + (uMouse.x / uView - .5) * .04, -p * 3.4);
  float c = fbm4(vec3(q * 1.2, uTime * .03));
  float c2 = fbm3(vec3(q * 1.2 + vec2(.03, .05), uTime * .03));
  float thick = p * 1.1 * (1. - smoothstep(.5, .72, p));
  float dens = smoothstep(-.05, .55, c + .3 * (1. - y) - .12 + thick);
  float xx = f.x / uRes.x; if (uMirror > .5) xx = 1. - xx;
  dens *= mix(mix(.25, 1., smoothstep(.2, .75, xx + (1. - y) * .45)), 1., smoothstep(.05, .25, p));
  float light = clamp((c - c2) * 6. + .6, 0., 1.);
  vec3 cloud = mix(vec3(.70, .75, .93), vec3(1.), light);
  vec3 col = mix(sky, cloud, dens * .92);
  float fog = smoothstep(.32, .52, p) * (1. - smoothstep(.62, .82, p));
  gl_FragColor = vec4(mix(col, vec3(.95, .96, 1.), fog * .9), 1.);
}`;

export const SKY_FRAG = `${COMMON}${TOPO}
uniform sampler2D tClouds; uniform float uP;
void main() {
  vec2 f = gl_FragCoord.xy;
  float g = smoothstep(.6, .9, uP);
  vec3 col = g >= 1. ? vec3(0.) : texture2D(tClouds, f / uRes).rgb;
  if (g > 0.) col = mix(col, topo(f), g);
  gl_FragColor = vec4(col, 1.);
}`;
