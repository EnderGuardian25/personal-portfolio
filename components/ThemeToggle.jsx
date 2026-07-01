"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useLayoutEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1];

// Run before the browser paints on the client (avoids a one-frame icon flash
// where dark-mode visitors briefly see the sun), but fall back to useEffect on
// the server to avoid the SSR useLayoutEffect warning.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function ThemeToggle() {
  // `mounted` guards against hydration mismatch: server + first client render
  // both show the sun, then we sync to the real theme set by the no-flash script.
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useIsoLayoutEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };

  const showMoon = mounted && dark;

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      aria-label={showMoon ? "Switch to light mode" : "Switch to dark mode"}
      title={showMoon ? "Light mode" : "Dark mode"}
      className="relative grid place-items-center w-8 h-8 rounded-full border border-ink/25 text-ink transition-colors duration-300 hover:border-electric hover:text-electric"
    >
      <AnimatePresence mode="wait" initial={false}>
        {showMoon ? (
          <motion.svg
            key="moon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ rotate: -70, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 70, scale: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
          </motion.svg>
        ) : (
          <motion.svg
            key="sun"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ rotate: -70, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 70, scale: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2v2.2M12 19.8V22M4.22 4.22l1.56 1.56M18.22 18.22l1.56 1.56M2 12h2.2M19.8 12H22M4.22 19.78l1.56-1.56M18.22 5.78l1.56-1.56" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
