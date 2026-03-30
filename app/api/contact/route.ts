import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "omar@omarkamel.com";

// In-memory rate limiting: IP → array of request timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3;

function isRateLimited(ip: string): boolean {
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

    const { name, email, message } = body as Record<string, unknown>;

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

    // Graceful fallback if no API key
    if (!process.env.RESEND_API_KEY) {
      console.log("[Contact Form Submission]", {
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: true });
    }

    // Send email via Resend
    await resend.emails.send({
      from: "Omar Kamel Website <onboarding@resend.dev>",
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
