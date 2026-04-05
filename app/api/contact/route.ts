import { NextRequest, NextResponse } from "next/server";
import { mailer } from "@/lib/mailer";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "omar@omarkamel.com";

// In-memory rate limiting: IP → array of request timestamps
// NOTE: This resets on each serverless cold start. For production,
// use Redis, Vercel KV, or Upstash for persistent rate limiting.
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_MAX_MAP_SIZE = 10_000; // Prevent unbounded memory growth
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Sweep every 5 minutes

/** Remove stale entries older than the rate-limit window */
function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [ip, timestamps] of rateLimitMap) {
    const recent = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, recent);
    }
  }
}

function isRateLimited(ip: string): boolean {
  cleanupRateLimitMap();

  // Hard cap: if the map is too large, evict the oldest entry
  if (rateLimitMap.size >= RATE_LIMIT_MAX_MAP_SIZE) {
    const firstKey = rateLimitMap.keys().next().value;
    if (firstKey) rateLimitMap.delete(firstKey);
  }

  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];

  // Filter to only timestamps within the window
  const recent = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitMap.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // Extract IP from x-forwarded-for header
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { name, email, message, website } = body as Record<string, unknown>;

    // Honeypot check — if filled, it's a bot
    if (website && typeof website === "string" && website.trim() !== "") {
      // Return success to not tip off the bot
      return NextResponse.json({ success: true });
    }

    // Validate required fields
    if (
      !name || typeof name !== "string" || name.trim() === "" ||
      !email || typeof email !== "string" || email.trim() === "" ||
      !message || typeof message !== "string" || message.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Name, email, and message are all required." },
        { status: 400 }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    // Graceful fallback if SMTP not configured (e.g. local dev without env vars)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("[Contact Form Submission]", {
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: true });
    }

    // Send email via Siteground SMTP.
    // FROM must match the authenticated mailbox (SMTP_USER) — Siteground rejects
    // sends from any other address. replyTo carries the submitter's email so
    // Omar can reply directly from his inbox.
    await mailer.sendMail({
      from: `"Incoming Transmission" <${process.env.SMTP_USER}>`,
      to: CONTACT_EMAIL,
      replyTo: trimmedEmail,
      subject: `Contact Form: ${trimmedName}`,
      text: `Name: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact Form Error]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
