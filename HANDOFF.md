# DDC Portfolio — Session Handoff
> Generated: 2026-06-06 | Updated: 2026-06-08 | Branch: `v2`

---

## ⚠️ Branch Status
**You are on branch `v2`. This branch is NOT deployed and NOT merged into `main` yet.**

- `main` — live on https://damiandc.com (pre-v2, older code)
- `v2` — all improvements from this and the previous session; intentionally held back for continued development

### Before merging `v2` → `main`
1. Update this document: change branch header to `main`, remove this warning block, and update "Last commit" below.
2. Run the merge locally: `git checkout main && git merge v2 --no-ff && git push origin main`
3. SSH into the VPS and run `~/deploy.sh`
4. Verify live: https://damiandc.com — dark mode toggle, favicon, OG image, `/sitemap.xml`, `/robots.txt`, `/services`
5. Submit `sitemap.xml` in Google Search Console and request indexing of homepage + `/services`

---

## Project Identity
- **Site:** https://damiandc.com
- **Owner:** Damian De Cruz — Creative Technologist, BSc (Hons) Computer Science, IIT Sri Lanka (University of Westminster)
- **Repo:** https://github.com/EnderGuardian25/personal-portfolio (`v2` branch — see warning above)
- **Local path:** `D:\personal-portfolio`
- **Last commit (v2):** `3ddecb9` — remove redundant mobile hero Services button; doc refresh

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
- Title: `"Damian De Cruz — Creative Technologist & Freelance Web Designer"`
- Meta description: freelance web designer/developer, Colombo, Sri Lanka, 48-hour delivery
- OG + Twitter cards updated to match
- `app/icon.svg` + `app/icon.png` (512×512) + `app/apple-icon.png` (180×180) — DDC favicon
- `app/robots.js` + `app/sitemap.js` — auto-wired by Next.js App Router; sitemap includes `/services`
- JSON-LD `Person` + `Service` structured data in `app/layout.jsx`
- OG image converted: `public/og.jpg` (45KB JPEG, was 753KB PNG)
- `alternates: { canonical: "/" }` in metadata
- `next.config.mjs`: removed `unoptimized: true`, added `formats: ['image/avif','image/webp']`
- Google Search Console: DNS TXT record verified via Squarespace DNS panel

### Services Page (`/services`)
- Standalone route with its own metadata, canonical, OG, Twitter, and `OfferCatalog` JSON-LD
- 6 sections: Intro · What I Do · How It Works · Recent Work · FAQ · Start a Project CTA
- 4 services with LKR/USD pricing and turnarounds:
  - Web design & development — from LKR 18,000 / $150, 48–72 hrs
  - Business website — from LKR 40,000 / $500, 3–5 days
  - Portfolio & booking — from LKR 65,000 / $800, 5–7 days
  - Redesign & refresh — from LKR 25,000 / $200, 2–3 days
