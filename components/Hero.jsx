"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const easeOut = [0.22, 1, 0.36, 1];

function Word({ children, delay = 0 }) {
  // No overflow-hidden here — clipping is handled at the line-div level so
  // italic glyph overhang is never cut on either side.
  return (
    <motion.span
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1.1, ease: easeOut, delay }}
      className="inline-block"
    >
      {children}
    </motion.span>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  // metadata fades quickly as soon as the user scrolls, so it never collides
  const metaOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section id="top" ref={ref} className="relative min-h-screen w-full overflow-hidden pt-44 md:pt-52">
      {/* atmospheric blue blob */}
      <div className="absolute -top-40 -right-32 w-[60vw] h-[60vw] rounded-full bg-sky/70 dark:bg-sky/40 blur-3xl blob pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-[40vw] h-[40vw] rounded-full bg-mist blur-3xl blob pointer-events-none" style={{ animationDelay: "-6s" }} />

      {/* corner metadata — coordinates top-left, index top-right; both fade out on scroll */}
      <motion.div
        style={{ opacity: metaOpacity }}
        className="absolute top-28 left-6 md:left-10 section-label"
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }}>
          <div>N 6.9271° / E 79.8612°</div>
          <div className="mt-1 text-ink-faint">Colombo · Sri Lanka</div>
        </motion.div>
      </motion.div>
      <div className="absolute top-28 right-6 md:right-10 flex flex-col items-end gap-4 z-10">
        <motion.div style={{ opacity: metaOpacity }} className="section-label text-right">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }}>
            <div>(001)</div>
            <div className="mt-1 text-ink-faint">Index / Landing</div>
          </motion.div>
        </motion.div>

        {/* Prominent Services CTA — stays visible while at the top, scrolls away with the hero */}
        <motion.a
          href="/services"
          data-hover
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.6, ease: easeOut }}
          className="hidden md:inline-flex items-center gap-2 bg-electric text-ivory hover:bg-electric/90 dark:bg-ink dark:text-ivory dark:hover:bg-ink/90 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 group"
        >
          Services
          <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        </motion.a>
      </div>

      <motion.div style={{ y, opacity }} className="relative px-6 md:px-10">
        {/* Role kicker — fades in before the name animates */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: easeOut }}
          className="mb-4 md:mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft"
        >
          Creative Technologist · Freelance Web Designer
        </motion.div>

        <h1 className="font-display tracking-tightest leading-[0.82] text-ink text-[17vw] md:text-[13.5vw] uppercase">
          <div className="overflow-hidden pb-[0.04em] flex flex-wrap items-end gap-x-[0.04em]">
            <Word delay={0.4}>Damian</Word>
          </div>
          <div className="overflow-hidden pb-[0.04em] flex flex-wrap items-end gap-x-[0.04em] -mt-2 md:-mt-4">
            <Word delay={0.55}>
              <span className="italic font-display text-electric">de&nbsp;</span>
            </Word>
            <Word delay={0.7}>Cruz.</Word>
          </div>
        </h1>

        <div className="mt-10 md:mt-16 grid grid-cols-12 gap-6 items-end">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1, ease: easeOut }}
            className="col-span-12 md:col-span-5 text-lg md:text-xl leading-snug text-ink-soft max-w-md"
          >
            Reading <span className="italic font-display text-ink">BSc (Hons) Computer Science</span>{" "}
            at the Informatics Institute of Technology, Colombo — University of Westminster&rsquo;s
            campus in Sri Lanka. Building things on the internet at the seam of code, design, and curiosity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.9 }}
            className="hidden md:block col-span-3"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 1, ease: easeOut }}
            className="col-span-12 md:col-span-4 flex flex-col gap-2 md:items-end"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
              Currently
            </div>
            <div className="font-display text-3xl md:text-4xl italic text-ink leading-tight md:text-right">
              learning, shipping, breaking things.
            </div>
          </motion.div>
        </div>

        {/* Mobile-only Services CTA — desktop version lives in the top-right corner */}
        <motion.a
          href="/services"
          data-hover
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.6, ease: easeOut }}
          className="md:hidden mt-12 inline-flex items-center gap-2 bg-electric text-ivory dark:bg-ink dark:text-ivory px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 group"
        >
          Services
          <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        </motion.a>
      </motion.div>

      {/* scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-ink/40"
        />
      </motion.div>
    </section>
  );
}
