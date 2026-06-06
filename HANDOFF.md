# DDC Portfolio — Session Handoff
> Generated: 2026-06-06 | Branch: `main`

---

## Project Identity
- **Site:** https://damiandc.com
- **Owner:** Damian De Cruz — Creative Technologist, BSc (Hons) Computer Science, IIT Sri Lanka (University of Westminster)
- **Repo:** https://github.com/EnderGuardian25/personal-portfolio (`main` branch)
- **Local path:** `D:\personal-portfolio`
- **Last commit:** `1cad459` — feat: use real hero screenshot as OG image (1200x630 crop)
- **Active branch:** `feature/nothing-ddc` — Lens section + photography pipeline (uncommitted)

---

## Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 14.2.33 (App Router) |
| Styling | Tailwind CSS 3.4.7 + custom tokens |
| Animation | Framer Motion 11 |
| Smooth scroll | Lenis |
| Fonts | Instrument Serif (display/italic), Manrope (sans), JetBrains Mono (mono) |
| Hosting | Hetzner VPS, Ubuntu 22.04 |
| Process manager | PM2 (`damiandc-website`), port 3000 |
| Reverse proxy | nginx |

---

## Custom Tailwind Tokens
- `ivory`    → #F6F6F1 (background)
- `ink`      → #0B1F3A (primary text)
- `electric` → #2563EB (accent blue)
- `sky`, `mist`, `rule` — supporting palette tokens

---

## Server Info
- **Deploy:** SSH into VPS → run `~/deploy.sh` (lives on server, NOT in repo)
- **PM2 process name:** `damiandc-website`
- **deploy.sh does:** `git pull → rm -rf .next → npm install → npm run build → pm2 restart damiandc-website`

---

## Key Files
```
app/
  layout.jsx          — metadata, fonts, grain + top-fade overlays
  page.jsx            — assembles all sections
  globals.css         — .top-fade, .grain, .rule-v, .section-label, .link-line, .blob

components/
  Nav.jsx             — fixed header; desktop nav + mobile hamburger overlay
  Hero.jsx            — oversized name, scroll parallax, fade-out metadata
  About.jsx           — bio section
  Leadership.jsx      — prefect/interact roles
  Skills.jsx          — tech skills
  Projects.jsx        — selected work (5 projects)
  Timeline.jsx        — chronological milestones
  Resume.jsx          — CV download
  Lens.jsx            — phone photography gallery (private IG mirror)
  Contact.jsx         — email + socials, vertical "hello." accent
  Footer.jsx          — v0.1 / Always Evolving

public/
  og.png              — 1200x630 OG image (real hero screenshot, top-cropped)
  damiandc-resume.pdf — downloadable CV
  photography/        — optimized 1600px-wide JPEGs served to Lens.jsx
  photography/originals/ — raw phone JPEGs (untouched, ~3-8MB each)

scripts/
  optimize-photos.mjs — sharp-based resize: originals/ → photography/, max 1600px, JPEG q82

ecosystem.config.js   — PM2 config (name: damiandc-website, port: 3000)
```

---

## Sections (in order)
`§ 01 About` · `§ 02 Beyond the Code` · `§ 03 Stack` · `§ 04 Selected Work` · `§ 05 Timeline` · `§ 06 Résumé` · `§ 07 Lens` · `§ 08 Contact`

> Note: Hero has no `§` label. Section numbering starts at About.

---

## Content Reference

### Hero
- Name: **DAMIAN / DE CRUZ.** — `text-[17vw] md:text-[13.5vw]`, `tracking-tightest leading-[0.82]`
- Tagline: *"learning, shipping, breaking things."*
- Top-left: coordinates · Top-right: index (both fade on scroll via metaOpacity)
- Section padding: `pt-44 md:pt-52`

### Nav
- Links: About · Work · Timeline · Contact
- Logo: `DDC / Portfolio '26`
- "Available · 2026" — **NOT a link** — plain `<span>` with pulse dot, both desktop and mobile
- Mobile: hamburger (3 lines → X), full-screen overlay with italic large links

### Leadership Roles (in order)
1. Head Prefect — St. Joseph's College, Colombo 10 (2024–25)
2. District Interact Representative — Rotary (2024–25)
3. Asst. District Interact Secretary (2023–24)
4. Senior Prefect — St. Joseph's College, Colombo 10 (2022–23)
5. Club President — SJC Interact (2022–23)

