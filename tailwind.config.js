/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Channel-based tokens so every usage (incl. /opacity modifiers)
        // re-themes automatically when the `.dark` class flips the vars.
        ivory: "rgb(var(--c-ivory) / <alpha-value>)",
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--c-ink-soft) / <alpha-value>)",
        "ink-faint": "rgb(var(--c-ink-faint) / <alpha-value>)",
        electric: "rgb(var(--c-electric) / <alpha-value>)",
        sky: "rgb(var(--c-sky) / <alpha-value>)",
        mist: "rgb(var(--c-mist) / <alpha-value>)",
        rule: "rgb(var(--c-rule) / <alpha-value>)",
        // Lab tokens (dark-only /lab route group; vars live in app/(lab)/lab.css).
        "lab-bg": "rgb(var(--lab-bg) / <alpha-value>)",
        "lab-panel": "rgb(var(--lab-panel) / <alpha-value>)",
        "lab-line": "rgb(var(--lab-line) / <alpha-value>)",
        "lab-text": "rgb(var(--lab-text) / <alpha-value>)",
        "lab-dim": "rgb(var(--lab-dim) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        "lab-display": ["var(--font-lab-display)", "sans-serif"],
        "lab-mono": ["var(--font-lab-mono)", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.06em",
        ultra: "-0.08em",
      },
    },
  },
  plugins: [],
};
