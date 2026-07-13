"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES, labHref } from "@/lib/lab";
import { DEMO_COMPONENTS } from "./registry";
import { useActive, usePrefersReducedMotion } from "./hooks";
import Poster from "./Poster";

// Shell around every demo. Owns the lifecycle rules all demos rely on:
//  - mounts the demo only while on screen + tab visible (useActive) and swaps
//    in the static Poster otherwise, so at most a handful of canvases/GL
//    contexts are ever live;
//  - Replay remounts via key bump;
//  - passes the standard contract { active, reducedMotion, standalone } down.
export default function LabStage({ demo, standalone = false }) {
  const ref = useRef(null);
  const [run, setRun] = useState(0);
  const active = useActive(ref);
  const reducedMotion = usePrefersReducedMotion();
  const Demo = DEMO_COMPONENTS[demo.slug];
  const category = CATEGORIES.find((c) => c.id === demo.category);

  return (
    <figure
      ref={ref}
      // NO `group` class here — the stage wraps every demo, so a stage-level
      // group makes each demo's internal `group-hover:` fire for the whole
      // card (all rows/cells lit at once), not just the hovered element.
      className="relative flex flex-col overflow-hidden border border-lab-line bg-lab-panel"
    >
      <div
        // overflow-hidden also zeroes the flex item's automatic min-height —
        // without it a demo with tall intrinsic content (e.g. an internal
        // scroller full of rows) defeats the aspect ratio and stretches the card.
        className={
          standalone
            ? "relative h-[calc(100dvh-6rem)] min-h-[420px] overflow-hidden"
            : "relative aspect-4/3 overflow-hidden sm:aspect-16/10"
        }
        // Demos size their type in cqw so they scale to the card OR the
        // fullscreen stage, never the viewport.
        style={{ containerType: "inline-size" }}
      >
        {Demo && active ? (
          <Demo
            key={run}
            active={active}
            reducedMotion={reducedMotion}
            standalone={standalone}
          />
        ) : (
          <Poster demo={demo} />
        )}
      </div>

      <figcaption className="flex items-center justify-between gap-4 border-t border-lab-line px-4 py-3 text-[11px] uppercase tracking-[0.18em]">
        <span className="flex min-w-0 items-baseline gap-3">
          <span className="truncate text-lab-text">{demo.title}</span>
          <span className="hidden text-lab-dim sm:inline">
            {category?.label}
          </span>
          {demo.tags.includes("signature") && (
            <span className="text-lab-dim" title="Signature effect">
              ★
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-4 text-lab-dim">
          <button
            type="button"
            onClick={() => setRun((n) => n + 1)}
            className="transition-colors hover:text-lab-text"
          >
            Replay
          </button>
          {!standalone && (
            <Link
              href={labHref(demo.slug)}
              className="transition-colors hover:text-lab-text"
              aria-label={`Open ${demo.title} fullscreen`}
            >
              Full ↗
            </Link>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
