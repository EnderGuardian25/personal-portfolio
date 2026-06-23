# Social Post / Poster Pipeline

How to produce a shareable image (Instagram, LinkedIn, etc.) that exactly matches
the portfolio's design system. This is a **durable reference** — unlike `HANDOFF.md`,
it is not refreshed per session.

> **Outputs live in `posts/`, which is gitignored.** Generated images stay on the
> local machine only — they are never committed to the repo or deployed.

---

## Why this pipeline

The image **must** be rendered by a real browser against the actual site CSS — not
hand-built in SVG/Canvas.

- ❌ **SVG → `sharp`/librsvg** — librsvg is not a browser engine. Instrument Serif
  renders with wrong weight, spacing, and italics; glows go flat. The output looks
  nothing like the site. (Tried and abandoned — do not revisit.)
- ✅ **Real Next.js page → headless Chrome screenshot** — pixel-identical to the
  live site because it *is* the live site's compiled CSS, fonts, tokens, and effects.

---

## Steps

### 1. Build a temporary route

Create `app/poster/page.jsx` (server component). Build the design with the **real
Tailwind tokens** — `bg-ivory`, `text-ink`, `font-display`, `font-mono`,
`text-electric`, `bg-sky/70`, `blur-3xl`, `bg-rule`, etc. Mirror the homepage hero
language: atmospheric sky/mist glow blobs, corner metadata, mono micro-labels,
oversized Instrument Serif headline with electric *italic* accents, hairline rules.

Fix the export surface to the target aspect ratio (e.g. `h-[1080px] w-[1080px]` for 1:1).

```jsx
export const metadata = { robots: { index: false, follow: false } };
```

### 2. Force the light theme (critical)

Headless Chrome reports a **dark** color-scheme preference, so the root theme script
(`app/layout.jsx`) adds `.dark` to `<html>` and flips every token to navy. Two guards
are needed so the export is always the light design:

1. **Pin light CSS variables** on the poster's root `<div style={...}>` — overrides
   the `.dark` tokens for that subtree:
   ```js
   const lightTokens = {
     "--c-ivory": "246 246 241", "--c-paper": "251 251 247",
     "--c-ink": "11 31 58", "--c-ink-soft": "22 49 90",
     "--c-ink-faint": "90 107 130", "--c-electric": "37 99 235",
     "--c-sky": "219 234 254", "--c-mist": "238 244 253",
     "--c-rule": "217 222 230",
   };
   ```
2. **Remove the `dark` class document-wide** so the *global* `.grain` and `.top-fade`
   overlays (siblings of the poster, rendered by the root layout) don't tint navy:
   ```jsx
   <script dangerouslySetInnerHTML={{
     __html: "document.documentElement.classList.remove('dark');",
   }} />
   ```
   Pinning tokens alone is **not enough** — the top-fade scrim is a `<body>`-level
   fixed element and will render a navy bar across the top without this.

### 3. Run the dev server

```powershell
cd D:\personal-portfolio
npm.cmd run dev          # npm.cmd, not npm — PS execution policy blocks the .ps1 shim
# confirm: http://localhost:3000/poster  (wait for the route to compile)
```

### 4. Capture with headless Chrome

`--force-device-scale-factor=2` gives a retina 2× export (1080×1080 window → 2160×2160 PNG).

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --headless=new --disable-gpu --hide-scrollbars `
  --force-device-scale-factor=2 --window-size=1080,1080 `
  --screenshot="D:\personal-portfolio\posts\DDC-Services-Poster.png" `
  "http://localhost:3000/poster"
```

Gotchas:
- If a capture lands while Next is **mid-recompile**, you'll get a 404 page or a blank
  frame. Poll `http://localhost:3000/poster` and confirm the response body contains
  expected text before screenshotting.
- Kill stray headless Chrome processes between attempts if a capture produces no file.

### 5. Verify and iterate

Use the **Read tool** on the PNG to view it. Refine the page, re-capture. Repeat
until approved.

### 6. Tear down

Once approved:
- **Delete `app/poster/`** — the route is temporary; never commit or deploy it.
- Stop the dev server.
- The PNG remains in `posts/` (gitignored, local only).

---

## Caption convention

Captions accompany the poster but live wherever you post. House style (per owner):
- **No emojis.**
- Contact block at the end, plain labels:
  ```
  Email: hello@damiandc.com
  WhatsApp: +94 77 712 0272
  ```
- Contact details are sourced from `lib/site.js` (`EMAIL`, `WHATSAPP`) — keep them in sync.

---

## Design tokens quick reference (light)

| Token | Hex | Use |
|---|---|---|
| `ivory` | #F6F6F1 | page ground |
| `ink` | #0B1F3A | primary text |
| `ink-soft` | #16315A | secondary text |
| `ink-faint` | #5A6B82 | micro-labels |
| `electric` | #2563EB | accent / italic highlights |
| `sky` | #DBEAFE | glow blob (top) |
| `mist` | #EEF4FD | glow blob (bottom) |
| `rule` | #D9DEE6 | hairline rules |

Fonts: Instrument Serif (`font-display`, has italic), JetBrains Mono (`font-mono`),
Manrope (`font-sans`).
