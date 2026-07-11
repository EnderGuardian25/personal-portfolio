# XrayHero & RippleSwap — True Stationary Hover + Smooth Transitions

**Date:** 2026-07-11
**Files:** `components/lab/demos/XrayHero.jsx`, `components/lab/demos/RippleSwap.jsx`
**Status:** Approved by Damian (design review, 2026-07-11)

## Problem

Both signature lab demos approximate the stationary-hover rule (a hovering
pointer must produce the effect even while resting) with faint idle feeds, and
both switch between "moving" and "resting" regimes with binary logic:

- **XrayHero** — the reveal is fed only by velocity-scaled flowmap splats. At
  rest, a faint wobble (magnitude 0.12) keeps a weak partial aperture that can
  never reach full reveal. Each frame picks one of two regimes (event splat vs
  wobble), so slow movement flip-flops between them — visible chop. The trail
  heals with a fixed ~0.6s half-life (`dissipation: 0.982`) even when the user
  has deliberately stopped to look.
- **RippleSwap** — cell energy comes only from path points that expire after
  900 ms, so a resting pointer stops emitting and the line always heals back to
  sentence A mid-hover. Cells swap via a binary class toggle
  (`energy > 0.5 → .on` with hysteresis) driving fixed 0.32s CSS transitions,
  so the propagating wave reads as stepped all-or-nothing pops.

User requirements:
1. XrayHero: trail must linger when the pointer stops moving.
2. XrayHero: a resting pointer must produce a **full** reveal beneath the
   cursor, not a partial one.
3. XrayHero: the stationary ↔ slow-moving transition must be smooth.
4. RippleSwap: the swap must **hold** (show sentence B) under a resting
   pointer instead of fading out.
5. RippleSwap: the transition between the two sentences must be smoother.

## Design — XrayHero (shader aperture + stillness blend)

One new continuous value threads through everything: **stillness** ∈ [0, 1]
(0 = moving, 1 = at rest while hovering), computed per frame by
exponential-moving-average smoothing of the pointer's measured speed. Because
it is continuous, every behavior it drives crossfades instead of switching.

1. **Full reveal at rest — radial aperture in the fragment shader.** New
   uniforms `uPointer` (cursor in UV space), `uHover` (smoothed stillness),
   `uAspect`. The shader computes an aspect-corrected circular falloff around
   the cursor and takes `f = max(trailFlow, aperture)` before the existing
   mask/edge math. At `uHover = 1` the aperture center reaches full mask —
   complete soft-edged reveal, with the existing blue edge glint ringing the
   rim for free. The reveal does not pass through the flowmap: no swirl, no
   pulse, no RG warp. The idle-wobble hack is deleted.
2. **Trail lingers when stopped — dynamic dissipation.** Flowmap dissipation
   lerps per frame between 0.982 (moving — today's heal rate) and ~0.996
   (still — half-life ~0.6s → ~2.9s), driven by the same stillness value.
   Implementation note: ogl's `Flowmap` holds `uDissipation` on its internal
   mesh program; verify the exact access path against the installed ogl
   version before relying on it.
3. **Smooth regime transitions.** `uHover` rises toward stillness over ~0.4s
   and falls quickly-but-smoothly on movement or `pointerleave`. Slow drift
   shows a partially open aperture gliding with a light trail — no regime
   flicker.

Unchanged: touch intro sweep, reduced-motion static render (stillness stays
0), back-layer text canvas, a11y (`role="img"` + label). Tuning knobs as named
constants: `APERTURE_RADIUS`, stillness speed reference, rise/fall rates,
`DISSIPATION_BASE`, `DISSIPATION_STILL`.

## Design — RippleSwap (sustained hover source + continuous flips)

1. **The pointer becomes a live energy source.** Track hover position
   (`pointermove` sets it, `pointerleave` clears it — pointerleave also fires
   after touch end). In the energy loop, add a sustained gaussian term around
   the current hover position (radius ~60–70 px, about a word's reach): cells
   near a resting cursor hold energy ≈ 1 indefinitely, so the swap persists
   until the pointer moves away or leaves. Ripple rings and streak from
   movement are untouched (additive). The rAF alive condition gains
   `|| hovering`; on leave, the field decays and heals to A as today.
2. **Continuous, field-driven flips.** Remove the `.on` class toggle,
   hysteresis, and glyph CSS transitions on the JS path. Each frame, map each
   cell's energy through smoothstep easing to progress `p` and write styles
   directly: `glyph-a` gets `rotateX(-88° × p)` with opacity fading out over
   the early part of the flip; `glyph-b` gets
   `translateX(var(--btx)) rotateX(88° × (1−p))` with opacity fading in over
   the late part. Mid-propagation cells sit at intermediate angles — one
   smooth wave, and an equally gradual heal. Skip writes when a cell's `p`
   hasn't materially changed (zero React state, same as now; 27 cells is
   trivial).
3. **Decay retuned for the new mapping.** `DECAY` 0.93 → ~0.95–0.96 so the
   passing ripple's heal doesn't feel snatched; exact value tuned live.

Untouched: the B-probe / `--bx` glyph pinning, NBSP cells, `sr-only` real
sentence, and the reduced-motion CSS crossfade fallback (keeps its
transitions; never runs the JS path).

## Verification

- Live chrome-devtools iteration on both demos: hold-at-rest (full
  reveal / held swap), slow drift (smoothness), pointerleave (heal), fast
  strokes (existing feel preserved).
- Reduced-motion check on both (static image / CSS crossfade).
- `next build` green (lint + types + 61 static pages).

## Out of scope

Other demos, LabStage, the hover rule doc in HANDOFF.md (update its examples
only if wording no longer matches the shipped mechanics).
