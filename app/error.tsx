"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1
          className="text-6xl font-mono font-bold mb-4"
          style={{ color: "#E63946" }}
        >
          Error
        </h1>
        <p className="text-[#f5f5f5]/70 text-lg mb-2 font-mono">
          Something went wrong.
        </p>
        <p className="text-[#8a8a8a] text-sm mb-8 font-mono">
          {error.digest ? `Ref: ${error.digest}` : error.message}
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 border font-mono text-sm uppercase tracking-wider transition-colors duration-200"
          style={{
            borderColor: "#E63946",
            color: "#E63946",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#E63946";
            e.currentTarget.style.color = "#0a0a0a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#E63946";
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
