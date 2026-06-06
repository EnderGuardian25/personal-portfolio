// Single source of truth for site-wide constants reused across components.
// Update these here rather than hunting through individual sections.

export const YEAR = 2026;
export const SHORT_YEAR = String(YEAR).slice(2); // "26"

export const EMAIL = "damianmdc@outlook.com";

export const AVAILABILITY = `Available · ${YEAR}`;

// Desktop + mobile navigation. Each href is an in-page anchor id.
export const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#timeline", label: "Timeline" },
  { href: "#resume", label: "Résumé" },
  { href: "#contact", label: "Contact" },
];

// Social channels — also mirrored into the JSON-LD `sameAs` in app/layout.jsx.
export const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/damian-de-cruz/", handle: "@damian-de-cruz" },
  { label: "GitHub", href: "https://github.com/EnderGuardian25", handle: "@EnderGuardian25" },
  { label: "Instagram", href: "https://www.instagram.com/damian._.dc", handle: "@damian._.dc" },
  { label: "Discord", href: "https://discord.com/users/1123626535786659910", handle: "enderguardian_22" },
];
