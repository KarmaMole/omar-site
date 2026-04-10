import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not Found: Omar Kamel",
};

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center bg-[#0a0a0a]">
      <span className="section-label mb-4">Error</span>
      <h1 className="text-hero font-bold tracking-tight text-light-100">
        404
      </h1>
      <p className="mt-4 text-lg text-light-300">
        Page not found. The page you are looking for does not exist or has been
        moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block border border-cyan text-cyan px-6 py-3 text-sm font-mono transition-colors hover:bg-cyan hover:text-black rounded-[2px]"
      >
        Back to Home
      </Link>
    </section>
  );
}
