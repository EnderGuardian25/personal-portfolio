"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

// Sort Grid — manual 2D drag-to-reorder (framer's Reorder.Group is 1D-only).
// Every tile is absolutely positioned by a pair of motion values: idle tiles
// are driven to their slot with the imperative animate() spring, the grabbed
// tile's values are written straight from pointermove (no React state per
// frame, no jump on release — the same values just get a new spring target).
// The hovered slot is computed from the POINTER position, not the tile
// center, and the order array reorders live while the drag is still going;
// the dragged tile's own slot-effect is suspended until drop.

const ITEMS = [
  { id: "p1", src: "/lab/photo-1.webp" },
  { id: "m1", word: "SORT" },
  { id: "p2", src: "/lab/photo-2.webp" },
  { id: "m2", word: "DRAG" },
  { id: "p3", src: "/lab/photo-3.webp" },
  { id: "m3", word: "HOLD" },
  { id: "p4", src: "/lab/photo-4.webp" },
  { id: "m4", word: "DROP" },
];
const GAP = 10;
const SPRING = { type: "spring", stiffness: 420, damping: 34 };

const metrics = (s) => {
  const cols = s.w < 420 ? 2 : 4;
  const rows = Math.ceil(ITEMS.length / cols);
  return {
    cols,
    rows,
    cellW: (s.w - (cols - 1) * GAP) / cols,
    cellH: (s.h - (rows - 1) * GAP) / rows,
  };
};

function Tile({ item, idx, rect, num, isDrag, wasDrag, reduced, onGrab, onMove, onDrop }) {
  const x = useMotionValue(rect.x);
  const y = useMotionValue(rect.y);

  // Spring home whenever the slot changes — suspended while this tile is the
  // one being dragged (the pointer owns x/y then).
  useEffect(() => {
    if (isDrag) return;
    if (reduced) {
      x.set(rect.x);
      y.set(rect.y);
      return;
    }
    const ax = animate(x, rect.x, SPRING);
    const ay = animate(y, rect.y, SPRING);
    return () => {
      ax.stop();
      ay.stop();
    };
  }, [rect.x, rect.y, isDrag, reduced, x, y]);

  return (
    <motion.div
      style={{
        x,
        y,
        width: rect.w,
        height: rect.h,
        zIndex: isDrag ? 30 : wasDrag ? 15 : 1, // settling tile stays on top
        touchAction: "none",
      }}
      className={`absolute left-0 top-0 select-none ${
        reduced ? "" : isDrag ? "cursor-grabbing" : "cursor-grab"
      }`}
      onPointerDown={reduced ? undefined : (e) => onGrab(item.id, x, y, e)}
      onPointerMove={reduced ? undefined : onMove}
      onPointerUp={reduced ? undefined : onDrop}
      onPointerCancel={reduced ? undefined : onDrop}
    >
      {/* entrance wrapper — its animate props never change, so the stagger
          delay only ever plays on mount */}
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduced ? { duration: 0 } : { ...SPRING, delay: idx * 0.05 }}
        className="h-full w-full"
      >
        {/* lift layer — scale + shadow while grabbed */}
        <motion.div
          animate={{
            scale: isDrag ? 1.06 : 1,
            boxShadow: isDrag
              ? "0 18px 40px -12px rgba(0,0,0,0.7)"
              : "0 0px 0px 0px rgba(0,0,0,0)",
          }}
          transition={reduced ? { duration: 0 } : SPRING}
          className={`relative h-full w-full overflow-hidden border transition-colors ${
            isDrag ? "border-[#3b82f6]/70" : "border-lab-line hover:border-white/25"
          }`}
        >
          {item.src ? (
            <>
              <img
                src={item.src}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-1.5 left-2 bg-black/40 px-1 font-lab-mono text-[10px] tracking-[0.25em] text-[#3b82f6]">
                {num}
              </span>
            </>
          ) : (
            <div className="flex h-full w-full flex-col justify-between bg-lab-panel p-2.5">
              <span className="font-lab-mono text-[10px] tracking-[0.25em] text-lab-dim">{num}</span>
              <span
                className="font-lab-display font-bold uppercase leading-none tracking-tight text-lab-text"
                style={{ fontSize: "min(3cqw, 22px)" }}
              >
                {item.word}
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function SortGrid({ reducedMotion }) {
  const wallRef = useRef(null);
  const dragRef = useRef(null); // { id, x, y, offX, offY }
  const metricsRef = useRef(null); // render-time metrics — drag math reuses them
  const [size, setSize] = useState(null);
  const [order, setOrder] = useState(ITEMS.map((it) => it.id));
  const [dragId, setDragId] = useState(null);
  const [lastDrag, setLastDrag] = useState(null);

  useEffect(() => {
    const el = wallRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const grab = (id, x, y, e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const wr = wallRef.current.getBoundingClientRect();
    dragRef.current = {
      id,
      x,
      y,
      offX: e.clientX - wr.left - x.get(),
      offY: e.clientY - wr.top - y.get(),
    };
    setDragId(id);
    setLastDrag(id);
  };

  const move = (e) => {
    const d = dragRef.current;
    const s = wallRef.current;
    const m = metricsRef.current; // same metrics the tiles are rendered with
    if (!d || !s || !m) return;
    // Re-read the wall rect per event — scrolling mid-drag moves it, and a
    // stale snapshot would desync tile position and slot math. Cell metrics
    // come from the cached render-time size (scroll doesn't change them).
    const wr = s.getBoundingClientRect();
    const px = e.clientX - wr.left;
    const py = e.clientY - wr.top;
    d.x.set(px - d.offX); // direct motion-value writes — no re-render
    d.y.set(py - d.offY);
    // Hovered slot from the pointer itself; reorder live when it changes.
    const col = Math.min(m.cols - 1, Math.max(0, Math.floor(px / (m.cellW + GAP))));
    const row = Math.min(m.rows - 1, Math.max(0, Math.floor(py / (m.cellH + GAP))));
    const slot = row * m.cols + col;
    setOrder((prev) => {
      const from = prev.indexOf(d.id);
      if (from === slot) return prev;
      const next = prev.slice();
      next.splice(from, 1);
      next.splice(slot, 0, d.id);
      return next;
    });
  };

  const drop = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragId(null); // slot-effect resumes → spring into the settled slot
  };

  const m = size ? metrics(size) : null;
  metricsRef.current = m; // stash so move() and layout share one geometry source

  return (
    <div className="relative flex h-full w-full flex-col gap-3 overflow-hidden bg-[#07070a] p-4 sm:p-5">
      <div className="flex items-baseline justify-between font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        <span>Sort / 08</span>
        <span>{reducedMotion ? "Static order" : "2D reorder"}</span>
      </div>

      <div ref={wallRef} className="relative min-h-0 flex-1">
        {m &&
          order.map((id, slot) => {
            const idx = ITEMS.findIndex((it) => it.id === id);
            return (
              <Tile
                key={id}
                item={ITEMS[idx]}
                idx={idx}
                num={String(slot + 1).padStart(2, "0")}
                rect={{
                  x: (slot % m.cols) * (m.cellW + GAP),
                  y: Math.floor(slot / m.cols) * (m.cellH + GAP),
                  w: m.cellW,
                  h: m.cellH,
                }}
                isDrag={dragId === id}
                wasDrag={lastDrag === id}
                reduced={reducedMotion}
                onGrab={grab}
                onMove={move}
                onDrop={drop}
              />
            );
          })}
      </div>

      <p className="font-lab-mono text-[10px] uppercase tracking-[0.3em] text-lab-dim">
        Drag a tile — the rest re-sort around it
      </p>
    </div>
  );
}
