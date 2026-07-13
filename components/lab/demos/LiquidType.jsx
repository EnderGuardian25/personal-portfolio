"use client";
import { useRef } from "react";
import { Geometry, Program, Mesh, Texture, Vec2 } from "ogl";
import useOgl from "../useOgl";

// Liquid Type — the headline is rasterized onto an offscreen 2D canvas and
// uploaded as a texture, then viewed through "glass": a fragment shader sums a
// height field of pointer-spawned ripples (round-robin vec4 buffer — center,
// birth time, strength) and refracts the sample UVs along its gradient.
const WORD = "LIQUID";
const RIPPLES = 10;

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
  uniform sampler2D tText;
  uniform float uTime;
  uniform float uStill; // 1 = reduced motion: flat glass, single frame
  uniform vec2 uRes;
  uniform vec4 uRipples[${RIPPLES}]; // xy center (aspect uv), z birth, w strength
  varying vec2 vUv;

  float height(vec2 p) {
    float h = 0.0;
    for (int i = 0; i < ${RIPPLES}; i++) {
      vec4 r = uRipples[i];
      float age = uTime - r.z;
      if (r.w <= 0.001 || age < 0.0) continue;
      // A wave packet travelling outward from the stir point, decaying.
      float band = distance(p, r.xy) - age * 0.3;
      h += cos(band * 34.0) * exp(-band * band * 130.0) * exp(-age * 1.15) * r.w;
    }
    // Ambient swell so the surface never reads as a still image.
    h += 0.9 * sin(p.x * 6.0 + uTime * 0.9) * sin(p.y * 5.0 - uTime * 0.7);
    h += 0.45 * sin(p.x * 11.0 - uTime * 0.6) * sin(p.y * 9.0 + uTime * 1.1);
    return h;
  }

  void main() {
    vec2 p = vUv * vec2(uRes.x / uRes.y, 1.0);
    vec2 grad = vec2(0.0);
    if (uStill < 0.5) {
      float e = 0.0035;
      float h0 = height(p);
      grad = vec2(height(p + vec2(e, 0.0)) - h0, height(p + vec2(0.0, e)) - h0) / e;
    }
    vec2 uv = vUv - grad * 0.0026; // refract through the surface slope
    vec3 col = vec3(
      texture2D(tText, uv - grad * 0.0006).r, // hair of dispersion at crests
      texture2D(tText, uv).g,
      texture2D(tText, uv + grad * 0.0006).b
    );
    // One electric glint riding the wave crests.
    col += vec3(0.14, 0.32, 0.96) * clamp(grad.y * 0.035, 0.0, 1.0) * 0.4;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function LiquidType({ reducedMotion }) {
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

      // Rasterize the word with the real display face (next/font hashes the
      // family name, so read it off a probe element instead of hardcoding).
      const probe = host.parentElement?.querySelector("[data-font-probe]");
      const family = probe ? getComputedStyle(probe).fontFamily : "Syne, sans-serif";
      const cnv = document.createElement("canvas");
      const ctx = cnv.getContext("2d");
      const tex = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR });
      const drawText = () => {
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cnv.width = w * dpr;
        cnv.height = h * dpr;
        ctx.scale(dpr, dpr);
        ctx.fillStyle = "#0a0a0e";
        ctx.fillRect(0, 0, w, h);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#e8e8e6";
        // Clamp so the word never bleeds past the frame (Syne 800 runs wide).
        let size = Math.min(w * 0.23, h * 0.42);
        ctx.font = `800 ${size}px ${family}`;
        const tw = ctx.measureText(WORD).width;
        if (tw > w * 0.92) {
          size *= (w * 0.92) / tw;
          ctx.font = `800 ${size}px ${family}`;
        }
        ctx.fillText(WORD, w / 2, h * 0.5);
        tex.image = cnv;
        tex.needsUpdate = true;
      };
      document.fonts?.ready?.then(() => {
        drawText();
        frozen = false; // reduced-motion frame may predate the webfont
      });

      // Plain Array, NOT Float32Array: ogl recognises `uRipples[0]` as an
      // array uniform via Array.isArray(value) — a typed array fails that
      // test, so every frame logged "Active uniform uRipples[0] has not been
      // supplied" (the data still uploaded; only the lookup complained).
      const rip = new Array(RIPPLES * 4).fill(0);
      let ri = 0;
      let lastSpawn = -1e9;
      const spawn = (x, y, strength, birth) => {
        const o = ri * 4;
        rip[o] = x;
        rip[o + 1] = y;
        rip[o + 2] = birth;
        rip[o + 3] = strength;
        ri = (ri + 1) % RIPPLES;
        lastSpawn = birth;
      };

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          tText: { value: tex },
          uTime: { value: 0 },
          uStill: { value: 0 },
          uRes: { value: new Vec2(1, 1) },
          uRipples: { value: rip },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });

      let aspect = 1;
      let last = null;
      let hover = null; // pointer position while it rests over the surface
      const onLeave = () => {
        hover = null;
      };
      const onMove = (e) => {
        const r = host.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * aspect;
        const y = 1 - (e.clientY - r.top) / r.height;
        hover = { x, y };
        if (last && Math.hypot(x - last.x, y - last.y) < 0.04) return;
        const s = last ? Math.min(1.15, 0.3 + Math.hypot(x - last.x, y - last.y) * 4) : 0.7;
        last = { x, y };
        spawn(x, y, s, performance.now() / 1000);
      };
      const onDown = (e) => {
        const r = host.getBoundingClientRect();
        spawn(
          ((e.clientX - r.left) / r.width) * aspect,
          1 - (e.clientY - r.top) / r.height,
          1.35,
          performance.now() / 1000
        );
      };
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointerleave", onLeave);

      let frozen = false;
      let intro = true;
      return {
        resize(w, h) {
          aspect = w / h;
          program.uniforms.uRes.value.set(w, h);
          drawText();
          frozen = false; // re-render the settled frame at the new size
        },
        render(t) {
          const now = t / 1000;
          if (reducedRef.current) {
            if (frozen) return;
            frozen = true;
            program.uniforms.uStill.value = 1;
            renderer.render({ scene: mesh });
            return;
          }
          if (intro) {
            // Entrance: three staggered stirs sweep across the word on mount.
            intro = false;
            spawn(0.32 * aspect, 0.52, 1.1, now);
            spawn(0.58 * aspect, 0.44, 0.95, now + 0.22);
            spawn(0.78 * aspect, 0.58, 0.8, now + 0.44);
          }
          // A resting pointer keeps gently stirring — hover must read even
          // when the mouse doesn't move.
          if (hover && now - lastSpawn > 0.75) spawn(hover.x, hover.y, 0.45, now);
          program.uniforms.uStill.value = 0;
          program.uniforms.uTime.value = now;
          renderer.render({ scene: mesh });
        },
        destroy() {
          host.removeEventListener("pointermove", onMove);
          host.removeEventListener("pointerdown", onDown);
          host.removeEventListener("pointerleave", onLeave);
        },
      };
    },
    []
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0e]">
      <span data-font-probe aria-hidden className="pointer-events-none absolute font-lab-display opacity-0">
        A
      </span>
      <span className="sr-only">{WORD}</span>
      <div ref={glRef} className="absolute inset-0" aria-hidden />
      <p className="pointer-events-none absolute bottom-4 left-4 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Stir the surface
      </p>
    </div>
  );
}
