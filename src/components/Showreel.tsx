"use client";

import { useEffect, useRef, useState } from "react";

// "Watch the showreel" button + full-screen video. Only rendered once a video
// has been uploaded in the CMS (Studio → showreel).
export default function Showreel({ src, poster, labels }: { src: string; poster?: string | null; labels: { open: string; close: string } }) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    void videoRef.current?.play().catch(() => {});
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    videoRef.current?.pause();
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        data-magnetic
        className="group inline-flex items-center gap-3 text-[15px] font-medium"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 group-hover:scale-110">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current rtl:-scale-x-100">
            <path d="M7 4.5v15l12-7.5-12-7.5Z" />
          </svg>
        </span>
        {labels.open}
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={labels.open} className="fixed inset-0 z-[95] grid place-items-center bg-black/90 p-4">
          <video ref={videoRef} src={src} poster={poster ?? undefined} controls playsInline className="max-h-[85vh] w-full max-w-6xl rounded-2xl" />
          <button
            type="button"
            onClick={close}
            autoFocus
            className="absolute end-5 top-5 rounded-full bg-white px-5 py-2.5 text-[15px] font-medium text-black"
          >
            {labels.close}
          </button>
        </div>
      )}
    </>
  );
}
