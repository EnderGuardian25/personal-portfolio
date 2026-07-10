"use client";
import { useEffect, useRef } from "react";

// Char Repel — the sentence is split into per-char spans measured once, then a
// rAF loop shoves each glyph away from the cursor with a capped inverse-square
// force and springs it home (direct transform writes via refs, zero React
// state). Displacement drives a small rotation so fleeing letters bank.
const SENTENCE = "Type that refuses to be touched — letters scatter, then settle back into place.";
const RADIUS = 120; // px repulsion reach

export default function CharRepel({ reducedMotion }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || reducedMotion) return;

    const start = performance.now();
    const chars = Array.from(wrap.querySelectorAll("[data-char]")).map(
      (el, i) => ({
        el,
        cx: 0,
        cy: 0,
        x: 0,
        y: 34, // entrance: every glyph springs up into the line, staggered
        vx: 0,
        vy: 0,
        born: start + 220 + i * 14,
      })
    );
    const lastBorn = chars.length ? chars[chars.length - 1].born : start;

    const measure = () => {
      const w = wrap.getBoundingClientRect();
      for (const c of chars) {
        const r = c.el.getBoundingClientRect();
        c.cx = r.left - w.left + r.width / 2 - c.x; // subtract current offset
        c.cy = r.top - w.top + r.height / 2 - c.y;
      }
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);

    let pointer = null;
    let raf = null;
    let prev = performance.now();

    const tick = (now) => {
      const dt = Math.min(2.5, (now - prev) / 16.7);
      prev = now;
      let energy = 0;

      for (const c of chars) {
        if (now < c.born) continue;
        if (pointer) {
          const dx = c.cx + c.x - pointer.x;
          const dy = c.cy + c.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < RADIUS * RADIUS) {
            const d = Math.sqrt(d2) || 1;
            const f = Math.min(5, 22000 / (d2 + 600)); // capped inverse-square
            c.vx += (dx / d) * f * dt;
            c.vy += (dy / d) * f * dt;
          }
        }
        // Underdamped spring home → springy overshoot, exponential settle.
        c.vx = (c.vx - c.x * 0.085 * dt) * Math.pow(0.88, dt);
        c.vy = (c.vy - c.y * 0.085 * dt) * Math.pow(0.88, dt);
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        energy += Math.abs(c.x) + Math.abs(c.y) + Math.abs(c.vx) + Math.abs(c.vy);

        const rot = Math.max(-15, Math.min(15, c.x * 0.24 - c.vy * 0.5));
        c.el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
        c.el.style.opacity = String(Math.min(1, (now - c.born) / 260));
      }

      if (!pointer && energy < 0.5 && now > lastBorn + 500) {
        for (const c of chars) c.el.style.transform = "";
        raf = null; // fully settled — park the loop
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    const run = () => {
      if (raf == null) {
        prev = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    run(); // mount plays the staggered entrance

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      run();
    };
    const onLeave = () => { pointer = null; };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointerdown", onMove); // taps poke the field too

    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onMove);
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  const words = SENTENCE.split(" ");
  const hidden = reducedMotion ? undefined : { opacity: 0, transform: "translateY(34px)" };

  return (
    <div
      ref={wrapRef}
      className="relative flex h-full w-full cursor-crosshair items-center overflow-hidden bg-[#07070a] px-8 sm:px-14"
    >
      <div>
        <p className="mb-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
          № 26 — Repulsion field
        </p>
        <p
          className="max-w-[26ch] font-lab-display font-bold leading-[1.12] text-lab-text"
          style={{ fontSize: "clamp(1.1rem, 4.8cqw, 3.2rem)" }}
        >
          {words.map((word, wi) => (
            <span key={wi}>
              <span className="inline-block whitespace-nowrap">
                {word.split("").map((ch, ci) => (
                  <span
                    key={ci}
                    data-char
                    className="inline-block will-change-transform"
                    style={hidden}
                  >
                    {ch}
                  </span>
                ))}
              </span>
              {wi < words.length - 1 ? " " : null}
            </span>
          ))}
        </p>
      </div>
      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Sweep through the sentence
      </p>
    </div>
  );
}
