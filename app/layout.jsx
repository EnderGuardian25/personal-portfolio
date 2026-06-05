import { Instrument_Serif, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  title: "DDC - Creative Technologist",
  description:
    "Portfolio of Damian De Cruz — reading BSc (Hons) Computer Science at the Informatics Institute of Technology (University of Westminster), Sri Lanka. Building at the intersection of code and design.",
  metadataBase: new URL("https://damiandecruz.com"),
  openGraph: {
    title: "Damian De Cruz — Creative Technologist",
    description: "Code, design, and curious side projects.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans bg-ivory text-ink antialiased">
        <div className="grain" aria-hidden />
        <div className="top-fade" aria-hidden />
        {children}
      </body>
    </html>
  );
}
