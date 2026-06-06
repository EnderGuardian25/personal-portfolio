"use client";
import Reveal from "./Reveal";

export default function About() {
  return (
    <section id="about" className="relative px-6 md:px-10 py-32 md:py-48">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <Reveal>
            <div className="sticky top-32">
              <div className="section-label mb-3">§ 01 — About</div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                Notes on the maker
              </div>
            </div>
          </Reveal>
        </div>

        <div className="col-span-12 md:col-span-9 md:col-start-4">
          <Reveal delay={0.1}>
            <p className="font-display text-3xl md:text-5xl leading-[1.15] tracking-tight text-ink">
              I&rsquo;m Damian — a{" "}
              <span className="italic text-electric">creative technologist</span> in the making,
              reading <span className="italic">BSc (Hons) Computer Science</span> at the{" "}
              <span className="italic">Informatics Institute of Technology</span> in Colombo.
            </p>
          </Reveal>

          <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <Reveal delay={0.15}>
              <h3 className="section-label mb-4">What I build</h3>
              <p className="text-base md:text-lg leading-relaxed text-ink-soft">
                Small, sharp websites. Personal tools. Generative experiments. Things that sit at
                the edge of software and design — where the interface is part of the idea.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <h3 className="section-label mb-4">How I work</h3>
              <p className="text-base md:text-lg leading-relaxed text-ink-soft">
                Quietly obsessive about details. I learn fastest by shipping. This site is itself
                a long-running project — I&rsquo;ll be refining it across the next four years of
                university and beyond.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
