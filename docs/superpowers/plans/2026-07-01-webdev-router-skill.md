# /webdev Router Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a global Claude skill `/webdev` that classifies any web-dev request into one of seven routes and orchestrates the right design/review skills, tools, and MCP servers, with approval gates at design and ship.

**Architecture:** A single skill directory at `~/.claude/skills/webdev/`. `SKILL.md` holds the router (detection table, phase vocabulary, gate rules, MCP smart-default summary) and stays lean; three files under `references/` hold the verbose detail (per-route playbooks, stack detection, MCP integration) loaded on demand.

**Tech Stack:** Claude Code skill format — Markdown with YAML frontmatter. No build step, no runtime. "Deliverable" per task = correct prose verified by inspection + classification dry-runs.

## Global Constraints

- Install location: `~/.claude/skills/webdev/` (global, outside any project repo). On this Windows machine that resolves to `C:\Users\Damian\.claude\skills\webdev\`.
- Seven routes exactly: `new-build`, `feature`, `component`, `redesign`, `bug-fix`, `audit` (read-only), `content`.
- Two approval gates on building routes: after DESIGN, before SHIP. Audit never edits/ships. Bug-fix and Component have no DESIGN gate.
- MCP usage = smart default: `Context7` auto for library APIs; `chrome-devtools` for ITERATE/audit; `magic-21st`/`shadcn` offered not forced; any disconnected MCP is silently skipped (never blocks).
- Skill must be stack-agnostic (detect Next/Vite/Astro/SvelteKit/Remix/CRA/static, Tailwind y/n, etc.) — do not hardcode Next.js/Tailwind.
- Source of truth: `docs/superpowers/specs/2026-07-01-webdev-router-skill-design.md`.
- `SKILL.md` frontmatter `description` must trigger on `/webdev` and on natural web-dev phrasing.

---

## File Structure

```
~/.claude/skills/webdev/
  SKILL.md                    # router core (Task 1) + wiring (Task 5)
  references/
    stack-detection.md        # Task 2
    mcp-integration.md        # Task 3
    routes.md                 # Task 4 — the seven playbooks
