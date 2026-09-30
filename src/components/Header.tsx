"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Dictionary } from "@/content/fr";
import { localeLabels, localeNames, locales, localizePath, type Locale, type PathMaps } from "@/lib/locales";
import { activeSocials, site } from "@/lib/site";
import SoundToggle from "./Sound";
import { Arrow, arrowHover, RollText } from "./ui";

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

export type MenuPreview = { src: string };

export default function Header({
  locale,
  nav,
  sound,
  maps,
  previews,
}: {
  locale: Locale;
  nav: Dictionary["nav"];
  sound: Dictionary["sound"];
  maps: PathMaps;
  previews: MenuPreview[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll, close on Escape and move focus into / out of the menu.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLElement>("nav a");
    const id = window.setTimeout(() => first?.focus({ preventScroll: true }), 350);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (r && menuRef.current) {
      menuRef.current.style.setProperty("--mx", `${r.left + r.width / 2}px`);
      menuRef.current.style.setProperty("--my", `${r.top + r.height / 2}px`);
    }
    setOpen((v) => !v);
  };

  const links = [
    { href: `/${locale}/services`, label: nav.services },
    { href: `/${locale}/work`, label: nav.work },
    { href: `/${locale}/pricing`, label: nav.pricing },
    { href: `/${locale}/blog`, label: nav.blog },
    { href: `/${locale}/lab`, label: nav.lab },
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
        data-theme={open ? "dark" : undefined}
        className={`theme-follow fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled && !open ? "border-b border-line bg-paper/70 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-4">
          <Link href={`/${locale}`} aria-label={`${site.name} — ${nav.home}`} className="relative z-10">
            <Logo />
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <SoundToggle labels={sound} />
            <div className="hidden sm:block">{langSwitch}</div>
            <Link
              href={`/${locale}/contact`}
              data-magnetic
              data-fill
              className="group relative isolate hidden items-center gap-2 overflow-hidden rounded-full bg-accent px-5 py-2.5 text-[15px] font-medium text-white md:inline-flex"
            >
              <span aria-hidden="true" className="pill-fill bg-ink" />
              <RollText text={nav.cta} />
              <Arrow className={arrowHover} />
            </Link>
            <button
              ref={buttonRef}
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls="site-menu"
              data-magnetic
              className="relative z-10 flex h-11 items-center gap-2.5 rounded-full bg-ink px-5 text-[15px] font-medium text-paper"
            >
              <RollText text={open ? nav.close : nav.menu} />
              <span aria-hidden="true" className="flex w-4 flex-col gap-1">
                <span className={`h-px bg-current transition-transform duration-500 ${open ? "translate-y-[2.5px] rotate-45" : ""}`} />
                <span className={`h-px bg-current transition-transform duration-500 ${open ? "-translate-y-[2.5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="site-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label={nav.menu}
        inert={!open}
        data-theme="dark"
        className={`site-menu fixed inset-0 z-40 flex flex-col overflow-y-auto pt-[88px] ${open ? "is-open" : ""}`}
      >
        <div className="container-x grid flex-1 items-center gap-10 py-8 lg:grid-cols-12">
          <nav aria-label="Main" className="lg:col-span-7">
            <ul className="flex flex-col">
              {links.map((link, i) => (
                <li key={link.href} className="menu-item overflow-hidden" style={{ "--i": i } as CSSProperties}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group flex items-center gap-5"
                  >
                    <span className="eyebrow w-8 shrink-0 text-muted">0{i + 1}</span>
                    <span
                      className={`display text-[clamp(2.1rem,min(6vw,8.5vh),5rem)] transition-colors duration-300 group-hover:text-accent-soft ${
                        isActive(link.href) ? "text-accent-soft" : ""
                      }`}
                    >
                      <RollText text={link.label} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div aria-hidden="true" className="relative hidden aspect-[4/3] overflow-hidden rounded-[28px] lg:col-span-5 lg:block">
            {previews.map((p, i) => (
              <div
                key={p.src + i}
                className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] ${
                  active % previews.length === i ? "scale-100 opacity-100" : "scale-110 opacity-0"
                }`}
              >
                <Image src={p.src} alt="" fill sizes="40vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="container-x flex flex-col gap-5 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          {langSwitch}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <a href={`mailto:${site.email}`} className="underline underline-offset-4">
              {site.email}
            </a>
            {activeSocials.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="capitalize text-muted hover:text-ink">
                {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
