"use client";

import { useEffect, useRef, useState } from "react";
import { Lockup } from "@/components/Lockup";

/**
 * THE NAVBAR THAT IS NOT THERE AT THE TOP.
 *
 * The banner spends nine seconds building the words MAJOR CONTENT out of
 * nothing, and the old header sat in the corner the whole time saying the
 * same thing — "too redundant", which it was. So nothing sits over the
 * banner now. Scroll past it and a real navbar arrives: the lockup on the
 * left, Contact on the right.
 *
 * It watches the BANNER, not a pixel count: an IntersectionObserver fires
 * when the hero has left, so the bar arrives at the same moment on a phone
 * as on a desktop, whatever the viewport height. If there is no banner on
 * the page (or no observer), the bar is simply always there, which is the
 * safe way round.
 *
 * While it is away it is `hidden` to the pointer AND to the keyboard —
 * visibility: hidden in the stylesheet — so nobody tabs into an invisible
 * Contact link at the top of the page.
 */
export function TopBar({ email, watch = ".hero-banner" }: { email: string; watch?: string }) {
  const [shown, setShown] = useState(false);
  const barRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const hero = document.querySelector(watch);
    if (!hero || typeof IntersectionObserver === "undefined") {
      setShown(true); // no banner to hide behind
      return;
    }
    /* the bar arrives once the banner is mostly gone — a sliver of it left
       on screen is still the banner, and a bar appearing over it is the
       thing he did not want */
    const io = new IntersectionObserver(
      ([entry]) => setShown(entry.intersectionRatio < 0.12),
      { threshold: [0, 0.12, 0.5, 1] },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [watch]);

  return (
    <header
      ref={barRef}
      className={`topbar${shown ? " is-shown" : ""}`}
      data-shown={shown ? "true" : "false"}
    >
      <a href="#main" className="topbar-brand" aria-label="Major Content">
        <Lockup tone="light" className="w-24 sm:w-28" />
      </a>
      <a href={`mailto:${email}`} className="btn meta-caps topbar-contact">
        Contact
      </a>
    </header>
  );
}
