"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Dictionary } from "@/content/fr";
import { localeLabels, localeNames, locales, localizePath, type Locale, type PathMaps } from "@/lib/locales";
import { activeSocials, site } from "@/lib/site";
import ScrollRing from "./ScrollRing";
import SoundToggle from "./Sound";
import { Arrow, arrowHover, RollText } from "./ui";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span dir="ltr" className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold tracking-tight text-white">MH</span>{" "}
      <span className="text-[1.0625rem] font-semibold tracking-tight">{site.name.replace("MH ", "")}</span>
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
  const [folded, setFolded] = useState(false);
  const [active, setActive] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  // The capsule folds to logo + ring + menu while scrolling down, and
  // opens again when scrolling up, near the top, or on hover.
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      if (y < 160) setFolded(false);
      else if (Math.abs(y - last) > 6) setFolded(y > last);
      if (Math.abs(y - last) > 6 || y < 160) last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
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

  // The menu opens as a circle growing from the button.
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
    { href: `/${locale}/about`, label: nav.about },
  ];
  const menuLinks = [...links.slice(0, 4), { href: `/${locale}/lab`, label: nav.lab }, ...links.slice(4), { href: `/${locale}/contact`, label: nav.contact }];
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const langSwitch = (
    <div className="flex items-center gap-0.5 text-[0.8125rem]" role="group" aria-label={nav.language}>
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
      <header data-theme={open ? "dark" : undefined} className="theme-follow pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 md:pt-4">
        <div
          data-folded={folded || open}
          data-open={open}
          className="capsule pointer-events-auto flex max-w-full items-center gap-1 rounded-full border border-line bg-paper/80 p-1.5 shadow-[0_18px_40px_-24px_rgb(11_11_18/0.45)] backdrop-blur-xl transition-colors duration-500"
        >
          <Link href={`/${locale}`} title={nav.home} className="relative z-10 shrink-0 rounded-full pe-2">
            <Logo />
          </Link>

          <div className="capsule-fold grid">
            <div className="gap-1">
              <nav aria-label="Main" className="hidden items-center lg:flex">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`rounded-full px-2.5 py-1.5 text-[0.875rem] transition-colors xl:px-3 ${isActive(link.href) ? "text-ink" : "text-muted hover:text-ink"}`}
                  >
                    <RollText text={link.label} />
                  </Link>
                ))}
              </nav>
              <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-line lg:block" />
              <div className="hidden sm:block">{langSwitch}</div>
              <SoundToggle labels={sound} />
            </div>
          </div>

          <ScrollRing label={nav.top} />

          <div className="capsule-fold hidden md:grid">
            <div>
              <Link
                href={`/${locale}/contact`}
                data-fill
                className="group relative isolate ms-1 inline-flex items-center gap-2 overflow-hidden rounded-full bg-accent px-4 py-2 text-sm font-medium whitespace-nowrap text-white"
              >
                <span aria-hidden="true" className="pill-fill bg-ink" />
                <RollText text={nav.cta} />
                <Arrow className={`text-[0.85em] ${arrowHover}`} />
              </Link>
            </div>
          </div>

          <button
            ref={buttonRef}
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="site-menu"
            className="relative z-10 ms-1 flex h-9 shrink-0 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-paper"
          >
            <RollText text={open ? nav.close : nav.menu} />
            <span aria-hidden="true" className="flex w-3.5 flex-col gap-1">
              <span className={`h-px bg-current transition-transform duration-500 ${open ? "translate-y-[2.5px] rotate-45" : ""}`} />
              <span className={`h-px bg-current transition-transform duration-500 ${open ? "-translate-y-[2.5px] -rotate-45" : ""}`} />
            </span>
          </button>
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
        className={`site-menu fixed inset-0 z-40 flex flex-col overflow-y-auto pt-20 ${open ? "is-open" : ""}`}
      >
        <div className="container-x grid flex-1 items-center gap-10 py-8 lg:grid-cols-12">
          <nav aria-label="Menu" className="lg:col-span-6">
            <ul className="flex flex-col">
              {menuLinks.map((link, i) => (
                <li key={link.href} className="menu-item overflow-hidden" style={{ "--i": i } as CSSProperties}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group flex items-center gap-4 py-1"
                  >
                    <span className="eyebrow w-7 shrink-0 text-muted">0{i + 1}</span>
                    <span
                      className={`display text-[clamp(1.9rem,min(4.4vw,7vh),3.5rem)] transition-colors duration-300 group-hover:text-accent-soft ${
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
          <div aria-hidden="true" className="relative hidden aspect-[16/10] overflow-hidden rounded-2xl border border-line lg:col-span-6 lg:block">
            {previews.map((p, i) => (
              <div
                key={p.src + i}
                className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] ${
                  active % previews.length === i ? "scale-100 opacity-100" : "scale-110 opacity-0"
                }`}
              >
                <Image src={p.src} alt="" fill sizes="45vw" className="object-cover object-top" />
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
