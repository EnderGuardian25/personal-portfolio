import { AVAILABILITY } from "@/lib/site";

// Pulse dot + availability label. Used in both the desktop nav and the
// mobile menu overlay — pass display/spacing via className.
export default function Availability({ className = "" }) {
  return (
    <span
      className={`items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink ${className}`}
    >
      <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
      {AVAILABILITY}
    </span>
  );
}
