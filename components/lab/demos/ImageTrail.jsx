"use client";
import { useEffect, useRef } from "react";

// Image Trail — fast pointer movement sheds photos onto a 2D canvas; each
// stamp blooms in, drifts with its throw direction, and fades out. Classic
// Codrops-style trail, no WebGL needed.
const SOURCES = [
  "/lab/photo-1.webp",
  "/lab/photo-2.webp",
  "/lab/photo-3.webp",
  "/lab/photo-4.webp",
];
const SPAWN_DIST = 56; // px of travel per stamp
const LIFE = 950; // ms per stamp

export default function ImageTrail({ reducedMotion }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || reducedMotion) return;
    const ctx = canvas.getContext("2d");

    const images = SOURCES.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    let dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = wrap.clientWidth * dpr;
      canvas.height = wrap.clientHeight * dpr;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);

    const stamps = [];
    let nextImg = 0;
    let last = null;
    let raf = null;
    let cur = null; // live pointer position while hovering, null when it leaves
    let lastSpawn = 0;

    const spawn = (x, y, vx, vy) => {
      lastSpawn = performance.now();
      stamps.push({
        img: images[nextImg++ % images.length],
        x,
        y,
        vx: vx * 0.35,
        vy: vy * 0.35,
        rot: (Math.random() - 0.5) * 0.5,
        born: performance.now(),
      });
      if (stamps.length > 24) stamps.shift();
      start();
    };

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      cur = { x, y };
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        if (Math.hypot(dx, dy) > SPAWN_DIST) {
          spawn(x, y, dx, dy);
          last = { x, y };
        }
      } else {
        // First contact drops a stamp immediately — hover must show
        // something even before (or without) any travel.
        last = { x, y };
        spawn(x, y, 0, 0);
      }
      start();
    };
    const onLeave = () => {
      cur = null;
      last = null;
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    const tick = () => {
      const now = performance.now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = stamps.length - 1; i >= 0; i--) {
        const s = stamps[i];
        const t = (now - s.born) / LIFE;
        if (t >= 1) {
          stamps.splice(i, 1);
          continue;
        }
        if (!s.img.complete) continue;
        // Ease: quick bloom in, slow melt out.
        const bloom = Math.min(1, t * 5);
        const fade = 1 - Math.max(0, (t - 0.35) / 0.65);
        const scale = 0.65 + bloom * 0.35 + t * 0.12;
        const w = 150 * scale;
        const h = 100 * scale;
        ctx.save();
        ctx.globalAlpha = bloom * fade;
        ctx.translate(s.x + s.vx * t * 2.2, s.y + s.vy * t * 2.2);
        ctx.rotate(s.rot * t);
        ctx.drawImage(s.img, -w / 2, -h / 2, w, h);
        ctx.restore();
      }

      // A resting cursor keeps shedding softly, so hover stays alive
      // without movement.
      if (cur && now - lastSpawn > 640) {
        spawn(cur.x, cur.y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
      }

      if (stamps.length) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };
    const start = () => {
      if (raf == null) raf = requestAnimationFrame(tick);
    };

    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full cursor-crosshair overflow-hidden bg-[#07070a]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p className="font-lab-display text-2xl font-bold uppercase tracking-[0.25em] text-lab-dim/50 sm:text-3xl">
          Move fast
        </p>
      </div>
    </div>
  );
}
