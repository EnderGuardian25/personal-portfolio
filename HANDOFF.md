# DDC Portfolio — Session Handoff
> Generated: 2026-06-06 | Updated: 2026-06-07 | Branch: `v2`

---

## ⚠️ Branch Status
**You are on branch `v2`. This branch is NOT deployed and NOT merged into `main` yet.**

- `main` — live on https://damiandc.com (pre-v2, older code)
- `v2` — all improvements from this session; intentionally held back for continued development

### Before merging `v2` → `main`
1. Update this document: change branch header to `main`, remove this warning block, and update "Last commit" below.
2. Run the merge locally: `git checkout main && git merge v2 --no-ff && git push origin main`
3. SSH into the VPS and run `~/deploy.sh`
4. Verify live: https://damiandc.com — dark mode toggle, favicon, OG image, `/sitemap.xml`, `/robots.txt`

---

## Project Identity
- **Site:** https://damiandc.com
- **Owner:** Damian De Cruz — Creative Technologist, BSc (Hons) Computer Science, IIT Sri Lanka (University of Westminster)
- **Repo:** https://github.com/EnderGuardian25/personal-portfolio (`v2` branch — see warning above)
- **Local path:** `D:\personal-portfolio`
- **Last commit (v2):** `05b42cf` — lazy-load Cursor + SmoothScroll via ClientEnhancements

---

## Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 14.2.33 (App Router) |
| Styling | Tailwind CSS 3.4.7 + CSS-variable-backed tokens |
| Animation | Framer Motion 11 (`MotionConfig reducedMotion="user"`) |
| Smooth scroll | Lenis (skipped on `prefers-reduced-motion`) |
| Fonts | Instrument Serif (display/italic), Manrope (sans), JetBrains Mono (mono) |
| Hosting | Hetzner VPS, Ubuntu 22.04 |
| Process manager | PM2 (`damiandc-website`), port 3000 |
| Reverse proxy | nginx |

---

## v2 Changes (not yet in main)
All of the following were added on the `v2` branch and are absent from production:

### Dark Mode
- Sun/moon `ThemeToggle` in nav — writes to `localStorage`, toggles `.dark` on `<html>`
- No-flash inline script in `<head>` reads preference before first paint
- `darkMode: "class"` in `tailwind.config.js`
- All color tokens CSS-variable-backed — full site re-themes by flipping one class
- Navy blue dark palette in `globals.css` (`:root` light + `.dark` block)
- `suppressHydrationWarning` on `<html>`

### SEO & Metadata
- `app/icon.svg` + `app/icon.png` (512×512) + `app/apple-icon.png` (180×180) — DDC favicon
- `app/robots.js` + `app/sitemap.js` — auto-wired by Next.js App Router
- JSON-LD `Person` structured data in layout
- OG image converted: `public/og.jpg` (45KB JPEG, was 753KB PNG)
- `alternates: { canonical: "/" }` in metadata
- `next.config.mjs`: removed `unoptimized: true`, added `formats: ['image/avif','image/webp']`

### Performance
- `ClientEnhancements.jsx` — lazy-loads Cursor + SmoothScroll via `next/dynamic ssr:false`
- First Load JS: 148 kB → 143 kB
- `sharp` moved from `devDependencies` to `dependencies` (required for image optimizer in production)

### Accessibility & UX
- Mobile menu: `aria-expanded`, `role="dialog"`, `aria-modal`, focus trap, Escape-to-close, body scroll lock, focus restoration to hamburger on close
- `MotionProvider.jsx` wraps entire app with `<MotionConfig reducedMotion="user">`
- `cursor: none` scoped to `@media (hover: hover) and (pointer: fine)` — no custom cursor on touch
- `:focus-visible` ring using `rgb(var(--c-electric))`
- `@media (prefers-reduced-motion: reduce)` block in globals.css

### Refactors
- `lib/site.js` — single source of truth for `YEAR`, `SHORT_YEAR`, `EMAIL`, `NAV_LINKS`, `SOCIALS`
- `Availability.jsx` — reusable pulse dot component (replaces copy-pasted markup in Nav)
- Dead `lint` script removed from `package.json`
- `assets/photography-originals/` added to `.gitignore`; optimize script SRC updated

