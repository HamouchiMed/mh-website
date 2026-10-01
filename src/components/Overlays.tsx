import type { Dictionary } from "@/content/fr";
import { site } from "@/lib/site";
import { Logo } from "./Header";

// First-visit intro: a 0 → 100 counter, then the panel slides away. Pure CSS
// driven by the `intro-play` class that an inline script adds once per session
// (never for reduced motion), so it costs no JavaScript bundle.
export function IntroLoader({ tagline }: { tagline: string }) {
  return (
    <div className="intro-loader" aria-hidden="true">
      <div className="container-x flex h-full flex-col justify-between py-6">
        <Logo />
        <div className="flex items-end justify-between gap-6">
          <span className="intro-count display" />
          <span className="eyebrow mb-4 hidden text-paper/60 sm:block">{tagline}</span>
        </div>
      </div>
      <div className="intro-bar" />
    </div>
  );
}

export const introScript = `try{var d=document.documentElement;if(!sessionStorage.getItem('mh-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro-play');sessionStorage.setItem('mh-intro','1');setTimeout(function(){d.classList.remove('intro-play')},2600)}}catch(e){}`;

export function WhatsAppButton({ t }: { t: Dictionary["whatsapp"] }) {
  if (!site.whatsapp) return null;
  const href = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(t.message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.label}
      data-magnetic
      className="group fixed bottom-5 end-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#25D366] ps-4 pe-4 text-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)] transition-[padding] duration-300 hover:pe-5 md:bottom-8 md:end-8"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6 fill-current">
        <path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.54 1.74 6.51L3 29l6.66-1.74A12.95 12.95 0 0 0 16.04 29C23.2 29 29.03 23.18 29.03 16S23.2 3 16.04 3Zm0 23.63c-2.03 0-4.02-.55-5.75-1.58l-.41-.24-3.95 1.03 1.05-3.85-.27-.4A10.6 10.6 0 0 1 5.4 16c0-5.87 4.77-10.64 10.64-10.64S26.67 10.13 26.67 16s-4.77 10.63-10.63 10.63Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.14 3.08 1.3 3.3c.16.21 2.25 3.43 5.44 4.81.76.33 1.35.52 1.81.67.76.24 1.46.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
      </svg>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[15px] font-medium transition-[max-width] duration-500 group-hover:max-w-[16rem]">
        {t.label}
      </span>
    </a>
  );
}
