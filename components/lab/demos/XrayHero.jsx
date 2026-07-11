"use client";
import { useEffect, useRef } from "react";
import { Geometry, Program, Mesh, Texture, Flowmap, Vec2 } from "ogl";
import useOgl from "../useOgl";

// X-Ray Hero (signature). A Flowmap — a ping-pong FBO pair holding a decaying
// pointer-trail texture — masks between the front image and a hidden text
// layer. Dissipation < 1 makes the trail heal itself closed; the trail's RG
// velocity channels warp the front image at the reveal edge for the streak.
//
// The hover reveal is a SEPARATE system from the trail: a radial aperture
// composited in the fragment shader (f = max(trail, aperture)) rides the
// cursor at CONSTANT size — moving or resting — so there is no moving↔still
// transition to read at all; movement just leaves the streaky trail healing
// behind it. (Never feed the flowmap fake velocity for this: it can only
// make velocity-shaped marks — swirl, pulse, partial coverage.) A smoothed
// "stillness" value still drives dissipation, so a trail lingers while the
// pointer rests and heals normally otherwise.
const FRONT_SRC = "/lab/photo-2.webp";

const APERTURE_R = 0.34; // aperture outer radius — fraction of stage height
const APERTURE_CORE = 0.58; // inner fraction of R held at full reveal
const STILL_SPEED = 220; // px/s — pointer speed at which stillness hits 0 (trail linger only)
const RISE_TAU = 260; // ms — aperture open time constant on enter (frame-rate independent)
const FALL_TAU = 220; // ms — aperture close time constant on leave
const DISS_BASE = 0.982; // trail heal rate while moving (half-life ~0.6s)
const DISS_STILL = 0.996; // trail heal rate at rest (half-life ~2.9s)

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
  uniform sampler2D tFront;
  uniform sampler2D tBack;
  uniform sampler2D tFlow;
  uniform vec2 uPlaneRes;
  uniform vec2 uFrontRes;
  uniform vec2 uPointer;
  uniform float uHover;
  uniform float uAspect;
  varying vec2 vUv;

  vec2 cover(vec2 uv, vec2 plane, vec2 img) {
    float pa = plane.x / plane.y;
    float ia = img.x / img.y;
    vec2 scale = pa > ia ? vec2(1.0, ia / pa) : vec2(pa / ia, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec3 flow = texture2D(tFlow, vUv).rgb;
    float f = clamp(flow.b, 0.0, 1.0);
    // Stationary-hover aperture: a soft circle around the resting pointer,
    // composited over the trail so a stopped cursor reads FULLY through.
    vec2 ap = vUv - uPointer;
    ap.x *= uAspect;
    f = max(f, uHover * (1.0 - smoothstep(${(APERTURE_R * APERTURE_CORE).toFixed(3)}, ${APERTURE_R.toFixed(3)}, length(ap))));
    float mask = smoothstep(0.12, 0.55, f);
    vec2 uvFront = cover(vUv, uPlaneRes, uFrontRes) + flow.rg * 0.05 * (1.0 - mask);
    vec3 front = texture2D(tFront, uvFront).rgb;
    vec3 back = texture2D(tBack, vUv).rgb;
    float edge = smoothstep(0.03, 0.2, f) * (1.0 - smoothstep(0.35, 0.75, f));
    vec3 col = mix(front, back, mask);
    col += edge * vec3(0.23, 0.51, 0.96) * 0.45;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// The hidden layer: type rendered to a 2D canvas at plane resolution, so the
// shader samples it 1:1 (no cover math needed).
function drawBackLayer(canvas, w, h, dpr) {
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = "#07070a";
  ctx.fillRect(0, 0, w, h);

  const displayVar =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-lab-display")
      .trim() || "sans-serif";
  const monoVar =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-lab-mono")
      .trim() || "monospace";

  // Fit the block to the frame: clamp the display size so the widest line
  // stays inside the stage, whatever its aspect ratio.
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let size = Math.min(w / 7.2, h / 3.4);
  ctx.font = `800 ${size}px ${displayVar}, sans-serif`;
  const widest = Math.max(
    ctx.measureText("UNDER THE").width,
    ctx.measureText("SURFACE").width
  );
  if (widest > w * 0.84) {
    size *= (w * 0.84) / widest;
    ctx.font = `800 ${size}px ${displayVar}, sans-serif`;
  }
  ctx.fillStyle = "#3b82f6";
  ctx.fillText("UNDER THE", w / 2, h / 2 - size * 0.62);
  ctx.fillStyle = "#e8e8e6";
  ctx.fillText("SURFACE", w / 2, h / 2 + size * 0.52);

  const tagline = "EVERY IMAGE HIDES A SECOND STORY — KEEP LOOKING";
  let mono = Math.max(11, size * 0.11);
  ctx.font = `500 ${mono}px ${monoVar}, monospace`;
  const tw = ctx.measureText(tagline).width;
  if (tw > w * 0.9) {
    mono = Math.max(8, mono * ((w * 0.9) / tw));
    ctx.font = `500 ${mono}px ${monoVar}, monospace`;
  }
  ctx.fillStyle = "rgba(232,232,230,0.55)";
  ctx.fillText(tagline, w / 2, h / 2 + size * 1.35);
}

export default function XrayHero({ reducedMotion }) {
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

      const flowmap = new Flowmap(gl, {
        falloff: 0.28,
        dissipation: 0.982, // < 1 → the streak slowly heals closed
        alpha: 1,
      });

      const front = new Texture(gl, { generateMipmaps: false });
      const frontImg = new Image();
      frontImg.onload = () => {
        front.image = frontImg;
        program.uniforms.uFrontRes.value.set(
          frontImg.naturalWidth,
          frontImg.naturalHeight
        );
      };
      frontImg.src = FRONT_SRC;

      const backCanvas = document.createElement("canvas");
      const back = new Texture(gl, {
        image: backCanvas,
        generateMipmaps: false,
        flipY: true,
      });

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          tFront: { value: front },
          tBack: { value: back },
          tFlow: flowmap.uniform,
          uPlaneRes: { value: new Vec2(1, 1) },
          uFrontRes: { value: new Vec2(1, 1) },
          uPointer: { value: new Vec2(-1, -1) },
          uHover: { value: 0 },
          uAspect: { value: 1 },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });

      // Pointer → flowmap splat. pointermove covers mouse AND touch-drag.
      const mouse = new Vec2(-1, -1);
      const velocity = new Vec2();
      const lastMouse = new Vec2();
      let lastTime = null;
      let interacted = false;
      let hovering = false;

      // Stillness tracking: per-frame pointer speed, EMA-smoothed. Continuous
      // 0..1 (not a moving/resting switch) so the aperture and dissipation
      // crossfade — a binary regime flip is what made slow movement choppy.
      const framePos = new Vec2();
      let framePosInit = false;
      let speedEma = 0;
      let hoverAmt = 0;
      let prevFrameMs = null;

      const onPointerLeave = () => {
        hovering = false;
      };
      const onPointerMove = (e) => {
        interacted = true;
        hovering = true;
        const rect = host.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1 - (e.clientY - rect.top) / rect.height;
        if (lastTime === null) {
          lastTime = performance.now();
          lastMouse.set(e.clientX, e.clientY);
        }
        const dx = e.clientX - lastMouse.x;
        const dy = e.clientY - lastMouse.y;
        lastMouse.set(e.clientX, e.clientY);
        const now = performance.now();
        const dt = Math.max(14, now - lastTime);
        lastTime = now;
        mouse.set(x, y);
        velocity.set(dx / dt, -dy / dt);
        velocity.needsUpdate = true;
      };
      host.addEventListener("pointermove", onPointerMove);
      host.addEventListener("pointerleave", onPointerLeave);

      // Fonts can land after the first draw — repaint the hidden layer then.
      const repaintBack = () => {
        drawBackLayer(
          backCanvas,
          host.clientWidth || 1,
          host.clientHeight || 1,
          Math.min(window.devicePixelRatio || 1, 2)
        );
        back.image = backCanvas;
        back.needsUpdate = true;
      };
      document.fonts?.ready?.then(repaintBack);

      const start = performance.now();

      return {
        resize(w, h) {
          program.uniforms.uPlaneRes.value.set(w, h);
          program.uniforms.uAspect.value = w / h;
          flowmap.aspect = w / h;
          repaintBack();
        },
        render() {
          if (reducedRef.current) {
            // Static front image: flowmap stays empty → mask = 0.
            renderer.render({ scene: mesh });
            return;
          }

          // Intro sweep so touch users (no hover) see the effect immediately;
          // hands off as soon as a real pointer arrives.
          const t = (performance.now() - start) / 1000;
          if (!interacted && t < 2.2) {
            const p = t / 2.2;
            const sx = 0.12 + p * 0.76;
            const sy = 0.5 + Math.sin(p * Math.PI * 2.2) * 0.18;
            velocity.set((sx - mouse.x) * 6, (sy - mouse.y) * 6);
            mouse.set(sx, sy);
            velocity.needsUpdate = true;
          }

          // Stillness → aperture strength + trail heal rate. Speed is measured
          // per FRAME from the last event position, so intermittent pointer
          // events at slow speeds read as slow, not as bursts of fast/still.
          const nowMs = performance.now();
          const dtMs = prevFrameMs == null ? 16.7 : Math.min(50, nowMs - prevFrameMs);
          prevFrameMs = nowMs;
          let speed = 0;
          if (hovering && framePosInit) {
            speed =
              (Math.hypot(lastMouse.x - framePos.x, lastMouse.y - framePos.y) /
                dtMs) *
              1000;
          }
          framePos.set(lastMouse.x, lastMouse.y);
          framePosInit = hovering;
          // Time-based smoothing (1 - e^(-dt/tau)) — per-frame lerp factors
          // would run ~2.4x faster on a 144Hz display than on 60Hz.
          speedEma += (speed - speedEma) * (1 - Math.exp(-dtMs / 70));
          const stillness = hovering
            ? Math.max(0, 1 - speedEma / STILL_SPEED)
            : 0;
          // Aperture: full whenever hovering — constant size moving or still,
          // so the only fades are pointer enter/leave.
          hoverAmt +=
            ((hovering ? 1 : 0) - hoverAmt) *
            (1 - Math.exp(-dtMs / (hovering ? RISE_TAU : FALL_TAU)));
          program.uniforms.uHover.value = hoverAmt;
          // Freeze uPointer on leave so the closing aperture fades in place —
          // copying the parked (-1,-1) mouse would teleport it offscreen.
          if (hovering) program.uniforms.uPointer.value.copy(mouse);
          // Trail linger is still stillness-driven: slow the heal while the
          // pointer rests, normal heal while sweeping (a slow rate while
          // moving would accumulate into a fully revealed stage).
          flowmap.mesh.program.uniforms.uDissipation.value =
            DISS_BASE + (DISS_STILL - DISS_BASE) * stillness;

          if (!velocity.needsUpdate) {
            // No event this frame: the aperture owns the resting reveal — the
            // flowmap just stops receiving energy (no fake wobble velocity).
            if (!hovering) mouse.set(-1, -1);
            velocity.set(0, 0);
          }
          velocity.needsUpdate = false;
          flowmap.mouse.copy(mouse);
          flowmap.velocity.lerp(velocity, velocity.len() ? 0.5 : 0.1);
          flowmap.update();
          renderer.render({ scene: mesh });
        },
        destroy() {
          host.removeEventListener("pointermove", onPointerMove);
          host.removeEventListener("pointerleave", onPointerLeave);
        },
      };
    },
    []
  );

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label="Photograph that reveals hidden text where the cursor passes, healing closed again"
      className="h-full w-full cursor-crosshair touch-none"
    />
  );
}
