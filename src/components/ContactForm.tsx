"use client";

import type { FormEvent } from "react";
import type { Dictionary } from "@/content/fr";
import { site } from "@/lib/site";

const field =
  "w-full rounded-2xl border border-line bg-white/60 px-5 py-4 text-base outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:bg-white";

// No back-end required: the form composes an email in the visitor's mail app.
// Swap handleSubmit for a POST to Formspree, Resend or an API route later.
export default function ContactForm({
  t,
  serviceOptions,
}: {
  t: Dictionary["contactPage"]["form"];
  serviceOptions: string[];
}) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const details = (["name", "email", "company", "service", "budget"] as const)
      .filter((key) => get(key))
      .map((key) => `${t[key]}: ${get(key)}`);
    const body = [...details, "", get("message")].join("\n");
    const subject = `${t.subject} — ${get("name")}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium">
        {t.name}
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        {t.email}
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label className="grid gap-2 text-sm font-medium sm:col-span-2">
        {t.company}
        <input name="company" autoComplete="organization" className={field} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        {t.service}
        <select name="service" defaultValue="" className={field}>
          <option value="" disabled>
            {t.servicePlaceholder}
          </option>
          {serviceOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
          <option>{t.other}</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium">
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
        <textarea name="message" required rows={6} placeholder={t.messagePlaceholder} className={`${field} resize-y`} />
      </label>
      <div className="flex flex-col items-start gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          className="inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 text-[15px] font-medium text-white transition-colors hover:bg-ink"
        >
          {t.submit}
          <span aria-hidden="true">→</span>
        </button>
        <p className="text-sm text-muted">{t.note}</p>
      </div>
    </form>
  );
}
