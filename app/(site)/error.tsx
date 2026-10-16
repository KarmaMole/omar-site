"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div data-mode="doc">
      <section className="slide title-slide lost">
        <div>
          <span className="no">Error</span>
          <h1>Something <b>Broke</b></h1>
          <p className="sub">sorry, this page hit a problem. please try again.</p>
          {error.digest ? <p className="sub">Reference: {error.digest}</p> : null}
          <p style={{ marginTop: 26 }}><button type="button" className="more" onClick={reset}>Try again <span aria-hidden="true">&rarr;</span></button></p>
        </div>
      </section>
    </div>
  );
}
