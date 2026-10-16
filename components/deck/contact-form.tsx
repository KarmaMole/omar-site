"use client";

import { useRef, useState } from "react";

const KINDS = ["AI video", "The workshop", "A digital build", "Film and post", "Brand and design", "Something else"];
const FALLBACK_ERROR = "Something went wrong. Please email omar@omarkamel.com directly.";

/**
 * The Deck's contact form. Posts to /api/contact like the old form; the optional
 * parts (what it is, timeline, budget) travel at the top of the message.
 */
export default function DeckContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "sent">("idle");
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const sentRef = useRef<HTMLHeadingElement>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const message = String(f.get("message") ?? "").trim();
    const bad = { name: !name, email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), message: !message };
    setInvalid(bad);
    const first = (["name", "email", "message"] as const).find((k) => bad[k]);
    if (first) {
      (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    const kinds = f.getAll("kind").map(String);
    const timeline = String(f.get("timeline") ?? "");
    const budget = String(f.get("budget") ?? "");
    const preface = [
      kinds.length ? `What it is: ${kinds.join(", ")}` : "",
      timeline ? `Timeline: ${timeline}` : "",
      budget ? `Budget: ${budget}` : "",
    ].filter(Boolean).join("\n");
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message: preface ? `${preface}\n\n${message}` : message, website: String(f.get("website") ?? "") }),
      });
      let data: { success?: boolean; error?: unknown } | null = null;
      try { data = await res.json(); } catch { data = null; }
      if (!res.ok || !data?.success) {
        setError(typeof data?.error === "string" && data.error ? data.error : FALLBACK_ERROR);
        setStatus("error");
        return;
      }
      setStatus("sent");
      requestAnimationFrame(() => sentRef.current?.focus());
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="sent" style={{ display: "block" }} role="status">
        <h2 ref={sentRef} tabIndex={-1}>Sent. Talk soon.</h2>
        <p>It goes straight to me, and I reply myself.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <fieldset className="grp">
        <legend><b>01</b> About you</legend>
        <div className="pair">
          <label className="fld"><span>Name</span><input name="name" autoComplete="name" required aria-invalid={invalid.name || undefined} /></label>
          <label className="fld"><span>Email</span><input name="email" type="email" autoComplete="email" required aria-invalid={invalid.email || undefined} /></label>
        </div>
      </fieldset>
      <fieldset className="grp">
        <legend><b>02</b> The project</legend>
        <div className="fld">
          <span id="kind-l">What is it, pick any</span>
          <div className="toggles" role="group" aria-labelledby="kind-l">
            {KINDS.map((k) => <label key={k}><input type="checkbox" name="kind" value={k} />{k}</label>)}
          </div>
        </div>
        <label className="fld">
          <span>What you need</span>
          <textarea name="message" rows={6} required aria-invalid={invalid.message || undefined} aria-describedby="msg-help" />
          <small id="msg-help">What it is, who it is for, and anything already made. Links welcome.</small>
        </label>
      </fieldset>
      <fieldset className="grp">
        <legend><b>03</b> Optional</legend>
        <div className="pair">
          <label className="fld"><span>Timeline</span>
            <select name="timeline" defaultValue="">
              <option value="">Not sure yet</option><option>This month</option><option>Next one to three months</option><option>Later this year</option>
            </select>
          </label>
          <label className="fld"><span>Budget</span>
            <select name="budget" defaultValue="">
              <option value="">Rather discuss it</option><option>Under $5k</option><option>$5k to $15k</option><option>$15k to $50k</option><option>$50k and up</option>
            </select>
          </label>
        </div>
      </fieldset>
      <label className="hp" aria-hidden="true">Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      {Object.values(invalid).some(Boolean) ? <p className="err" role="alert">Name, a valid email and a few lines about the project are needed.</p> : null}
      {status === "error" ? <p className="err" role="alert">{error}</p> : null}
      <div className="send">
        <small>Goes straight to me. No list, no newsletter.</small>
        <button type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending" : "Send"} <span aria-hidden="true">&rarr;</span></button>
      </div>
    </form>
  );
}
