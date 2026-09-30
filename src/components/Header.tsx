"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/content/fr";
import { localeLabels, localeNames, locales, localizePath, type Locale, type PathMaps } from "@/lib/locales";
import { site } from "@/lib/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span dir="ltr" className={`flex items-center gap-2 ${className}`}>
      <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full bg-accent text-[12px] font-semibold tracking-tight text-white">
        MH
      </span>
      <span className="text-[17px] font-semibold tracking-tight">{site.name.replace("MH ", "")}</span>
    </span>
  );
}

export default function Header({ locale, nav, maps }: { locale: Locale; nav: Dictionary["nav"]; maps: PathMaps }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: `/${locale}/services`, label: nav.services },
    { href: `/${locale}/work`, label: nav.work },
    { href: `/${locale}/pricing`, label: nav.pricing },
    { href: `/${locale}/blog`, label: nav.blog },
    { href: `/${locale}/about`, label: nav.about },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const langSwitch = (
    <div className="flex items-center gap-0.5 text-[13px]" role="group" aria-label={nav.language}>
      {locales.map((l) => (
        <Link
          key={l}
          href={localizePath(pathname, l, maps)}
          hrefLang={l}
          lang={l}
          title={localeNames[l]}
          aria-current={l === locale ? "true" : undefined}
          className={`grid h-7 min-w-7 place-items-center rounded-full px-2 transition-colors ${
            l === locale ? "bg-ink text-paper" : "text-muted hover:text-ink"
          }`}
        >
          {localeLabels[l]}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        {nav.skip}
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
          scrolled || open ? "border-line bg-paper/85 backdrop-blur-md" : "border-transparent bg-transparent"
        }`}
      >
        <div className="container-x flex h-16 items-center justify-between gap-6">
          <Link href={`/${locale}`} aria-label={`${site.name} — ${nav.home}`}>
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`text-[15px] transition-colors ${isActive(link.href) ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">{langSwitch}</div>
            <Link
              href={`/${locale}/contact`}
              className="hidden rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-paper transition-colors hover:bg-ink/85 md:inline-flex"
            >
              {nav.cta}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? nav.close : nav.menu}
              className="grid h-10 w-10 place-items-center rounded-full border border-line lg:hidden"
            >
              <span aria-hidden="true" className="flex w-4 flex-col gap-[5px]">
                <span className={`h-px bg-current transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : ""}`} />
                <span className={`h-px bg-current transition-transform duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>

        <div id="mobile-menu" hidden={!open} className="border-t border-line bg-paper lg:hidden">
          <nav aria-label="Mobile" className="container-x flex flex-col py-4">
            {[...links, { href: `/${locale}/contact`, label: nav.contact }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className="border-b border-line py-3.5 text-lg font-medium last:border-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="container-x flex items-center justify-between gap-4 pb-5">
            {langSwitch}
            <Link href={`/${locale}/contact`} className="rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-paper">
              {nav.cta}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
