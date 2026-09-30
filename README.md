# MH Group — agency website

Bilingual (FR/EN), SEO-first agency site built with Next.js 16, React 19 and
Tailwind CSS 4. Visual direction inspired by lusion.co: a real-time WebGL hero
(raymarched metaballs that follow the cursor), smooth scrolling, masked
headline reveals and scroll-linked text.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /fr
npm run build && npm start   # production build (all pages are static)
```

## Edit your content

| What | Where |
| --- | --- |
| Brand name, email, phone/WhatsApp, socials, site URL | `src/lib/site.ts` |
| All page copy (FR / EN) | `src/content/fr.ts`, `src/content/en.ts` |
| Services + their SEO landing pages | `src/content/services.ts` |
| Portfolio projects | `src/content/projects.ts` |
| Colours, fonts | `src/app/globals.css` (`@theme`) |

Before launch, replace the placeholder email in `src/lib/site.ts` and check
the project list — both are marked `TODO`.

## Deploy (Vercel)

1. Import the repo on vercel.com (framework is detected automatically).
2. Add the env var `NEXT_PUBLIC_SITE_URL` = your final domain, e.g. `https://mh-group.ma`.
3. Connect the domain, then submit `https://<domain>/sitemap.xml` in Google Search Console.

## What's built in for SEO

- Static HTML for every page, one `<h1>` each, semantic sections.
- Per-page titles/descriptions, canonical URLs and `hreflang` (fr, en, x-default).
- Keyword-rich, translated service URLs (`/fr/services/creation-site-web`, `/en/services/web-development`).
- JSON-LD: ProfessionalService + WebSite, Service, BreadcrumbList, FAQPage, ContactPage.
- `sitemap.xml` with language alternates, `robots.txt`, web manifest, generated Open Graph images.
- Performance: the 3D hero is ~200 lines of plain WebGL (no three.js), renders
  below native resolution, pauses off-screen, and falls back to a static
  frame for `prefers-reduced-motion`. Reveal animations only hide content
  when JS runs, so crawlers always see the text.

## Structure

```
src/app/[locale]/          pages (home, services, services/[slug], work, about, contact)
src/app/sitemap.ts         sitemap with hreflang alternates
src/components/HeroCanvas  WebGL hero
src/components/Effects     smooth scroll (Lenis), reveals, scroll-text
src/content/               all copy, services and projects
src/lib/seo.ts             metadata helper (canonical, hreflang, OG)
```
