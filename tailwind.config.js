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
        electric: "rgb(var(--c-electric) / <alpha-value>)",
        sky: "rgb(var(--c-sky) / <alpha-value>)",
        mist: "rgb(var(--c-mist) / <alpha-value>)",
        rule: "rgb(var(--c-rule) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.06em",
        ultra: "-0.08em",
      },
    },
  },
  plugins: [],
};
