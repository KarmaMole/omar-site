"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center bg-[#0a0a0a]">
      <span className="section-label mb-4">Error</span>
      <h1 className="text-4xl font-bold tracking-tight text-light-100">
        Something went wrong
      </h1>
      <p className="mt-4 text-lg text-light-300">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-block border border-cyan text-cyan px-6 py-3 text-sm font-mono transition-colors hover:bg-cyan hover:text-black rounded-[2px]"
      >
        Try again
      </button>
    </section>
  );
}
