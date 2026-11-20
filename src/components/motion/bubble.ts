import { SNOISE } from "./stage";

// The iridescent liquid bubble: a sphere whose surface is displaced by noise
// (pointer and time move it), lit with a fresnel rainbow. Used by the classic
// home page (SceneCanvas) and the sky of "Du ciel au code" (SkyDive).
// Uniforms: uTime, uMouse (vec2), uAmp, uColor (vec3), uAlpha.

export const BUBBLE_VERTEX = `${SNOISE}
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

export const BUBBLE_FRAGMENT = `
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
