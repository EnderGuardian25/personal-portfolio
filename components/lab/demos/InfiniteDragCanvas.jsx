"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Infinite Drag Canvas — a 2D plane of image and type tiles driven by rAF +
// direct transforms. Every tile's position wraps modulo the plane period each
// frame, so the field repeats endlessly in all directions with no edges;
// scale/opacity fall off with distance from center, and release inherits a
// smoothed, decaying throw velocity. Mount plays an automatic glide-in.

const CONTENT = [
  { img: "/lab/photo-1.webp" },
  { word: "DRIFT", idx: "01" },
  { img: "/lab/photo-2.webp" },
  { img: "/lab/photo-3.webp" },
  { word: "WRAP", idx: "02", accent: true },
  { img: "/lab/photo-4.webp" },
  { word: "THROW", idx: "03" },
  { img: "/lab/photo-2.webp" },
];

const wrap = (v, size) => ((v % size) + size) % size;
const FRICTION = 0.955; // per-frame decay — long, satisfying glide

export default function InfiniteDragCanvas({ reducedMotion }) {
  const wrapRef = useRef(null);
  const tileRefs = useRef([]);
  const [grid, setGrid] = useState(null);

  // Derive a tile lattice that overspans the stage by one full period in each
  // axis, so the modulo wrap can never expose a gap at any stage size.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (!W || !H) return;
      const cw = Math.round(Math.min(340, Math.max(190, W * 0.32)));
      const ch = Math.round(cw * 0.68);
      const sx = Math.round(cw * 1.16);
      const sy = Math.round(ch * 1.24);
      setGrid({ cols: Math.ceil(W / sx) + 1, rows: Math.ceil(H / sy) + 1, cw, ch, sx, sy, W, H });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !grid) return;
    const { cols, rows, cw, ch, sx, sy, W, H } = grid;
    const planeW = cols * sx;
    const planeH = rows * sy;
    const maxD = Math.hypot(W, H) * 0.55;
    const cam = { x: 0, y: 0, vx: -9, vy: -4.5 }; // the mount throw IS the intro

    const layout = () => {
      const nodes = tileRefs.current;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node) continue;
        const row = (i / cols) | 0;
        const bx = (i % cols) * sx + (row % 2 ? sx * 0.5 : 0); // brick offset
        const x = wrap(bx + cam.x, planeW) - sx;
        const y = wrap(row * sy + cam.y, planeH) - sy;
        const d = Math.min(1, Math.hypot(x + cw / 2 - W / 2, y + ch / 2 - H / 2) / maxD);
        node.style.transform = `translate3d(${x}px,${y}px,0) scale(${1.05 - d * 0.16})`;
        node.style.opacity = String(1 - d * 0.4);
      }
    };

    if (reducedMotion) {
      cam.vx = cam.vy = 0;
      layout(); // settled end state, single static frame
      return;
    }

    let raf;
    let dragging = false;
    const tick = () => {
      if (!dragging) {
        cam.x += cam.vx;
        cam.y += cam.vy;
        cam.vx *= FRICTION;
        cam.vy *= FRICTION;
      }
      layout();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let last = null;
    let lastT = 0;
    const down = (e) => {
      dragging = true;
      last = { x: e.clientX, y: e.clientY };
      lastT = performance.now();
      cam.vx = cam.vy = 0;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e) => {
      if (!dragging || !last) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      lastT = performance.now();
      cam.x += dx;
      cam.y += dy;
      // Smooth the throw across events; clamp so a wild flick glides, never teleports.
      cam.vx = Math.max(-38, Math.min(38, cam.vx * 0.4 + dx * 0.65));
      cam.vy = Math.max(-38, Math.min(38, cam.vy * 0.4 + dy * 0.65));
    };
    const up = () => {
      dragging = false;
      last = null;
      if (performance.now() - lastT > 90) cam.vx = cam.vy = 0; // held still: no throw
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [grid, reducedMotion]);

  const count = grid ? grid.cols * grid.rows : 0;
  tileRefs.current.length = count;

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full cursor-grab overflow-hidden bg-[#07070a] active:cursor-grabbing"
      style={{ touchAction: "none" }}
    >
      {grid &&
        Array.from({ length: count }, (_, i) => {
          const c = CONTENT[i % CONTENT.length];
          return (
            <div
              key={`${grid.cols}x${grid.rows}-${i}`}
              ref={(n) => (tileRefs.current[i] = n)}
              className="absolute left-0 top-0 overflow-hidden will-change-transform"
              style={{ width: grid.cw, height: grid.ch, opacity: 0 }}
              aria-hidden
            >
              {c.img ? (
                <Image src={c.img} alt="" fill sizes="340px" className="object-cover" draggable={false} />
              ) : (
                <div className="flex h-full w-full flex-col justify-between border border-lab-line bg-lab-panel p-3">
                  <span className="font-lab-mono text-[10px] tracking-[0.3em] text-lab-dim">{c.idx} / ∞</span>
                  <span
                    className={`font-lab-display font-bold uppercase leading-none tracking-tight ${
                      c.accent ? "text-[#3b82f6]" : "text-lab-text"
                    }`}
                    style={{ fontSize: grid.cw * 0.17 }}
                  >
                    {c.word}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }}
        aria-hidden
      />
      <p className="pointer-events-none absolute bottom-4 left-5 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Drag &amp; throw — the plane wraps forever
      </p>
    </div>
  );
}
