"use client";
import { useRef } from "react";
import { Geometry, Program, Mesh, Vec2 } from "ogl";
import useOgl from "../useOgl";

// Particle Name (signature). "DAMIAN" is rasterized to an offscreen 2D canvas
// and its lit pixels become home positions for 6k GPU points. A spring sim
// (pointer repels, damped pull home, per-particle stagger) writes the position
// buffer each frame; the shader colors each point by distance from home, so
// thrown particles flare electric blue and cool to off-white as they land.

const COUNT = 6000;
const WORD = "DAMIAN";

const vertex = /* glsl */ `
  attribute vec2 position;
  attribute vec2 home;
  attribute float seed;
  uniform vec2 uRes;
  uniform float uDpr;
  uniform float uTime;
  varying float vHeat;
  void main() {
    // Sub-pixel breathing so the settled name still reads as live particles.
    vec2 p = position + vec2(
      sin(uTime * 0.9 + seed * 43.7),
      cos(uTime * 0.8 + seed * 71.3)
    ) * 0.55;
    vHeat = clamp(length(position - home) / 90.0, 0.0, 1.0);
    vec2 clip = vec2(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0);
    gl_Position = vec4(clip, 0.0, 1.0);
    gl_PointSize = (1.1 + seed * 1.5 + vHeat * 1.8) * uDpr;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying float vHeat;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d);
    vec3 col = mix(vec3(0.91, 0.91, 0.9), vec3(0.23, 0.51, 0.96), vHeat);
    gl_FragColor = vec4(col, a * (0.5 + vHeat * 0.5));
  }
`;

