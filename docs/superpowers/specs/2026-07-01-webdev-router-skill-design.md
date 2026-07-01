# `/webdev` — Web Development Intent Router Skill

**Date:** 2026-07-01
**Status:** Approved design, pending implementation plan
**Scope:** Global skill (installed at `~/.claude/skills/webdev/`), usable across all future web-development projects — not scoped to any single repo.

> This spec lives in the personal-portfolio repo only as a convenient git-tracked home. The artifact it describes is global.

---

## 1. Problem

Claude has many web-dev capabilities spread across separate skills, tools, and MCP servers:

- **Design skills:** `frontend-design`, `impeccable`, `web-design-guidelines`, `artifact-design`, `bencium-designer`, `ui-ux-pro-max`
- **Review/verify skills:** `code-review`, `verify`, `requesting-code-review`, `systematic-debugging`
- **Process skills:** `brainstorming`, `writing-plans`
- **Web tooling skills:** `run`, `verify`, `seo-geo-audit`
- **MCP servers:** `chrome-devtools`, `magic-21st`, `shadcn`, `Context7`, `Figma`, `Canva`

Today the user must remember which to invoke, in what order, for each kind of task. This is error-prone and means good capabilities go unused.

**Goal:** one command — `/webdev <request>` — that classifies the request and orchestrates exactly the right capabilities, in the right order, with sensible approval gates. The user should never need to invoke the underlying skills/tools individually.

---

## 2. Architecture: Intent Router

`/webdev <request>` is an **intent router**, not a fixed pipeline and not a passive reference. On invocation Claude:

1. **SCOPE** the request — read it, detect the project stack, and classify it into exactly one of seven routes (or sequence two if the request clearly spans them).
2. State the chosen route in one line and proceed (the user can redirect).
3. Execute that route's tuned sequence of phases, honoring the two approval gates.

Rejected alternatives (for the record):
- **Fixed full pipeline** — runs design steps even for a one-line bug fix; too heavy.
- **Decision-tree playbook** — flexible but non-deterministic; defeats the "knows exactly what to call" goal.

---

## 3. Stack Detection

Because the skill is global, it must not assume Next.js/Tailwind. During SCOPE it detects the stack:

- Read `package.json` + lockfile: framework (Next, Vite, Astro, SvelteKit, Remix, CRA, plain static), CSS approach (Tailwind, CSS modules, styled-components, vanilla), animation libs (Framer Motion, GSAP), component libs (shadcn present?).
- Detect the dev/build/test commands from `scripts`.
- If no framework is detectable (e.g. hand-written HTML/CSS/JS), fall back to a static-site profile.
- Only ask the user a question if detection is genuinely ambiguous.

Detection output feeds every later phase (which commands `run`/`verify` use, whether `shadcn` MCP is relevant, which docs `Context7` fetches).

Detailed rules → `references/stack-detection.md`.

---

## 4. Shared Phase Vocabulary

Every route is composed from these phases so behavior stays consistent. `⏸` marks an approval gate.

| Phase | What runs |
|---|---|
| **SCOPE** | Understand request, detect stack (§3), pick route |
| **DESIGN** ⏸ | `frontend-design` + `impeccable` for direction; `bencium-designer` / `ui-ux-pro-max` as supporting lenses. Presents direction, **stops for approval** before building. |
| **SOURCE** | `Context7` for library APIs/config; `magic-21st` / `shadcn` for components (offered, never forced) |
| **BUILD** | Implement, matching existing code patterns and the detected stack |
| **ITERATE** | `run` to launch the app; `chrome-devtools` for live visual iteration |
| **REVIEW** | `code-review` (correctness) + `web-design-guidelines` (a11y/UX) |
| **VERIFY** | `verify` skill — run the app, observe real behavior |
| **SHIP** ⏸ | commit / PR — **stops for approval**; irreversible ops (push/deploy) always pause |

---

## 5. Routing Table

