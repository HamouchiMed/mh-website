# MH Group — agency website

Trilingual (FR / EN / AR), SEO-first agency site built with Next.js 16, React 19
and Tailwind CSS 4. Moderate type sizes with Lusion-style motion: a real-time
WebGL scene that follows the home page sections (`SceneCanvas.tsx`), page
colours that change per section, smooth scrolling (Lenis), a first-visit intro,
page transitions, a pinned sideways project strip, liquid image hover, a
custom cursor, magnetic and rolling-letter buttons, a full-screen menu,
optional UI sounds and a `/lab` page with three interactive experiments.
Everything stays static and readable for `prefers-reduced-motion`, touch
screens and browsers without WebGL.

## Run it

```bash
npm install
npm run dev                  # http://localhost:3000 → redirects to /fr
npm run build && npm start   # production build
```

## What's on the site

| Page | URL (FR) |
| --- | --- |
| Home | `/fr` |
| Services + 6 service pages | `/fr/services`, `/fr/services/creation-site-web` … |
| Work + case studies | `/fr/work`, `/fr/work/bricol-clic` … |
| Packages (on quote) | `/fr/pricing` |
| Blog + articles | `/fr/blog`, `/fr/blog/seo-local-maroc` … |
| City pages (12 cities + hub) | `/fr/agence-web`, `/fr/agence-web/casablanca` … (EN: `/en/web-agency/…`) |
| About, Contact | `/fr/about`, `/fr/contact` |
| Legal notice, Privacy (loi 09-08) | `/fr/legal`, `/fr/privacy` |

English lives under `/en`, Arabic (right-to-left) under `/ar`.

## Edit your content

### With the content editor (no code)

Blog articles, projects (cover image + screenshots), testimonials, client
logos, team members and the Studio settings (showreel video, key figures) are
edited at **`/keystatic`**:

- **Locally:** `npm run dev`, open http://localhost:3000/keystatic, edit, then
  commit the changed files in `content/`.
- **Online (on the live site):** connect Keystatic to GitHub once:
  1. Run the site locally with `npm run dev` and open `/keystatic`.
  2. Temporarily set `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=placeholder` in
     `.env.local`, restart, and follow Keystatic's "Create GitHub App" screen.
     It creates the app and writes `KEYSTATIC_GITHUB_CLIENT_ID`,
     `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` and
     `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` to `.env.local`.
  3. Copy those four values to Vercel → Settings → Environment Variables and
     redeploy. Edits made on `/keystatic` are then committed to GitHub and
     Vercel redeploys automatically.

Testimonials, client logos, the team, key figures and the showreel button all
stay hidden until you add real ones. Project covers are 16:10 screenshots
(ideally 1600×1000 or larger); only projects marked "featured" appear on the
home page. The current screenshots were taken from each project's own code,
with sample data where a dashboard needs a backend.

### In code

| What | Where |
| --- | --- |
| Email, WhatsApp, phone, socials, legal details (ICE, RC…) | `src/lib/site.ts` |
| Page text (FR / EN / AR) | `src/content/fr.ts`, `en.ts`, `ar.ts` |
| Services (FR/EN) + Arabic | `src/content/services.ts`, `services.ar.ts` |
| City pages | `src/content/cities.ts` |
| Colours, fonts, animations | `src/app/globals.css` |

**Before launch:** replace the placeholder email and fill in the WhatsApp
number and legal details in `src/lib/site.ts` (all marked `TODO`). The
WhatsApp button appears automatically once a number is set.

## Deploy (Vercel)

1. Import the repo on vercel.com (Next.js is detected automatically).
2. Environment variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Final domain, e.g. `https://mh-group.ma` |
| `RESEND_API_KEY` | Contact form emails ([resend.com](https://resend.com), free tier) |
| `CONTACT_TO_EMAIL` | Inbox receiving messages (defaults to the email in `site.ts`) |
| `CONTACT_FROM_EMAIL` | Verified sender, e.g. `MH Group <site@mh-group.ma>` |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console verification code |
| Keystatic variables | See "Content editor" above |

Without `RESEND_API_KEY` the contact form falls back to opening the visitor's
email app. Until you verify your domain in Resend, messages can only be sent to
the email address of your Resend account.

3. Enable **Analytics** and **Speed Insights** in the Vercel project (they're
   cookieless and already wired in).
4. Connect the domain, then submit `https://<domain>/sitemap.xml` in Google
   Search Console.

## SEO built in

- Static HTML for every page, one `<h1>` each, semantic sections.
- Per-page titles/descriptions, canonical URLs and `hreflang` (fr, en, ar, x-default).
- Translated, keyword-rich URLs for services, blog posts and city pages.
- JSON-LD: ProfessionalService, WebSite, Service, OfferCatalog, CreativeWork,
  BlogPosting, BreadcrumbList, FAQPage, City areaServed.
- `sitemap.xml` with language alternates, `robots.txt`, web manifest,
  generated Open Graph images.
- Performance: the 3D scene is a single WebGL shader (no three.js), rendered
  below native resolution, paused off-screen and static for
  `prefers-reduced-motion`. The intro loader and page transitions are pure CSS.
