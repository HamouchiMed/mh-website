"use client";

import { useEffect, useRef } from "react";
import { ease, isSmallScreen, runThreeStage } from "./stage";

// An ocean of light dots in perspective. A bump follows the pointer and a
// click sends a circular wave. Drawn on a transparent canvas, so it works on
// the accent and dark section themes alike.
export default function DotWave({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    return runThreeStage(host, { alpha: true, antialias: false, dprCap: 1.5 }, (THREE, pointer) => {
      const N = isSmallScreen() ? 90 : 140;
      const SP = 0.32;
      const pos = new Float32Array(N * N * 3);
      let i = 0;
      for (let z = 0; z < N; z++)
        for (let x = 0; x < N; x++) {
          pos[i++] = (x - N / 2) * SP;
          pos[i++] = 0;
          pos[i++] = (z - N / 2) * SP;
        }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const uniforms = {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uClick: { value: new THREE.Vector3(0, 0, -100) },
        uPix: { value: Math.min(window.devicePixelRatio || 1, 1.5) },
      };
      const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        vertexShader: `
          uniform float uTime; uniform vec2 uMouse; uniform vec3 uClick; uniform float uPix;
          varying float vH; varying float vD;
          void main() {
            vec3 p = position;
            float h = sin(p.x * 0.35 + uTime * 0.9) * 0.45 + cos(p.z * 0.3 + uTime * 0.7) * 0.45;
            float d = distance(p.xz, uMouse);
            h += exp(-d * d * 0.05) * 2.0 * (0.7 + 0.3 * sin(uTime * 3.0 - d * 1.2));
            float age = uTime - uClick.z;
            float cd = distance(p.xz, uClick.xy);
            h += exp(-pow(cd - age * 9.0, 2.0) * 0.4) * 1.6 * exp(-age * 0.7);
            p.y = h; vH = h;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            vD = -mv.z;
            gl_PointSize = uPix * 58.0 / vD * (1.0 + max(h, 0.0) * 0.35);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying float vH; varying float vD;
          void main() {
            float r = length(gl_PointCoord - 0.5);
            if (r > 0.5) discard;
            vec3 col = mix(vec3(0.72, 0.78, 1.0), vec3(1.0), clamp(vH * 0.45 + 0.3, 0.0, 1.0));
            float fade = clamp(1.4 - vD / 32.0, 0.0, 1.0);
            gl_FragColor = vec4(col, (1.0 - smoothstep(0.1, 0.5, r)) * fade * 0.85);
          }`,
      });
      const scene = new THREE.Scene();
      scene.add(new THREE.Points(geometry, material));
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
      camera.position.set(0, 6.5, 16);
      camera.lookAt(0, 0, -2);
      const ray = new THREE.Raycaster();
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const ndc = new THREE.Vector2();
      const hit = new THREE.Vector3();
      const target = new THREE.Vector2();
      let w = 1;
      let h = 1;
      const project = (x: number, y: number) => {
        ndc.set((x / w) * 2 - 1, -(y / h) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        return ray.ray.intersectPlane(plane, hit);
      };
      return {
        resize(nw, nh) {
          w = nw;
          h = nh;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        },
        down(x, y) {
          const p = project(x, y);
          if (p) uniforms.uClick.value.set(p.x, p.z, uniforms.uTime.value);
        },
        frame(t, dt, renderer) {
          uniforms.uTime.value = t;
          const p = pointer.inside ? project(pointer.x, pointer.y) : null;
          if (p) target.set(p.x, p.z);
          else if (!pointer.inside) target.set(Math.sin(t * 0.5) * 8, Math.cos(t * 0.37) * 5 - 1);
          uniforms.uMouse.value.lerp(target, ease(dt, 6));
          renderer.render(scene, camera);
        },
        dispose() {
          geometry.dispose();
          material.dispose();
        },
      };
    });
  }, []);

  return <div ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
