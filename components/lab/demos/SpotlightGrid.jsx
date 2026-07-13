"use client";
import { useEffect, useRef } from "react";

// Inspector Spotlight (rework of the old spotlight-grid — same slug). The old
// version was a dim card grid that brightened under the cursor, which read as
// a twin of glow-cards. Now the mask-clone trick reveals genuinely DIFFERENT
// content: a finished mini-site renders twice — the built UI as the base, and
// an "inspect" clone on top (dashed element outlines, tag chips via
// content: attr(data-el), stroked ghost type, baseline/column guides) masked
// to a radial beam at the pointer. Identical markup in both layers keeps them
// registered; the inspect look is pure CSS overrides under .spot-inspect.
// Stationary rule: the beam is position-driven (CSS vars), so a resting
// pointer holds the inspection; only enter/leave fade via an opacity
// transition. No rAF loop at all.
// Reduced motion: no listeners — a static beam parks over the headline.
const STATS = [
  ["24", "Projects shipped"],
  ["04", "Weeks avg. build"],
  ["100", "Lighthouse perf"],
];

// Sizing note: type/padding use cqw clamps, never viewport (sm:) variants —
// on a desktop viewport a media query would give the small index card the
// fullscreen sizes and the hero content bleeds out of its panel.
function MiniSite() {
  return (
    <div
      className="relative flex h-full w-full flex-col"
      style={{
        gap: "clamp(10px, 2cqw, 16px)",
        padding: "clamp(14px, 3cqw, 28px)",
        // extra bottom room so the stage caption never rides the stats row
        paddingBottom: "clamp(34px, 6cqw, 48px)",
      }}
    >
      {/* baseline + column guides — visible only in the inspect clone */}
      <div aria-hidden className="spot-guides pointer-events-none absolute inset-0" />

      <div
        data-el="<nav>"
        className="relative flex shrink-0 items-center justify-between border border-lab-line bg-lab-panel px-4 py-2.5"
      >
        <span className="font-lab-display text-xs font-bold tracking-wide text-lab-text">
          FOUNDRY®
        </span>
        <div className="hidden gap-4 font-lab-mono text-[9px] uppercase tracking-[0.2em] text-lab-dim sm:flex">
          <span>Work</span>
          <span>Studio</span>
          <span>Notes</span>
        </div>
        <span
          data-el="<a.cta>"
          className="relative bg-[#3b82f6] px-3 py-1 font-lab-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white"
        >
          Start
        </span>
      </div>

      <div
        data-el="<header>"
        className="relative flex min-h-0 flex-1 flex-col justify-center gap-2 overflow-hidden border border-lab-line bg-lab-panel py-3"
        style={{ paddingInline: "clamp(16px, 3cqw, 28px)" }}
      >
        <span className="font-lab-mono text-[9px] uppercase tracking-[0.3em] text-[#3b82f6]">
          Studio — est. 2026
        </span>
        <h3
          data-el="<h1>"
          data-stroke
          className="relative font-lab-display font-extrabold leading-[0.95] tracking-tight text-lab-text"
          style={{ fontSize: "clamp(17px, 4.5cqw, 42px)" }}
        >
          Ship the whole idea.
        </h3>
        <p className="font-lab-mono text-[10px] tracking-wide text-lab-dim">
          Design, build, launch — one pair of hands.
        </p>
        <div className="mt-1 flex gap-2">
          <span
            data-el="<button>"
            className="relative bg-[#3b82f6] px-4 py-1.5 font-lab-mono text-[10px] font-bold text-white"
          >
            See work
          </span>
          <span className="border border-lab-line px-4 py-1.5 font-lab-mono text-[10px] text-lab-dim">
            Process
          </span>
        </div>
      </div>

      <div data-el="<ul.stats>" className="relative grid shrink-0 grid-cols-3 gap-3">
        {STATS.map(([stat, label]) => (
          <div
            key={label}
            data-el="<li>"
            className="relative flex flex-col gap-1 border border-lab-line bg-lab-panel p-3"
          >
            <span className="font-lab-mono text-sm text-lab-text">{stat}</span>
            <span className="font-lab-mono text-[8px] uppercase tracking-[0.2em] text-lab-dim">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SpotlightGrid({ reducedMotion }) {
  const wrapRef = useRef(null);
  const readRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return; // static beam via inline vars — no listeners
    const wrap = wrapRef.current;
    const read = readRef.current;
    if (!wrap) return;

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      wrap.style.setProperty("--sx", `${x.toFixed(1)}px`);
      wrap.style.setProperty("--sy", `${y.toFixed(1)}px`);
      wrap.style.setProperty("--on", "1");
      if (read) read.textContent = `${Math.round(x)} · ${Math.round(y)}`;
    };
    const onLeave = () => wrap.style.setProperty("--on", "0");
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={wrapRef}
      style={{ "--sx": "62%", "--sy": "42%", "--on": reducedMotion ? 1 : 0 }}
      className={`spot-wrap relative h-full w-full cursor-crosshair overflow-hidden bg-[#050508] ${
        reducedMotion ? "spot-static" : ""
      }`}
    >
      <div className="absolute inset-0">
        <MiniSite />
      </div>

      {/* inspect clone — identical markup, restyled + masked to the beam */}
      <div aria-hidden className="spot-inspect spot-lit absolute inset-0">
        <MiniSite />
      </div>

      <div aria-hidden className="spot-ring" />
      <div ref={readRef} aria-hidden className="spot-read font-lab-mono text-[9px] tracking-[0.2em] text-[#3b82f6]" />

      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        the beam inspects the build — rest anywhere, it holds
      </p>

      <style jsx global>{`
        .spot-lit {
          background: #050508;
          opacity: var(--on);
          transition: opacity 0.3s ease;
          -webkit-mask-image: radial-gradient(
            circle 165px at var(--sx) var(--sy),
            #000 58%,
            rgb(0 0 0 / 0.35) 72%,
            transparent 82%
          );
          mask-image: radial-gradient(
            circle 165px at var(--sx) var(--sy),
            #000 58%,
            rgb(0 0 0 / 0.35) 72%,
            transparent 82%
          );
        }
        /* wireframe theme: kill fills, ghost every color to the accent */
        .spot-inspect * {
          color: rgb(120 170 255 / 0.6) !important;
          border-color: rgb(59 130 246 / 0.28) !important;
          background: transparent !important;
        }
        .spot-inspect [data-el] {
          outline: 1px dashed rgb(59 130 246 / 0.55);
          outline-offset: -1px;
        }
        .spot-inspect [data-el]::before {
          content: attr(data-el);
          position: absolute;
          top: -6px;
          left: 6px;
          z-index: 1;
          padding: 0 4px;
          background: #050508;
          border: 1px solid rgb(59 130 246 / 0.35);
          color: #3b82f6;
          font-family: var(--font-lab-mono), monospace;
          font-size: 8px;
          line-height: 12px;
          letter-spacing: 0.08em;
        }
        .spot-inspect [data-stroke] {
          color: transparent !important;
          -webkit-text-stroke: 1px rgb(120 170 255 / 0.65);
        }
        .spot-guides {
          display: none;
        }
        .spot-inspect .spot-guides {
          display: block;
          /* !important — the .spot-inspect * fill-kill above resets background */
          background-image: repeating-linear-gradient(
              to bottom,
              rgb(59 130 246 / 0.06) 0 1px,
              transparent 1px 8px
            ),
            repeating-linear-gradient(
              to right,
              rgb(59 130 246 / 0.05) 0 1px,
              transparent 1px 64px
            ) !important;
        }
        .spot-ring {
          position: absolute;
          left: -120px;
          top: -120px;
          width: 240px;
          height: 240px;
          border: 1px solid rgb(59 130 246 / 0.4);
          border-radius: 9999px;
          transform: translate(var(--sx), var(--sy));
          opacity: var(--on);
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .spot-read {
          position: absolute;
          left: 0;
          top: 0;
          transform: translate(var(--sx), calc(var(--sy) + 128px)) translate(-50%, 0);
          opacity: var(--on);
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .spot-static .spot-ring,
        .spot-static .spot-read {
          display: none;
        }
      `}</style>
    </div>
  );
}
