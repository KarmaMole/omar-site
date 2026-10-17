import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  // The layout title template appends ": Omar Kamel"
  title: "Not Found",
};

export default function NotFound() {
  return (
    <div data-mode="doc">
      <section className="slide title-slide lost">
        <div>
          <span className="no">404</span>
          <h1>Not <b>Found</b></h1>
          <p className="sub">the page you are looking for does not exist or has moved.</p>
          <p className="lost-links">
            {[["/", "Home"], ["/work", "The work"], ["/studio", "The studio"], ["/dispatch", "Dispatches"], ["/contact", "Contact"]].map(([href, label]) => (
              <Link key={href} className="more" href={href} prefetch={false}>{label} <span aria-hidden="true">&rarr;</span></Link>
            ))}
          </p>
        </div>
      </section>
    </div>
  );
}
