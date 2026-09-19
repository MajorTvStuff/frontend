"use client";

import { useEffect } from "react";

/** the controls that open and swap panels: a press on one of these is theirs
    to handle, never a press "off" the panel */
const CONTROLS = ".jacket-hit, .band-hit, .stage-reset, .book-panel-close";

/**
 * A panel a press opened, and the two ways out every visitor reaches for:
 * Escape, and a press anywhere off it.
 *
 * `click`, not `pointerdown`: a finger that scrolls the page never produces
 * one, so reading on past a shelf cannot close what someone just opened.
 * And the test is the panel's BOX, not the click's target — on a wide screen
 * the panel is transparent to the pointer so the covers underneath stay
 * reachable, which means a click on its own text reports whatever lies
 * beneath it.
 */
export function useDismiss(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest(CONTROLS)) return;
      const r = document.getElementById("book-panel")?.getBoundingClientRect();
      if (
        r &&
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      )
        return;
      close();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open, close]);
}