| Route | Detection cues | Sequence |
|---|---|---|
| **New build** | "new site/app/page", "from scratch", "start a…" | SCOPE → `brainstorming` → **DESIGN ⏸** → SOURCE → BUILD → ITERATE → REVIEW → VERIFY → **SHIP ⏸** |
| **Feature / section** | "add a … section/feature", "build a … page" on an existing site | SCOPE → `brainstorming` (light) → **DESIGN ⏸** → SOURCE → BUILD → ITERATE → REVIEW → VERIFY → **SHIP ⏸** |
| **Component** | "build a … component/button/card/modal/nav" | SCOPE → SOURCE (`magic-21st`/`shadcn` + `Context7`) → BUILD → ITERATE (`run`) → VERIFY → **SHIP ⏸**. Quick design sanity-check, no full DESIGN gate. |
| **Redesign / polish** | "redesign", "make it look better", "polish", "more bold/quiet", "delight" | SCOPE → **DESIGN ⏸** (`frontend-design`+`impeccable`) → BUILD → ITERATE (`chrome-devtools`) → REVIEW (`web-design-guidelines`) → VERIFY → **SHIP ⏸** |
| **Bug fix** | "fix", "broken", "not working", "overflow", "error", "regression" | SCOPE → `systematic-debugging` → BUILD (fix) → VERIFY → **SHIP ⏸**. No DESIGN gate, no MCP. |
| **Audit** (read-only) | "audit", "review my UI", "check a11y/perf/SEO", "how's it ranking" | SCOPE → REVIEW (`web-design-guidelines` + `chrome-devtools` Lighthouse/perf + optional `seo-geo-audit`) → **REPORT**. Makes no edits, never ships. |
| **Content / copy** | "copy", "microcopy", "error text", "empty-state wording", "CTA text" | SCOPE → `impeccable` (copy lens) → BUILD (edits) → VERIFY (light) → **SHIP ⏸** |

**Ambiguity handling:** if a request fits two routes, Claude states its single best pick in one line and proceeds. If it clearly contains two distinct asks (e.g. "add a pricing section and fix the mobile nav bug"), it sequences the routes (Feature, then Bug fix), each with its own gates.

---

## 6. MCP Integration Rules (smart default)

- **`Context7`** — used automatically whenever a specific library API/config is involved (framework, Tailwind, animation lib). Prefer it over training memory for library specifics.
- **`chrome-devtools`** — used in ITERATE and Audit phases only (needs dev server + Chrome). Provides live inspection, Lighthouse, performance traces, responsive/device emulation.
- **`magic-21st` / `shadcn`** — offered for component work, never forced. `shadcn` only when the project already uses (or opts into) it.
- **`Figma` / `Canva`** — not a primary route. Referenced only if the user points at an existing design file; then used to read the design before BUILD.
- **Graceful skip:** any MCP that is not connected in the current session is silently skipped and the route degrades to core skills. The skill never blocks on an unavailable MCP.

Detailed rules → `references/mcp-integration.md`.

---

## 7. Approval Gates

- Two gates on building routes: after **DESIGN** (before building) and before **SHIP** (before commit/push).
- Between gates, phases run autonomously.
- **Audit** route never edits or ships (read-only; ends in a REPORT).
- **Bug fix** and **Component** routes have no DESIGN gate but keep the SHIP gate.
- Irreversible operations (git push, deploy) always pause for confirmation even inside autonomous stretches.

---

## 8. File Structure

```
~/.claude/skills/webdev/
  SKILL.md                    # router: detection cues → route → sequence + gates + MCP smart-default rules
  references/
    routes.md                 # full per-route playbooks (detailed steps per phase, per route)
    stack-detection.md        # how to detect stack + adapt commands
    mcp-integration.md        # when/how to use each MCP, graceful-skip rules
```

- `SKILL.md` holds the router: the detection table, the phase vocabulary, gate rules, and pointers into `references/`. Kept lean so it loads fast.
- `references/routes.md` holds the verbose per-route detail so `SKILL.md` stays scannable.
- The skill's frontmatter `description` must trigger on web-dev phrasing so `/webdev` and natural web-dev requests both surface it.

---

## 9. Success Criteria

1. `/webdev <request>` correctly classifies each of the seven route types from natural phrasing.
2. Each route invokes only its tuned skills/tools/MCP, in the documented order.
3. Design and ship gates fire exactly where specified; audit never edits.
4. Works on a non-Next project (stack detection adapts commands).
5. A disconnected MCP causes a graceful skip, not a failure.
6. The user never needs to invoke `impeccable`, `frontend-design`, `code-review`, `chrome-devtools`, etc. by hand for a covered task.

---

## 10. Out of Scope (YAGNI)

- Dedicated Figma/Canva "import from design" route (demoted to an optional aside).
- Deployment/hosting automation beyond the SHIP gate's commit/PR.
- Non-web tasks (backend-only, data, CLI) — the skill declines and defers to normal handling.
