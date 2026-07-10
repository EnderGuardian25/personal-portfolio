"use client";
import { useEffect, useRef } from "react";
import { Geometry, Program, Mesh, Texture, Flowmap, Vec2 } from "ogl";
import useOgl from "../useOgl";

// X-Ray Hero (signature). A Flowmap — a ping-pong FBO pair holding a decaying
// pointer-trail texture — masks between the front image and a hidden text
// layer. Dissipation < 1 makes the trail heal itself closed; the trail's RG
// velocity channels warp the front image at the reveal edge for the streak.
const FRONT_SRC = "/lab/photo-2.webp";

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

  const size = Math.min(w / 7.2, h / 3.4);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${size}px ${displayVar}, sans-serif`;
  ctx.fillStyle = "#3b82f6";
  ctx.fillText("UNDER THE", w / 2, h / 2 - size * 0.62);
  ctx.fillStyle = "#e8e8e6";
  ctx.fillText("SURFACE", w / 2, h / 2 + size * 0.52);

  ctx.font = `500 ${Math.max(11, size * 0.11)}px ${monoVar}, monospace`;
  ctx.fillStyle = "rgba(232,232,230,0.55)";
  ctx.fillText(
    "EVERY IMAGE HIDES A SECOND STORY — KEEP LOOKING",
    w / 2,
    h / 2 + size * 1.35
  );
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
        },
      });
      const mesh = new Mesh(gl, { geometry, program });

      // Pointer → flowmap splat. pointermove covers mouse AND touch-drag.
      const mouse = new Vec2(-1, -1);
      const velocity = new Vec2();
      const lastMouse = new Vec2();
      let lastTime = null;
      let interacted = false;

      const onPointerMove = (e) => {
        interacted = true;
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

          if (!velocity.needsUpdate) {
            mouse.set(-1, -1);
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
