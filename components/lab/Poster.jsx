// Static placeholder rendered while a demo card is off-screen (the live demo
// is unmounted to free its WebGL context / rAF loop). Pure CSS — zero JS cost.
export default function Poster({ demo }) {
  return (
    <div
      aria-hidden
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-lab-panel"
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 110%, rgb(var(--lab-line) / 0.55), transparent 65%)",
        }}
      />
      <span className="relative font-lab-display text-2xl font-bold uppercase tracking-widest text-lab-dim/40 select-none">
        {demo.title}
      </span>
    </div>
  );
}
