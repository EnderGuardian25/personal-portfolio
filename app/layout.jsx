import { Instrument_Serif, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import MotionProvider from "@/components/MotionProvider";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Damian De Cruz — Creative Technologist",
  description:
    "Portfolio of Damian De Cruz — reading BSc (Hons) Computer Science at the Informatics Institute of Technology (IIT), Sri Lanka, affiliated with the University of Westminster. Building at the intersection of code and design.",
  metadataBase: new URL("https://damiandc.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Damian De Cruz — Creative Technologist",
    description: "Code, design, and curious side projects. BSc Computer Science @ IIT Sri Lanka.",
    type: "website",
    siteName: "Damian De Cruz",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Damian De Cruz — Creative Technologist" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Damian De Cruz — Creative Technologist",
    description: "Code, design, and curious side projects. BSc Computer Science @ IIT Sri Lanka.",
    images: ["/og.jpg"],
  },
};

// Runs before first paint so the saved/system theme is applied with no flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

// JSON-LD Person structured data — helps Google associate this site with
// the entity "Damian De Cruz" and link verified social profiles.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Damian De Cruz",
  url: "https://damiandc.com",
  jobTitle: "Creative Technologist",
  affiliation: {
    "@type": "EducationalOrganization",
    name: "Informatics Institute of Technology",
    alternateName: "IIT Sri Lanka",
    url: "https://www.iit.ac.lk",
  },
  alumniOf: {
    "@type": "EducationalOrganization",
    name: "University of Westminster",
    url: "https://www.westminster.ac.uk",
  },
  sameAs: [
    "https://www.linkedin.com/in/damian-de-cruz/",
    "https://github.com/EnderGuardian25",
    "https://www.instagram.com/damian._.dc",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-ivory text-ink antialiased">
        <div className="grain" aria-hidden />
        <div className="top-fade" aria-hidden />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
