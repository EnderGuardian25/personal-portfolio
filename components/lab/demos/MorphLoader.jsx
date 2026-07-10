"use client";
import { useEffect, useRef } from "react";

// Morph Loader — one SVG path re-plotted every frame: ten spoke radii ease
// toward a shuffled morph target (plus a per-spoke sine wobble) so the blob
// never repeats a silhouette. At 100% the spokes collapse to a perfect
// circle and a check strokes in; the whole cycle loops after a long hold.

const N = 10;
const WORDS = ["warming shaders", "seeding noise", "packing glyphs", "binding buffers", "priming cache"];
// Hand-tuned morph targets — same vertex count, different silhouettes.
const TARGETS = [
  [1.0, 0.78, 1.06, 0.9, 1.12, 0.8, 1.0, 0.86, 1.1, 0.76],
  [0.82, 1.1, 0.9, 1.14, 0.84, 1.02, 0.78, 1.12, 0.88, 1.04],
  [1.12, 0.86, 0.8, 1.06, 0.94, 1.14, 0.9, 0.78, 1.02, 0.88],
  [0.9, 1.02, 1.12, 0.8, 1.08, 0.88, 1.14, 0.94, 0.78, 1.06],
];

// Closed smooth curve: quadratic segments through the midpoints of each
// vertex pair — cheap, stable, and morphable (constant command count).
function blobPath(radii, wobbleT) {
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const wob = wobbleT === null ? 0 : 0.035 * Math.sin(wobbleT * 2.1 + i * 1.7);
    const r = 30 * radii[i] * (1 + wob);
    pts.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]);
  }
  const mid = (i) => {
    const p = pts[i % N];
    const q = pts[(i + 1) % N];
    return `${((p[0] + q[0]) / 2).toFixed(2)} ${((p[1] + q[1]) / 2).toFixed(2)}`;
  };
  let d = `M ${mid(0)}`;
  for (let i = 1; i <= N; i++) {
    const v = pts[i % N];
    d += ` Q ${v[0].toFixed(2)} ${v[1].toFixed(2)} ${mid(i % N)}`;
  }
  return d + " Z";
}

export default function MorphLoader({ reducedMotion }) {
  const pathRef = useRef(null);
  const checkRef = useRef(null);
  const pctRef = useRef(null);
  const wordRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const check = checkRef.current;
    const pct = pctRef.current;
    const word = wordRef.current;
    if (!path) return;
    const circle = new Array(N).fill(1);

    if (reducedMotion) {
      // Settled end state: clean circle, check drawn, count at 100.
      path.setAttribute("d", blobPath(circle, null));
      check.style.strokeDashoffset = "0";
      pct.textContent = "100";
      word.textContent = "ready";
      return;
    }

    let raf = 0;
    let last = performance.now();
    let t = 0;
    let radii = TARGETS[0].slice();
    let target = 1;
    let swapAt = 1.0;
    let wordIdx = 0;
    let p = 0;
    let speed = 26; // %/s — re-rolled on every target swap for uneven climbs
    let phase = "load";
    let phaseT = 0;
    check.style.strokeDashoffset = "40";
    path.setAttribute("d", blobPath(radii, 0));

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      phaseT += dt;

      if (phase === "load") {
        const k = 1 - Math.exp(-dt * 4.5); // exponential chase — never linear
        for (let i = 0; i < N; i++) radii[i] += (TARGETS[target][i] - radii[i]) * k;
        if (t >= swapAt) {
          target = (target + 1 + ((Math.random() * (TARGETS.length - 1)) | 0)) % TARGETS.length;
          swapAt = t + 0.9 + Math.random() * 0.5;
          speed = 14 + Math.random() * 34;
          word.textContent = WORDS[++wordIdx % WORDS.length];
        }
        p = Math.min(100, p + dt * speed);
        pct.textContent = String(Math.round(p));
        path.setAttribute("d", blobPath(radii, t));
        if (p >= 100) {
          phase = "settle";
          phaseT = 0;
          word.textContent = "ready";
        }
      } else if (phase === "settle") {
        const k = 1 - Math.exp(-dt * 9);
        for (let i = 0; i < N; i++) radii[i] += (1 - radii[i]) * k;
        path.setAttribute("d", blobPath(radii, null));
        if (phaseT > 0.55) {
          phase = "check";
          phaseT = 0;
        }
      } else if (phase === "check") {
        const e = Math.min(1, phaseT / 0.45);
        check.style.strokeDashoffset = String(40 * Math.pow(1 - e, 3)); // ease-out draw
        if (phaseT > 2.8) {
          // generous hold, then loop from zero
          phase = "load";
          phaseT = 0;
          p = 0;
          pct.textContent = "0";
          swapAt = t + 0.9;
          speed = 14 + Math.random() * 34;
          check.style.strokeDashoffset = "40";
          word.textContent = WORDS[++wordIdx % WORDS.length];
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-[#07070a] p-6">
      <svg
        viewBox="0 0 100 100"
        aria-hidden
        className="overflow-visible"
        style={{ width: "clamp(96px, 34cqw, 320px)" }}
      >
        <path
          ref={pathRef}
          fill="rgba(59,130,246,0.08)"
          stroke="#3b82f6"
          strokeWidth="1.4"
          style={{ filter: "drop-shadow(0 0 16px rgba(59,130,246,0.35))" }}
        />
        <path
          ref={checkRef}
          d="M38 52 L47 60 L64 42"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="40"
          strokeDashoffset="40"
        />
      </svg>
      <div
        className="flex items-baseline gap-1 font-lab-display font-extrabold leading-none text-lab-text"
        style={{ fontSize: "clamp(1.6rem, 9cqw, 6rem)" }}
      >
        <span ref={pctRef}>0</span>
        <span className="text-[0.35em] text-lab-dim">%</span>
      </div>
      <p ref={wordRef} className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        warming shaders
      </p>
      <p className="absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Loops — fresh morph targets each pass
      </p>
    </div>
  );
}
