# Product

## Register

brand

## Users

Two surfaces, two audiences:

- **damiandc.com** — prospective freelance clients (small businesses and creatives in Colombo and beyond) evaluating whether to hire Damian De Cruz for a website; also recruiters/collaborators skimming the portfolio.
- **lab.damiandc.com** — the same clients, walked through live interaction patterns during a project conversation ("which of these do you like?"), plus Damian himself reusing patterns in client builds. Unlisted; reachable by direct link only.

## Product Purpose

A personal portfolio + services site that converts visitors into freelance web-design clients, and a private motion/interaction reference library that shortens design conversations. Success = client enquiries via email/WhatsApp, and the lab being usable as a live pattern catalog.

## Brand Personality

Precise, kinetic, understated-confident. The portfolio is refined-editorial (ivory/navy, Instrument Serif + Manrope); the lab is a dark studio annex (near-black, Syne + IBM Plex Mono) where the demos are the only source of color. Voice: short, sensory, second-person ("hover them, drag them, hit replay").

## Anti-references

- Template SaaS landing grammar: hero-metric strips, identical card grids, gradient-text headlines.
- Cursor gimmicks on chrome: no magnetic buttons, no parallax/drift on text (both removed by the user; see HANDOFF.md Critical Design Rules).
- Movement-only hover effects — a resting pointer must still produce the effect (lab hover rule).
- Anything that reads "AI-generated portfolio": generic eyebrow labels on every block, decorative glass everywhere, bouncy easing.

## Design Principles

1. **The demo is the hero.** Lab chrome stays monochrome and hairline-quiet; color and spectacle live inside the stages.
2. **Interactions must survive a resting pointer.** Position-driven over velocity-driven; continuous values over binary flips.
3. **Performance is a design rule.** Demos mount only on screen; WebGL contexts are released, not parked; portfolio bundles never absorb lab dependencies.
4. **Identity per surface, systems shared.** Two root layouts, two type systems, one registry/motion vocabulary.
5. **Show, don't describe.** Live patterns beat screenshots; replay buttons beat autoplay loops.

## Accessibility & Inclusion

- Lighthouse a11y 100 maintained on portfolio pages; keep it.
- `prefers-reduced-motion` honored everywhere: CSS motion collapses globally in the lab; imperative demos render a settled end-state with no loops.
- Visible `:focus-visible` outlines on both surfaces; hover effects must also fire on keyboard focus where feasible.
- Lab is dark-only by design (color-scheme: dark); portfolio ships light + dark with AA contrast verified.
