"use client";
import { useEffect, useRef } from "react";

// Character pool for the field — dense mix of glyphs matching the reference.
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()[]{}<>/=+-;:_?".split("");
const rnd = () => CHARS[(Math.random() * CHARS.length) | 0];

// GlitchField — decorative, continuously-scrambling field of monospace glyphs
// used as a background texture (e.g. behind "coming soon" cards). Rendered on a
// <canvas> rather than DOM text on purpose: it carries no accessible text
// (it's pure decoration, aria-hidden), so screen readers ignore it AND
// automated contrast audits don't flag the intentionally-faint glyphs. A radial
// mask keeps it brightest in the centre and fades it out at the edges so
// overlaid text stays readable. Reduced-motion users get a single static frame.
export default function GlitchField({ cell = 12, alpha = 0.34, className = "" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Glyph colour + font follow the wrapper's computed style: `text-ink-soft`
    // makes the colour theme-aware, and `font-mono` resolves to the real
    // JetBrains Mono stack (Canvas can't parse the raw `var(--font-mono)`).
    let color = getComputedStyle(wrap).color;
    let fontFamily = getComputedStyle(wrap).fontFamily || "monospace";

    let cols = 0, rows = 0, grid = [], dpr = 1, raf, last = 0;

    const build = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      const colW = cell * 0.62; // monospace glyph advance ≈ 0.62em
      cols = Math.ceil(w / colW) + 1;
      rows = Math.ceil(h / (cell * 1.25)) + 1;
      grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, rnd)
      );
      draw();
    };

    const draw = () => {
      const colW = cell * 0.62;
      const rowH = cell * 1.25;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.font = `${cell}px ${fontFamily}`;
      ctx.textBaseline = "top";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillText(grid[r][c], c * colW, r * rowH);
        }
      }
    };

    build();

    // Redraw once the webfont has actually loaded so glyphs render in
    // JetBrains Mono rather than the fallback captured on first paint.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        fontFamily = getComputedStyle(wrap).fontFamily || fontFamily;
        draw();
      });
    }

    const ro = new ResizeObserver(build);
    ro.observe(wrap);

    // Re-read the glyph colour the moment the theme flips, so the field keeps
    // pace with the rest of the page instead of holding the stale colour.
    const themeObserver = new MutationObserver(() => {
      color = getComputedStyle(wrap).color;
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    if (!reduce) {
      const tick = (t) => {
        if (t - last > 60 && rows && cols) {
          last = t;
          const churn = Math.max(1, Math.floor(rows * cols * 0.05));
          for (let k = 0; k < churn; k++) {
            grid[(Math.random() * rows) | 0][(Math.random() * cols) | 0] = rnd();
          }
          draw();
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      ro.disconnect();
      themeObserver.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cell, alpha]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none select-none overflow-hidden font-mono ${className}`}
      style={{
        WebkitMaskImage:
          "radial-gradient(ellipse 75% 75% at 50% 45%, #000 12%, transparent 78%)",
        maskImage:
          "radial-gradient(ellipse 75% 75% at 50% 45%, #000 12%, transparent 78%)",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