// Rasterize the word, return lit-pixel coordinates scaled to host pixels.
function sampleWord(w, h) {
  const cw = Math.min(w, 820);
  const ch = Math.max(1, Math.round((h * cw) / w));
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const family =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-lab-display")
      .trim() || "sans-serif";
  ctx.font = `800 100px ${family}, sans-serif`;
  const tw = ctx.measureText(WORD).width || 1;
  ctx.font = `800 ${Math.min((cw * 0.9 * 100) / tw, ch * 0.62)}px ${family}, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(WORD, cw / 2, ch / 2);
  const data = ctx.getImageData(0, 0, cw, ch).data;
  const pts = [];
  for (let y = 0; y < ch; y += 2) {
    for (let x = 0; x < cw; x += 2) {
      if (data[(y * cw + x) * 4 + 3] > 128) pts.push(x, y);
    }
  }
  return { pts, scale: w / cw };
}

export default function ParticleNameHero({ reducedMotion }) {
  const hostRef = useRef(null);
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  useOgl(
    hostRef,
    ({ renderer, gl, host }) => {
      const pos = new Float32Array(COUNT * 2);
      const vel = new Float32Array(COUNT * 2);
      const home = new Float32Array(COUNT * 2);
      const seed = new Float32Array(COUNT);
      for (let i = 0; i < COUNT; i++) seed[i] = Math.random();

      const geometry = new Geometry(gl, {
        position: { size: 2, data: pos, usage: gl.DYNAMIC_DRAW },
        home: { size: 2, data: home },
        seed: { size: 1, data: seed },
      });
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uRes: { value: new Vec2(1, 1) },
          uDpr: { value: renderer.dpr },
          uTime: { value: 0 },
        },
        transparent: true,
        depthTest: false,
      });
      program.setBlendFunc(gl.SRC_ALPHA, gl.ONE); // additive → particles glow
      const points = new Mesh(gl, { mode: gl.POINTS, geometry, program });

      let scattered = false;
      let stageW = host.clientWidth || 1;

      const rebuild = (w, h) => {
        const { pts, scale } = sampleWord(w, h);
        const n = pts.length / 2;
        if (!n) return;
        for (let i = 0; i < COUNT; i++) {
          const j = Math.floor((i / COUNT) * n) * 2;
          home[i * 2] = pts[j] * scale + (Math.random() - 0.5) * 2;
          home[i * 2 + 1] = pts[j + 1] * scale + (Math.random() - 0.5) * 2;
        }
        geometry.attributes.home.needsUpdate = true;
        if (!scattered) {
          // Entrance: a cloud of loose sparks; the staggered spring (below)
          // pulls them into the glyphs — assembly IS the mount choreography.
          for (let i = 0; i < COUNT; i++) {
            pos[i * 2] = Math.random() * w;
            pos[i * 2 + 1] = Math.random() * h;
            vel[i * 2] = (Math.random() - 0.5) * 6;
            vel[i * 2 + 1] = (Math.random() - 0.5) * 6;
          }
          scattered = true;
        }
      };

      const mouse = { x: -1e4, y: -1e4 };
      const setMouse = (e) => {
        const r = host.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      };
      const clearMouse = () => {
        mouse.x = -1e4;
        mouse.y = -1e4;
      };
      host.addEventListener("pointermove", setMouse);
      host.addEventListener("pointerdown", setMouse); // tap repels on touch
      host.addEventListener("pointerup", clearMouse);
      host.addEventListener("pointerleave", clearMouse);
      // Syne can land after first raster — re-home onto the real glyphs.
      document.fonts?.ready?.then(() =>
        rebuild(host.clientWidth || 1, host.clientHeight || 1)
      );

      const start = performance.now();
      let lastT = start;
      let staticDone = false;

      return {
        resize(w, h) {
          program.uniforms.uRes.value.set(w, h);
          stageW = w;
          rebuild(w, h); // homes move; the spring re-forms the name organically
        },
        render(t) {
          if (reducedRef.current) {
            if (!staticDone) {
              pos.set(home);
              geometry.attributes.position.needsUpdate = true;
              staticDone = true;
            }
            renderer.render({ scene: points });
            return;
          }
          staticDone = false;
          program.uniforms.uTime.value = t / 1000;
          const now = performance.now();
          const dtn = Math.min(2, Math.max(0.5, (now - lastT) / 16.7));
          lastT = now;
          const elapsed = (now - start) / 1000;
          const damp = Math.pow(0.86, dtn);
          const R = Math.max(70, stageW * 0.11);
          for (let i = 0; i < COUNT; i++) {
            const ix = i * 2;
            const iy = ix + 1;
            let vx = vel[ix];
            let vy = vel[iy];
            const dx = pos[ix] - mouse.x;
            const dy = pos[iy] - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < R * R) {
              const d = Math.sqrt(d2) || 1;
              let f = 1 - d / R;
              f = f * f * 3.4 * dtn;
              vx += (dx / d) * f;
              vy += (dy / d) * f;
            }
            if (elapsed > seed[i] * 0.9) {
              vx += (home[ix] - pos[ix]) * 0.045 * dtn;
              vy += (home[iy] - pos[iy]) * 0.045 * dtn;
            }
            vx *= damp;
            vy *= damp;
            pos[ix] += vx * dtn;
            pos[iy] += vy * dtn;
            vel[ix] = vx;
            vel[iy] = vy;
          }
          geometry.attributes.position.needsUpdate = true;
          renderer.render({ scene: points });
        },
        destroy() {
          host.removeEventListener("pointermove", setMouse);
          host.removeEventListener("pointerdown", setMouse);
          host.removeEventListener("pointerup", clearMouse);
          host.removeEventListener("pointerleave", clearMouse);
        },
      };
    },
    []
  );

  return (
    <div
      role="img"
      aria-label="The name Damian rendered as thousands of particles that scatter around the cursor and spring back home"
      className="relative h-full w-full overflow-hidden bg-[#07070a]"
    >
      <div ref={hostRef} aria-hidden className="absolute inset-0 cursor-crosshair touch-none" />
      <div className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        6,000 particles — run the cursor through the name
      </div>
    </div>
  );
}
