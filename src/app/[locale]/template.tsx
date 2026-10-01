"use client";

import { useEffect, useState, type ReactNode } from "react";

// Re-mounted on every navigation: after the first page, each new page comes
// in behind a sliding accent curtain.
let hasNavigated = false;

export default function Template({ children }: { children: ReactNode }) {
  const [animate] = useState(() => typeof window !== "undefined" && hasNavigated);
  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <>
      {animate && <div aria-hidden="true" className="page-curtain" />}
      <div className={animate ? "page-enter" : undefined}>{children}</div>
    </>
  );
}
