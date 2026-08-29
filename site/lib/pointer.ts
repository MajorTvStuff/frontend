"use client";

import { useEffect, type RefObject } from "react";

/**
 * Spring-follow the pointer across an element.
 *
 * Tying a visual directly to mouse position feels artificial because it has
 * no weight — the element snaps wherever the cursor is. Interpolating toward
 * the target each frame gives it momentum and settle, which is what makes it
 * read as physics rather than as a readout.
 *
 * Writes two custom properties, --px and --py, each -1..1 from the element's
 * own centre. The CSS decides what to do with them, so one hook serves a
 * tilting card, a drifting cover and anything else.
 *
 * Decorative only: gated to real pointers, dead under reduced motion,
 * transform-only, and the rAF loop parks itself as soon as the spring
 * settles rather than running forever.
 */
export function usePointerSpring(
  ref: RefObject<HTMLElement | null>,
  { onlyWhileHovered = true }: { onlyWhileHovered?: boolean } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let vx = 0;
    let vy = 0;
    let frame = 0;
    let idle = 0;

    // stiff enough to keep up, damped enough not to wobble
    const STIFF = 0.06;
    const DAMP = 0.8;

    const tick = () => {
      vx = (vx + (tx - cx) * STIFF) * DAMP;
      vy = (vy + (ty - cy) * STIFF) * DAMP;
      cx += vx;
      cy += vy;
      el.style.setProperty("--px", cx.toFixed(4));
      el.style.setProperty("--py", cy.toFixed(4));
      const settled =
        Math.abs(tx - cx) < 0.0008 &&
        Math.abs(ty - cy) < 0.0008 &&
        Math.abs(vx) < 0.0008 &&
        Math.abs(vy) < 0.0008;
      if (settled && ++idle > 4) {
        frame = 0;
        return;
      }
      if (!settled) idle = 0;
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
    const rest = () => {
      tx = 0;
      ty = 0;
      wake();
    };

    const target: HTMLElement | Window = onlyWhileHovered ? el : window;
    target.addEventListener("pointermove", onMove as EventListener, {
      passive: true,
    });
    el.addEventListener("pointerleave", rest);
    return () => {
      target.removeEventListener("pointermove", onMove as EventListener);
      el.removeEventListener("pointerleave", rest);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, onlyWhileHovered]);
}