- CTA buttons: WhatsApp (electric fill) + email (outline) — constants from `lib/site.js`
- Uses its own `ServicesNav` (logo **DDC / Services '26**, section links Pricing · Process · Work · FAQ) — see Navigation above
- **Hero corner block mirrors the homepage hero**: `(002) Services / Hire` label (fades on scroll via `useScroll`/`metaOpacity`) with an electric **Portfolio →** button below it, desktop only (`hidden md:flex`)
- Hero left-column label reads **Damian De Cruz** (not "Services" — avoids triple-repeating the word on landing)
- Recent Work section has a **See the full portfolio →** link (→ `/`) plus a **"My Portfolio"** project card (→ `/`)
- "Start a project" CTA section: label in left column, no redundant "Or reach me at" line (email CTA covers it)
- Page itself is **not** in the homepage navbar — surfaced via in-page links from About + the homepage hero corner button instead

### Navigation
- **Two separate, mirrored navbars** — the homepage uses `Nav.jsx`; `/services` uses its own `ServicesNav.jsx`. Both carry: section links · theme toggle · `Available · 2026` badge (desktop right + mobile overlay) · and a cross-link to the *other* page in the mobile overlay.
- `Nav.jsx` (homepage): logo `"Portfolio '26"` → `#top`; links About · Work · Timeline · Résumé · Contact (`NAV_LINKS`); `usePathname()` + `resolveHref()` rewrites `#anchor` → `/#anchor` on non-home routes (defensive — only the homepage currently uses it); mobile overlay has a **Services →** cross-link button
- `ServicesNav.jsx` (`/services`): logo `"Services '26"` → `#top`; centred section links (Pricing · Process · Work · FAQ → `#what-i-do`, `#process`, `#recent`, `#faq`); theme toggle; mobile overlay has a **Portfolio →** cross-link button. **No desktop nav cross-link button** — the Portfolio CTA lives in the services hero corner instead (mirrors how the homepage's Services CTA lives in its hero corner)
- Services removed from `NAV_LINKS` (homepage keeps 5 clean scroll anchors; avoids breaking smooth-scroll feel)

### Lenis Smooth Scroll Fix
- `SmoothScroll.jsx` intercepts all `a[href^="#"]` clicks via a **single delegated listener on `document`** (`e.target.closest('a[href^="#"]')`)
- Calls `lenis.scrollTo(target, { offset: -80 })` so smooth scroll runs and `whileInView` animations fire correctly
- Delegation (not a one-time `querySelectorAll` snapshot) means it catches links rendered *after* mount too — the `ServicesNav` links and both navs' conditionally-rendered mobile-menu overlays now smooth-scroll on every page
- Without this, native anchor jumps bypass Lenis and `whileInView` triggers all at once

### Hero
- Kicker: `"Creative Technologist · Freelance Web Designer"`
- Services CTA — desktop only: electric button in the top-right corner below the `(001) Index / Landing` label, `hidden md:inline-flex`, fades in at delay 1.9s
- On **mobile** the homepage Services link lives in the **nav hamburger overlay** (no separate hero button — that was removed as redundant)
- Button dark mode: light → `bg-electric text-ivory`; dark → `bg-ink text-ivory` (white fill, navy text)
  - Token note: `ivory` = navy in dark, `ink` = white in dark — the CSS vars swap symmetrically

### About
- Bio lead: `"a creative technologist and freelance web designer in Colombo"`
- "What I build" copy: mentions freelance work for businesses/creatives in Colombo and beyond
- "How I work" copy: "Most client sites go from brief to live in a couple of days"
- Electric "Services & pricing →" link added after "What I build" paragraph

### Contact
- Intro: removed `"classmates from IIT"` — now reads `"Internships, collaborations, or anyone with a good idea"`
- "See services & pricing →" link removed (surfaced adequately via Hero and About)

### Content
- **Projects:** Danella De Cruz added (04, `status: "soon"`, tags: Client Work / Music / Next.js)
- **Projects:** Blurb updated to `"Three projects out in the world. Two more in motion."`
- **Timeline:** Danella De Cruz entry added (2026 · "Client project · Portfolio & Booking") — positioned after "This Portfolio"

### Contact Details (single source of truth in `lib/site.js`)
- `EMAIL` → `hello@damiandc.com`
- `WHATSAPP` → `94777120272`
- `WHATSAPP_LINK` → auto-generated `wa.me` link with pre-filled message

### Performance & Refactors
- `ClientEnhancements.jsx` — lazy-loads Cursor + SmoothScroll via `next/dynamic ssr:false`
- First Load JS: 148 kB → 143 kB
- `sharp` moved from `devDependencies` to `dependencies`

### Accessibility & UX
- Mobile menu: `aria-expanded`, `role="dialog"`, `aria-modal`, focus trap, Escape-to-close, body scroll lock, focus restoration
- `MotionProvider.jsx` wraps entire app with `<MotionConfig reducedMotion="user">`
- `cursor: none` scoped to `@media (hover: hover) and (pointer: fine)`
- `:focus-visible` ring using `rgb(var(--c-electric))`
- `@media (prefers-reduced-motion: reduce)` block in globals.css

---

## Custom Tailwind Tokens
All tokens are CSS-variable-backed (`rgb(var(--c-*) / <alpha-value>)`) so `/opacity` modifiers work in both themes.
**Token swap rule:** `ivory` ↔ `ink` invert between light and dark — use this when building theme-aware components.

| Token | Light | Dark |
|---|---|---|
| `ivory` | #F6F6F1 (warm white — page bg) | #0B1F3A (navy — page bg) |
| `paper` | #FBFBF7 (elevated surface) | #112646 (elevated surface) |
| `ink` | #0B1F3A (navy — primary text) | #F6F6F1 (white — primary text) |
| `ink-soft` | #16315A | #A2B4D0 |
| `ink-faint` | #5A6B82 | #8EA1C0 |
| `electric` | #2563EB | #3B82F6 (brightened for navy contrast) |
| `sky` | #DBEAFE | #2D5496 |
| `mist` | #EEF4FD | #142C52 |
| `rule` | #D9DEE6 | #2A3F63 |

---

## Key Files

```
app/
  layout.jsx            — metadata, Person + Service JSON-LD, fonts, no-flash theme script, MotionProvider
  page.jsx              — assembles all homepage sections, ClientEnhancements
  globals.css           — :root + .dark token blocks, .top-fade, .grain, .link-line, etc.
  icon.svg / icon.png   — DDC favicon (navy square, Georgia serif, ivory rules)
  apple-icon.png        — 180×180 Apple touch icon
  robots.js             — allows all, references sitemap
  sitemap.js            — homepage + /services entries

  services/
    page.jsx            — /services metadata, OfferCatalog JSON-LD, renders ServicesNav + Services + Footer

components/
  Nav.jsx               — homepage fixed header; ThemeToggle; desktop nav + a11y mobile menu (NAV_LINKS)
  ServicesNav.jsx       — /services fixed header; section links + Portfolio button + ThemeToggle + a11y mobile menu
  ThemeToggle.jsx       — sun/moon animated toggle, localStorage + .dark class
  Availability.jsx      — reusable pulse dot + "Available · 2026"
  MotionProvider.jsx    — <MotionConfig reducedMotion="user"> wrapper
  ClientEnhancements.jsx— lazy-loads Cursor + SmoothScroll (ssr:false)
  SmoothScroll.jsx      — Lenis init + delegated anchor click interception on document (lenis.scrollTo, offset -80)
  Hero.jsx              — oversized name, kicker, scroll parallax, desktop corner Services button
  About.jsx             — bio, "What I build" + "How I work" + Services link
  Services.jsx          — full /services page content (6 sections, pricing, hero corner Portfolio button, WhatsApp + email CTAs)
  Leadership.jsx        — prefect/interact roles
  Skills.jsx            — tech skills
  Projects.jsx          — selected work (live = motion.a, soon = motion.div dimmed)
  Timeline.jsx          — chronological milestones
  Resume.jsx            — CV download (id="resume")
  Lens.jsx              — phone photography gallery
  Contact.jsx           — email + socials (data from lib/site.js)
  Footer.jsx            — v:02 / Always evolving

lib/
  site.js               — YEAR, SHORT_YEAR, EMAIL, WHATSAPP, WHATSAPP_LINK, WHATSAPP_MESSAGE,
                          NAV_LINKS, SOCIALS (single source of truth — update here, not in components)

public/
  og.jpg                — 1200×630 OG image (45KB JPEG)
  damiandc-resume.pdf   — downloadable CV
  photography/          — optimized 1600px-wide JPEGs for Lens.jsx

assets/
  photography-originals/ — raw phone JPEGs (gitignored)

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
- Kicker (above h1): `"Creative Technologist · Freelance Web Designer"` — font-mono, fades in at delay 0.2
- Tagline: *"learning, shipping, breaking things."*
- Top-left: coordinates (N 6.9271° / E 79.8612°) · Top-right: (001) Index/Landing — both fade on scroll via `metaOpacity`
- Services button: desktop only, top-right corner below the (001) label — `hidden md:inline-flex`, fades in at delay 1.9s
- Mobile Services link: in the nav hamburger overlay (no separate hero button — removed as redundant)
- Section padding: `pt-44 md:pt-52`

### Nav (homepage — `Nav.jsx`)
- Links: About · Work · Timeline · Résumé · Contact (from `NAV_LINKS` in `lib/site.js`)
- Logo: `DDC / Portfolio '26` → `#top` (→ `/` if ever rendered off-home)
- "Available · 2026" — `<Availability />` component with pulse dot, NOT a link
- `<ThemeToggle />` — sun/moon, next to availability on desktop
- Mobile: hamburger (3 lines → X), full-screen overlay with italic large links + a **Services →** cross-link button + Availability

### ServicesNav (`/services` — `ServicesNav.jsx`)
- Logo: `DDC / Services '26` → `#top`
- Links: Pricing · Process · Work · FAQ (→ `#what-i-do`, `#process`, `#recent`, `#faq`) — local `SERVICES_LINKS` array in the component, smooth-scrolled by SmoothScroll/Lenis
- Right: `<ThemeToggle />` + `<Availability />` (`hidden md:inline-flex`). The Portfolio CTA is NOT here — it lives in the services hero corner (`Services.jsx`), mirroring the homepage hero
- Mobile: hamburger → full-screen overlay with italic large links + a **Portfolio →** cross-link button + Availability (same a11y pattern as Nav)
- `PortfolioButton` helper carries `mix-blend-normal isolate` (legacy from when it lived in the multiply-blended header; harmless in the overlay)

### Projects
| # | Title | Status | Notes |
|---|---|---|---|
| 01 | This Portfolio | Live | href: #top — "You're here ↑" |
| 02 | Personal Dashboard | Live | no link yet |
| 03 | Ranmal Flora | Live | https://enderguardian25.github.io/ranmal-flora/ |
| 04 | Danella De Cruz | Soon | Client project — portfolio & booking site for vocal artist |
| 05 | Coursework Archive | Soon | dim + `cursor-default`, no hover |

Blurb: *"Three projects out in the world. Two more in motion."*

Ranmal Flora description: *"Website for Sri Lanka's foremost tissue culture laboratory — producing 1.2 million pathogen-free plantlets annually and scaling to 6 million."* (tissue culture lab — NOT a local florist)

### Timeline (newest → oldest)
- 2026 — This Portfolio *(accent color)*
- 2026 — Danella De Cruz *(Client project · Portfolio & Booking)*
- 2026 — Ranmal Flora
- 2026 — Personal Dashboard
- 2025–2026 — Completed first year (IIT · University of Westminster)
- Sep 2025 — Began BSc (Hons) Computer Science (IIT · University of Westminster)
- 2022–2024 — Edexcel A-Levels (St. Joseph's College, Colombo 10)
- 2024 — First lines of code
- 2020 — Video games as a hobby
- 2018 — Where it began (Scratch, Micro:bit & Arduino)

### Leadership Roles (in order)
1. Head Prefect — St. Joseph's College, Colombo 10 (2024–25)
2. District Interact Representative — Rotary (2024–25)
3. Asst. District Interact Secretary (2023–24)
4. Senior Prefect — St. Joseph's College, Colombo 10 (2022–23)
5. Club President — SJC Interact (2022–23)

### Lens (§ 07)
- Private IG mirror — curated phone photography hosted on the site itself (IG account `@nothing._.ddc` stays private)
- Photo entries live in the `photos` array at the top of `components/Lens.jsx` — `{ n, src, caption, location }`. Set `src: null` for a placeholder card.
- All shots tagged as "shot on Nothing Phone (3a) Pro" in the section blurb.
- CTA: outbound to https://www.instagram.com/nothing._.ddc/ — "Private account — request access for the full feed."
- Card hover: tile lifts (`whileHover y:-4`); image itself does NOT zoom (user preference).

#### Adding new photos
1. Drop raw phone JPEG into `assets/photography-originals/` (gitignored).
2. Run `npm run optimize-photos` (uses sharp).
3. Output `.jpg` lands in `public/photography/` (resized to max 1600px wide).
4. Add a new entry to the `photos` array in `components/Lens.jsx` pointing at `/photography/<filename>.jpg`.
5. URL-encode any spaces or parens in filenames (e.g. `IMG_x (1).jpg` → `IMG_x%20(1).jpg`).

### Contact (§ 08)
- Email: `hello@damiandc.com` (from `EMAIL` in `lib/site.js`)
- WhatsApp: `+94 77 712 0272` (from `WHATSAPP` in `lib/site.js`)
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
10. **Services not in `NAV_LINKS`** — it's a route, not an anchor; adding it breaks the smooth-scroll feel and clutters the nav; surface via in-page links instead
11. **Dark mode Services button** — `dark:bg-ink dark:text-ivory` (NOT `dark:bg-ivory` — ivory is navy in dark mode, ink is white)
12. **Lenis anchors** — `SmoothScroll.jsx` uses ONE delegated `click` listener on `document` (`e.target.closest('a[href^="#"]')`), NOT a `querySelectorAll` snapshot. Keep it delegated — a snapshot misses links rendered after mount (ServicesNav, mobile overlays), causing native jumps that make `whileInView` animations misfire

---

## Running Locally
```powershell
cd D:\personal-portfolio
git checkout v2          # ensure you're on the right branch
npm.cmd run dev
# http://localhost:3000 (or 3001 if 3000 is in use)
```
> Use `npm.cmd` not `npm` — PowerShell execution policy blocks the .ps1 shim

> **Never run `npm run build` while `next dev` is running** — they share the `.next` folder; production manifests will clobber dev manifests, causing CSS 404s. If this happens: stop dev server → `rm -rf .next` → restart dev server.

---

## Deploying (when ready — v2 is NOT deployed yet)
```bash
# 1. Locally — merge v2 into main
git checkout main
git merge v2 --no-ff -m "Merge v2: dark mode, SEO, a11y, perf, services page, content updates"
git push origin main

# 2. Update HANDOFF.md: change branch header to `main`, remove the ⚠️ warning block

# 3. SSH into Hetzner VPS, then:
~/deploy.sh

# 4. Verify
# https://damiandc.com — dark mode toggle, favicon, sitemap, OG image, /services page
# https://damiandc.com/sitemap.xml
# https://damiandc.com/robots.txt

# 5. Post-deploy GSC tasks
# - Submit sitemap.xml in Google Search Console
# - Request indexing of https://damiandc.com and https://damiandc.com/services
```

---

## Pending / Next Ideas
- [ ] Personal Dashboard — add live link when ready
- [ ] Danella De Cruz — update project card with live link when site is deployed
- [ ] Coursework Archive — reveal when ready
- [ ] Verify OG image live at `https://damiandc.com/og.jpg` after deploy
- [ ] Check opengraph.xyz with `https://damiandc.com` after deploy
- [ ] Submit sitemap + request indexing in GSC after deploy
- [ ] "Introductory rate" framing on services pricing (optional — research recommended for first few clients)
- [ ] Analytics (Plausible or similar)
- [ ] Lighthouse audit after deploy
- [ ] D: drive (KINGSTON NVMe) — check Event Viewer → System for disk/nvme/Ntfs errors; consider reseating M.2 drive (intermittent PCIe bus dropouts caused file corruption during this session)
