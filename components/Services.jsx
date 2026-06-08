"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Reveal from "./Reveal";
import { EMAIL, WHATSAPP_LINK } from "@/lib/site";

const services = [
  {
    n: "01",
    title: "Web design & development",
    desc: "A clean, fast, custom website built from scratch — landing pages, personal sites, and one-pagers that load quickly and look sharp on every screen.",
    includes: ["Custom responsive design", "Fast, hand-built code", "Basic on-page SEO"],
    fromLKR: "LKR 18,000",
    fromUSD: "$150",
    turnaround: "~2–3 days",
  },
  {
    n: "02",
    title: "Business & portfolio sites",
    desc: "Multi-page sites that give a business or creative a proper home online — services, about, gallery, and contact, wired for search and enquiries.",
    includes: ["Up to ~5 pages", "Contact form & socials", "SEO + analytics setup"],
    fromLKR: "LKR 40,000",
    fromUSD: "$500",
    turnaround: "~1 week",
  },
  {
    n: "03",
    title: "Booking & scheduling sites",
    desc: "Let clients book you online — appointment calendars, reservations, and payment-ready scheduling built into a polished, branded site.",
    includes: ["Calendar / booking flow", "Payment gateway integration", "Email confirmations"],
    fromLKR: "LKR 65,000",
    fromUSD: "$800",
    turnaround: "1–2 weeks",
  },
  {
    n: "04",
    title: "Redesigns & speed fixes",
    desc: "Already have a site? I'll modernise the look or fix what's slow — Core Web Vitals, mobile layout, and the rough edges that quietly lose visitors.",
    includes: ["Performance & speed tuning", "Visual refresh", "Mobile & accessibility fixes"],
    fromLKR: "LKR 25,000",
    fromUSD: "$200",
    turnaround: "1–3 days",
  },
];

const steps = [
  { n: "01", title: "Brief", desc: "You tell me what you need — a few messages or a quick call. I send back a clear scope and a fixed starting price." },
  { n: "02", title: "Design", desc: "I shape the look and structure, sharing previews early so you can steer the direction before anything's locked in." },
  { n: "03", title: "Build", desc: "I build it fast and clean — responsive, quick to load, and ready for search engines from day one." },
  { n: "04", title: "Launch", desc: "We go live on your domain. I hand everything over and stay around for tweaks and support." },
];

const work = [
  { title: "Ranmal Flora", note: "Website for Sri Lanka's foremost tissue-culture laboratory.", href: "https://enderguardian25.github.io/ranmal-flora/", tag: "Business site" },
  { title: "My Portfolio", note: "Personal portfolio built with Next.js, Tailwind & Framer Motion — see the full body of work.", href: "/", tag: "Portfolio" },
  { title: "Personal Dashboard", note: "A self-updating homepage with RSS, a reading queue, and quick links.", href: "https://enderguardian25.github.io/personal-dashboard/", tag: "Web app" },
];

const faqs = [
  {
    q: "What's included in a build?",
    a: "Every site comes fully responsive (great on phones, tablets, and desktops), quick to load, and with basic on-page SEO so Google can find it. Business builds add a contact form, analytics, and social links. Anything beyond the agreed scope is quoted up front — no surprises.",
  },
  {
    q: "How fast can you really deliver?",
    a: "A single-page site is usually ~2–3 days, a small business site about a week, and booking sites 1–2 weeks. Those timelines assume your content (text, images, logo) is ready and feedback is prompt — speed is a two-way street.",
  },
  {
    q: "What about domain and hosting?",
    a: "Those are small recurring costs paid to providers, not to me — a domain runs about LKR 3,000/year and hosting roughly LKR 10,000–20,000/year. I'll recommend and set it all up for you, or build on hosting you already have.",
  },
  {
    q: "How does payment work?",
    a: "Typically 30–40% up front to begin, with the balance on delivery. For larger projects we can split it across milestones. I'll confirm the full price before any work starts.",
  },
  {
    q: "Do you work with clients outside Sri Lanka?",
    a: "Yes — I work with clients anywhere. International projects are quoted in USD (roughly the figures shown), and we handle everything over email, WhatsApp, or a call.",
  },
  {
    q: "What if I need changes after launch?",
    a: "A round of revisions is included with every build, and I'm reachable for small fixes once you're live. Ongoing maintenance or larger updates can be arranged whenever you need them.",
  },
];

