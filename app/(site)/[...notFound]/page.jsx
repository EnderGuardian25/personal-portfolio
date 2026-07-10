import { notFound } from "next/navigation";

// Catch-all for URLs no other route matches. Static routes (/, /services,
// /lab, /lab/[slug]) always win over this dynamic segment, so its only job is
// to trigger the (site) not-found boundary for genuinely unknown paths.
export default function NotFoundCatchAll() {
  notFound();
}
