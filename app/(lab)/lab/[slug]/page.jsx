import Link from "next/link";
import { notFound } from "next/navigation";
import { DEMOS, getDemo, demoIndex } from "@/lib/lab";
import LabStage from "@/components/lab/LabStage";

// Fullscreen stage for one demo — the view for walking a client through the
// library one pattern at a time (prev/next below the stage).
export function generateStaticParams() {
  return DEMOS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const demo = getDemo(slug);
  return demo ? { title: demo.title, description: demo.description } : {};
}

export default async function DemoPage({ params }) {
  const { slug } = await params;
  const demo = getDemo(slug);
  if (!demo) notFound();

  const i = demoIndex(demo.slug);
  const prev = DEMOS[(i - 1 + DEMOS.length) % DEMOS.length];
  const next = DEMOS[(i + 1) % DEMOS.length];

  return (
    <main className="mx-auto flex min-h-dvh max-w-7xl flex-col px-4 py-6 sm:px-6">
      <LabStage demo={demo} standalone />
      <nav className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-lab-dim">
        <Link
          href={`/lab/${prev.slug}`}
          className="transition-colors hover:text-lab-text"
        >
          ← {prev.title}
        </Link>
        <Link href="/lab" className="transition-colors hover:text-lab-text">
          Index
        </Link>
        <Link
          href={`/lab/${next.slug}`}
          className="transition-colors hover:text-lab-text"
        >
          {next.title} →
        </Link>
      </nav>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-lab-dim">
        {demo.description}
      </p>
    </main>
  );
}
