"use client";
import { useRef } from "react";
import { Geometry, Program, Mesh, Texture, Vec2 } from "ogl";
import gsap from "gsap";
import useOgl from "../useOgl";

// Distortion Slider — two textures melt into each other through an fbm noise
// displacement field. GSAP tweens a single progress uniform; the shader does
// the rest. Click / tap advances; it also auto-advances on a timer.
const SLIDES = [
  "/lab/photo-1.webp",
  "/lab/photo-2.webp",
  "/lab/photo-3.webp",
  "/lab/photo-4.webp",
];

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
  uniform sampler2D tA;
  uniform sampler2D tB;
  uniform float uProgress;
  uniform vec2 uPlaneRes;
  uniform vec2 uResA;
  uniform vec2 uResB;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
    return v;
  }

  vec2 cover(vec2 uv, vec2 plane, vec2 img) {
    float pa = plane.x / plane.y;
    float ia = img.x / img.y;
    vec2 scale = pa > ia ? vec2(1.0, ia / pa) : vec2(pa / ia, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    float n = fbm(vUv * 3.5);
    float p = uProgress;
    // Displacement peaks mid-transition, zero at rest.
    float amt = sin(p * 3.14159) * 0.18;
    vec2 dir = vec2(n - 0.5, noise(vUv * 5.0) - 0.5);
    vec2 uvA = cover(vUv, uPlaneRes, uResA) + dir * amt * p;
    vec2 uvB = cover(vUv, uPlaneRes, uResB) - dir * amt * (1.0 - p);
    // Noise-shaped wipe instead of a flat crossfade. m: 0 at rest (p=1, show
    // current tA), 1 at transition end (p=0, show incoming tB) — on complete,
    // current++ re-syncs tA to the image already on screen, so no snap.
    float m = smoothstep(p * 1.4 - 0.4, p * 1.4, n);
    vec3 col = mix(texture2D(tA, uvA).rgb, texture2D(tB, uvB).rgb, m);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function DistortionSlider({ reducedMotion }) {
  const hostRef = useRef(null);
  const labelRef = useRef(null);
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  useOgl(
    hostRef,
    ({ renderer, gl, host }) => {
      const geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
      });

      const textures = SLIDES.map((src) => {
        const tex = new Texture(gl, { generateMipmaps: false });
        tex.imageSize = new Vec2(1, 1);
        const img = new Image();
        img.onload = () => {
          tex.image = img;
          tex.imageSize.set(img.naturalWidth, img.naturalHeight);
          sync();
        };
        img.src = src;
        return tex;
      });

      let current = 0;
      let animating = false;
      const state = { p: 1 }; // 1 = fully showing tA (current)

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          tA: { value: textures[0] },
          tB: { value: textures[1] },
          uProgress: { value: 1 },
          uPlaneRes: { value: new Vec2(1, 1) },
          uResA: { value: new Vec2(1, 1) },
          uResB: { value: new Vec2(1, 1) },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });

      const sync = () => {
        const next = (current + 1) % SLIDES.length;
        program.uniforms.tA.value = textures[current];
        program.uniforms.tB.value = textures[next];
        program.uniforms.uResA.value.copy(textures[current].imageSize);
        program.uniforms.uResB.value.copy(textures[next].imageSize);
        if (labelRef.current) {
          labelRef.current.textContent = `${String(current + 1).padStart(2, "0")} / ${String(SLIDES.length).padStart(2, "0")}`;
        }
      };
      sync();

      const advance = () => {
        if (animating) return;
        if (reducedRef.current) {
          current = (current + 1) % SLIDES.length;
          sync();
          return;
        }
        animating = true;
        state.p = 1;
        gsap.to(state, {
          p: 0,
          duration: 1.4,
          ease: "power2.inOut",
          onComplete: () => {
            current = (current + 1) % SLIDES.length;
            state.p = 1;
            sync();
            animating = false;
          },
        });
      };

      host.addEventListener("click", advance);
      const timer = setInterval(() => {
        if (!document.hidden) advance();
      }, 3800);

      return {
        resize(w, h) {
          program.uniforms.uPlaneRes.value.set(w, h);
        },
        render() {
          program.uniforms.uProgress.value = state.p;
          renderer.render({ scene: mesh });
        },
        destroy() {
          clearInterval(timer);
          host.removeEventListener("click", advance);
          gsap.killTweensOf(state);
        },
      };
    },
    []
  );

  return (
    <div className="relative h-full w-full cursor-pointer" ref={hostRef}>
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-text/80">
        <span ref={labelRef}>01 / 04</span>
        <span className="ml-4 text-lab-text/50">click to advance</span>
      </div>
    </div>
  );
}
