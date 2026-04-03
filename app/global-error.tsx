"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#0a0a0a",
          color: "#f5f5f5",
          margin: 0,
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div style={{ maxWidth: "28rem", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "3.75rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: "#00e5ff",
              }}
            >
              Fatal Error
            </h1>
            <p
              style={{
                color: "rgba(245,245,245,0.7)",
                fontSize: "1.125rem",
                marginBottom: "0.5rem",
              }}
            >
              A critical error occurred.
            </p>
            <p
              style={{
                color: "rgba(245,245,245,0.4)",
                fontSize: "0.875rem",
                marginBottom: "2rem",
              }}
            >
              {error.digest ? `Ref: ${error.digest}` : error.message}
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "0.75rem 1.5rem",
                border: "1px solid #00e5ff",
                backgroundColor: "transparent",
                color: "#00e5ff",
                fontFamily: "monospace",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