### Content / Design
- Hero kicker: `"Creative Technologist · Code × Design"` above h1 (font-mono, delay 0.2)
- Right blob dimmed in dark mode: `dark:bg-sky/40`
- Footer: `v:02 / Always evolving`
- `id="resume"` added to Resume section element
- Nav links now driven by `NAV_LINKS` array (includes Résumé link)

---

## Custom Tailwind Tokens
All tokens are CSS-variable-backed (`rgb(var(--c-*) / <alpha-value>)`) so `/opacity` modifiers work in both themes.

| Token | Light | Dark |
|---|---|---|
| `ivory` | #F6F6F1 (warm white) | #0B1220 (deep navy) |
| `paper` | #EEEEE8 | #111827 |
| `ink` | #0B1F3A | #E8EDF5 |
| `ink-soft` | #3D5066 | #A8BCDA |
| `ink-faint` | #5A6B82 | #8EA1C0 |
| `electric` | #2563EB | #3B82F6 |
| `sky` | #BFDBFE | #1E3A5F |
| `mist` | #EFF6FF | #131F31 |
| `rule` | #E2E8F0 | #1E2D42 |

---

## Key Files

```
app/
  layout.jsx            — metadata, JSON-LD, fonts, no-flash theme script, MotionProvider
  page.jsx              — assembles all sections, ClientEnhancements
  globals.css           — :root + .dark token blocks, .top-fade, .grain, .link-line, etc.
  icon.svg / icon.png   — DDC favicon (navy square, Georgia serif, ivory rules)
  apple-icon.png        — 180×180 Apple touch icon
  robots.js             — allows all, references sitemap
  sitemap.js            — returns home URL with lastModified

components/
  Nav.jsx               — fixed header; ThemeToggle; desktop nav + a11y mobile menu
  ThemeToggle.jsx       — sun/moon animated toggle, localStorage + .dark class
  Availability.jsx      — reusable pulse dot + "Available · 2026"
  MotionProvider.jsx    — <MotionConfig reducedMotion="user"> wrapper
  ClientEnhancements.jsx— lazy-loads Cursor + SmoothScroll (ssr:false)
  Hero.jsx              — oversized name, kicker, scroll parallax, fade-out metadata
  About.jsx             — bio section
  Leadership.jsx        — prefect/interact roles
  Skills.jsx            — tech skills
  Projects.jsx          — selected work (live cards = motion.a, soon cards = motion.div dimmed)
  Timeline.jsx          — chronological milestones
  Resume.jsx            — CV download (id="resume")
  Lens.jsx              — phone photography gallery
  Contact.jsx           — email + socials (data from lib/site.js)
  Footer.jsx            — v:02 / Always evolving

lib/
  site.js               — YEAR, SHORT_YEAR, EMAIL, NAV_LINKS, SOCIALS (single source of truth)

public/
  og.jpg                — 1200×630 OG image (45KB JPEG)
  damiandc-resume.pdf   — downloadable CV
  photography/          — optimized 1600px-wide JPEGs for Lens.jsx

assets/
  photography-originals/ — raw phone JPEGs (gitignored, ~3–8MB each)

scripts/
  optimize-photos.mjs   — sharp resize: assets/photography-originals/ → public/photography/

ecosystem.config.js     — PM2 config (name: damiandc-website, port: 3000)
```

---

## Server Info
- **Deploy:** SSH into VPS → run `~/deploy.sh` (lives on server, NOT in repo)
- **PM2 process name:** `damiandc-website`
- **deploy.sh does:** `git pull origin main → rm -rf .next → npm install → npm run build → pm2 restart damiandc-website`
- **sharp note:** `sharp` is in `dependencies` — `npm install` (not `--production`) must run, which `deploy.sh` already does correctly

---

## Sections (in order)
`§ 01 About` · `§ 02 Beyond the Code` · `§ 03 Stack` · `§ 04 Selected Work` · `§ 05 Timeline` · `§ 06 Résumé` · `§ 07 Lens` · `§ 08 Contact`

> Note: Hero has no `§` label. Section numbering starts at About.

---

## Content Reference

### Hero
- Name: **DAMIAN / DE CRUZ.** — `text-[17vw] md:text-[13.5vw]`, `tracking-tightest leading-[0.82]`
- Kicker (above h1): `"Creative Technologist · Code × Design"` — font-mono, fades in at delay 0.2
- Tagline: *"learning, shipping, breaking things."*
- Top-left: coordinates · Top-right: index (both fade on scroll via metaOpacity)
- Section padding: `pt-44 md:pt-52`

