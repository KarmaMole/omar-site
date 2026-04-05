import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "omarkamel.com";

// Hosts that should 301-redirect to the canonical host.
// Only the production vercel.app URL is redirected — preview deployments
// (omar2026-*.vercel.app, omar2026-git-*.vercel.app) remain accessible.
const REDIRECT_HOSTS = new Set(["omar2026.vercel.app"]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (REDIRECT_HOSTS.has(host)) {
    const url = new URL(request.url);
    url.host = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except Next internals and static assets
  matcher: ["/((?!_next/|_vercel|.*\\..*).*)"],
};
