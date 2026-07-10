"use client";
import { useEffect, useRef } from "react";

// Pixel Dissolve — a canvas grid slices the front scene into cover-mapped
// crops; each block shrink-flips away on its own delayed clock (shuffled
// order + a left→right wave bias) to uncover the scene behind. After a
// generous hold the roles swap and it shatters back the other way. Click
// anywhere to skip the hold. Pure 2D canvas, one draw pass per frame.

const SRCS = ["/lab/photo-1.webp", "/lab/photo-2.webp"];
const COLS = 18;
const BLOCK = 0.55; // per-block flip duration (s)
const SPREAD = 0.9; // delay window across the grid (s)
const HOLD = 2.2; // pause on the revealed scene (s)

export default function PixelDissolve({ reducedMotion }) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");

    let raf = 0;
    let w = 0;
    let h = 0;
    let rows = 12;
    let delays = [];
    let front = 0;
    let back = 1;
    let phase = "run";
    let phaseT = 0;
    let last = performance.now();
    let loaded = 0;
    const imgs = SRCS.map((src) => {
      const im = new Image();
      im.src = src;
      return im;
    });

    // Cover-fit source rect: same crop next/image would produce.
    const cover = (im) => {
      const s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
      return {
        sx: (im.naturalWidth - w / s) / 2,
        sy: (im.naturalHeight - h / s) / 2,
        sw: w / s,
        sh: h / s,
      };
    };

    // Fisher–Yates order → 60% shuffled rank, 40% column wave bias.
    const shuffleDelays = () => {
      rows = Math.max(4, Math.round((COLS * h) / Math.max(1, w)));
      const order = Array.from({ length: COLS * rows }, (_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [order[i], order[j]] = [order[j], order[i]];
      }
      delays = new Array(order.length);
      order.forEach((cell, rank) => {
        delays[cell] =
          (rank / order.length) * SPREAD * 0.6 + ((cell % COLS) / COLS) * SPREAD * 0.4;
      });
    };

    const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

    const draw = (elapsed) => {
      if (loaded < 2 || !w) return;
      const B = cover(imgs[back]);
      const F = cover(imgs[front]);
      ctx.drawImage(imgs[back], B.sx, B.sy, B.sw, B.sh, 0, 0, w, h);
      const bw = w / COLS;
      const bh = h / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < COLS; c++) {
          const local = Math.min(1, Math.max(0, (elapsed - delays[r * COLS + c]) / BLOCK));
          const s = 1 - easeInOut(local);
          if (s <= 0.004) continue;
          const dx = c * bw;
          const dy = r * bh;
          const bleed = s > 0.996 ? 0.75 : 0; // hide hairline seams pre-flip
          const dw = bw * s;
          const dh = bh * s * s; // vertical collapses faster — flip feel
          ctx.drawImage(
            imgs[front],
            F.sx + (dx / w) * F.sw,
            F.sy + (dy / h) * F.sh,
            (bw / w) * F.sw,
            (bh / h) * F.sh,
            dx + (bw - dw) / 2 - bleed / 2,
            dy + (bh - dh) / 2 - bleed / 2,
            dw + bleed,
            dh + bleed
          );
        }
      }
    };

    const beginRun = () => {
      [front, back] = [back, front];
      shuffleDelays();
      phase = "run";
      phaseT = 0;
      if (labelRef.current)
        labelRef.current.textContent = `0${front + 1} → 0${back + 1}`;
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      phaseT += dt;
      if (phase === "run") {
        draw(phaseT);
        if (phaseT >= SPREAD + BLOCK + 0.05) {
          phase = "hold";
          phaseT = 0;
        }
      } else if (phaseT >= HOLD) {
        beginRun();
      }
      raf = requestAnimationFrame(tick);
    };

    const ready = () => {
      if (++loaded < 2) return;
      if (reducedMotion) {
        draw(99); // settled destination scene, no loop
      } else {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    imgs.forEach((im) => {
      if (im.complete && im.naturalWidth) ready();
      else im.onload = ready;
    });

    const ro = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width;
      const ch = entry.contentRect.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(cw * dpr));
      canvas.height = Math.max(1, Math.round(ch * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      w = cw;
      h = ch;
      shuffleDelays();
      if (reducedMotion || phase === "hold") draw(99);
    });
    ro.observe(host);

    const onPointer = () => {
      if (phase === "hold") beginRun(); // skip the hold, reshatter now
    };
    if (!reducedMotion) host.addEventListener("pointerdown", onPointer);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      imgs.forEach((im) => (im.onload = null));
      host.removeEventListener("pointerdown", onPointer);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={hostRef}
      className={`relative h-full w-full overflow-hidden bg-[#07070a] ${
        reducedMotion ? "" : "cursor-pointer"
      }`}
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      <div className="absolute left-4 top-4 z-10 bg-black/35 px-2 py-1 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-white/85 backdrop-blur-sm">
        <span ref={labelRef}>01 → 02</span>
      </div>
      <p className="absolute bottom-4 left-4 z-10 bg-black/35 px-2 py-1 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-white/85 backdrop-blur-sm">
        Click — reshatter early
      </p>
    </div>
  );
}
