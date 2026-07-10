"use client";
import { useRef } from "react";
import { Geometry, Program, Mesh, Vec2 } from "ogl";
import useOgl from "../useOgl";

// Gradient Field — an fbm noise fog drifting through three hues over
// near-black; the pointer drags a subtle warp through the field. Headline is
// plain DOM on top, so the type stays crisp and selectable.
const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;
  varying vec2 vUv;

  // Cheap value-noise fbm — plenty for a soft fog.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.05;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uRes.x / uRes.y;

    // Pointer warp: pull the sample space toward the cursor.
    vec2 m = uMouse;
    m.x *= uRes.x / uRes.y;
    float md = length(uv - m);
    vec2 warp = normalize(uv - m + 0.0001) * exp(-md * 2.6) * 0.35;

    float t = uTime * 0.055;
    float n1 = fbm(uv * 1.6 - warp + vec2(t, -t * 0.7));
    float n2 = fbm(uv * 2.3 + warp + vec2(-t * 0.8, t * 0.5) + n1);

    vec3 base = vec3(0.028, 0.028, 0.04);
    vec3 blue = vec3(0.09, 0.23, 0.55);
    vec3 electric = vec3(0.14, 0.32, 0.96);
    vec3 violet = vec3(0.35, 0.16, 0.6);

    vec3 col = base;
    col = mix(col, blue, smoothstep(0.35, 0.75, n1));
    col = mix(col, violet, smoothstep(0.55, 0.9, n2) * 0.7);
    col = mix(col, electric, smoothstep(0.72, 0.98, n1 * n2 * 1.6) * 0.8);

    // Gentle vignette keeps the corners quiet under the headline.
    col *= 1.0 - length(vUv - 0.5) * 0.55;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function GradientFieldHero({ reducedMotion }) {
  const hostRef = useRef(null);
  const glRef = useRef(null);
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  useOgl(
    glRef,
    ({ renderer, gl, host }) => {
      const geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
      });
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new Vec2(0.5, 0.5) },
          uRes: { value: new Vec2(1, 1) },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });

      const target = new Vec2(0.5, 0.5);
      const onMove = (e) => {
        const r = host.getBoundingClientRect();
        target.set(
          (e.clientX - r.left) / r.width,
          1 - (e.clientY - r.top) / r.height
        );
      };
      // Listen on the parent (the DOM headline covers the canvas).
      const listenEl = host.parentElement || host;
      listenEl.addEventListener("pointermove", onMove);

      let frozen = false;
      return {
        resize(w, h) {
          program.uniforms.uRes.value.set(w, h);
        },
        render(t) {
          if (reducedRef.current) {
            if (frozen) return;
            frozen = true; // draw one settled frame, then hold
            program.uniforms.uTime.value = 40;
            renderer.render({ scene: mesh });
            return;
          }
          program.uniforms.uTime.value = t / 1000;
          const m = program.uniforms.uMouse.value;
          m.lerp(target, 0.06);
          renderer.render({ scene: mesh });
        },
        destroy() {
          listenEl.removeEventListener("pointermove", onMove);
        },
      };
    },
    []
  );

  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden">
      <div ref={glRef} className="absolute inset-0" aria-hidden />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-start justify-end p-8 sm:p-12">
        <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-text/60">
          Atmosphere, not decoration
        </p>
        <h2 className="mt-3 max-w-md font-lab-display text-3xl font-bold leading-tight text-lab-text sm:text-5xl">
          Color that breathes behind the message.
        </h2>
      </div>
    </div>
  );
}
