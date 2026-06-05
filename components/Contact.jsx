"use client";
import { motion } from "framer-motion";
import Reveal from "./Reveal";

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/damian-de-cruz/", handle: "@damian-de-cruz" },
  { label: "GitHub", href: "https://github.com/EnderGuardian25", handle: "@EnderGuardian25" },
  { label: "Instagram", href: "https://www.instagram.com/damian._.dc", handle: "@damian._.dc" },
  { label: "Discord", href: "https://discord.com/users/1123626535786659910", handle: "enderguardian_22" },
];

export default function Contact() {
  return (
    <section id="contact" className="relative px-6 md:px-10 pt-32 md:pt-48 pb-64 md:pb-80 border-t border-rule overflow-hidden">
      {/* decorative oversize word */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute bottom-8 md:bottom-14 right-2 md:right-6 font-display italic text-electric/15 text-[22vw] leading-none select-none"
        aria-hidden
      >
        hello.
      </motion.div>

      <div className="grid grid-cols-12 gap-6 relative">
        <div className="col-span-12 md:col-span-3">
          <div className="section-label">§ 07 — Contact</div>
        </div>

        <div className="col-span-12 md:col-span-9 md:col-start-4">
          <Reveal>
            <h2 className="font-display text-6xl md:text-[9rem] leading-[0.88] tracking-ultra text-ink">
              Let&rsquo;s <span className="italic text-electric">talk</span>.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 md:mt-10 max-w-xl text-lg md:text-xl text-ink-soft leading-relaxed">
              Internships, collaborations, classmates from IIT, or anyone with a good idea — the
              inbox is open. Pick the channel you like.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <a
              href="mailto:damianmdc@outlook.com"
              data-hover
              className="group mt-8 inline-flex items-center gap-3 link-line font-display text-2xl md:text-4xl italic text-ink"
            >
              damianmdc@outlook.com
              <span className="font-sans not-italic text-base transition-transform duration-500 group-hover:translate-x-1.5">
                →
              </span>
            </a>
          </Reveal>

          <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-rule border-y border-rule">
            {socials.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hover
                  className="group flex items-baseline justify-between gap-6 bg-ivory px-6 py-8 md:px-10 md:py-10 hover:bg-mist transition-colors duration-500"
                >
                  <div>
                    <div className="section-label mb-2">{`0${i + 1} / ${s.label}`}</div>
                    <div className="font-display text-3xl md:text-5xl text-ink group-hover:text-electric transition-colors duration-500">
                      {s.handle}
                    </div>
                  </div>
                  <span className="font-mono text-xl md:text-3xl text-ink-soft transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-1">
                    ↗
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
