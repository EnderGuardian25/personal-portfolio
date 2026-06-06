"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    // Respect the user's reduced-motion preference — skip the scroll hijack entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Lenis only smooths wheel events by default — anchor link clicks (#about,
    // #work, etc.) bypass it and cause an instant native browser jump. This
    // intercepts those clicks and delegates them to lenis.scrollTo() so the
    // smooth scroll kicks in and whileInView animations trigger properly.
    function handleAnchorClick(e) {
      const href = e.currentTarget.getAttribute("href");
      if (!href) return;

      if (href === "#top" || href === "#") {
        e.preventDefault();
        lenis.scrollTo(0);
        return;
      }

      if (href.startsWith("#")) {
        const target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        // Offset accounts for the fixed nav bar (~72px tall)
        lenis.scrollTo(target, { offset: -80 });
      }
    }

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((a) => a.addEventListener("click", handleAnchorClick));

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      anchors.forEach((a) => a.removeEventListener("click", handleAnchorClick));
      lenis.destroy();
    };
  }, []);
  return null;
}