### Nav
- Links: About · Work · Timeline · Résumé · Contact (from `NAV_LINKS` in `lib/site.js`)
- Logo: `DDC / Portfolio '26` (year from `SHORT_YEAR`)
- "Available · 2026" — `<Availability />` component with pulse dot, NOT a link
- `<ThemeToggle />` — sun/moon, next to availability on desktop
- Mobile: hamburger (3 lines → X), full-screen overlay with italic large links + Availability

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
| 04 | Project Field | Soon | dim + `cursor-default`, no hover |
| 05 | Coursework Archive | Soon | dim + `cursor-default`, no hover |

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
1. Drop raw phone JPEG into `assets/photography-originals/` (gitignored).
2. Run `npm run optimize-photos` (uses sharp).
3. Output `.jpg` lands in `public/photography/` (resized to max 1600px wide).
4. Add a new entry to the `photos` array in `components/Lens.jsx` pointing at `/photography/<filename>.jpg`.
5. URL-encode any spaces or parens in filenames (e.g. `IMG_x (1).jpg` → `IMG_x%20(1).jpg`).

### Contact (§ 08)
- Email: damianmdc@outlook.com (from `EMAIL` in `lib/site.js`)
- LinkedIn: @damian-de-cruz
- GitHub: @EnderGuardian25
- Instagram: @damian._.dc
- Discord: enderguardian_22 (user ID: 1123626535786659910)
- Socials driven by `SOCIALS` array in `lib/site.js`
- Left column accent: vertical "hello." (`writingMode: vertical-rl`, `rotate(180deg)`, `fontSize: 7rem`)

### Footer
- `v:02 / Always evolving` — `text-right` at **all** screen sizes
- Copyright: `© {YEAR} — Damian De Cruz` (year from `YEAR` in `lib/site.js`)

---

## Critical Design Rules — DO NOT RE-BREAK
1. **Italic name clipping** — `overflow-hidden` on LINE-LEVEL divs (`pb-[0.04em]`), never on word spans
2. **OG image** — static `public/og.jpg` only. No dynamic `/opengraph-image` route — causes 502 on nginx+PM2
3. **"Available · 2026"** — `<Availability />` component, never `<a>`, on both desktop and mobile
4. **Mobile hamburger X** — y offset exactly `6` (not 7); lines use `gap-[5px]`
5. **Footer** — `text-right` at all sizes, not just mobile
6. **No stats strip** in Leadership (removed by user)
7. **No scroll parallax** on project titles (removed by user)
8. **Theme transition flicker** — global `color` transition removed from `*`; only `background-color` + `border-color` on `*`, and `color` on `body` only
9. **Soon cards** — `motion.div` (not `motion.a`), `opacity-60 cursor-default select-none`, no `data-hover`

---

## Running Locally
```powershell
cd D:\personal-portfolio
git checkout v2          # ensure you're on the right branch
npm.cmd run dev
# http://localhost:3000 (or 3001 if 3000 is in use)
```
> Use `npm.cmd` not `npm` — PowerShell execution policy blocks the .ps1 shim

---

## Deploying (when ready — v2 is NOT deployed yet)
```bash
# 1. Locally — merge v2 into main
git checkout main
git merge v2 --no-ff -m "Merge v2: dark mode, SEO, a11y, perf, favicons, refactors"
git push origin main

# 2. Update HANDOFF.md: change branch header to `main`, remove the ⚠️ warning block

# 3. SSH into Hetzner VPS, then:
~/deploy.sh

# 4. Verify
# https://damiandc.com — dark mode toggle, favicon, sitemap, OG image
# https://damiandc.com/sitemap.xml
# https://damiandc.com/robots.txt
```

---

## Pending / Next Ideas
- [ ] Personal Dashboard — add live link when ready
- [ ] Project Field — reveal when ready
- [ ] Coursework Archive — reveal when ready
- [ ] Verify OG image live at `https://damiandc.com/og.jpg` after deploy
- [ ] Check opengraph.xyz with `https://damiandc.com` after deploy
- [ ] Analytics (Plausible or similar)
- [ ] Lighthouse audit after deploy
