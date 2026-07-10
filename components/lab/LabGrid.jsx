"use client";
import { useState } from "react";
import { CATEGORIES, DEMOS } from "@/lib/lab";
import LabStage from "./LabStage";

// Filterable demo grid for the /lab index. Filtering unmounts hidden demos
// entirely (not display:none), which also releases their GL contexts.
export default function LabGrid() {
  const [filter, setFilter] = useState("all");
  const shown =
    filter === "all" ? DEMOS : DEMOS.filter((d) => d.category === filter);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter demos by category"
        className="flex flex-wrap gap-2"
      >
        {[{ id: "all", label: "All" }, ...CATEGORIES].map((c) => {
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
              <span className="ml-2 opacity-60">
                {c.id === "all"
                  ? DEMOS.length
                  : DEMOS.filter((d) => d.category === c.id).length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {shown.map((d) => (
          <div key={d.slug} className={d.span === 2 ? "lg:col-span-2" : ""}>
            <LabStage demo={d} />
          </div>
        ))}
      </div>
    </div>
  );
}
