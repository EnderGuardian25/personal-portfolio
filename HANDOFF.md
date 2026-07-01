# DDC Portfolio — Session Handoff
> Generated: 2026-06-06 | Updated: 2026-07-01 | Branch: `main`

---

## Project Identity
- **Site:** https://damiandc.com
- **Owner:** Damian De Cruz — Creative Technologist, BSc (Hons) Computer Science, IIT Sri Lanka (University of Westminster)
- **Repo:** https://github.com/EnderGuardian25/personal-portfolio (`main` branch)
- **Local path:** `D:\personal-portfolio`
- **Last commit:** `2026-07-01` — perf: pause glitch canvas off-screen/hidden; earlier this session: a11y fixes (Lighthouse a11y **100**) + animated glitch decrypt field behind upcoming projects

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

## What's in main

### Dark Mode
- Sun/moon `ThemeToggle` in nav — writes to `localStorage`, toggles `.dark` on `<html>`
- No-flash inline script in `<head>` reads preference before first paint
- `darkMode: "class"` in `tailwind.config.js`
- All color tokens CSS-variable-backed — full site re-themes by flipping one class
- Navy blue dark palette in `globals.css` (`:root` light + `.dark` block)
- `suppressHydrationWarning` on `<html>`

### SEO & Metadata
- Title: `"Damian De Cruz — Creative Technologist & Freelance Web Designer"`
- Meta description: freelance web designer/developer, Colombo, Sri Lanka, delivered in days often 2–3
- OG + Twitter cards updated to match
- `app/icon.svg` + `app/icon.png` (512×512) + `app/apple-icon.png` (180×180) — DDC favicon
- `app/robots.js` + `app/sitemap.js` — auto-wired by Next.js App Router; sitemap includes `/services`
- JSON-LD `Person` + `Service` structured data in `app/layout.jsx`
- `FAQPage` JSON-LD in `app/services/page.jsx` — 7 Q&As, eligible for Google rich results
- OG image converted: `public/og.jpg` (45KB JPEG, was 753KB PNG); unused `og.png` (771KB) deleted
- `alternates: { canonical: "/" }` in metadata
- `next.config.mjs`: removed `unoptimized: true`, added `formats: ['image/avif','image/webp']`
- Google Search Console: DNS TXT record verified via Squarespace DNS panel
- **Google Analytics 4** (`G-PC1HZKKSEC`) — added via `next/script strategy="afterInteractive"` in `app/layout.jsx`; covers all pages from root layout

### Services Page (`/services`)
- Standalone route with its own metadata, canonical, OG, Twitter, `OfferCatalog` JSON-LD, and `FAQPage` JSON-LD
- 6 sections: Intro (unnumbered) · `§ 01 — What I do` · `§ 02 — How it works` · `§ 03 — Recent work` · `§ 04 — FAQ` · `§ 05 — Start a project`
- **7 services** with LKR/USD pricing and turnarounds:
  - § 01 Web design & development — from LKR 18,000 / $150, ~2–3 days
  - § 02 Business & portfolio sites — from LKR 40,000 / $500, ~1 week
  - § 03 Booking & scheduling sites — from LKR 65,000 / $800, 1–2 weeks
  - § 04 Redesigns & speed fixes — from LKR 25,000 / $200, 1–3 days
  - § 05 SEO & AI visibility audit — from LKR 50,000 / $299, 2–4 days
  - § 06 SEO & GEO implementation — from LKR 65,000 / $400, 1–2 weeks *(final price quoted from audit scope)*
  - § 07 Ongoing SEO & GEO retainer — from LKR 48,000 / $225/mo, monthly
