"use client";
import { useEffect, useRef } from "react";

// Particle Comet — the cursor is a comet head shedding motes into a cheap
// curl-noise-style swirl field on a 2D canvas. Additive compositing gives each
// particle a blue-hot core inside a soft blue halo; pointerdown detonates a
// radial burst. With no pointer, the head autopilots a lissajous flight path.
const MAX = 520; // particle cap
const HOLD = 1500; // ms after the last pointer move before autopilot resumes

export default function ParticleComet({ reducedMotion }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");

    let dpr = 1, W = 0, H = 0;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      if (reducedMotion) drawStill();
    };

    // Divergence-poor swirl: two phased trig octaves stand in for curl noise.
    const field = (x, y, t) => ({
      x: Math.sin(y * 0.011 + t * 0.9) + 0.6 * Math.cos((x + y) * 0.006 - t * 0.5),
      y: Math.cos(x * 0.009 - t * 0.7) + 0.6 * Math.sin((x - y) * 0.007 + t * 0.4),
    });

    const glow = (x, y, r, a) => {
      ctx.fillStyle = `rgba(37,99,235,${(a * 0.07).toFixed(3)})`; // faint blue halo
      ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(59,130,246,${(a * 0.85).toFixed(3)})`; // blue core
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(219,234,254,${(a * 0.5).toFixed(3)})`; // hot pin
      ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, Math.PI * 2); ctx.fill();
    };

    // reducedMotion → one settled frame: the comet frozen mid-flight.
    const drawStill = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 46; i++) {
        const t = 2.2 - i * 0.03;
        const x = W / 2 + W * 0.3 * Math.sin(t * 0.9);
        const y = H / 2 + H * 0.24 * Math.sin(t * 1.4 + 1);
        glow(x, y, 4.5 * (1 - i / 52) + 0.6, (1 - i / 46) * 0.8);
      }
    };

    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);
    if (reducedMotion) return () => ro.disconnect();

    const parts = [];
    const head = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
    let pointer = null;
    let hovering = false;
    let lastMove = -1e9;

    const emit = (x, y, vx, vy, spread, speed, life) => {
      if (parts.length >= MAX) parts.shift();
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      parts.push({
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * spread,
        vx: vx + Math.cos(a) * s,
        vy: vy + Math.sin(a) * s,
        life: 0,
        max: life * (0.6 + Math.random() * 0.8),
        r: 1.2 + Math.random() * 2.4,
      });
    };

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      hovering = true;
      lastMove = performance.now();
    };
    const onDown = (e) => {
      onMove(e);
      for (let i = 0; i < 90; i++) emit(pointer.x, pointer.y, 0, 0, 8, 8, 900);
    };
    const onLeave = () => {
      hovering = false;
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointerleave", onLeave);

    const t0 = performance.now();
    let prev = t0;
    let raf = requestAnimationFrame(function tick(now) {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(2.5, (now - prev) / 16.7);
      prev = now;
      const t = (now - t0) / 1000;

      // Head: chase the pointer, or fly the lissajous when idle. A hovering
      // pointer is never idle — the comet holds station under a resting
      // cursor; the HOLD grace only applies after the pointer leaves (touch).
      const idle = !pointer || (!hovering && now - lastMove > HOLD);
      const tx = idle ? W / 2 + W * 0.3 * Math.sin(t * 0.9) : pointer.x;
      const ty = idle ? H / 2 + H * 0.24 * Math.sin(t * 1.4 + 1) : pointer.y;
      const k = 1 - Math.pow(idle ? 0.94 : 0.8, dt); // exponential chase
      head.vx = (tx - head.x) * k;
      head.vy = (ty - head.y) * k;
      head.x += head.vx;
      head.y += head.vy;
      for (let i = 0; i < 3; i++)
        emit(head.x, head.y, head.vx * 0.4, head.vy * 0.4, 4, 0.7, 1100);

      // Fade previous frame (destination-out keeps the canvas transparent).
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.24)";
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt * 16.7;
        if (p.life >= p.max) { parts.splice(i, 1); continue; }
        const f = field(p.x, p.y, t);
        p.vx = (p.vx + f.x * 0.1 * dt) * Math.pow(0.965, dt);
        p.vy = (p.vy + f.y * 0.1 * dt) * Math.pow(0.965, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const a = Math.pow(1 - p.life / p.max, 1.6);
        glow(p.x, p.y, p.r * (0.4 + a * 0.6), a);
      }
      glow(head.x, head.y, 4.6, 1); // the comet nucleus itself
    });

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full cursor-crosshair overflow-hidden bg-[#050507]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Move — click to detonate
      </p>
    </div>
  );
}
