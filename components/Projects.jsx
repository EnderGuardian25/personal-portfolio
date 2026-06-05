"use client";
import { motion } from "framer-motion";
import Reveal from "./Reveal";

const projects = [
  {
    n: "01",
    title: "This Portfolio",
    year: "2026",
    blurb:
      "The site you're reading now — built with Next.js, Tailwind, and Framer Motion as a living journal of my work.",
    tags: ["Next.js", "Framer Motion", "Design"],
    href: "#top",
    status: "live",
  },
  {
    n: "02",
    title: "Personal Dashboard",
    year: "2026",
    blurb:
      "A self-updating homepage — RSS aggregation, reading queue, and a dashboard I open every morning.",
    tags: ["HTML/CSS/JS", "Static Site", "GitHub Pages"],
    href: "https://enderguardian25.github.io/personal-dashboard/",
    status: "live",
  },
  {
    n: "03",
    title: "Ranmal Flora",
    year: "2026",
    blurb:
      "Website for Sri Lanka's foremost tissue culture laboratory — producing 1.2 million pathogen-free plantlets annually and scaling to 6 million.",
    tags: ["HTML/CSS/JS", "Client Project", "Design"],
    href: "https://enderguardian25.github.io/ranmal-flora/",
    status: "live",
  },
  {
    n: "04",
    title: "Project Field",
    year: "2026",
    blurb:
      "Something at the intersection of LLMs and personal knowledge. In sketches.",
    tags: ["Next.js", "AI", "WIP"],
    href: "#",
    status: "soon",
  },
  {
    n: "05",
    title: "Coursework Archive",
    year: "2026 →",
    blurb:
      "A growing index of university coursework, write-ups, and small lab projects.",
    tags: ["Archive", "Writing"],
    href: "#",
    status: "soon",
  },
];

function Card({ p, i }) {
  const isSoon = p.status === "soon";
  const isExternal = p.href.startsWith("http");
  return (
    <motion.a
      href={p.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      data-hover
      className="group block border-t border-rule py-10 md:py-14 first:border-t-0"
    >
      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 md:col-span-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            ({p.n})
          </span>
        </div>

        <div className="col-span-12 md:col-span-6">
          <h3
            className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tight text-ink group-hover:text-electric transition-colors duration-500"
          >
            {p.title}
            {isSoon && (
              <sup className="ml-3 align-top font-mono text-[10px] tracking-[0.2em] uppercase text-electric not-italic">
                soon
              </sup>
            )}
          </h3>
          <p className="mt-5 md:mt-7 max-w-md text-base md:text-lg leading-relaxed text-ink-soft">
            {p.blurb}
          </p>
        </div>

        <div className="col-span-12 md:col-span-3 md:col-start-8 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 border border-rule rounded-full text-ink-soft"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="col-span-12 md:col-span-2 md:text-right">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            {p.year}
          </div>
          <div className="mt-2 flex md:justify-end items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSoon ? "bg-ink-soft/30" : "bg-electric animate-pulse"
              }`}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              {isSoon ? "in sketch" : "live"}
            </span>
          </div>
          {!isSoon && (
            <div className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ink group-hover:text-electric transition">
              {isExternal ? "Visit" : "You're here"}&nbsp;
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">
                {isExternal ? "↗" : "↑"}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.a>
  );
}

export default function Projects() {
  return (
    <section id="work" className="relative px-6 md:px-10 py-32 md:py-44 border-t border-rule">
      <div className="grid grid-cols-12 gap-6 mb-16 md:mb-24">
        <div className="col-span-12 md:col-span-3">
          <div className="section-label">§ 04 — Selected Work</div>
        </div>
        <div className="col-span-12 md:col-span-9 md:col-start-4">
          <Reveal>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight text-ink">
              A small but <span className="italic text-electric">growing</span> shelf.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-base md:text-lg text-ink-soft">
              Three projects out in the world. Two more in motion. This shelf will keep growing
              year over year — bookmark it.
            </p>
          </Reveal>
        </div>
      </div>

      <div>
        {projects.map((p, i) => (
          <Card key={p.n} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}
