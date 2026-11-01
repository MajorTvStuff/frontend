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
      /* Where the press came FROM, by the event's path rather than its
         target: the path is fixed when the event is dispatched, so it still
         holds the panel when the pressed control has already been replaced
         (the play button swaps for the player before this runs). And a press
         from the keyboard has no position at all — Enter on the play button
         reported 0,0, which the box test below read as a press off the
         panel, and closed it instead of playing. */
      const path = e.composedPath();
      const panel = document.getElementById("book-panel");
      if (panel && path.includes(panel)) return;
      if (path.some((n) => n instanceof Element && n.matches(CONTROLS))) return;
      const r = panel?.getBoundingClientRect();
      if (
        r &&
        e.detail > 0 &&
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
