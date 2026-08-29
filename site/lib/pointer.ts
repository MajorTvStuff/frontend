"use client";

import { useEffect, useRef } from "react";

/**
 * Spring-follow the pointer.
 *
 * Tying a visual directly to mouse position feels artificial because it has
 * no weight — the element snaps wherever the cursor is. Interpolating toward
 * the target each frame gives it momentum and settle, which is what makes it
 * read as physics rather than as a readout.
 *
 * Decorative only, so it is gated to real pointers, disabled under reduced
 * motion, and writes nothing but a transform on elements that opt in through
 * a CSS custom property.
 */
export function usePointerParallax(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    // target (where the cursor is) and current (where the spring has got to),
    // both normalised to -1..1 from the element's centre
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let vx = 0;
    let vy = 0;
    let frame = 0;
    let idle = 0;

    // a light spring: stiff enough to keep up, damped enough not to wobble
    const STIFF = 0.055;
    const DAMP = 0.82;

    const tick = () => {
      vx = (vx + (tx - cx) * STIFF) * DAMP;
      vy = (vy + (ty - cy) * STIFF) * DAMP;
      cx += vx;
      cy += vy;
      el.style.setProperty("--px", cx.toFixed(4));
      el.style.setProperty("--py", cy.toFixed(4));
      // stop the loop once it has settled and the cursor has stopped moving
      const still =
        Math.abs(tx - cx) < 0.0006 &&
        Math.abs(ty - cy) < 0.0006 &&
        Math.abs(vx) < 0.0006 &&
        Math.abs(vy) < 0.0006;
      if (still && ++idle > 6) {
        frame = 0;
        return;
      }
      if (!still) idle = 0;
      frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      wake();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);
}
