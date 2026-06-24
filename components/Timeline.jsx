"use client";
import Reveal from "./Reveal";

const entries = [
  {
    year: "2026",
    title: "This portfolio",
    place: "Personal project · Next.js & Framer Motion",
    detail:
      "Designed and built this site as a living journal of my work — something I'll keep refining across the rest of university.",
    accent: true,
  },
  {
    year: "2026",
    title: "Personal Dashboard",
    place: "Side project",
    detail: "A self-updating homepage I open every morning. RSS, reading queue, and quick links.",
  },
  {
    year: "2025 — 2026",
    title: "Completed first year",
    place: "IIT · University of Westminster",
    detail:
      "Wrapped up the first year of my BSc (Hons) Computer Science, building the fundamentals across programming, systems, and problem-solving.",
  },
  {
    year: "Sep 2025",
    title: "Began BSc (Hons) Computer Science",
    place: "IIT · University of Westminster",
    detail:
      "Started my degree — the formal beginning of turning a self-taught hobby into a craft.",
  },
  {
    year: "2022 — 2024",
    title: "Edexcel A-Levels",
    place: "St. Joseph's College, Colombo 10",
    detail:
      "Pearson Edexcel IAL in Mathematics, Physics, and Chemistry — alongside leading the student body as Head Prefect.",
  },
  {
    year: "2024",
    title: "First lines of code",
    place: "Self-taught · web development",
    detail:
      "Started teaching myself web development — HTML, CSS, then JavaScript — and began collecting small projects on GitHub.",
  },
  {
    year: "2020",
    title: "Video games as a hobby",
    place: "Curiosity",
    detail:
      "Fell deep into video games — equal parts play and a quiet fascination with how the worlds behind the screen were actually built.",
  },
  {
    year: "2018",
    title: "Where it began",
    place: "Self-taught · Scratch, Micro:bit & Arduino",
    detail:
      "My very first taste of making things — block-coding in Scratch, then wiring up Micro:bit and Arduino. The spark that started this whole journey.",
  },
];

export default function Timeline() {
  return (
    <section id="timeline" className="relative px-6 md:px-10 py-32 md:py-44 border-t border-rule bg-paper">
      <div className="grid grid-cols-12 gap-6 mb-16 md:mb-24">
        <div className="col-span-12 md:col-span-3">
          <div className="section-label">§ 05 — Timeline</div>
        </div>
        <div className="col-span-12 md:col-span-9 md:col-start-4">
          <Reveal>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight text-ink">
              How I got <span className="italic text-electric">here</span>.
            </h2>
          </Reveal>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-9 md:col-start-4 relative">
          {/* vertical line */}
          <div className="absolute left-4 md:left-0 top-0 bottom-0 w-px rule-v" aria-hidden />

          <ol className="flex flex-col gap-12 md:gap-16">
            {entries.map((e, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <li className="relative pl-12 md:pl-20">
                  <span
                    className={`absolute left-[11px] md:left-[-5px] top-3 w-2.5 h-2.5 rounded-full ${
                      e.accent ? "bg-electric" : "bg-ink"
                    }`}
                  />
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft mb-2">
                    {e.year} &mdash; {e.place}
                  </div>
                  <h3 className="font-display text-3xl md:text-5xl leading-tight text-ink">
                    {e.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-base md:text-lg text-ink-soft">
                    {e.detail}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
