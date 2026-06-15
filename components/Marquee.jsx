"use client";

const words = [
  "Creative Technologist",
  "✦",
  "Code",
  "✦",
  "Design",
  "✦",
  "Curiosity",
  "✦",
  "Colombo · Sri Lanka",
  "✦",
  "Portfolio Vol. 02",
  "✦",
];

export default function Marquee() {
  return (
    <section aria-hidden className="relative border-y border-rule bg-paper py-6 md:py-8 overflow-hidden">
      <div className="flex marquee-track whitespace-nowrap">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex shrink-0 items-center gap-12 pr-12">
            {words.map((w, j) => (
              <span
                key={`${i}-${j}`}
                className={`font-display ${w === "✦" ? "text-electric text-3xl" : "italic text-ink"} text-3xl md:text-5xl leading-none`}
              >
                {w}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
