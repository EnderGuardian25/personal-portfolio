/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F6F6F1",
        paper: "#FBFBF7",
        ink: "#0B1F3A",
        "ink-soft": "#16315A",
        electric: "#2563EB",
        sky: "#DBEAFE",
        mist: "#EEF4FD",
        rule: "#D9DEE6",
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
