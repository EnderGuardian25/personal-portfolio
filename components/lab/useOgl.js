"use client";
import { useEffect, useRef } from "react";
import { Renderer } from "ogl";

// Shared ogl bootstrap for WebGL demos: renderer creation, DPR clamp (same
// min(dpr, 2) as GlitchField), ResizeObserver sizing, and — critically —
// context release on unmount. LabStage unmounts off-screen demos, so this
// dispose path is what keeps the page under the browser's WebGL context cap.
//
// Usage:
//   useOgl(hostRef, ({ renderer, gl }) => {
//     ...build scene...
//     return {
//       render(t) {...},          // called every rAF while mounted
//       resize(w, h) {...},       // called on host resize (after renderer)
//       destroy() {...},          // optional extra cleanup
//     };
//   }, [deps]);
export default function useOgl(hostRef, setup, deps = []) {
  const sceneRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    const gl = renderer.gl;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    host.appendChild(gl.canvas);

    const size = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h);
      sceneRef.current?.resize?.(w, h);
    };

    renderer.setSize(host.clientWidth || 1, host.clientHeight || 1);
    const scene = setup({ renderer, gl, host });
    sceneRef.current = scene;
    scene?.resize?.(host.clientWidth || 1, host.clientHeight || 1);

    const ro = new ResizeObserver(size);
    ro.observe(host);

    let raf;
    const loop = (t) => {
      scene?.render?.(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene?.destroy?.();
      sceneRef.current = null;
      host.contains(gl.canvas) && host.removeChild(gl.canvas);
      // Explicitly free the context instead of waiting for GC.
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
