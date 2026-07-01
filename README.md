# Damian De Cruz — Portfolio

Personal portfolio + landing page, plus a freelance **`/services`** page. Built with **Next.js 14** (App Router), **Tailwind CSS**, **Framer Motion**, and **Lenis** smooth scroll. Live at **[damiandc.com](https://damiandc.com)**.

## Design

- **Aesthetic:** Editorial / Swiss-modern — light, minimalist, professional, with a full **dark mode** (navy palette) toggled from the nav and persisted to `localStorage` (no-flash inline script sets it before first paint).
- **Palette:** Ivory (`#F6F6F1`) + deep ink blue (`#0B1F3A`) + electric blue (`#2563EB`) + sky tint. All colours are CSS-variable-backed tokens, so the whole site re-themes by flipping one class.
- **Typography:** Instrument Serif (display, italic accents) + Manrope (body) + JetBrains Mono (labels). All via `next/font/google`.
- **Motion:** Oversized hero with letter-stagger reveal, an interactive grab-to-drag marquee, sticky section labels, scroll reveals, a custom magnetic cursor, an animated canvas "glitch/decrypt" field behind upcoming projects, and Lenis smooth scroll. All motion respects `prefers-reduced-motion`.
- **Accessibility:** Lighthouse Accessibility / Best Practices / SEO all **100** (verified on a production build).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 (falls back to 3001 if in use).

> **Never run `npm run build` while `next dev` is running** — they share the `.next` folder and the production manifests clobber the dev ones. If it happens: stop the dev server → `rm -rf .next` → restart.

## Customize

Most site-wide content lives in **`lib/site.js`** (single source of truth) — year, email, WhatsApp, nav links, and socials. Edit there, not in individual components.

- **Résumé PDF:** replace `public/damiandc-resume.pdf` (the Download CV button links there).
- **Projects:** edit the `projects` array in `components/Projects.jsx` (set `status: "soon"` for an upcoming, dimmed card with the glitch backdrop).
- **Timeline:** edit `entries` in `components/Timeline.jsx`.
- **Skills:** edit `groups` in `components/Skills.jsx`.
- **Photography (Lens):** drop originals in `assets/photography-originals/`, run `npm run optimize-photos`, then add entries to the `photos` array in `components/Lens.jsx`.
- **Contact / socials:** edit `EMAIL`, `WHATSAPP`, and `SOCIALS` in `lib/site.js`.

## Deploy

Hosted on a **Hetzner VPS** (Ubuntu 22.04) behind **nginx**, run by **PM2** (`damiandc-website`, port 3000).

```bash
# main is merged and pushed, then:
# 1. SSH into the VPS and run the deploy script (lives on the server, not in the repo):
~/deploy.sh
#    (git pull origin main → rm -rf .next → npm install → npm run build → pm2 restart damiandc-website)

# 2. Verify at https://damiandc.com — dark-mode toggle, /services, /sitemap.xml, /robots.txt, OG image
```

> `sharp` is a production dependency, so the deploy must run a full `npm install` (not `--production`) — `deploy.sh` already does.

## Reference

See **[`HANDOFF.md`](HANDOFF.md)** for the full session handoff: architecture, design tokens, per-file notes, content reference, and the "critical design rules — do not re-break" list.

## Roadmap

- Add live links to client project cards as each site ships (Personal Dashboard, Danella De Cruz, etc.)
- Reveal the Coursework Archive project when ready
- Add a testimonial / client outcome to `/services`
- Add a `/blog` route