- **SEO/GEO service flow:** audit (§05) → implementation (§06, quoted after audit) → retainer (§07, optional ongoing)
- FAQ section has 7 entries including deposit/cancellation policy
- `mailto:` links include `?subject=Website%20enquiry` pre-fill in both `Services.jsx` and `Contact.jsx`
- CTA buttons: WhatsApp (electric fill) + email (outline) — constants from `lib/site.js`
- Uses its own `ServicesNav` (logo **DDC / Services '26**, section links Pricing · Process · Work · FAQ)
- **Hero corner block mirrors the homepage hero**: `(002) Services / Hire` label (fades on scroll) with **Portfolio →** button, desktop only
- Hero left-column label reads **Damian De Cruz**
- Recent Work (`§ 03`): **See the full portfolio →** link + **4 project cards in a 2×2 grid** (`sm:grid-cols-2`, hairline `gap-px bg-rule` dividers) — This Portfolio (`/`) · Ranmal Flora · Spades Solutions · Aloys Travels. `work[]` array lives at the top of `Services.jsx`
- Not in the homepage navbar — surfaced via hero corner button (desktop) and nav hamburger overlay (mobile)

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

### Interactive Marquee (`Marquee.jsx`)
- The italic ribbon between homepage sections ("Creative Technologist ✦ Code ✦ …") — **JS-driven `requestAnimationFrame` loop**, NOT a CSS keyframe (the old `@keyframes marquee` / `.marquee-track` rule was removed from `globals.css`)
- **Auto-scrolls** leftward at the same speed as before (`baseline = -single / LOOP_SECONDS`, `LOOP_SECONDS = 38`; `single = track.scrollWidth / 2` since two copies are rendered)
- **Grab-to-drag:** pointerdown grabs it, pointermove moves the offset 1:1 with the cursor, a smoothed throw velocity is captured
- **Momentum + settle:** on release the flick keeps gliding, then an exponential blend (`SETTLE_TAU = 0.9`) decelerates it back into the normal leftward rotation. Two tuning knobs live at the top of the file: `LOOP_SECONDS` (speed) + `SETTLE_TAU` (settle laziness)
- **Pause on grab only** — auto-scroll keeps running on hover; it only stops while actively held
- Offset wraps modulo `single` for a seamless loop in both directions; `dt` is clamped (0.05s) so tab-switches don't cause jumps
- `touch-pan-y` lets horizontal drag grab the ribbon while vertical page scroll still works on mobile; `data-hover` expands the custom cursor ring; `cursor: grab` → `grabbing`
- **Reduced motion:** `baseline = 0` (no perpetual spin) and the loop idle-suspends; drag still works and settles to a stop. `Marquee.jsx` is no longer referenced in the `prefers-reduced-motion` CSS block

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
- **Mobile menu now also sets `<main>` `inert`** while open (Nav + ServicesNav) so browse-mode screen readers can't reach content behind the overlay
- `MotionProvider.jsx` wraps entire app with `<MotionConfig reducedMotion="user">`
- `cursor: none` gated behind `html.js-cursor` class — `Cursor.jsx` adds it on mount, removes on unmount; JS failure leaves native cursor visible. **Also skipped entirely for `prefers-reduced-motion` and `forced-colors: active` users** (JS bail in `Cursor.jsx` + CSS media guards in `globals.css`) so they keep the native cursor
- `:focus-visible` ring using `rgb(var(--c-electric))`
- `@media (prefers-reduced-motion: reduce)` block in globals.css

### Accessibility Pass — Lighthouse a11y 100 (2026-07-01)
Verified **100 / 100 / 100 / 100** (Accessibility · Best Practices · SEO · Agentic) on a production build in dark mode, via chrome-devtools Lighthouse.
- **Timeline list semantics:** `<ol>` children had been wrapped in a `<div>` (invalid list). `Reveal.jsx` gained an `as` prop so the reveal wrapper renders as the real `<li>` — valid `<ol>`/`<li>` nesting with the animation intact
- **Heading order:** About's `§ 01 — About` label changed from `<div>` to `<h2>` (keeps the `.section-label` class → no visual change) so headings descend sequentially
- **Decorative elements hidden:** Hero scroll-cue and the `Availability` pulse dot marked `aria-hidden`
- **Résumé download:** `aria-label="Download CV — PDF"` so the file type is announced
- **ThemeToggle:** switched to an isomorphic `useLayoutEffect` so the correct sun/moon icon is set before paint — no icon flash for dark-mode visitors
- **Contrast:** the two "soon" project cards were `opacity-60`, dragging their text under 4.5:1 in dark mode → lifted to `opacity-75` and the "soon" badge muted from `electric` to `ink-soft`

### Upcoming-Projects Glitch Field (2026-07-01)
- `GlitchField.jsx` — a decorative, continuously-scrambling field of monospace glyphs rendered behind each "soon" project card (Danella De Cruz, Coursework Archive), matching the reference in `docs/Glitch Text.png` (untracked, local-only)
- **Canvas-rendered, not DOM text — on purpose:** carries no accessible text (screen readers ignore it) and no DOM glyphs for the contrast audit to flag at its intentionally-faint opacity. Drawn in the real **JetBrains Mono** stack read from the wrapper's computed `font-family` (Canvas can't parse `var(--font-mono)`); redraws once `document.fonts.ready` resolves
- Radial center-fade mask keeps the overlaid title/blurb readable; `aria-hidden`; glyph colour re-read on theme flip via a `MutationObserver` on `<html>` so it never lags the theme
- **Reduced motion:** paints a single static frame, no loop
- **Perf:** the rAF loop is gated by an `IntersectionObserver` (only animates while on screen, 100px rootMargin) **and** a `visibilitychange` listener (pauses on hidden tabs) — off-screen fields don't churn the main thread during scroll
- A live-title "decrypt" animation was prototyped and **removed** (too janky) — only the "soon" cards animate

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
  Projects.jsx          — selected work (live = motion.a, soon = motion.div dimmed to 75% + GlitchField bg)
  GlitchField.jsx       — canvas glitch/decrypt field behind "soon" cards (aria-hidden, JetBrains Mono, IntersectionObserver-gated)
  Reveal.jsx            — scroll-reveal wrapper; `as` prop renders it as a semantic tag (e.g. <li>) instead of a div
  Timeline.jsx          — chronological milestones
  Resume.jsx            — CV download (id="resume")
  Lens.jsx              — phone photography gallery
  Marquee.jsx           — interactive ribbon: JS rAF auto-scroll + grab-to-drag with momentum/settle
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

