"use client";

import { useEffect, useState } from "react";
import { Lockup } from "@/components/Lockup";

/**
 * THE NAVBAR THAT IS NOT THERE AT THE TOP.
 *
 * The banner spends its opening building the words MAJOR CONTENT, and a
 * lockup sitting in the corner the whole time said the same thing — too
 * redundant, in his words. So at the top of the page there is no bar at
 * all. The moment the visitor starts scrolling, a real navbar arrives: the
 * lockup on the left, Contact on the right. Back at the very top, it goes.
 *
 * While it is away it is visibility: hidden, not just transparent, so a
 * keyboard cannot tab into an invisible Contact link. It is hidden from the
 * first paint too — the server renders it without `is-shown`.
 */
const START = 8; // px: the page has started to move, not a trackpad twitch

export function TopBar({ email }: { email: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      setShown(window.scrollY > START);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check(); // a reload halfway down the page shows it straight away
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
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
