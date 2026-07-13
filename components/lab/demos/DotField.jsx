"use client";
import { useEffect, useRef } from "react";

// Dot Field — a canvas lattice (~26px pitch) where every dot leans toward the
// pointer with capped inverse-distance falloff and the nearest ones swell and
// ignite toward one electric-blue accent. The pointer inputs are POSITION
// driven and exponentially smoothed (smoothed cursor + a continuous 0..1
// hover presence), so a resting pointer holds a stable dimple in the field —
// no velocity anywhere. With no pointer over the stage a slow breathing wave
// crosses the lattice so the card never looks dead. DPR-aware canvas, resized
// via ResizeObserver; reduced motion renders the static lattice with no loop.

const SPACING = 26;
const DIM = [132, 132, 140]; // lab-dim
const ACCENT = [59, 130, 246]; // the one deliberate color

// Quantized DIM→ACCENT fill styles (33 heat levels) — indexed per dot instead
// of building an rgba template string per dot per frame; alpha rides on
// ctx.globalAlpha so it stays continuous.
const HEAT_LEVELS = 32;
const HEAT_LUT = Array.from({ length: HEAT_LEVELS + 1 }, (_, i) => {
  const h = i / HEAT_LEVELS;
  return `rgb(${(DIM[0] + (ACCENT[0] - DIM[0]) * h) | 0}, ${
    (DIM[1] + (ACCENT[1] - DIM[1]) * h) | 0
  }, ${(DIM[2] + (ACCENT[2] - DIM[2]) * h) | 0})`;
});

export default function DotField({ reducedMotion }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");

    let dpr = 1;
    let w = 0;
    let h = 0;
    let dots = [];

    const drawStatic = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgba(${DIM[0]}, ${DIM[1]}, ${DIM[2]}, 0.4)`;
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.4, 0, 6.2832);
        ctx.fill();
      }
    };

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      // Center the lattice so edge gutters are symmetric at any stage size.
      const cols = Math.max(2, Math.floor(w / SPACING));
      const rows = Math.max(2, Math.floor(h / SPACING));
      const ox = (w - (cols - 1) * SPACING) / 2;
      const oy = (h - (rows - 1) * SPACING) / 2;
      dots = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          dots.push({ x: ox + c * SPACING, y: oy + r * SPACING });
      if (reducedMotion) drawStatic();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);

    if (reducedMotion) return () => ro.disconnect(); // settled lattice, no loop

    const st = {
      px: w / 2, py: h / 2, // raw pointer
      sx: w / 2, sy: h / 2, // smoothed pointer the field actually reacts to
      hov: 0, tHov: 0, // hover presence 0..1
      last: performance.now(),
    };

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      st.px = e.clientX - r.left;
      st.py = e.clientY - r.top;
      st.tHov = 1;
    };
    const onLeave = () => {
      st.tHov = 0; // presence eases out; ambient wave eases back in
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    let raf = null;
    let frame = 0;
    const tick = (now) => {
      frame++;
      // With no hover presence only the slow ambient wave is animating —
      // render at half rate (skip alternate frames; dt-based smoothing and
      // the absolute-time wave are unaffected by the longer step).
      if (st.tHov === 0 && st.hov < 0.02 && (frame & 1)) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(0.05, (now - st.last) / 1000);
      st.last = now;
      st.sx += (st.px - st.sx) * (1 - Math.exp(-dt / 0.1));
      st.sy += (st.py - st.sy) * (1 - Math.exp(-dt / 0.1));
      st.hov += (st.tHov - st.hov) * (1 - Math.exp(-dt / 0.16));

      const t = now * 0.001;
      const amb = 1 - st.hov;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      let basePath = null; // dots indistinguishable from base — one batched fill
      for (const d of dots) {
        const dx = st.sx - d.x;
        const dy = st.sy - d.y;
        const dist = Math.hypot(dx, dy) + 0.001;
        // Lean toward the pointer — inverse-distance, capped so near dots
        // dimple without collapsing onto the cursor.
        const lean = st.hov * Math.min(8, 460 / (dist + 30));
        // Gaussian ignite for the nearest dots.
        const near = st.hov * Math.exp(-(dist * dist) / (2 * 95 * 95));
        // Ambient breathing — a diagonal wave that owns the idle state.
        const wave =
          amb * 0.5 * (1 + Math.sin(d.x * 0.016 + d.y * 0.011 - t * 1.1));
        if (near < 0.004 && wave < 0.02 && lean < 0.4) {
          // Delta from the resting dot is imperceptible — batch it.
          if (!basePath) basePath = new Path2D();
          basePath.moveTo(d.x + 1.3, d.y);
          basePath.arc(d.x, d.y, 1.3, 0, 6.2832);
          continue;
        }
        const nx = d.x + (dx / dist) * lean;
        const ny = d.y + (dy / dist) * lean;
        const heat = Math.min(1, near + wave * 0.22);
        const rad = 1.3 + near * 2.4 + wave * 0.55;
        const a = Math.min(1, 0.28 + 0.62 * heat + wave * 0.2);
        ctx.globalAlpha = a;
        ctx.fillStyle = HEAT_LUT[(heat * HEAT_LEVELS + 0.5) | 0];
        ctx.beginPath();
        ctx.arc(nx, ny, rad, 0, 6.2832);
        ctx.fill();
      }
      if (basePath) {
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = HEAT_LUT[0];
        ctx.fill(basePath);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-[#07070a]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        26px lattice · lean + ignite
      </p>
    </div>
  );
}
