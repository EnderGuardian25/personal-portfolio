"use client";
import { useRef } from "react";
import { Geometry, Program, Mesh, Texture, Vec2 } from "ogl";
import gsap from "gsap";
import useOgl from "../useOgl";

// Panorama Strip — one continuous strip of photos sampled by a fullscreen
// triangle. Screen-x is bent through a lens in the fragment shader: a tan-like
// horizontal squeeze plus a 1/cos vertical bow, so the strip's edges curve
// away like a wrapped panorama. Dragging scrubs a scroll uniform with real
// inertia; flick velocity feeds extra curvature so the lens breathes.
const PHOTOS = ["/lab/photo-1.webp", "/lab/photo-2.webp", "/lab/photo-3.webp", "/lab/photo-4.webp"];
const SPAN = 1.15; // strip tiles from screen centre to screen edge

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
  uniform sampler2D t0; uniform sampler2D t1; uniform sampler2D t2; uniform sampler2D t3;
  uniform vec2 uRes0; uniform vec2 uRes1; uniform vec2 uRes2; uniform vec2 uRes3;
  uniform vec2 uPlaneRes;
  uniform float uScroll; // strip units — 1.0 = one photo tile
  uniform float uCurve;  // lens strength
  varying vec2 vUv;

  vec2 cover(vec2 st, vec2 tile, vec2 img) {
    float ta = tile.x / tile.y;
    float ia = img.x / img.y;
    vec2 s = ta > ia ? vec2(1.0, ia / ta) : vec2(ta / ia, 1.0);
    return (st - 0.5) * s + 0.5;
  }

  vec3 tile(float slot, vec2 st, vec2 tr) {
    if (slot < 0.5) return texture2D(t0, cover(st, tr, uRes0)).rgb;
    if (slot < 1.5) return texture2D(t1, cover(st, tr, uRes1)).rgb;
    if (slot < 2.5) return texture2D(t2, cover(st, tr, uRes2)).rgb;
    return texture2D(t3, cover(st, tr, uRes3)).rgb;
  }

  void main() {
    float x = vUv.x * 2.0 - 1.0;
    float sq = x * x;
    // Lens math: edges see MORE strip per pixel (squeeze) and less height (bow).
    float u = uScroll + x * ${SPAN} * (1.0 + sq * uCurve * 0.85);
    float bow = 1.0 - sq * uCurve * 0.34;
    float y = (vUv.y - 0.5) / bow + 0.5;
    vec3 bg = vec3(0.031, 0.031, 0.039);
    if (y < 0.0 || y > 1.0) { gl_FragColor = vec4(bg, 1.0); return; }
    float slot = mod(floor(u), 4.0);
    vec2 tr = vec2(uPlaneRes.x / (2.0 * ${SPAN}), uPlaneRes.y);
    vec3 col = tile(slot, vec2(fract(u), y), tr);
    // dark seam between frames + falloff as the edges recede
    float f = fract(u);
    col *= smoothstep(0.0, 0.012, f) * smoothstep(1.0, 0.988, f);
    col = mix(col, bg, sq * 0.45);
    // one accent: a blue hairline riding the bowed top/bottom rails
    float rail = smoothstep(0.016, 0.004, abs(abs(y - 0.5) - 0.494));
    col = mix(col, vec3(0.23, 0.51, 0.96), rail * 0.65);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function PanoramaStrip({ reducedMotion }) {
  const hostRef = useRef(null);
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  useOgl(
    hostRef,
    ({ renderer, gl, host }) => {
      const geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
      });

      const uniforms = {
        uPlaneRes: { value: new Vec2(1, 1) },
        uScroll: { value: 0 },
        uCurve: { value: 0 },
      };
      PHOTOS.forEach((src, i) => {
        const tex = new Texture(gl, { generateMipmaps: false });
        const res = new Vec2(1, 1); // mutated in place on load; uniform holds the ref
        const img = new Image();
        img.onload = () => {
          tex.image = img;
          res.set(img.naturalWidth, img.naturalHeight);
        };
        img.src = src;
        uniforms[`t${i}`] = { value: tex };
        uniforms[`uRes${i}`] = { value: res };
      });

      const program = new Program(gl, { vertex, fragment, uniforms });
      const mesh = new Mesh(gl, { geometry, program });

      // Entrance: the strip glides in while the lens curls from flat to bowed.
      const state = { scroll: 1.35, curve: 0 };
      if (reducedRef.current) {
        state.scroll = 0;
        state.curve = 1;
      } else {
        gsap.to(state, { scroll: 0, duration: 1.8, ease: "power3.out" });
        gsap.to(state, { curve: 1, duration: 1.5, ease: "power2.inOut", delay: 0.15 });
      }

      let dragging = false;
      let lastX = 0;
      let vel = 0;
      let bend = state.curve;
      const onDown = (e) => {
        dragging = true;
        lastX = e.clientX;
        vel = 0;
        gsap.killTweensOf(state);
        host.setPointerCapture?.(e.pointerId);
      };
      const onMove = (e) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        const du = (-dx / Math.max(1, host.clientWidth)) * 2 * SPAN;
        state.scroll += du;
        vel = Math.max(-0.22, Math.min(0.22, vel * 0.55 + du * 0.45));
      };
      const onUp = () => (dragging = false);
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerup", onUp);
      host.addEventListener("pointercancel", onUp);

      return {
        resize(w, h) {
          program.uniforms.uPlaneRes.value.set(w, h);
        },
        render() {
          if (!reducedRef.current) {
            if (!dragging && !gsap.isTweening(state)) {
              state.scroll += vel + 0.00055; // inertia glide + ambient drift
              vel *= 0.945;
            }
            // flick velocity momentarily deepens the lens
            const target = state.curve * (1 + Math.min(Math.abs(vel) * 24, 0.5));
            bend += (target - bend) * 0.09;
          } else {
            bend = state.curve;
          }
          program.uniforms.uScroll.value = state.scroll;
          program.uniforms.uCurve.value = bend;
          renderer.render({ scene: mesh });
        },
        destroy() {
          gsap.killTweensOf(state);
          host.removeEventListener("pointerdown", onDown);
          host.removeEventListener("pointermove", onMove);
          host.removeEventListener("pointerup", onUp);
          host.removeEventListener("pointercancel", onUp);
        },
      };
    },
    []
  );

  return (
    <div
      ref={hostRef}
      className="relative h-full w-full cursor-grab overflow-hidden [touch-action:pan-y] active:cursor-grabbing"
    >
      <p className="pointer-events-none absolute bottom-4 left-4 z-10 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        drag to pan · flick for momentum
      </p>
    </div>
  );
}
