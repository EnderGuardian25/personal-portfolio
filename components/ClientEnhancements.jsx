"use client";
import dynamic from "next/dynamic";

// Non-essential, client-only progressive enhancements. Lazy-loaded with
// ssr:false so they split out of the initial bundle and load after the page
// is interactive — the site renders and scrolls fine before they arrive.
const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });
const Cursor = dynamic(() => import("./Cursor"), { ssr: false });

export default function ClientEnhancements() {
  return (
    <>
      <SmoothScroll />
      <Cursor />
    </>
  );
}