### Projects
| # | Title | Status | Notes |
|---|---|---|---|
| 01 | This Portfolio | Live | href:#top — "You're here ↑" |
| 02 | Personal Dashboard | Live | no link yet |
| 03 | Ranmal Flora | Live | https://enderguardian25.github.io/ranmal-flora/ |
| 04 | Project Field | Soon | — |
| 05 | Coursework Archive | Soon | — |

Blurb: *"Three projects out in the world. Two more in motion."*

Ranmal Flora description: *"Website for Sri Lanka's foremost tissue culture laboratory — producing 1.2 million pathogen-free plantlets annually and scaling to 6 million."* (tissue culture lab — NOT a local florist)

### Timeline (newest → oldest)
- 2026 — This Portfolio *(accent color)*
- 2026 — Ranmal Flora
- 2026 — Personal Dashboard
- 2025–2026 — Completed first year (IIT · University of Westminster)
- Sep 2025 — Began BSc (Hons) Computer Science (IIT · University of Westminster)
- 2022–2024 — Edexcel A-Levels (St. Joseph's College, Colombo 10)
- 2024 — First lines of code
- 2020 — Video games as a hobby
- 2018 — Where it began (Scratch, Micro:bit & Arduino)

### Lens (§ 07)
- Private IG mirror — curated phone photography hosted on the site itself (IG account `@nothing._.ddc` stays private).
- Photo entries live in the `photos` array at the top of `components/Lens.jsx` — `{ n, src, caption, location }`. Set `src: null` for a placeholder card.
- All shots tagged as "shot on Nothing Phone (3a) Pro" in the section blurb.
- CTA: outbound to https://www.instagram.com/nothing._.ddc/ with copy "Private account — request access for the full feed."
- Card hover: tile lifts (`whileHover y:-4`); image itself does NOT zoom (user preference).

#### Adding new photos
1. Drop raw phone JPEG into `public/photography/originals/`.
2. Run `npm run optimize-photos` (uses sharp — devDep, allow-scripts approved).
3. Output `.jpg` lands in `public/photography/` (resized to max 1600px wide, ~85% smaller).
4. Add a new entry to the `photos` array in `components/Lens.jsx` pointing at `/photography/<filename>.jpg`.
5. URL-encode any spaces or parens in filenames (e.g. `IMG_x (1).jpg` → `IMG_x%20(1).jpg`).

### Contact (§ 08)
- Email: damianmdc@outlook.com (italic display link)
- LinkedIn: @damian-de-cruz
- GitHub: @EnderGuardian25
- Instagram: @damian._.dc
- Discord: enderguardian_22 (user ID: 1123626535786659910)
- Left column accent: vertical "hello." (`writingMode: vertical-rl`, `rotate(180deg)`, `fontSize: 7rem`)

### Footer
- `v0.1 / Always Evolving` — `text-right` at **all** screen sizes

---

## Critical Design Rules — DO NOT RE-BREAK
1. **Italic name clipping** — `overflow-hidden` on LINE-LEVEL divs (`pb-[0.04em]`), never on Word spans
2. **OG image** — static `public/og.png` only. No dynamic `/opengraph-image` route — causes 502 on nginx+PM2
3. **"Available · 2026"** — `<span>` only, never `<a>`, on both desktop and mobile
4. **Mobile hamburger X** — y offset exactly `6` (not 7); lines use `gap-[5px]`
5. **Footer** — `text-right` at all sizes, not just mobile
6. **No stats strip** in Leadership (removed by user)
7. **No scroll parallax** on project titles (removed by user)

---

## Running Locally
```powershell
cd D:\personal-portfolio
npm.cmd run dev
# http://localhost:3000
```
> Use `npm.cmd` not `npm` — PowerShell execution policy blocks the .ps1 shim

---

## Deploying
```bash
# SSH into Hetzner VPS, then:
~/deploy.sh
# Verify: https://damiandc.com and https://damiandc.com/og.png
```

---

## Pending / Next Branch Ideas
- [ ] Verify OG image live at `https://damiandc.com/og.png` after deploy
- [ ] Check opengraph.xyz with `https://damiandc.com`
- [ ] Personal Dashboard — add live link when ready
- [ ] Project Field — reveal when ready
- [ ] Coursework Archive — reveal when ready
- [ ] Accessibility audit (aria labels, focus states, contrast)
- [ ] Performance audit (Lighthouse)
- [ ] Analytics (Plausible or similar)
