"use client";
import { useEffect, useRef } from "react";

// Split Flap — a departure-board row. Each cell renders four faces under its
// own perspective: two static halves (top = the INCOMING char, bottom = the
// current one) plus two hinged flaps. One flip step folds the top flap down
// (rotateX 0 → −90, origin bottom) and then swings the bottom flap out
// (90 → 0, origin top) to land the next glyph; a brightness dip on the moving
// flap sells the hinge. Word changes queue 2–4 random intermediate chars per
// cell with a left-to-right start delay, so the board clatters instead of
// snapping. A single rAF loop drives every cell with direct style writes —
// backface-visibility hides whichever flap is past edge-on, no visibility
// juggling mid-step. Reduced motion: the JSX renders the first word, settled.

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789· ";
const WORDS = ["BOARDING", "GATE B12", "ON TIME ", "DEPARTED"]; // padded to 8
const COLS = WORDS[0].length;
const STEP = 0.1; // s per single flap
const HOLD = 2.2; // s a word rests before the next departs
const rnd = () => CHARS[(Math.random() * CHARS.length) | 0];

export default function SplitFlap({ reducedMotion }) {
  const rootRef = useRef(null);
  const liveRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;

    const cells = Array.from(root.querySelectorAll("[data-cell]")).map((el) => ({
      topNext: el.querySelector('[data-face="top-next"]'),
      botCur: el.querySelector('[data-face="bot-cur"]'),
      flapT: el.querySelector("[data-flap-top]"),
      flapTChar: el.querySelector('[data-face="flap-cur"]'),
      flapB: el.querySelector("[data-flap-bot]"),
      flapBChar: el.querySelector('[data-face="flap-next"]'),
      cur: " ",
      next: null, // char currently being flipped to
      queue: [], // remaining chars (randoms + the target last)
      delay: 0, // s before this cell starts clattering
      p: 0, // progress through the current step
    }));

    const settle = (c) => {
      // Between steps every face shows `cur`; flaps parked.
      c.topNext.textContent = c.cur;
      c.botCur.textContent = c.cur;
      c.flapTChar.textContent = c.cur;
      c.flapT.style.transform = "rotateX(0deg)";
      c.flapT.style.filter = "";
      c.flapB.style.transform = "rotateX(90deg)";
      c.flapB.style.visibility = "hidden";
    };

    const beginStep = (c) => {
      c.next = c.queue.shift();
      c.p = 0;
      c.topNext.textContent = c.next; // revealed as the top flap falls away
      c.flapBChar.textContent = c.next;
      c.flapB.style.visibility = "visible";
    };

    const plan = (word) => {
      cells.forEach((c, i) => {
        const extra = 2 + ((Math.random() * 3) | 0); // the clatter
        c.queue = Array.from({ length: extra }, rnd).concat(word[i]);
        c.delay = i * 0.07 + Math.random() * 0.06; // left-to-right ripple
      });
      if (liveRef.current) liveRef.current.textContent = word.trim();
    };

    let wordIdx = -1;
    let hold = 0.5; // beat before the first word flips in — the entrance
    let raf = null;
    let prev = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      let busy = false;

      for (const c of cells) {
        if (c.delay > 0) {
          c.delay -= dt;
          busy = true;
          continue;
        }
        if (c.next == null && c.queue.length) beginStep(c);
        if (c.next == null) continue;
        busy = true;
        c.p += dt / STEP;
        if (c.p >= 1) {
          c.cur = c.next;
          c.next = null;
          settle(c);
          continue;
        }
        if (c.p < 0.5) {
          // First half: top flap folds down over the seam.
          const a = c.p * 2 * 90;
          c.flapT.style.transform = `rotateX(${-a.toFixed(1)}deg)`;
          c.flapT.style.filter = `brightness(${(1 - c.p * 0.9).toFixed(3)})`;
          c.flapB.style.transform = "rotateX(90deg)";
        } else {
          // Second half: bottom flap swings flat, catching the light.
          const a = (1 - (c.p - 0.5) * 2) * 90;
          c.flapT.style.transform = "rotateX(-90deg)";
          c.flapB.style.transform = `rotateX(${a.toFixed(1)}deg)`;
          c.flapB.style.filter = `brightness(${(0.55 + (c.p - 0.5) * 0.9).toFixed(3)})`;
        }
      }

      if (!busy) {
        hold -= dt;
        if (hold <= 0) {
          wordIdx = (wordIdx + 1) % WORDS.length;
          plan(WORDS[wordIdx]);
          hold = HOLD;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    cells.forEach(settle);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  // Half-glyph plumbing: each half-height face clips a full-height span —
  // top half shows the span at top: 0, bottom half at top: -100% (of the
  // half container, i.e. shifted up by half the cell).
  const glyph = "absolute inset-x-0 flex items-center justify-center font-lab-mono font-semibold text-lab-text";
  const initial = (i) => (reducedMotion ? WORDS[0][i] : " ");

  return (
    <div
      ref={rootRef}
      className="relative flex h-full w-full flex-col items-center justify-center gap-[3cqw] bg-[#07070a]"
    >
      <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        DDC Air — departures
      </p>

      <div aria-hidden className="flex gap-[1cqw]">
        {Array.from({ length: COLS }).map((_, i) => (
          <div
            key={i}
            data-cell
            className="relative"
            style={{ width: "9cqw", height: "12.5cqw", perspective: "40cqw", fontSize: "6cqw" }}
          >
            {/* static top — incoming char */}
            <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-[0.5cqw] border border-b-0 border-lab-line bg-[#141419]">
              <span data-face="top-next" className={glyph} style={{ height: "200%", top: 0 }}>
                {initial(i)}
              </span>
            </div>
            {/* static bottom — current char */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden rounded-b-[0.5cqw] border border-t-0 border-lab-line bg-[#101015]">
              <span data-face="bot-cur" className={glyph} style={{ height: "200%", top: "-100%" }}>
                {initial(i)}
              </span>
            </div>
            {/* top flap — current char, hinges down from the seam */}
            <div
              data-flap-top
              className="absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-[0.5cqw] border border-b-0 border-lab-line bg-[#141419] will-change-transform"
              style={{ transformOrigin: "bottom", backfaceVisibility: "hidden" }}
            >
              <span data-face="flap-cur" className={glyph} style={{ height: "200%", top: 0 }}>
                {initial(i)}
              </span>
            </div>
            {/* bottom flap — next char, swings out after the seam */}
            <div
              data-flap-bot
              className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden rounded-b-[0.5cqw] border border-t-0 border-lab-line bg-[#101015] will-change-transform"
              style={{
                transformOrigin: "top",
                transform: "rotateX(90deg)",
                backfaceVisibility: "hidden",
                visibility: "hidden",
              }}
            >
              <span data-face="flap-next" className={glyph} style={{ height: "200%", top: "-100%" }}>
                {initial(i)}
              </span>
            </div>
            {/* the mechanical seam */}
            <div className="absolute inset-x-0 top-1/2 z-10 h-px -translate-y-1/2 bg-black/70" />
          </div>
        ))}
      </div>

      <span ref={liveRef} aria-live="polite" className="sr-only">
        {WORDS[0].trim()}
      </span>

      <p className="pointer-events-none absolute bottom-4 left-4 font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Next departure every {HOLD}s
      </p>
    </div>
  );
}
