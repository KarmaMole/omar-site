"use client";

import { useEffect, useRef, useState } from "react";

type Status = "idle" | "sending" | "error" | "submitted";

interface FormData {
  name: string;
  email: string;
  message: string;
  website: string; // honeypot
}

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

const FALLBACK_ERROR =
  "Something went wrong. Please email omar@omarkamel.com directly.";
const NETWORK_ERROR =
  "Network error. Please check your connection and try again.";

const FIELD_ORDER = ["name", "email", "message"] as const;

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
    website: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const fieldRefs = { name: nameRef, email: emailRef, message: messageRef };

  // Move focus to the confirmation so keyboard and screen reader users land on it.
  useEffect(() => {
    if (status === "submitted") successHeadingRef.current?.focus();
  }, [status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!formData.message.trim()) errors.message = "Message is required";
    setFieldErrors(errors);

    const firstInvalid = FIELD_ORDER.find((key) => errors[key]);
    if (firstInvalid) fieldRefs[firstInvalid].current?.focus();
    return !firstInvalid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      setStatus("idle");
      setErrorMessage("");
      return;
    }
    setStatus("sending");
    setErrorMessage("");

    let res: Response;
    try {
      res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } catch {
      // The request never completed: a real network failure.
      setErrorMessage(NETWORK_ERROR);
      setStatus("error");
      return;
    }

    // The server answered. It may not be JSON (500 pages, 413, proxies).
    let data: { success?: boolean; error?: unknown } | null = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok || !data?.success) {
      setErrorMessage(
        typeof data?.error === "string" && data.error ? data.error : FALLBACK_ERROR
      );
      setStatus("error");
      return;
    }

    setStatus("submitted");
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", message: "", website: "" });
    setStatus("idle");
    setErrorMessage("");
    setFieldErrors({});
  };

  if (status === "submitted") {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <div className="w-12 h-[1px] bg-cyan mb-6" />
        <h3
          ref={successHeadingRef}
          tabIndex={-1}
          className="text-2xl font-light text-light-100 mb-3 outline-none"
        >
          Message Sent
        </h3>
        <p className="text-light-300 mb-6">
          Thanks for reaching out. I&apos;ll get back to you soon.
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

  const errorCount = Object.values(fieldErrors).filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Honeypot, hidden from real users, bots fill it in */}
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

      {/* One summary alert; individual messages stay linked via aria-describedby */}
      {errorCount > 0 && (
        <div role="alert" className="text-red-400 text-sm">
          {errorCount === 1
            ? "Please fix the field below."
            : "Please fix the fields below."}
        </div>
      )}

      <div className="relative">
        <input
          ref={nameRef}
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          placeholder=" "
          value={formData.name}
          onChange={handleChange}
          aria-invalid={fieldErrors.name ? true : undefined}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
          className={`peer w-full bg-dark-200 border-b ${fieldErrors.name ? "border-red-500/50" : "border-light-300/20"} border-t-0 border-l-0 border-r-0 px-3 pt-7 pb-3 text-sm text-light-100 placeholder-light-300/30 focus:border-b-cyan focus:outline-none transition-colors`}
        />
        <label
          htmlFor="name"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-light-400 transition-all duration-200 pointer-events-none peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-cyan peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-light-400"
        >
          Name
        </label>
        {fieldErrors.name && (
          <p id="name-error" className="text-red-400 text-xs mt-1.5">{fieldErrors.name}</p>
        )}
      </div>

      <div className="relative">
        <input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder=" "
          value={formData.email}
          onChange={handleChange}
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          className={`peer w-full bg-dark-200 border-b ${fieldErrors.email ? "border-red-500/50" : "border-light-300/20"} border-t-0 border-l-0 border-r-0 px-3 pt-7 pb-3 text-sm text-light-100 placeholder-light-300/30 focus:border-b-cyan focus:outline-none transition-colors`}
        />
        <label
          htmlFor="email"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-light-400 transition-all duration-200 pointer-events-none peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-cyan peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-light-400"
        >
          Email
        </label>
        {fieldErrors.email && (
          <p id="email-error" className="text-red-400 text-xs mt-1.5">{fieldErrors.email}</p>
        )}
      </div>

      <div className="relative">
        <textarea
          ref={messageRef}
          id="message"
          name="message"
          rows={6}
          required
          maxLength={5000}
          placeholder=" "
          value={formData.message}
          onChange={handleChange}
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          className={`peer w-full bg-dark-200 border-b ${fieldErrors.message ? "border-red-500/50" : "border-light-300/20"} border-t-0 border-l-0 border-r-0 px-3 pt-7 pb-3 text-sm text-light-100 placeholder-light-300/30 focus:border-b-cyan focus:outline-none transition-colors resize-none`}
        />
        <label
          htmlFor="message"
          className="absolute left-3 top-4 text-sm text-light-400 transition-all duration-200 pointer-events-none peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-cyan peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-light-400"
        >
          Message
        </label>
        {fieldErrors.message && (
          <p id="message-error" className="text-red-400 text-xs mt-1.5">{fieldErrors.message}</p>
        )}
      </div>

      {status === "error" && errorMessage && (
        <div role="alert" className="text-red-500 text-sm">{errorMessage}</div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-cyan text-black font-mono text-xs tracking-widest uppercase px-8 py-3 transition-all duration-200 hover:shadow-[0_0_12px_rgba(0,217,255,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100 inline-flex items-center gap-2"
      >
        {status === "sending" && (
          <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
