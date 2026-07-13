"use client";
import { useState } from "react";
import { DEMOS, SECTIONS } from "@/lib/lab";
import LabStage from "./LabStage";

// Filterable demo grid for the /lab index, grouped into category sections.
// Grouping/counts come precomputed from lib/lab.js SECTIONS (single owner —
// also guarantees section order matches the fullscreen prev/next walk).
// Filtering unmounts hidden demos entirely (not display:none), which also
// releases their GL contexts. Section headers carry real catalog info only
// (label + count) — the demos are the hero, the chrome stays quiet.
export default function LabGrid() {
  const [filter, setFilter] = useState("all");
  const shown = SECTIONS.filter((s) => filter === "all" || filter === s.id);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter demos by category"
        className="flex flex-wrap gap-2"
      >
        {[{ id: "all", label: "All", demos: DEMOS }, ...SECTIONS].map((c) => {
          const on = filter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(c.id)}
              className={`border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                on
                  ? "border-lab-text bg-lab-text text-lab-bg"
                  : "border-lab-line text-lab-dim hover:border-lab-dim hover:text-lab-text"
              }`}
            >
              {c.label}
              <span className="ml-2 opacity-60">{c.demos.length}</span>
            </button>
          );
        })}
      </div>

      {shown.map((c) => (
        <section key={c.id} aria-label={c.label} className="mt-14 first:mt-10">
          <header className="flex items-baseline justify-between gap-4 border-t border-lab-line pt-5">
            <h2 className="font-lab-display text-2xl font-bold uppercase leading-none tracking-tight text-lab-dim sm:text-4xl">
              {c.label}
            </h2>
            <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-lab-dim tabular-nums">
              {c.demos.length} refs
            </span>
          </header>

          <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {c.demos.map((d) => (
              <div key={d.slug} className={d.span === 2 ? "lg:col-span-2" : ""}>
                <LabStage demo={d} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
