# Damian De Cruz — Portfolio

Personal portfolio + landing page. Built with **Next.js 14**, **Tailwind CSS**, **Framer Motion**, and **Lenis** smooth scroll.

## Design

- **Aesthetic:** Editorial / Swiss-modern. Light, minimalist, professional.
- **Palette:** Ivory (`#F6F6F1`) + deep ink blue (`#0B1F3A`) + electric blue (`#2563EB`) + sky tint.
- **Typography:** Instrument Serif (display, italic accents) + Manrope (body) + JetBrains Mono (labels). All via `next/font/google`.
- **Motion:** Oversized hero with letter stagger reveal, marquee strip, parallax project titles, sticky section labels, scroll reveals, custom cursor with magnetic hover, smooth scroll.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Customize

- **Resume PDF:** drop yours at `public/resume.pdf`. The Download CV button links there.
- **Projects:** edit the `projects` array in `components/Projects.jsx`.
- **Timeline:** edit `entries` in `components/Timeline.jsx`.
- **Skills:** edit `groups` in `components/Skills.jsx`.
- **Socials:** edit `socials` in `components/Contact.jsx`.

## Deploy

- **Vercel (recommended):** push to GitHub → import on vercel.com → done.
- **GitHub Pages (static):** add `output: "export"` to `next.config.mjs`, run `npm run build`, push the `out/` folder to a `gh-pages` branch (or use the `peaceiris/actions-gh-pages` GitHub Action).

## Roadmap

- Add real resume PDF
- Replace placeholder project cards with real work as it ships
- Add `/blog` route when ready
- Wire up a custom domain
