"use client";
import { useRef } from "react";
import { Geometry, Program, Mesh, Texture, Vec2 } from "ogl";
import useOgl from "../useOgl";

// Liquid Type — the headline is rasterized onto an offscreen 2D canvas and
// uploaded as a texture, then viewed through "glass": a fragment shader sums a
// height field of pointer-spawned ripples (round-robin vec4 buffer — center,
// birth time, strength) and refracts the sample UVs along its gradient.
//
// Behaviour (per owner): a STILL pointer leaves still glass — there is no
// ambient swell and no resting re-stir. Only movement disturbs the surface,
// and each disturbance is a LOCAL damped bob (barely travels) that settles in
// ~1s, so ripples don't keep following or spreading after the pointer stops.
// The moving streak is smoothed by filling the gap between pointer samples
// with evenly-spaced spawns, so a fast flick reads as one continuous wake.
const WORD = "LIQUID";
const RIPPLES = 12;

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
    // Each stir is a LOCAL damped oscillation: it bobs in place (temporal
    // term) and creeps outward only slightly (age * 0.08), so it reads as a
    // real disturbance settling — not a ring spreading across the whole
    // surface. Fast decay (exp(-age * 2.6)) means everything calms within ~1s
    // of the last movement. Dense interpolated spawns overlap into a smooth
    // wake. No ambient term — a still pointer leaves the glass still.
    for (int i = 0; i < ${RIPPLES}; i++) {
      vec4 r = uRipples[i];
      float age = uTime - r.z;
      if (r.w <= 0.001 || age < 0.0) continue;
      float ring = distance(p, r.xy) - age * 0.08;
      float env = exp(-ring * ring * 80.0);       // tight, near-stationary
      float wave = cos(ring * 20.0 - age * 5.0);   // bob in place, don't travel
      h += wave * env * exp(-age * 2.6) * r.w;
    }
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
        // The first frame(s) may predate the webfont; redraw the texture and
        // force one more render so the real face shows even if already settled.
        drawText();
        stillDrawn = false;
        dirty = true;
      });

      // Plain Array, NOT Float32Array: ogl recognises `uRipples[0]` as an
      // array uniform via Array.isArray(value) — a typed array fails that
      // test, so every frame logged "Active uniform uRipples[0] has not been
      // supplied" (the data still uploaded; only the lookup complained).
      const rip = new Array(RIPPLES * 4).fill(0);
      let ri = 0;
      let lastActivity = -1e9; // last stir time — drives the settle/freeze
      const spawn = (x, y, strength, birth) => {
        const o = ri * 4;
        rip[o] = x;
        rip[o + 1] = y;
        rip[o + 2] = birth;
        rip[o + 3] = strength;
        ri = (ri + 1) % RIPPLES;
        if (birth > lastActivity) lastActivity = birth;
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

      // Movement leaves a streak; a resting pointer leaves nothing. Fill the
      // gap between the last and current sample with evenly-spaced spawns
      // (capped) so a fast flick is one continuous wake, not a row of discrete
      // rings. Sub-threshold jitter spawns nothing → still pointer, still glass.
      const SPACING = 0.03; // aspect-uv distance between trail spawns
      const onMove = (e) => {
        const r = host.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * aspect;
        const y = 1 - (e.clientY - r.top) / r.height;
        if (!last) {
          last = { x, y }; // seed the trail; entering isn't a stir
          return;
        }
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.012) return; // stationary jitter — leave the surface calm
        const birth = performance.now() / 1000;
        const steps = Math.min(6, Math.ceil(dist / SPACING));
        for (let s = 1; s <= steps; s++) {
          const f = s / steps;
          spawn(last.x + dx * f, last.y + dy * f, 0.6, birth);
        }
        last = { x, y };
      };
      const onDown = (e) => {
        const r = host.getBoundingClientRect();
        spawn(
          ((e.clientX - r.left) / r.width) * aspect,
          1 - (e.clientY - r.top) / r.height,
          1.2,
          performance.now() / 1000
        );
      };
      const onLeave = () => {
        last = null; // re-entry starts a fresh trail, no streak across the gap
      };
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointerleave", onLeave);

      let stillDrawn = false; // reduced motion: single settled frame guard
      let dirty = false; // force one draw after a resize, even if settled
      let intro = true;
      const HOLD = 1.5; // s of quiet before the surface freezes (ripples gone)
      return {
        resize(w, h) {
          aspect = w / h;
          program.uniforms.uRes.value.set(w, h);
          drawText();
          stillDrawn = false;
          dirty = true; // redraw once at the new size even if already settled
        },
        render(t) {
          const now = t / 1000;
          if (reducedRef.current) {
            if (stillDrawn) return;
            stillDrawn = true;
            program.uniforms.uStill.value = 1;
            renderer.render({ scene: mesh });
            return;
          }
          if (intro) {
            // Entrance: three staggered stirs sweep across the word on mount.
            intro = false;
            spawn(0.3 * aspect, 0.52, 0.9, now);
            spawn(0.56 * aspect, 0.45, 0.8, now + 0.2);
            spawn(0.8 * aspect, 0.57, 0.7, now + 0.4);
          }
          // Once the surface has been quiet long enough for every ripple to
          // decay, stop drawing and hold the last (calm) frame — movement
          // refreshes lastActivity via spawn() and the loop resumes next frame.
          if (!dirty && now - lastActivity > HOLD) return;
          dirty = false;
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
