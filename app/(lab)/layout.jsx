import { Syne, IBM_Plex_Mono } from "next/font/google";
import "./lab.css";
import MotionProvider from "@/components/MotionProvider";

// The lab is a second root layout: it deliberately shares nothing with the
// portfolio — no globals.css, no theme script, no GA, no grain. Dark-only.
// Syne ships as a variable font (wght 400–800) — loaded without a weight list
// so demos can animate font-variation-settings across the full axis.
const display = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata = {
  // The lab's canonical home is the subdomain (see proxy.js).
  metadataBase: new URL("https://lab.damiandc.com"),
  title: {
    default: "Lab — Damian De Cruz",
    template: "%s · Lab",
  },
  description: "Interaction and animation references.",
  // Unlisted: reachable by direct link only. Deliberately NOT paired with a
  // robots.txt disallow — that would advertise the path and stop crawlers
  // from ever seeing this noindex.
  robots: { index: false, follow: false, nocache: true },
};

export default function LabLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="lab-body font-lab-mono antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