posts/                    — local social media exports (gitignored — lives on this machine only)
  DDC-Services-Poster.png — 2160×2160 light-theme services poster, rendered from /poster route (now deleted)

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
| 02 | Personal Dashboard | Live | https://enderguardian25.github.io/personal-dashboard/ |
| 03 | Ranmal Flora | Live | https://enderguardian25.github.io/ranmal-flora/ |
| 04 | Spades Solutions | Live | Client project — https://enderguardian25.github.io/spades-solutions/index.html |
| 05 | Aloys Travels | Live | Client project — https://aloys-travels.pages.dev/ |
| 06 | Danella De Cruz | Soon | Client project — portfolio & booking site for vocal artist |
| 07 | Coursework Archive | Soon | dim + `cursor-default`, no hover |

> Order rule: live projects sit above `soon` ones — Danella De Cruz is still in progress, so it follows the live client work.
> `soon` cards (06, 07) render on an animated `GlitchField` canvas backdrop at `opacity-75` — see *Upcoming-Projects Glitch Field* under "What's in main".

Blurb: *"Five projects out in the world. Two more in motion."*

Ranmal Flora description: *"Website for Sri Lanka's foremost tissue culture laboratory — producing 1.2 million pathogen-free plantlets annually and scaling to 6 million."* (tissue culture lab — NOT a local florist)

### Timeline (newest → oldest)
- 2026 — This Portfolio *(accent color)*
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

## Social Poster

A 1:1 (2160×2160 at 2×) services poster lives at `posts/DDC-Services-Poster.png` on this machine — gitignored, local only.

