import { NextResponse } from "next/server";

// lab.damiandc.com serves the (lab) route group by rewriting the subdomain
// onto the existing /lab routes — nothing is duplicated and no redirects fire:
//   lab host   /             -> rewrite  /lab             (index; URL stays "/")
//   lab host   /xray-hero    -> rewrite  /lab/xray-hero   (canonical: internal
//                                links are clean /<slug> hrefs, so the visible
//                                URL never carries /lab)
//   lab host   /lab/<x>      -> served as-is              (back-compat for old links)
//   main host  /lab, /lab/<x> -> 404 (the lab lives only on the subdomain; no
//                                redirect since nothing has been shared)
// The matcher excludes /api, /_next, and anything with a file extension, so
// public/ assets like /lab/photo-1.webp, robots.txt, and icons are served
// untouched on both hosts. Requires nginx to pass `proxy_set_header Host $host`.
// "lab.localhost:3000" mirrors the lab host in dev.

const LAB_HOST = "lab.damiandc.com";

function isLabHost(host) {
  return host === LAB_HOST || host.startsWith("lab.localhost");
}

export function proxy(request) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const { pathname } = request.nextUrl;
  const onLabPath = pathname === "/lab" || pathname.startsWith("/lab/");

  if (!isLabHost(host)) {
    // The lab lives only on the subdomain — hide the /lab tree on the main
    // host by rewriting to a path that has no route, yielding the 404 page.
    if (onLabPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/_lab-not-here";
      return NextResponse.rewrite(url, { status: 404 });
    }
    return;
  }

  // Back-compat: old /lab/... links still resolve on the lab host (internal
  // links are clean /<slug> hrefs from lib/lab.js labHref).
  if (onLabPath) return;

  // Map the subdomain root and clean slugs onto the /lab tree.
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/lab" : `/lab${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
