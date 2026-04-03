"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "error" | "submitted";

interface FormData {
  name: string;
  email: string;
  message: string;
  website: string; // honeypot
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
    website: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("submitted");
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", message: "", website: "" });
    setStatus("idle");
    setErrorMessage("");
  };

  if (status === "submitted") {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <div className="w-12 h-[1px] bg-cyan mb-6" />
        <h3 className="text-2xl font-light text-light-100 mb-3">Message Sent</h3>
        <p className="text-light-300 mb-6">
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
        <button
          onClick={handleReset}
          className="border border-cyan text-cyan font-mono text-xs tracking-widest uppercase px-8 py-3 transition-all duration-200 hover:bg-cyan hover:text-black"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
      {/* Honeypot — hidden from real users, bots fill it in */}
      <div className="absolute opacity-0 top-0 left-0 h-0 w-0 -z-10" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={handleChange}
        />
      </div>

      <div className="relative">
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder=" "
          value={formData.name}
          onChange={handleChange}
          className="peer w-full bg-dark-200 border-b border-light-300/20 border-t-0 border-l-0 border-r-0 px-3 pt-7 pb-3 text-sm text-light-100 placeholder-light-300/30 focus:border-b-cyan focus:outline-none transition-colors"
        />
        <label
          htmlFor="name"
          className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-light-300/50 transition-all duration-200 pointer-events-none peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-cyan peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-light-300/50"
        >
          Name
        </label>
      </div>

      <div className="relative">
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder=" "
          value={formData.email}
          onChange={handleChange}
          className="peer w-full bg-dark-200 border-b border-light-300/20 border-t-0 border-l-0 border-r-0 px-3 pt-7 pb-3 text-sm text-light-100 placeholder-light-300/30 focus:border-b-cyan focus:outline-none transition-colors"
        />
        <label
          htmlFor="email"
          className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-light-300/50 transition-all duration-200 pointer-events-none peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-cyan peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-light-300/50"
        >
          Email
        </label>
      </div>

      <div className="relative">
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder=" "
          value={formData.message}
          onChange={handleChange}
          className="peer w-full bg-dark-200 border-b border-light-300/20 border-t-0 border-l-0 border-r-0 px-3 pt-7 pb-3 text-sm text-light-100 placeholder-light-300/30 focus:border-b-cyan focus:outline-none transition-colors resize-none"
        />
        <label
          htmlFor="message"
          className="absolute left-0 top-4 text-sm text-light-300/50 transition-all duration-200 pointer-events-none peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-cyan peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-light-300/50"
        >
          Message
        </label>
      </div>

      {status === "error" && errorMessage && (
        <p className="text-red-500 text-sm">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-transparent border border-cyan text-cyan font-mono text-xs tracking-widest uppercase px-8 py-3 transition-all duration-200 hover:bg-cyan hover:text-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-cyan inline-flex items-center gap-2"
      >
        {status === "sending" && (
          <svg className="animate-spin h-4 w-4 text-cyan" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
