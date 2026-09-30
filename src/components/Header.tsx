"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/content/fr";
import { localeLabels, localeNames, locales, localizePath, type Locale, type PathMaps } from "@/lib/locales";
import { site } from "@/lib/site";
import { Arrow, arrowHover } from "./ui";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span dir="ltr" className={`flex items-center gap-2.5 ${className}`}>
      <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-accent text-[13px] font-semibold tracking-tight text-white">
        MH
      </span>
      <span className="text-lg font-semibold tracking-tight">{site.name.replace("MH ", "")}</span>
    </span>
  );
}

export default function Header({ locale, nav, maps }: { locale: Locale; nav: Dictionary["nav"]; maps: PathMaps }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const links = [
    { href: `/${locale}/services`, label: nav.services },
    { href: `/${locale}/work`, label: nav.work },
    { href: `/${locale}/pricing`, label: nav.pricing },
    { href: `/${locale}/blog`, label: nav.blog },
    { href: `/${locale}/about`, label: nav.about },
    { href: `/${locale}/contact`, label: nav.contact },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const langSwitch = (
    <div className="flex items-center gap-1 text-sm" role="group" aria-label={nav.language}>
      {locales.map((l) => (
        <Link
          key={l}
          href={localizePath(pathname, l, maps)}
          hrefLang={l}
          lang={l}
          title={localeNames[l]}
          aria-current={l === locale ? "true" : undefined}
          className={`grid h-8 min-w-8 place-items-center rounded-full px-2.5 transition-colors ${l === locale ? "bg-ink text-paper" : "hover:bg-ink/10"}`}
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
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled && !open ? "border-b border-line bg-paper/75 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <Link href={`/${locale}`} aria-label={`${site.name} — ${nav.home}`} className="relative z-10">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 text-[15px] transition-colors ${
                  isActive(link.href) ? "bg-ink/[0.07]" : "hover:bg-ink/[0.07]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">{langSwitch}</div>
            <Link
              href={`/${locale}/contact`}
              data-magnetic
              className="group hidden items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-ink md:inline-flex"
            >
              {nav.cta}
              <Arrow className={arrowHover} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="relative z-10 flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-medium text-paper xl:hidden"
            >
              {open ? nav.close : nav.menu}
              <span aria-hidden="true" className="flex w-4 flex-col gap-1">
                <span className={`h-px bg-current transition-transform ${open ? "translate-y-[2.5px] rotate-45" : ""}`} />
                <span className={`h-px bg-current transition-transform ${open ? "-translate-y-[2.5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" hidden={!open} className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-paper pt-[88px] xl:hidden">
        <nav aria-label="Mobile" className="container-x flex flex-1 flex-col justify-center gap-1 py-6">
          {links.map((link, i) => (
            <Link key={link.href} href={link.href} className="display flex items-baseline gap-4 py-1.5 text-[clamp(2.25rem,10vw,4rem)]">
              <span className="eyebrow text-muted">0{i + 1}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="container-x flex items-center justify-between gap-4 border-t border-line py-6">
          {langSwitch}
          <a href={`mailto:${site.email}`} className="text-sm underline underline-offset-4">
            {site.email}
          </a>
        </div>
      </div>
    </>
  );
}
