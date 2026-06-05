"use client";
import Reveal from "./Reveal";

export default function Resume() {
  return (
    <section className="relative px-6 md:px-10 py-32 md:py-44 border-t border-rule">
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-3">
          <div className="section-label">§ 06 — Résumé</div>
        </div>

        <div className="col-span-12 md:col-span-6">
          <Reveal>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight text-ink">
              Want the <span className="italic text-electric">long form</span>?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-base md:text-lg text-ink-soft">
              Education, coursework, and current pursuits — packaged as a single page.
            </p>
          </Reveal>
        </div>

        <div className="col-span-12 md:col-span-3 md:text-right">
          <Reveal delay={0.2}>
            <a
              href="/resume.pdf"
              download
              data-hover
              className="group inline-flex items-center gap-3 px-6 py-4 border border-ink rounded-full hover:bg-ink hover:text-ivory transition-colors duration-500"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
                Download CV
              </span>
              <span className="inline-block transition-transform duration-500 group-hover:translate-y-0.5">
                ↓
              </span>
            </a>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft/60">
              PDF · v1 · 2026
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
