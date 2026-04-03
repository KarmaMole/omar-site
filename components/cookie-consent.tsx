"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_KEY = "cookie-consent";

type ConsentState = "undecided" | "accepted" | "declined";

function getStoredConsent(): ConsentState {
  if (typeof window === "undefined") return "undecided";
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "declined") return value;
  return "undecided";
}

export default function CookieConsent({ gaId }: { gaId: string }) {
  const [consent, setConsent] = useState<ConsentState>("undecided");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConsent(getStoredConsent());
    setMounted(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setConsent("accepted");
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    setConsent("declined");
  }

  return (
    <>
      {/* Only inject GA after explicit consent */}
      {consent === "accepted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      {/* Banner — only shown when user has not decided yet */}
      {mounted && consent === "undecided" && (
        <div
          className="fixed bottom-0 inset-x-0 z-50 p-4"
          style={{ backgroundColor: "rgba(10,10,10,0.95)" }}
        >
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-sm">
            <p className="text-[#f5f5f5]/70">
              This site uses cookies for analytics.{" "}
              <span className="text-[#f5f5f5]/40">
                We only track basic page views via Google Analytics.
              </span>
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={decline}
                className="px-4 py-2 border border-[#f5f5f5]/20 text-[#f5f5f5]/50 hover:text-[#f5f5f5] hover:border-[#f5f5f5]/40 transition-colors text-xs uppercase tracking-wider"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="px-4 py-2 text-xs uppercase tracking-wider transition-colors"
                style={{
                  backgroundColor: "#00e5ff",
                  color: "#0a0a0a",
                }}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
