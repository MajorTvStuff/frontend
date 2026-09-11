"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

/**
 * PINCH AND DRAG THROUGH THE CLUMP — the phone's version of the cursor.
 *
 * On a desktop the backlist clump answers the pointer: near covers drift
 * further than far ones, and the pile reads as a space. A phone has no
 * pointer to follow, and at 350px the whole clump fits but every cover is a
 * thumbnail. So below the tablet breakpoint the field becomes a window you
 * pinch into: a pinch zooms, a drag moves the camera, a double-tap on empty
 * ground toggles between overview and close-up.
 *
 * This hook only writes three custom properties on the field — --s (scale),
 * --tx and --ty (camera offset, px) — and flags data-zoomed. The CSS decides
 * what depth means: a near cover (high --z) zooms and travels more than a far
 * one, which is what the cursor parallax does on desktop and what a real pile
 * of jackets does when you lean in.
 *
 * Direct manipulation has no easing — the finger is the animation. Only the
 * programmatic moves (double-tap, reset, the spring back to overview) run a
 * short transition, via the is-animating class, and reduced motion makes
 * those instant through the global rule.
 *
 * At overview the field lets the page scroll through it (touch-action:
 * pan-y), so a full-width square never traps a thumb; a one-finger drag
 * there only tilts the pile a little and springs back. Once zoomed, the
 * field owns the gesture and the drag pans.
 */

const MAX_SCALE = 3.2;
const TAP_SCALE = 2.4; // double-tap on empty ground zooms to this
const RUBBER = 0.85; // how far a pinch may go below 1 before it snaps back
const OVERVIEW_DRIFT = 0.12; // at overview a drag may tilt the pile this share of the field...
const OVERVIEW_GAIN = 0.4; // ...moving this fraction of the finger's travel
const ANIM_MS = 420;
const TAP_MS = 320;
const TAP_RADIUS = 40;

type Pt = { x: number; y: number };