```

- `SKILL.md` — one responsibility: classify the request and dispatch. Lean and scannable.
- `references/stack-detection.md` — one responsibility: detect the project stack and derive commands.
- `references/mcp-integration.md` — one responsibility: when/how to use each MCP + graceful-skip rules.
- `references/routes.md` — one responsibility: the detailed phase-by-phase playbook for each route.

---

## Task 1: Scaffold directory and write SKILL.md router core

**Files:**
- Create: `C:\Users\Damian\.claude\skills\webdev\SKILL.md`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: the router contract that references rely on — the seven route ids (`new-build`, `feature`, `component`, `redesign`, `bug-fix`, `audit`, `content`), the eight phase names (`SCOPE`, `DESIGN`, `SOURCE`, `BUILD`, `ITERATE`, `REVIEW`, `VERIFY`, `SHIP`), and the reference filenames (`references/routes.md`, `references/stack-detection.md`, `references/mcp-integration.md`). Tasks 2–4 must use these exact ids/names.

- [ ] **Step 1: Create the skill directory**

Run:
```bash
mkdir -p ~/.claude/skills/webdev/references
```

- [ ] **Step 2: Write SKILL.md with the full content below**

Create `~/.claude/skills/webdev/SKILL.md`:

````markdown
---
name: webdev
description: >-
  One-command web/frontend development router. Use for ANY web UI task:
  building a new site/page/app, adding a section or feature, building a
  component, redesigning or polishing UI, fixing a frontend bug, auditing
  accessibility/performance/SEO, or writing UX copy. Classifies the request
  and orchestrates the right design skills (frontend-design, impeccable,
  web-design-guidelines), review skills (code-review, verify,
  systematic-debugging), and MCP servers (chrome-devtools, magic-21st,
  shadcn, Context7) with approval gates at design and ship. Invoke via
  /webdev or whenever a web-dev task is described.
---

# webdev — Web Development Intent Router

One command for all web-dev work. Classify the request into ONE route, then
run that route's phase sequence, honoring the two approval gates.

## How to use this skill

1. **SCOPE the request.** Detect the project stack (see
   `references/stack-detection.md`) and classify the request into exactly one
   route using the Detection Table below. State your pick in one line, e.g.
   "Routing this as **redesign**." Then proceed — the user can redirect.
2. **Run the route's sequence** from `references/routes.md`.
3. **Honor the gates** (see Gates below).
4. **Apply MCP smart-default rules** from `references/mcp-integration.md`.

If a request clearly contains two distinct asks (e.g. "add a pricing section
AND fix the mobile nav bug"), sequence the two routes, each with its own
gates. If it is ambiguous between routes, pick the single best fit, say so,
and proceed.

If the request is not a web/frontend task (backend-only, data, CLI), decline
this skill and hand back to normal handling.

## Detection Table

| Route | Cues in the request |
|---|---|
| `new-build` | "new site/app/page", "from scratch", "start a…" |
| `feature` | "add a … section/feature", "build a … page" on an existing site |
| `component` | "build a … component/button/card/modal/nav" |
| `redesign` | "redesign", "make it look better", "polish", "more bold/quiet", "delight" |
| `bug-fix` | "fix", "broken", "not working", "overflow", "error", "regression" |
| `audit` | "audit", "review my UI", "check a11y/perf/SEO", "how's it ranking" (read-only) |
| `content` | "copy", "microcopy", "error text", "empty-state wording", "CTA text" |

## Phase Vocabulary

Every route is built from these phases. `⏸` = approval gate.

| Phase | What runs |
|---|---|
| SCOPE | Understand request, detect stack, pick route |
| DESIGN ⏸ | `frontend-design` + `impeccable` for direction (`bencium-designer` / `ui-ux-pro-max` as supporting lenses); **stop for approval** |
| SOURCE | `Context7` for library APIs; `magic-21st` / `shadcn` for components (offered) |
| BUILD | Implement, matching existing patterns and detected stack |
| ITERATE | `run` to launch; `chrome-devtools` for live visual iteration |
| REVIEW | `code-review` (correctness) + `web-design-guidelines` (a11y/UX) |
| VERIFY | `verify` skill — run the app, observe real behavior |
| SHIP ⏸ | commit / PR; **stop for approval**. Irreversible ops (push/deploy) always pause |

## Gates

- Building routes stop twice: after DESIGN and before SHIP. Between gates, run
  autonomously.
- `audit` never edits or ships — it ends in a REPORT.
- `bug-fix` and `component` have no DESIGN gate but keep the SHIP gate.
- Push/deploy always pause even inside autonomous stretches.

## MCP smart default (summary)

- `Context7` — auto whenever a specific library API/config is in play.
- `chrome-devtools` — ITERATE and audit phases only (needs dev server + Chrome).
- `magic-21st` / `shadcn` — offered for components, never forced.
- `Figma` / `Canva` — only if the user points at an existing design file.
- **Any MCP not connected this session is silently skipped.** Never block on it.

Full rules: `references/mcp-integration.md`.

## References

- `references/routes.md` — the full per-route playbooks.
- `references/stack-detection.md` — how to detect the stack and derive commands.
- `references/mcp-integration.md` — when/how to use each MCP + graceful skip.
````

- [ ] **Step 3: Verify the frontmatter parses as YAML**

Run:
```bash
python -c "import yaml,io,re,sys; t=open('/c/Users/Damian/.claude/skills/webdev/SKILL.md',encoding='utf-8').read(); fm=re.match(r'^---\n(.*?)\n---',t,re.S).group(1); d=yaml.safe_load(fm); print('name:',d['name']); assert d['name']=='webdev'; assert 'description' in d and len(d['description'])>50; print('OK')"
```
Expected: prints `name: webdev` then `OK`. (If Python/yaml unavailable, instead open the file and confirm the frontmatter block is valid `key: value` YAML delimited by `---`.)

- [ ] **Step 4: Verify all seven route ids are present**

Run:
```bash
for r in new-build feature component redesign bug-fix audit content; do grep -q "\`$r\`" ~/.claude/skills/webdev/SKILL.md && echo "$r OK" || echo "$r MISSING"; done
```
Expected: seven lines, each ending `OK`.

- [ ] **Step 5: Commit**

Note: `~/.claude/skills/` may or may not be a git repo. If it is, commit there. If it is not, skip the commit for this and later tasks (state that you skipped because the target is not version-controlled).

```bash
cd ~/.claude/skills && git rev-parse --is-inside-work-tree >/dev/null 2>&1 && git add webdev/SKILL.md && git commit -m "feat(webdev): add router core SKILL.md" || echo "skills dir not a git repo — skipping commit"
```

---

## Task 2: Write references/stack-detection.md

**Files:**
- Create: `C:\Users\Damian\.claude\skills\webdev\references\stack-detection.md`

**Interfaces:**
- Consumes: the SCOPE phase from `SKILL.md` (this file is the detail behind "detect the project stack").
- Produces: a stack profile concept — `{framework, css, animation, componentLib, devCmd, buildCmd, testCmd}` — referenced by `routes.md` phases (ITERATE/BUILD/VERIFY use `devCmd`/`buildCmd`/`testCmd`).

- [ ] **Step 1: Write the file with the full content below**

Create `~/.claude/skills/webdev/references/stack-detection.md`:

````markdown
# Stack Detection

Run during SCOPE, before choosing commands for any later phase. The skill is
global — never assume Next.js/Tailwind.

## Procedure

1. Read `package.json` if present. From `dependencies` + `devDependencies`
   determine:
   - **framework:** `next` → Next.js; `vite` (+ `@sveltejs/kit` → SvelteKit,
     + `react` → Vite+React, + `vue` → Vite+Vue); `astro` → Astro;
     `@remix-run/*` → Remix; `react-scripts` → CRA. None of these → treat as
     a static/hand-rolled site.
   - **css:** `tailwindcss` → Tailwind; `styled-components`/`@emotion` →
     CSS-in-JS; `*.module.css` files → CSS modules; otherwise vanilla CSS.
   - **animation:** `framer-motion`, `gsap`, `@react-spring/*` if present.
   - **componentLib:** presence of `components.json` or `shadcn` dep → shadcn
     available.
2. Read the lockfile name to pick the package manager: `pnpm-lock.yaml` → pnpm,
   `yarn.lock` → yarn, `package-lock.json` → npm, `bun.lockb` → bun.
3. Derive commands from `package.json` `scripts`:
   - **devCmd:** the `dev` script (fallback `start`).
   - **buildCmd:** the `build` script.
   - **testCmd:** the `test` script if present; else note "no test script".
   Prefix with the detected package manager, e.g. `pnpm dev`, `npm run build`.
4. If there is no `package.json` (plain HTML/CSS/JS), use the **static
   profile**: framework=static, no build step, serve with a static server for
   ITERATE (e.g. `npx serve .` or the project's existing method).

## When to ask the user

Only ask if detection is genuinely ambiguous — e.g. multiple frameworks
present, or no `dev` script and no obvious entry point. Otherwise proceed with
the detected profile and state it in one line
("Detected: Vite + React + Tailwind; dev = `pnpm dev`").

## Output

Carry a short stack profile forward for the rest of the route:
`{framework, css, animation, componentLib, packageManager, devCmd, buildCmd, testCmd}`.
Later phases reference it: BUILD matches `css`/`animation` conventions,
ITERATE runs `devCmd`, VERIFY runs `testCmd`/`buildCmd`.
````

- [ ] **Step 2: Verify the four required fallbacks/frameworks are covered**

Run:
```bash
for k in Next.js Vite Astro SvelteKit Remix static devCmd; do grep -qi "$k" ~/.claude/skills/webdev/references/stack-detection.md && echo "$k OK" || echo "$k MISSING"; done
```
Expected: seven lines, each ending `OK`.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/skills && git rev-parse --is-inside-work-tree >/dev/null 2>&1 && git add webdev/references/stack-detection.md && git commit -m "feat(webdev): add stack-detection reference" || echo "skills dir not a git repo — skipping commit"
```

---

## Task 3: Write references/mcp-integration.md

**Files:**
- Create: `C:\Users\Damian\.claude\skills\webdev\references\mcp-integration.md`

**Interfaces:**
- Consumes: the "MCP smart default (summary)" section of `SKILL.md`.
- Produces: the availability-check + graceful-skip procedure referenced by every route's SOURCE/ITERATE/audit phases in `routes.md`.

- [ ] **Step 1: Write the file with the full content below**

Create `~/.claude/skills/webdev/references/mcp-integration.md`:

````markdown
# MCP Integration (smart default)

## Availability check first

MCP tools appear as `mcp__<server>__*`. Before relying on one, confirm it is
connected this session (its tools are listed/available). If a server is not
connected, **silently skip it and fall back to core skills** — never block,
never error out, never make the user connect it. Optionally note the skip in
one line ("Context7 not connected — using existing knowledge").

## Per-server policy

### Context7 (`mcp__claude_ai_Context7__*`)
- **When:** automatically, whenever a specific library/framework API, config,
  or version detail is in play (the detected framework, Tailwind, the
  animation lib, etc.). Prefer it over training memory for library specifics.
- **How:** `resolve-library-id` then `query-docs`.
- **Skip fallback:** answer from existing knowledge, flag any uncertainty.

### chrome-devtools (`mcp__chrome-devtools__*`)
- **When:** ITERATE phase (live visual iteration) and the `audit` route
  (Lighthouse, performance traces, responsive/device emulation).
- **Prereq:** dev server running (`devCmd`) + a Chrome instance. Start the dev
  server first (see `run`), then navigate.
- **Skip fallback:** iterate from code + screenshots via the `run`/`verify`
  skills; for audits, fall back to `web-design-guidelines` static review only
  and say Lighthouse/perf numbers were not collected.

### magic-21st (`mcp__magic-21st__*`)
- **When:** OFFERED during SOURCE on component/feature/new-build routes for
  generating or refining components. Never forced.
- **Skip fallback:** hand-write the component following project conventions.

### shadcn (`mcp__shadcn__*`)
- **When:** OFFERED during SOURCE only if the project already uses shadcn
  (`components.json` / `shadcn` dep) or the user opts in.
- **Skip fallback:** hand-write or use magic-21st.

### Figma / Canva (`mcp__claude_ai_Figma__*`, `mcp__claude_ai_Canva__*`)
- **When:** only if the user points at an existing Figma/Canva design. Read the
  design before BUILD. Not a primary route.
- **Skip fallback:** proceed from the user's description.

## Cost note

These servers cost tokens and some need a running browser. Use them where they
add real value per the policy above; do not fire every server on every task.
````

- [ ] **Step 2: Verify all four smart-default MCP servers and the skip rule are covered**

Run:
```bash
for k in Context7 chrome-devtools magic-21st shadcn "silently skip"; do grep -qi "$k" ~/.claude/skills/webdev/references/mcp-integration.md && echo "$k OK" || echo "$k MISSING"; done
```
Expected: five lines, each ending `OK`.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/skills && git rev-parse --is-inside-work-tree >/dev/null 2>&1 && git add webdev/references/mcp-integration.md && git commit -m "feat(webdev): add mcp-integration reference" || echo "skills dir not a git repo — skipping commit"
```

---

## Task 4: Write references/routes.md (the seven playbooks)

**Files:**
- Create: `C:\Users\Damian\.claude\skills\webdev\references\routes.md`

**Interfaces:**
- Consumes: route ids and phase names from `SKILL.md`; stack profile from
  `stack-detection.md`; MCP policy from `mcp-integration.md`.
- Produces: the executable playbook per route (terminal detail — nothing
  downstream consumes it).

- [ ] **Step 1: Write the file with the full content below**

Create `~/.claude/skills/webdev/references/routes.md`:

````markdown
# Route Playbooks

Each route lists its cues and its phase-by-phase steps. `⏸` = stop for
approval. Detect the stack (see `stack-detection.md`) during SCOPE for every
route. Apply MCP smart-default rules (see `mcp-integration.md`) wherever a
server is named.

## new-build

**Cues:** new site/app/page, "from scratch", "start a…".

1. **SCOPE** — detect stack (or, if greenfield, confirm the intended stack in
   one line); restate the goal.
2. **`brainstorming`** — full: purpose, sections, constraints, success criteria.
3. **DESIGN ⏸** — `frontend-design` + `impeccable` to set visual direction
   (typography, palette, motion, layout). Present direction. **Stop for
   approval.**
4. **SOURCE** — `Context7` for framework/lib APIs; offer `magic-21st`/`shadcn`
   for components.
5. **BUILD** — scaffold and implement, matching the chosen direction.
6. **ITERATE** — `run` to launch (`devCmd`); `chrome-devtools` for live tuning.
7. **REVIEW** — `code-review` + `web-design-guidelines`.
8. **VERIFY** — `verify`: run the app, confirm it works.
9. **SHIP ⏸** — commit/PR. **Stop for approval.**

## feature

**Cues:** "add a … section/feature", "build a … page" on an existing site.

1. **SCOPE** — detect stack; locate where the feature fits in the existing code.
2. **`brainstorming`** — light: just the feature's purpose/constraints.
3. **DESIGN ⏸** — `frontend-design` + `impeccable`, consistent with the
   existing design language. Present. **Stop for approval.**
4. **SOURCE** — `Context7` as needed; offer `magic-21st`/`shadcn`.
5. **BUILD** — implement, following existing patterns.
6. **ITERATE** — `run` + `chrome-devtools`.
7. **REVIEW** — `code-review` + `web-design-guidelines`.
8. **VERIFY** — `verify`.
9. **SHIP ⏸** — commit/PR. **Stop for approval.**

## component

**Cues:** "build a … component/button/card/modal/nav".

1. **SCOPE** — detect stack; note where the component will be used.
2. **SOURCE** — offer `magic-21st`/`shadcn` (shadcn only if project uses it);
   `Context7` for the framework/animation API. Do a quick design sanity-check
   against the surrounding UI — no full DESIGN gate.
3. **BUILD** — implement and wire it in.
4. **ITERATE** — `run` to see it render (`chrome-devtools` if useful).
5. **VERIFY** — `verify`.
6. **SHIP ⏸** — commit/PR. **Stop for approval.**

## redesign

**Cues:** "redesign", "make it look better", "polish", "more bold/quiet",
"delight".

1. **SCOPE** — detect stack; identify the target UI and current problems.
2. **DESIGN ⏸** — `frontend-design` + `impeccable` (supporting:
   `bencium-designer` / `ui-ux-pro-max`) to propose the new direction. Present.
   **Stop for approval.** No new scaffolding.
3. **BUILD** — apply the redesign.
4. **ITERATE** — `run` + `chrome-devtools` for live visual iteration.
5. **REVIEW** — `web-design-guidelines` (a11y/UX).
6. **VERIFY** — `verify`.
7. **SHIP ⏸** — commit/PR. **Stop for approval.**

## bug-fix

**Cues:** "fix", "broken", "not working", "overflow", "error", "regression".

1. **SCOPE** — detect stack; capture the exact symptom.
2. **`systematic-debugging`** — reproduce, isolate root cause, form hypothesis.
   No DESIGN gate, no MCP.
3. **BUILD** — apply the minimal fix.
4. **VERIFY** — `verify`: confirm the symptom is gone and nothing regressed.
5. **SHIP ⏸** — commit/PR. **Stop for approval.**

## audit (read-only)

**Cues:** "audit", "review my UI", "check a11y/perf/SEO", "how's it ranking".

1. **SCOPE** — detect stack; confirm the audit's focus (a11y / perf / SEO / all).
2. **REVIEW** — `web-design-guidelines` for a11y/UX; `chrome-devtools`
   Lighthouse + performance traces for perf; optional `seo-geo-audit` for
   SEO/GEO.
3. **REPORT** — produce findings. **Make no edits. Never ship.** If the user
   wants fixes, that becomes a separate route (redesign/bug-fix).

## content

**Cues:** "copy", "microcopy", "error text", "empty-state wording", "CTA text".

1. **SCOPE** — detect stack; find the strings/components to change.
2. **`impeccable`** (copy lens) — craft the copy (clarity, tone, hierarchy).
3. **BUILD** — apply the text edits.
4. **VERIFY** — light: `run` to confirm the copy renders correctly.
5. **SHIP ⏸** — commit/PR. **Stop for approval.**
````

- [ ] **Step 2: Verify all seven route headings exist**

Run:
```bash
for r in "## new-build" "## feature" "## component" "## redesign" "## bug-fix" "## audit" "## content"; do grep -qF "$r" ~/.claude/skills/webdev/references/routes.md && echo "$r OK" || echo "$r MISSING"; done
```
Expected: seven lines, each ending `OK`.

- [ ] **Step 3: Verify gate placement — audit has no SHIP, building routes do**

Run:
```bash
grep -c "SHIP ⏸" ~/.claude/skills/webdev/references/routes.md
```
Expected: `6` (all routes except `audit`).

- [ ] **Step 4: Commit**

```bash
cd ~/.claude/skills && git rev-parse --is-inside-work-tree >/dev/null 2>&1 && git add webdev/references/routes.md && git commit -m "feat(webdev): add route playbooks" || echo "skills dir not a git repo — skipping commit"
```

---

## Task 5: Integration verification (classification dry-run + cross-file consistency)

**Files:**
- Modify (only if a check fails): any of the four files above.

**Interfaces:**
- Consumes: all four files.
- Produces: a verified, self-consistent skill.

- [ ] **Step 1: Cross-file route-id consistency**

Run:
```bash
for r in new-build feature component redesign bug-fix audit content; do
  a=$(grep -c "$r" ~/.claude/skills/webdev/SKILL.md);
  b=$(grep -c "$r" ~/.claude/skills/webdev/references/routes.md);
  echo "$r: SKILL=$a routes=$b";
done
```
Expected: every route appears at least once (`>=1`) in both files. If any shows `0`, fix the missing reference in that file, then re-run.

- [ ] **Step 2: Reference filenames in SKILL.md all exist**

Run:
```bash
for f in routes stack-detection mcp-integration; do test -f ~/.claude/skills/webdev/references/$f.md && grep -q "references/$f.md" ~/.claude/skills/webdev/SKILL.md && echo "$f OK" || echo "$f BROKEN LINK"; done
```
Expected: three lines, each ending `OK`.

- [ ] **Step 3: Classification dry-run**

Read `SKILL.md`'s Detection Table, then classify these seven sample prompts. Confirm each maps to the intended route (this is a reasoning check — write the mapping out):

| Sample prompt | Expected route |
|---|---|
| "Start a new landing page from scratch for my startup" | new-build |
| "Add a testimonials section to the homepage" | feature |
| "Build me a pricing card component" | component |
| "Make the hero section look bolder and more polished" | redesign |
| "The mobile nav overflows and breaks — fix it" | bug-fix |
| "Review my site for accessibility and performance issues" | audit |
| "Rewrite the empty-state text on the dashboard" | content |

Expected: all seven map correctly. If any is ambiguous or wrong, tighten that
route's cues in `SKILL.md`'s Detection Table, then re-run this step.

- [ ] **Step 4: Gate-rule consistency check**

Confirm by reading: (a) `audit` route in `routes.md` has no SHIP and no edits;
(b) `bug-fix` and `component` have a SHIP gate but no DESIGN gate; (c) all
other routes have both DESIGN ⏸ and SHIP ⏸. Fix any mismatch against the spec
§7, then re-read.

- [ ] **Step 5: Final commit**

```bash
cd ~/.claude/skills && git rev-parse --is-inside-work-tree >/dev/null 2>&1 && { git add webdev; git diff --cached --quiet && echo "no changes to commit" || git commit -m "fix(webdev): integration consistency pass"; } || echo "skills dir not a git repo — skipping commit"
```

---

## Self-Review (author's check against the spec)

**Spec coverage:**
- §2 Intent Router → Task 1 (SKILL.md router + detection table). ✓
- §3 Stack Detection → Task 2. ✓
- §4 Phase Vocabulary → Task 1 (phase table). ✓
- §5 Routing Table (7 routes) → Task 1 (detection table) + Task 4 (playbooks). ✓
- §6 MCP smart default → Task 1 (summary) + Task 3 (full). ✓
- §7 Gates → Task 1 (Gates section) + Task 4 (per-route ⏸) + Task 5 Step 4. ✓
- §8 File structure → Tasks 1–4 create exactly the four specified files. ✓
- §9 Success criteria → Task 5 (classification dry-run, cross-file consistency, graceful-skip documented in Task 3). ✓
- §10 Out of scope → Figma/Canva demoted (Task 3, "not a primary route"); no deploy automation; non-web decline (Task 1). ✓

**Placeholder scan:** No TBD/TODO; every file's full content is inline. ✓

**Type/name consistency:** Route ids (`new-build`, `feature`, `component`,
`redesign`, `bug-fix`, `audit`, `content`) and phase names (`SCOPE`, `DESIGN`,
`SOURCE`, `BUILD`, `ITERATE`, `REVIEW`, `VERIFY`, `SHIP`) are identical across
Tasks 1 and 4, and enforced by Task 5 Steps 1 and 3. ✓

**Note on commits:** `~/.claude/skills/` may not be a git repo; every commit
step degrades to a printed skip message rather than failing. This is
intentional and honest.
````
