"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Dictionary } from "@/content/fr";
import { site } from "@/lib/site";

const field =
  "w-full rounded-2xl border border-line bg-white/60 px-5 py-4 text-base outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:bg-white";

type Status = "idle" | "sending" | "sent" | "error";

// Posts to /api/contact (sent by email through Resend). If the API isn't
// configured yet, it falls back to opening the visitor's email app.
export default function ContactForm({
  t,
  locale,
  serviceOptions,
  packages,
}: {
  t: Dictionary["contactPage"]["form"];
  locale: string;
  serviceOptions: { id: string; label: string }[];
  packages: { id: string; label: string }[];
}) {
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Bring the confirmation into view (and to screen readers) once sent.
  useEffect(() => {
    if (status !== "sent") return;
    successRef.current?.focus({ preventScroll: true });
    successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [status]);

  // Preselect from links such as /contact?package=business or ?service=web.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const form = formRef.current;
    if (!form) return;
    const pkg = packages.find((p) => p.id === params.get("package"));
    const svc = serviceOptions.find((s) => s.id === params.get("service"));
    if (pkg) (form.elements.namedItem("package") as HTMLSelectElement).value = pkg.label;
    if (svc) (form.elements.namedItem("service") as HTMLSelectElement).value = svc.label;
  }, [packages, serviceOptions]);

  const mailtoFallback = (data: Record<string, string>) => {
    const keys = ["name", "email", "company", "service", "package", "budget"] as const;
    const details = keys.filter((k) => data[k]).map((k) => `${t[k]}: ${data[k]}`);
    const body = [...details, "", data.message].join("\n");
    const subject = `${t.subject} — ${data.name}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(
      Array.from(new FormData(e.currentTarget).entries()).map(([k, v]) => [k, String(v).trim()]),
    );
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      if (res.ok) {
        setStatus("sent");
        formRef.current?.reset();
        return;
      }
      if (res.status === 503) {
        setStatus("idle");
        mailtoFallback(data);
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-line bg-white/60 p-10 md:p-14">
        <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl text-white">
          ✓
        </span>
        <h2 ref={successRef} tabIndex={-1} className="h-section mt-6 outline-none">
          {t.successTitle}
        </h2>
        <p className="mt-4 text-lg text-muted">{t.successText}</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-8 text-[15px] font-medium underline underline-offset-4">
          {t.again}
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      {/* Honeypot: hidden from people, often filled by spam bots. */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium">
        {t.name}
        <input name="name" required maxLength={120} autoComplete="name" className={field} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        {t.email}
        <input name="email" type="email" required maxLength={200} autoComplete="email" dir="ltr" className={`${field} rtl:text-right`} />
      </label>
      <label className="grid gap-2 text-sm font-medium sm:col-span-2">
        {t.company}
        <input name="company" maxLength={160} autoComplete="organization" className={field} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        {t.service}
        <select name="service" defaultValue="" className={field}>
          <option value="" disabled>
            {t.servicePlaceholder}
          </option>
          {serviceOptions.map((s) => (
            <option key={s.id}>{s.label}</option>
          ))}
          <option>{t.other}</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium">
        {t.package}
        <select name="package" defaultValue="" className={field}>
          <option value="">—</option>
          {packages.map((p) => (
            <option key={p.id}>{p.label}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium sm:col-span-2">
        {t.budget}
        <select name="budget" defaultValue="" className={field}>
          <option value="" disabled>
            {t.budgetPlaceholder}
          </option>
          {t.budgets.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium sm:col-span-2">
        {t.message}
        <textarea name="message" required rows={6} maxLength={5000} placeholder={t.messagePlaceholder} className={`${field} resize-y`} />
      </label>
      {status === "error" && (
        <p role="alert" className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 sm:col-span-2">
          {t.error}{" "}
          <a href={`mailto:${site.email}`} className="font-medium underline">
            {site.email}
          </a>
        </p>
      )}
      <div className="flex flex-col items-start gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 text-[15px] font-medium text-white transition-colors hover:bg-ink disabled:opacity-60"
        >
          {status === "sending" ? t.sending : t.submit}
          <span aria-hidden="true" className="rtl:-scale-x-100">
            →
          </span>
        </button>
        <p className="text-sm text-muted">
          {t.note}{" "}
          <Link href={`/${locale}/privacy`} className="underline underline-offset-4">
            {t.privacy}
          </Link>
        </p>
      </div>
    </form>
  );
}
