"use client";

import { useEffect, type RefObject } from "react";

/**
 * One reveal mechanism for the whole site.
 *
 * It is TRIGGERED on contact with the screen, not scrubbed by scroll
 * position. That distinction was the single biggest motion fix in the
 * previous build: a `view()` scroll timeline's `entry` phase is the
 * element's OWN height, so a 15px caps heading got 15px of range and
 * finished inside 6px of scroll — thirty-nine elements were paying for an
 * animation nobody could see. A triggered reveal plays once, at its own
 * speed, does not unwind when you scroll back, does not race when you
 * flick, and works in Firefox and Safari, which have no scroll timelines.
 *
 * The contract with the CSS:
 *   - the SERVER renders `data-reveal="pending"` on the section
 *   - only `[data-reveal="in"]` carries a transition, so nothing can
 *     animate in the hiding direction and be watched fading away
 *   - the resting state (no attribute at all) is fully visible, so
 *     reduced-motion and no-JS visitors get the finished composition
 */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // reduced motion: drop the pending state, show everything, do nothing else
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.removeAttribute("data-reveal");
      return;
    }

    const reveal = () => {
      el.setAttribute("data-reveal", "in");
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        // on contact — or if it is already behind us, because a jump (End
        // key, anchor link, a hard fling) can take a section from below the
        // fold to above it without ever crossing a threshold, and it would
        // stay hidden for good
        if (e.isIntersecting || e.boundingClientRect.bottom < 0) reveal();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
    );
    io.observe(el);

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (el.getBoundingClientRect().bottom < 0) reveal();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);
}