function CTAButtons() {
  return (
    <div className="flex flex-wrap gap-4">
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        data-hover
        className="group inline-flex items-center gap-3 bg-electric px-7 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ivory hover:bg-electric/90 transition-colors duration-300"
      >
        Message on WhatsApp
        <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
      </a>
      <a
        href={`mailto:${EMAIL}`}
        data-hover
        className="group inline-flex items-center gap-3 border border-ink px-7 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-ivory transition-colors duration-300"
      >
        Email me
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </a>
    </div>
  );
}

export default function Services() {
  const introRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: introRef, offset: ["start start", "end start"] });
  // The (001) index label fades quickly on scroll, exactly like the homepage hero.
  const metaOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <>
      {/* Intro */}
      <section id="top" ref={introRef} className="relative px-6 md:px-10 pt-40 md:pt-56 pb-20 md:pb-28 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[55vw] h-[55vw] rounded-full bg-sky/60 dark:bg-sky/30 blur-3xl blob pointer-events-none" />

        {/* Corner index + Portfolio CTA — mirrors the homepage hero's top-right
            block (index label that fades on scroll, electric button below it).
            Desktop only; mobile reaches the portfolio via the nav overlay. */}
        <div className="hidden md:flex absolute top-28 right-6 md:right-10 flex-col items-end gap-4 z-10">
          <motion.div style={{ opacity: metaOpacity }} className="section-label text-right">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
              <div>(002)</div>
              <div className="mt-1 text-ink-faint">Services / Hire</div>
            </motion.div>
          </motion.div>

          <motion.a
            href="/"
            data-hover
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="group inline-flex items-center gap-2 bg-electric text-ivory hover:bg-electric/90 dark:bg-ink dark:text-ivory dark:hover:bg-ink/90 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-300"
          >
            Portfolio
            <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
          </motion.a>
        </div>

        <div className="grid grid-cols-12 gap-6 relative">
          <div className="col-span-12 md:col-span-3">
            <Reveal>
              <div className="section-label">Damian De Cruz</div>
              <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                Web design & development
              </div>
            </Reveal>
          </div>
          <div className="col-span-12 md:col-span-9 md:col-start-4">
            <Reveal delay={0.05}>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft mb-5">
                Freelance · Colombo, Sri Lanka
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="font-display text-5xl md:text-8xl leading-[0.92] tracking-tight text-ink">
                Clean, fast websites — <span className="italic text-electric">built in days</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-xl text-lg md:text-xl leading-relaxed text-ink-soft">
                I&rsquo;m Damian — a creative technologist and freelance web designer in Colombo. I design and
                build custom websites for businesses and creatives: quick to load, sharp on every screen, and
                ready for Google. Most projects ship in days, not months.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-10">
                <CTAButtons />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What I do */}
      <section id="what-i-do" className="relative px-6 md:px-10 py-24 md:py-36 border-t border-rule">
        <div className="grid grid-cols-12 gap-6 mb-12 md:mb-16">
          <div className="col-span-12 md:col-span-3">
            <div className="section-label">§ 01 — What I do</div>
          </div>
          <div className="col-span-12 md:col-span-9 md:col-start-4">
            <Reveal>
              <h2 className="font-display text-4xl md:text-6xl leading-tight tracking-tight text-ink">
                Four ways I can <span className="italic text-electric">help</span>.
              </h2>
            </Reveal>
          </div>
        </div>

        <div>
          {services.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.05}>
              <div className="grid grid-cols-12 gap-6 items-start border-t border-rule py-10 md:py-12 first:border-t-0">
                <div className="col-span-12 md:col-span-1">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-ink-soft">({s.n})</span>
                </div>
                <div className="col-span-12 md:col-span-5">
                  <h3 className="font-display text-3xl md:text-4xl leading-tight text-ink">{s.title}</h3>
                  <p className="mt-4 max-w-md text-base md:text-lg leading-relaxed text-ink-soft">{s.desc}</p>
                </div>
                <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
                  {s.includes.map((it) => (
                    <div key={it} className="flex items-baseline gap-2 text-sm md:text-base text-ink-soft">
                      <span className="text-electric">—</span>
                      <span>{it}</span>
                    </div>
                  ))}
                </div>
                <div className="col-span-12 md:col-span-3 md:text-right">
                  <div className="font-display text-2xl md:text-3xl text-ink">{s.fromLKR}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint mt-1">
                    to start · intl from {s.fromUSD}
                  </div>
                  <div className="mt-3 inline-flex md:justify-end items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric" />
                    {s.turnaround}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-10 max-w-2xl text-sm md:text-base text-ink-faint leading-relaxed">
            All figures are starting points — the final quote depends on scope. Larger, fully custom builds
            start from around LKR 150,000. Domain and hosting are billed separately, at cost.
          </p>
        </Reveal>
      </section>

      {/* How it works */}
      <section id="process" className="relative px-6 md:px-10 py-24 md:py-36 border-t border-rule bg-paper">
        <div className="grid grid-cols-12 gap-6 mb-12 md:mb-16">
          <div className="col-span-12 md:col-span-3">
            <div className="section-label">§ 02 — How it works</div>
          </div>
          <div className="col-span-12 md:col-span-9 md:col-start-4">
            <Reveal>
              <h2 className="font-display text-4xl md:text-6xl leading-tight tracking-tight text-ink">
                From idea to live in <span className="italic text-electric">four steps</span>.
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-9 md:col-start-4 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 md:gap-y-14">
            {steps.map((st, i) => (
              <Reveal key={st.n} delay={i * 0.07}>
                <div className="flex gap-5">
                  <div className="font-display text-4xl md:text-5xl italic text-electric leading-none">{st.n}</div>
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl text-ink">{st.title}</h3>
                    <p className="mt-2 max-w-md text-base text-ink-soft leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Recent work */}
      <section id="recent" className="relative px-6 md:px-10 py-24 md:py-36 border-t border-rule">
        <div className="grid grid-cols-12 gap-6 mb-12 md:mb-16">
          <div className="col-span-12 md:col-span-3">
            <div className="section-label">§ 03 — Recent work</div>
          </div>
          <div className="col-span-12 md:col-span-9 md:col-start-4">
            <Reveal>
              <h2 className="font-display text-4xl md:text-6xl leading-tight tracking-tight text-ink">
                A few things I&rsquo;ve <span className="italic text-electric">shipped</span>.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <a
                href="/"
                data-hover
                className="group mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-electric link-line"
              >
                See the full portfolio
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </a>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-rule border-y border-rule">
          {work.map((w, i) => {
            const external = w.href.startsWith("http");
            return (
              <Reveal key={w.title} delay={i * 0.06}>
                <a
                  href={w.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  data-hover
                  className="group flex flex-col h-full bg-ivory px-7 py-9 hover:bg-mist transition-colors duration-500"
                >
                  <div className="section-label mb-3">{w.tag}</div>
                  <h3 className="font-display text-2xl md:text-3xl text-ink group-hover:text-electric transition-colors duration-500">
                    {w.title}
                  </h3>
                  <p className="mt-3 text-sm md:text-base text-ink-soft leading-relaxed flex-1">{w.note}</p>
                  <span className="mt-5 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ink group-hover:text-electric transition">
                    {external ? "Visit" : "View"}
                    <span className="transition-transform duration-500 group-hover:translate-x-1.5">
                      {external ? "↗" : "→"}
                    </span>
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative px-6 md:px-10 py-24 md:py-36 border-t border-rule bg-paper">
        <div className="grid grid-cols-12 gap-6 mb-12 md:mb-16">
          <div className="col-span-12 md:col-span-3">
            <div className="section-label">§ 04 — FAQ</div>
          </div>
          <div className="col-span-12 md:col-span-9 md:col-start-4">
            <Reveal>
              <h2 className="font-display text-4xl md:text-6xl leading-tight tracking-tight text-ink">
                Good questions, <span className="italic text-electric">answered</span>.
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-9 md:col-start-4">
            {faqs.map((f, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <details className="group border-t border-rule py-6 first:border-t-0">
                  <summary className="flex items-center justify-between gap-6 cursor-pointer list-none font-display text-xl md:text-2xl text-ink [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="font-mono text-electric text-2xl leading-none transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl text-base md:text-lg text-ink-soft leading-relaxed">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Start a project */}
      <section id="start" className="relative px-6 md:px-10 py-28 md:py-40 border-t border-rule overflow-hidden">
        <div className="absolute -bottom-40 -left-32 w-[55vw] h-[55vw] rounded-full bg-sky/50 dark:bg-sky/25 blur-3xl blob pointer-events-none" />
        <div className="grid grid-cols-12 gap-6 relative">
          <div className="col-span-12 md:col-span-3">
            <Reveal>
              <div className="section-label">§ 05 — Start a project</div>
            </Reveal>
          </div>
          <div className="col-span-12 md:col-span-9 md:col-start-4">
            <Reveal delay={0.1}>
              <h2 className="font-display text-5xl md:text-8xl leading-[0.9] tracking-tight text-ink">
                Let&rsquo;s build <span className="italic text-electric">your</span> site.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-xl text-lg md:text-xl text-ink-soft leading-relaxed">
                Tell me what you have in mind and I&rsquo;ll come back with a scope, a fixed starting price, and
                a timeline — usually within a day. No obligation.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-10">
                <CTAButtons />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