export function useZoomStage(
  ref: RefObject<HTMLElement | null>,
  { media = "(max-width: 767px)" }: { media?: string } = {},
) {
  const [zoomed, setZoomed] = useState(false);
  const [touched, setTouched] = useState(false);
  const ctl = useRef<{ reset: () => void } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia(media);

    let detach: (() => void) | null = null;

    const attach = () => {
      let s = 1,
        tx = 0,
        ty = 0;
      let W = 0; // field width in px, read at each gesture start
      let animTimer: ReturnType<typeof setTimeout> | null = null;
      const pts = new Map<number, Pt>();
      let lastTap: { t: number; x: number; y: number } | null = null;
      // the gesture in progress
      let g:
        | {
            kind: "pan";
            ax: number;
            ay: number;
            tx: number;
            ty: number;
            t0: number;
            moved: boolean;
            onCover: boolean;
          }
        | {
            kind: "pinch";
            s: number;
            d0: number;
            p0x: number;
            p0y: number;
            moved: boolean;
          }
        | null = null;

      const apply = () => {
        el.style.setProperty("--s", s.toFixed(4));
        el.style.setProperty("--tx", `${tx.toFixed(1)}px`);
        el.style.setProperty("--ty", `${ty.toFixed(1)}px`);
        const z = s > 1.001;
        el.dataset.zoomed = z ? "true" : "false";
        // at overview the page scrolls through the field; zoomed, the field owns the drag
        el.style.touchAction = z ? "none" : "pan-y";
      };
      const clampT = () => {
        const lim = s > 1 ? ((s - 1) * W) / 2 : OVERVIEW_DRIFT * W;
        tx = Math.max(-lim, Math.min(lim, tx));
        ty = Math.max(-lim, Math.min(lim, ty));
      };
      const stopAnim = () => {
        if (animTimer) clearTimeout(animTimer);
        animTimer = null;
        el.classList.remove("is-animating");
      };
      const animateTo = (s2: number, tx2: number, ty2: number) => {
        stopAnim();
        el.classList.add("is-animating");
        s = s2;
        tx = tx2;
        ty = ty2;
        clampT();
        apply();
        animTimer = setTimeout(stopAnim, ANIM_MS);
        setZoomed(s > 1.001);
      };
      const local = (e: PointerEvent): Pt => {
        const r = el.getBoundingClientRect();
        W = r.width;
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      };
      const first2 = () => {
        const it = pts.values();
        return [it.next().value as Pt, it.next().value as Pt];
      };
      /* the content point (field px, unscaled) currently under a screen point */
      const under = (p: Pt) => {
        const C = W / 2;
        return { x: C + (p.x - C - tx) / s, y: C + (p.y - C - ty) / s };
      };
      /* the camera offset that puts content point p0 under screen point p at scale s2 */
      const aim = (p0: Pt, p: Pt, s2: number) => {
        const C = W / 2;
        return {
          x: p.x - (C + (p0.x - C) * s2),
          y: p.y - (C + (p0.y - C) * s2),
        };
      };

      const startPan = (p: Pt, onCover: boolean) => {
        g = {
          kind: "pan",
          ax: p.x,
          ay: p.y,
          tx,
          ty,
          t0: performance.now(),
          moved: false,
          onCover,
        };
      };
      const startPinch = () => {
        const [a, b] = first2();
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const p0 = under(mid);
        g = {
          kind: "pinch",
          s,
          d0: Math.hypot(b.x - a.x, b.y - a.y) || 1,
          p0x: p0.x,
          p0y: p0.y,
          moved: false,
        };
      };

      const onDown = (e: PointerEvent) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        stopAnim();
        const p = local(e);
        if (!W) return;
        pts.set(e.pointerId, p);
        if (pts.size === 1) {
          const onCover = !!(e.target as Element | null)?.closest?.(
            ".shelf-item",
          );
          startPan(p, onCover);
        } else if (pts.size === 2) startPinch();
        // no preventDefault and no pointer capture: a tap must still reach
        // the cover's button and pin the panel
      };

      const onMove = (e: PointerEvent) => {
        if (!pts.has(e.pointerId) || !g) return;
        const p = local(e);
        pts.set(e.pointerId, p);
        if (g.kind === "pinch" && pts.size >= 2) {
          const [a, b] = first2();
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          s = Math.max(RUBBER, Math.min(MAX_SCALE, (g.s * d) / g.d0));
          const t = aim({ x: g.p0x, y: g.p0y }, mid, s);
          tx = t.x;
          ty = t.y;
          clampT();
          apply();
          g.moved = true;
        } else if (g.kind === "pan" && pts.size === 1) {
          const gain = s > 1.001 ? 1 : OVERVIEW_GAIN;
          tx = g.tx + (p.x - g.ax) * gain;
          ty = g.ty + (p.y - g.ay) * gain;
          clampT();
          apply();
          if (Math.hypot(p.x - g.ax, p.y - g.ay) > 6) g.moved = true;
        }
      };

      const toggleZoom = (p: Pt) => {
        if (s > 1.001) {
          animateTo(1, 0, 0);
          return;
        }
        const p0 = under(p);
        const t = aim(p0, p, TAP_SCALE);
        animateTo(TAP_SCALE, t.x, t.y);
      };

      const end = (e: PointerEvent, cancelled: boolean) => {
        if (!pts.has(e.pointerId)) return;
        const p = pts.get(e.pointerId)!;
        const wasPan = g?.kind === "pan" ? g : null;
        pts.delete(e.pointerId);
        if (g?.moved) setTouched(true);

        if (pts.size === 1 && g?.kind === "pinch") {
          // one finger lifted mid-pinch: carry on as a pan from the other one
          const [a] = first2();
          startPan(a, true);
          return;
        }
        if (pts.size > 0) return;

        // gesture over
        if (s < 1) animateTo(1, 0, 0);
        else if (s <= 1.001 && (tx !== 0 || ty !== 0))
          animateTo(1, 0, 0); // spring the tilt back
        else setZoomed(s > 1.001);

        // double-tap on empty ground toggles the close-up; taps on a cover
        // belong to the cover (they pin the panel)
        if (
          !cancelled &&
          wasPan &&
          !wasPan.moved &&
          !wasPan.onCover &&
          performance.now() - wasPan.t0 < TAP_MS
        ) {
          const now = performance.now();
          if (
            lastTap &&
            now - lastTap.t < TAP_MS &&
            Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < TAP_RADIUS
          ) {
            lastTap = null;
            toggleZoom(p);
            setTouched(true);
          } else lastTap = { t: now, x: p.x, y: p.y };
        }
        g = null;
      };
      const onUp = (e: PointerEvent) => end(e, false);
      const onCancel = (e: PointerEvent) => end(e, true);

      ctl.current = {
        reset: () => {
          pts.clear();
          g = null;
          animateTo(1, 0, 0);
        },
      };

      el.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
      apply();

      detach = () => {
        el.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        stopAnim();
        el.style.removeProperty("--s");
        el.style.removeProperty("--tx");
        el.style.removeProperty("--ty");
        el.style.removeProperty("touch-action");
        delete el.dataset.zoomed;
        ctl.current = null;
        setZoomed(false);
      };
    };

    const sync = () => {
      if (mq.matches && !detach) attach();
      else if (!mq.matches && detach) {
        detach();
        detach = null;
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      if (detach) detach();
    };
  }, [ref, media]);

  const reset = useCallback(() => ctl.current?.reset(), []);
  return { zoomed, touched, reset };
}
