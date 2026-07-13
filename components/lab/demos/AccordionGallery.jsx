"use client";
import { useState } from "react";
import Image from "next/image";

// Accordion Gallery — a flex row of vertical slats whose grow animates
// through a springy cubic-bezier: the slat under the cursor (or keyboard
// focus) breathes open while its siblings compress and dim. Click locks a
// slat open and reveals its caption; clicking again (or locking another)
// releases it. React state changes only on hover/click — never per frame.
const SLATS = [
  { src: "/lab/photo-1.webp", caption: "Fine art, shot on a phone" },
  { src: "/lab/photo-2.webp", caption: "Golden hour, Galle Face" },
  { src: "/lab/photo-3.webp", caption: "Monsoon light study" },
  { src: "/lab/photo-4.webp", caption: "Street geometry" },
  { src: "/lab/photo-2.webp", caption: "Harbour haze" },
  { src: "/lab/photo-3.webp", caption: "Wet season blues" },
];

export default function AccordionGallery({ reducedMotion }) {
  const [hovered, setHovered] = useState(null);
  // Reduced motion: mount straight into the settled end-state — one slat open.
  const [locked, setLocked] = useState(reducedMotion ? 1 : null);

  const open = hovered ?? locked;
  const grow = (i) =>
    locked === i ? 4.4 : hovered === i ? 3.4 : open != null ? 0.8 : 1;

  return (
    <div className="relative h-full w-full overflow-hidden bg-lab-bg p-4 pb-12 sm:p-6 sm:pb-14">
      <div className="flex h-full w-full gap-1.5 sm:gap-2">
        {SLATS.map((s, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={locked === i}
            aria-label={`${s.caption} — ${locked === i ? "unlock slat" : "lock slat open"}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            onClick={() => setLocked(locked === i ? null : i)}
            style={{
              flexGrow: grow(i),
              "--i": i,
              borderColor: locked === i ? "rgb(59 130 246 / 0.75)" : undefined,
            }}
            className="ag-slat relative h-full min-w-0 basis-0 cursor-pointer overflow-hidden border border-lab-line bg-lab-panel p-0 text-left outline-hidden"
          >
            <Image
              src={s.src}
              alt=""
              fill
              sizes="(max-width: 1024px) 60vw, 40vw"
              className="object-cover"
              draggable={false}
            />
            {/* siblings dim while one slat is open */}
            <div
              aria-hidden
              className="absolute inset-0 bg-black transition-opacity duration-500"
              style={{ opacity: open == null || open === i ? 0 : 0.55 }}
            />
            <span className="absolute left-2 top-2 font-lab-mono text-[9px] tracking-[0.25em] text-white/65">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={`absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3 pt-8 transition-all duration-500 ${
                locked === i
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              }`}
            >
              <span className="block whitespace-nowrap font-lab-mono text-[10px] uppercase tracking-[0.22em] text-white/85">
                {s.caption}
              </span>
              <span className="mt-1 block font-lab-mono text-[9px] uppercase tracking-[0.25em] text-[#3b82f6]">
                locked · click to release
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        hover to open · click to lock
      </p>

      <style jsx>{`
        .ag-slat {
          transition:
            flex-grow 0.75s cubic-bezier(0.34, 1.25, 0.35, 1),
            border-color 0.4s ease;
          animation: ag-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--i) * 65ms);
        }
        @keyframes ag-in {
          from {
            opacity: 0;
            transform: translateY(5%) scaleY(0.92);
          }
        }
      `}</style>
    </div>
  );
}