> **Full pipeline:** see [`docs/POSTER-PIPELINE.md`](docs/POSTER-PIPELINE.md) — durable reference for building/regenerating any social post (temp Next.js route → headless Chrome screenshot, light-theme guards, teardown).
> **Key lesson:** never hand-build in SVG (librsvg renders fonts wrong). Always render the real page in a browser.

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
9. **Soon cards** — `motion.div` (not `motion.a`), `opacity-75 cursor-default select-none` (was `opacity-60` — raised for AA contrast), no `data-hover`; each sits on a `<GlitchField>` bg. Their title `<h3>` must NOT carry `transition-colors` (only live cards need it, for the hover-to-electric effect) — otherwise the title colour visibly lags on theme switch while the rest of the card snaps
10. **Services not in `NAV_LINKS`** — it's a route, not an anchor; adding it breaks the smooth-scroll feel and clutters the nav; surface via in-page links instead
11. **Dark mode Services button** — `dark:bg-ink dark:text-ivory` (NOT `dark:bg-ivory` — ivory is navy in dark mode, ink is white)
12. **Lenis anchors** — `SmoothScroll.jsx` uses ONE delegated `click` listener on `document` (`e.target.closest('a[href^="#"]')`), NOT a `querySelectorAll` snapshot. Keep it delegated — a snapshot misses links rendered after mount (ServicesNav, mobile overlays), causing native jumps that make `whileInView` animations misfire
13. **Marquee is JS-driven** — `Marquee.jsx` runs its own rAF loop for grab-to-drag + momentum. Do NOT revert it to a CSS `@keyframes marquee` / `.marquee-track` animation (that removes the drag interaction). The transform is set inline every frame; don't add a competing CSS `animation` or `transition: transform` to the track
14. **GlitchField is a `<canvas>`** — never render its glyphs as DOM text. DOM text would (a) be read aloud as gibberish by screen readers and (b) fail the colour-contrast audit at the intended faint opacity. Keep it `aria-hidden`, canvas-drawn, and keep the `IntersectionObserver` + `visibilitychange` gating so the two fields don't animate off-screen

---

## Running Locally
```powershell
cd D:\personal-portfolio
git checkout main
npm.cmd run dev
# http://localhost:3000 (or 3001 if 3000 is in use)
```
> Use `npm.cmd` not `npm` — PowerShell execution policy blocks the .ps1 shim

> **Never run `npm run build` while `next dev` is running** — they share the `.next` folder; production manifests will clobber dev manifests, causing CSS 404s. If this happens: stop dev server → `rm -rf .next` → restart dev server.

---

## Deploying
```bash
# main is merged and pushed. To deploy:
# 1. SSH into Hetzner VPS, then:
~/deploy.sh

# 2. Verify
# https://damiandc.com — dark mode toggle, favicon, sitemap, OG image, /services page
# https://damiandc.com/sitemap.xml
# https://damiandc.com/robots.txt

# 3. Post-deploy GSC tasks
# - Submit sitemap.xml in Google Search Console
# - Request indexing of https://damiandc.com and https://damiandc.com/services
```

---

## Pending / Next Ideas
- [ ] **Deploy** — SSH into VPS → `~/deploy.sh` (main is ready)
- [ ] Verify live: dark mode, `/services`, `/sitemap.xml`, `/robots.txt`, OG image
- [ ] Submit sitemap + request indexing of `/` and `/services` in GSC
- [ ] Verify GA4 data flowing in Google Analytics dashboard (~24–48 hrs after deploy)
- [ ] Personal Dashboard — add live link when ready
- [ ] Danella De Cruz — update project card with live link when site is deployed
- [ ] Spades Solutions — update project card with live link when site is deployed
- [ ] Aloys Travels — update project card with live link when site is deployed
- [ ] Coursework Archive — reveal when ready
- [ ] Add a testimonial / client outcome to `/services` (biggest remaining trust gap)
- [ ] Homepage: add WhatsApp CTA above the fold on mobile (Services button is desktop-only)
- [ ] Lighthouse audit after deploy
- [ ] D: drive (KINGSTON NVMe) — check Event Viewer → System for disk/nvme/Ntfs errors; consider reseating M.2 drive (intermittent PCIe bus dropouts caused file corruption in a prior session)
