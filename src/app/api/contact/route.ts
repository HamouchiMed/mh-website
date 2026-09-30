import { NextResponse } from "next/server";
import { site } from "@/lib/site";

// Contact form endpoint. Sends the message by email through Resend
// (https://resend.com). Configure on Vercel:
//   RESEND_API_KEY      API key from resend.com
//   CONTACT_TO_EMAIL    inbox that receives the messages (defaults to site.email)
//   CONTACT_FROM_EMAIL  verified sender, e.g. "MH Group <site@mh-group.ma>"
//                       (defaults to Resend's test sender, which can only
//                       deliver to the email address of your Resend account)
// Without RESEND_API_KEY the endpoint answers 503 and the form falls back to
// opening the visitor's email app.

const limits = { name: 120, email: 200, company: 160, service: 120, package: 120, budget: 120, message: 5000 };
type Field = keyof typeof limits;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot filled → silently accept and drop.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const data = {} as Record<Field, string>;
  for (const key of Object.keys(limits) as Field[]) {
    const value = typeof body[key] === "string" ? (body[key] as string).trim() : "";
    if (value.length > limits[key]) return NextResponse.json({ error: `too_long_${key}` }, { status: 400 });
    data[key] = value;
  }
  if (!data.name || !data.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const rows = (["name", "email", "company", "service", "package", "budget"] as Field[])
    .filter((k) => data[k])
    .map((k) => `<tr><td style="padding:4px 12px 4px 0;color:#5e6070">${k}</td><td>${escapeHtml(data[k])}</td></tr>`)
    .join("");
  const html = `<h2 style="font-family:sans-serif">Nouveau message — ${escapeHtml(site.name)}</h2>
<table style="font-family:sans-serif;font-size:14px">${rows}</table>
<p style="font-family:sans-serif;font-size:15px;white-space:pre-wrap">${escapeHtml(data.message)}</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || `${site.name} <onboarding@resend.dev>`,
      to: [process.env.CONTACT_TO_EMAIL || site.email],
      reply_to: data.email,
      subject: `Nouveau projet — ${data.name}${data.company ? ` (${data.company})` : ""}`,
      html,
      text: [...(["name", "email", "company", "service", "package", "budget"] as Field[]).filter((k) => data[k]).map((k) => `${k}: ${data[k]}`), "", data.message].join("\n"),
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
