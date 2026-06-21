import ServicesNav from "@/components/ServicesNav";
import Footer from "@/components/Footer";
import Services from "@/components/Services";
import ClientEnhancements from "@/components/ClientEnhancements";

export const metadata = {
  title: "Web Design Services in Colombo | Damian De Cruz",
  description:
    "Freelance web design & development in Colombo, Sri Lanka. Custom business sites, portfolios, booking systems, and redesigns — clean, fast, and often delivered in days. Starting from LKR 18,000.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Web Design Services in Colombo | Damian De Cruz",
    description:
      "Freelance web design & development in Colombo, Sri Lanka. Custom sites, booking systems & redesigns — clean, fast, delivered in days. From LKR 18,000.",
    type: "website",
    url: "/services",
    siteName: "Damian De Cruz",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Web Design Services — Damian De Cruz" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Design Services in Colombo | Damian De Cruz",
    description:
      "Freelance web design & development in Colombo, Sri Lanka. Custom sites, booking systems & redesigns — clean, fast, delivered in days.",
    images: ["/og.jpg"],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's included in a build?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every site comes fully responsive (great on phones, tablets, and desktops), quick to load, and with basic on-page SEO so Google can find it. Business builds add a contact form, analytics, and social links. Anything beyond the agreed scope is quoted up front — no surprises.",
      },
    },
    {
      "@type": "Question",
      name: "How fast can you really deliver?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A single-page site is usually ~2–3 days, a small business site about a week, and booking sites 1–2 weeks. Those timelines assume your content (text, images, logo) is ready and feedback is prompt — speed is a two-way street.",
      },
    },
    {
      "@type": "Question",
      name: "What about domain and hosting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Those are small recurring costs paid to providers, not to me — a domain runs about LKR 3,000/year and hosting roughly LKR 10,000–20,000/year. I'll recommend and set it all up for you, or build on hosting you already have.",
      },
    },
    {
      "@type": "Question",
      name: "How does payment work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Typically 30–40% up front to begin, with the balance on delivery. For larger projects we can split it across milestones. I'll confirm the full price before any work starts.",
      },
    },
    {
      "@type": "Question",
      name: "What happens to the deposit if the project is cancelled?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The upfront deposit covers the scoping and design work done before a single line of code is written — that time is spent regardless of what happens next. If you cancel after work has started, the deposit is non-refundable, but you keep everything produced up to that point (designs, wireframes, any partial build). If I fail to deliver what was agreed, I'll refund in full. Either way, the full price is locked in writing before work begins — no surprises.",
      },
    },
    {
      "@type": "Question",
      name: "Do you work with clients outside Sri Lanka?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — I work with clients anywhere. International projects are quoted in USD (roughly the figures shown), and we handle everything over email, WhatsApp, or a call.",
      },
    },
    {
      "@type": "Question",
      name: "What if I need changes after launch?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A round of revisions is included with every build, and I'm reachable for small fixes once you're live. Ongoing maintenance or larger updates can be arranged whenever you need them.",
      },
    },
  ],
};

// JSON-LD service catalog — lists the concrete offerings with price ranges so
// Google can surface them for local "web design / developer" service searches.
const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Web Design and Development",
  provider: {
    "@type": "Person",
    name: "Damian De Cruz",
    url: "https://damiandc.com",
  },
  areaServed: { "@type": "Place", name: "Colombo, Sri Lanka" },
  url: "https://damiandc.com/services",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Web Design & Development Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Web design & development" },
        priceCurrency: "LKR",
        price: "18000",
        description: "Custom, responsive single-page and landing websites.",
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Business & portfolio websites" },
        priceCurrency: "LKR",
        price: "40000",
        description: "Multi-page business and portfolio sites with SEO and contact forms.",
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Booking & scheduling websites" },
        priceCurrency: "LKR",
        price: "65000",
        description: "Appointment and reservation sites with payment integration.",
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Website redesigns & speed fixes" },
        priceCurrency: "LKR",
        price: "25000",
        description: "Visual refreshes and performance / Core Web Vitals optimisation.",
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "SEO & AI visibility audit" },
        priceCurrency: "LKR",
        price: "50000",
        description: "On-page, technical, and GEO audit — how the site ranks on Google and surfaces in AI answers, with a priority roadmap.",
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "SEO & GEO implementation" },
        priceCurrency: "LKR",
        price: "65000",
        description: "Implementation of audit recommendations — technical fixes, schema markup, and AI snippet optimisation.",
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Ongoing SEO & GEO retainer" },
        priceCurrency: "LKR",
        price: "35000",
        description: "Monthly SEO health checks, GEO monitoring, content updates, and a performance report.",
      },
    ],
  },
};

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ClientEnhancements />
      <ServicesNav />
      <main className="relative">
        <Services />
        <Footer />
      </main>
    </>
  );
}
