"use client";
import { useEffect, useRef } from "react";

// Mosaic Ripple — a dense tile grid where every pointer hit spawns a radial
// wave: each tile evaluates a damped sinusoid of (age − distance/speed), so a
// crest rolls outward, overshoots, and settles. Overlapping ripples simply sum
// per tile. All per-frame work is direct style mutation via refs in one rAF.

const COLS = 16;
const ROWS = 11;
const SPEED = 520; // px/s wavefront
const FREQ = 9; // rad/s carrier — with SPEED this sets the wavelength
const DAMP = 3.2; // local decay after the front passes a tile
const LIFE = 2600; // ms before a ripple stops emitting entirely

export default function MosaicRipple({ reducedMotion }) {
  const wrapRef = useRef(null);
  const tileRefs = useRef([]);

  useEffect(() => {
    if (reducedMotion) return; // settled grid is the end state — no loop

    const wrap = wrapRef.current;
    const tiles = tileRefs.current.filter(Boolean);
    if (!wrap || tiles.length === 0) return;

    let centers = [];
    const resting = new Uint8Array(tiles.length).fill(1);
    const ripples = []; // { x, y, t, amp }
    let raf = null;
    let idleTimer = null;

    const measure = () => {
      const wr = wrap.getBoundingClientRect();
      centers = tiles.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left - wr.left + r.width / 2,
          y: r.top - wr.top + r.height / 2,
        };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);

    const settle = (i) => {
      resting[i] = 1;
      tiles[i].style.transform = "";
      tiles[i].style.filter = "";
      tiles[i].style.backgroundColor = "";
    };

    const tick = () => {
      const now = performance.now();
      for (let r = ripples.length - 1; r >= 0; r--) {
        if (now - ripples[r].t > LIFE) ripples.splice(r, 1);
      }

      for (let i = 0; i < tiles.length; i++) {
        let e = 0;
        for (let r = 0; r < ripples.length; r++) {
          const rp = ripples[r];
          const d = Math.hypot(centers[i].x - rp.x, centers[i].y - rp.y);
          const local = (now - rp.t) / 1000 - d / SPEED; // s since front hit
          if (local <= 0) continue;
          const fade = 1 - (now - rp.t) / LIFE; // whole-ripple energy budget
          e += Math.sin(local * FREQ) * Math.exp(-local * DAMP) * fade * rp.amp;
        }
        if (Math.abs(e) < 0.004) {
          if (!resting[i]) settle(i);
          continue;
        }
        resting[i] = 0;
        e = Math.max(-0.9, Math.min(1.6, e));
        const k = Math.min(1, Math.max(0, e)); // crest → electric blue
        tiles[i].style.transform = `scale(${1 + e * 0.3})`;
        tiles[i].style.filter = `brightness(${1 + Math.max(0, e) * 0.9})`;
        tiles[i].style.backgroundColor = `rgb(${(17 + 42 * k) | 0}, ${
          (17 + 113 * k) | 0
        }, ${(22 + 224 * k) | 0})`;
      }

      if (ripples.length) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
        for (let i = 0; i < tiles.length; i++) if (!resting[i]) settle(i);
      }
    };

    const addRipple = (x, y, amp) => {
      ripples.push({ x, y, t: performance.now(), amp });
      if (ripples.length > 10) ripples.shift();
      if (raf == null) raf = requestAnimationFrame(tick);
    };

    // Ambient idle — a soft auto-ripple keeps the mosaic breathing.
    const scheduleIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        const wr = wrap.getBoundingClientRect();
        addRipple(
          (0.2 + Math.random() * 0.6) * wr.width,
          (0.2 + Math.random() * 0.6) * wr.height,
          0.5
        );
        scheduleIdle();
      }, 2600 + Math.random() * 2400);
    };

    const at = (e, amp) => {
      const r = wrap.getBoundingClientRect();
      addRipple(e.clientX - r.left, e.clientY - r.top, amp);
      scheduleIdle(); // push the ambient wave back while the user plays
    };
    const onDown = (e) => at(e, 1);
    const onEnter = (e) => at(e, 0.55);
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointerenter", onEnter);

    // Entrance: one center ripple announces the mechanic on mount.
    const introTimer = setTimeout(() => {
      const wr = wrap.getBoundingClientRect();
      addRipple(wr.width / 2, wr.height / 2, 0.9);
    }, 260);
    scheduleIdle();

    return () => {
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointerenter", onEnter);
      clearTimeout(introTimer);
      clearTimeout(idleTimer);
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden bg-[#050507] p-5 sm:p-6"
    >
      <div
        aria-hidden
        className="grid h-full w-full gap-1"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <div
            key={i}
            ref={(el) => (tileRefs.current[i] = el)}
            className="rounded-[2px] bg-[#111116]"
          />
        ))}
      </div>
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Tap the mosaic · waves overlap and sum
      </p>
    </div>
  );
}
