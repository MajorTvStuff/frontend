"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

/**
 * A CAMERA IN FRONT OF THE PILE — the phone's version of the cursor.
 *
 * On a desktop the backlist clump answers the pointer: near covers drift
 * further than far ones and the pile reads as a space. A phone has no
 * pointer, and at 350px every cover is a thumbnail. So below the tablet
 * breakpoint the field becomes a real 3D scene seen from the front: the
 * covers sit in five depth layers (the biggest nearest), the field has
 * perspective, and the fingers move the CAMERA.
 *
 *   drag      leans the camera — near covers slide one way and far covers
 *             the other, like a model turned in the hand — and eases back
 *             level on release. Once dollied in, a drag also pans, and the
 *             lean shrinks with the magnification so what you framed stays
 *             framed.
 *   tilt      of the phone itself leans it too, where the sensor is allowed:
 *             Android straight away, iOS after the first deliberate gesture.
 *   pinch     dollies the camera INTO the pile toward the fingers. A layer
 *             the camera passes fades out and stops taking taps, and a depth
 *             of field narrows as you go, so a pinch isolates one layer of
 *             covers at a time — near first, then the middle, then the back.
 *   double-tap on empty ground jumps to a close-up and back.
 *
 * At rest the scene is pre-compensated (see foreshorten) so it matches the
 * flat clump exactly; the depth only shows when the camera moves. Before
 * anyone touches it, the scene sweeps once by itself — that is the invitation.
 *
 * The hook writes the camera onto the field as custom properties (--dz dolly,
 * --tx/--ty pan, --rx/--ry lean, --gx/--gy device tilt) and, because the fade
 * and blur depend on each cover's distance to the camera, writes --o and
 * --blur onto the covers. The CSS owns everything else.
 *
 * Direct manipulation has no easing — the finger is the animation. The
 * programmatic moves (the lean settling, double-tap, reset) are a JS tween
 * on the same numbers, so a finger arriving mid-move simply takes over from
 * wherever the camera is, and the fade and blur track the camera frame by
 * frame. Reduced motion makes those moves instant and leaves the sensor off.
 *
 * At overview the field lets the page scroll through it (touch-action:
 * pan-y), so a full-width square never traps a thumb. Once dollied in the
 * field owns the gesture — but only when the whole window is on screen,
 * because a window taller than the viewport that owns the drag is a trap.
 */

export const STAGE = {
  /** perspective distance, px — the camera sits this far in front of the middle layer */
  P: 600,
  /** covers sit between -DEPTH (far) and +DEPTH (near), px */
  DEPTH: 190,
  /** covers are grouped into this many depth layers, so a dolly brings a
      layer of them into focus together rather than one cover at a time */
  BANDS: 5,
  /** how far the middle layer can be magnified — past this the frame empties */
  MAX_K: 2.6,
  /** where a double-tap lands */
  TAP_K: 1.9,
  /** drag lean: degrees per px of finger travel, and the cap (both divided
      by the magnification once dollied in) */
  TILT_GAIN: 0.09,
  TILT_MAX: 12,
  /** device tilt: degrees of camera per degree of phone, and the cap */
  GYRO_GAIN: 0.55,
  GYRO_MAX: 9,
  /** a cover closer to the camera than FADE_FAR starts to fade; at FADE_NEAR it is gone */
  FADE_NEAR: 40,
  FADE_FAR: 120,
  /** below this opacity a fading cover stops taking taps */
  PASSING: 0.6,
  /** once dollied in, the layer this far from the camera is the sharp one,
      give or take FOCUS_BAND */
  FOCUS_D: 260,
  FOCUS_BAND: 50,
  BLUR_MAX: 2.5,
  /** the depth of field is fully narrowed after this much dolly (px) */
  DOF_RAMP: 160,
};

const RUBBER = 0.9; // how far a pinch may go below 1x before it snaps back
const EASE_MS = 620;
const TAP_MS = 320;
const TAP_RADIUS = 40;
const MOVE_SLOP = 6;

/**
 * Depth of a cover from its RANK by size-depth: the ranks are cut into
 * STAGE.BANDS layers, evenly spaced from the back to the front. Five layers
 * of ~3 covers each is what makes "isolate a depth" isolate a group.
 */
export const depthOf = (rank: number, count: number) => {
  if (count <= 1) return 0;
  const bands = Math.min(STAGE.BANDS, count);
  const band = Math.min(bands - 1, Math.floor((rank * bands) / count));
  return -STAGE.DEPTH + (2 * STAGE.DEPTH * band) / (bands - 1);
};
/** apparent scale of a layer at depth Z when the camera is at rest */
export const foreshorten = (Z: number) => STAGE.P / (STAGE.P - Z);

/** what the hint above the field still has to say */
export type StageHint = "full" | "pinch" | "done";

type Pt = { x: number; y: number };
type Drag = {
  kind: "drag";
  ax: number;
  ay: number;
  tx0: number;
  ty0: number;
  rx0: number;
  ry0: number;
  t0: number;
  moved: boolean;
  onCover: boolean;
};
type Pinch = {
  kind: "pinch";
  k: number;
  d0: number;
  p0x: number;
  p0y: number;
  moved: boolean;
};
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function useDepthStage(
  ref: RefObject<HTMLElement | null>,
  {
    media = "(max-width: 767px)",
    onGroundTap,
  }: { media?: string; onGroundTap?: () => void } = {},
) {
  const [zoomed, setZoomed] = useState(false);
  const [hint, setHint] = useState<StageHint>("full");
  const ctl = useRef<{ reset: () => void } | null>(null);
  const groundTap = useRef(onGroundTap);
  groundTap.current = onGroundTap;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia(media);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let detach: (() => void) | null = null;

    const attach = () => {
      const { P } = STAGE;
      const scene = el.querySelector<HTMLElement>(".shelf-scene");
      const covers = Array.from(
        el.querySelectorAll<HTMLElement>(".shelf-item"),
      );
      const depths = covers.map(
        (c) => parseFloat(c.style.getPropertyValue("--Z")) || 0,
      );
      // the sweep animates registered properties; an engine that cannot
      // register them would play it as a two-step jerk, so it gets none
      if (typeof CSS !== "undefined" && "registerProperty" in CSS)
        el.classList.add("has-prop");

      // the camera
      let d = 0, // dolly, px toward the pile
        tx = 0, // pan, scene px
        ty = 0,
        rx = 0, // lean, degrees
        ry = 0;
      let rect = { left: 0, top: 0, W: 0 }; // the field, read at gesture start
      let lastD = NaN;
      let frame = 0; // the tween
      const pts = new Map<number, Pt>();
      let lastTap: { t: number; x: number; y: number } | null = null;
      let dollied = false;
      let g: Drag | Pinch | null = null;

      /** screen magnification of the middle layer at dolly dd */
      const mag = (dd = d) => P / (P - dd);
      const dollyFor = (k: number) => P * (1 - 1 / k);

      const applyCovers = () => {
        if (d === lastD) return;
        lastD = d;
        // the depth of field narrows as the camera comes in
        const dof = clamp(d / STAGE.DOF_RAMP, 0, 1);
        covers.forEach((c, i) => {
          const D = P - depths[i] - d; // distance from the camera
          const o = clamp(
            (D - STAGE.FADE_NEAR) / (STAGE.FADE_FAR - STAGE.FADE_NEAR),
            0,
            1,
          );
          const blur =
            dof *
            clamp(
              (Math.abs(D - STAGE.FOCUS_D) - STAGE.FOCUS_BAND) * 0.02,
              0,
              STAGE.BLUR_MAX,
            );
          c.style.setProperty("--o", o.toFixed(3));
          c.style.setProperty("--blur", `${blur.toFixed(2)}px`);
          // a cover the camera is passing must not take the tap meant for
          // the one behind it; once gone it leaves the tab order too
          c.dataset.passing = o < STAGE.PASSING ? "true" : "false";
          c.dataset.gone = o < 0.05 ? "true" : "false";
        });
      };
      const measure = () => {
        const r = el.getBoundingClientRect();
        rect = { left: r.left, top: r.top, W: r.width };
      };
      const apply = () => {
        el.style.setProperty("--dz", `${d.toFixed(1)}px`);
        el.style.setProperty("--tx", `${tx.toFixed(1)}px`);
        el.style.setProperty("--ty", `${ty.toFixed(1)}px`);
        el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
        el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
        const z = d > 1;
        el.dataset.zoomed = z ? "true" : "false";
        // dollied in, the field owns the drag — but only while the whole
        // window is on screen; otherwise the page must keep scrolling
        const fits = rect.W > 0 && rect.W <= window.innerHeight - 64;
        el.style.touchAction = z && fits ? "none" : "pan-y";
        applyCovers();
      };
      /* keep the middle layer over the frame: no pan at overview, and deeper
         in only as much as the magnification has uncovered — radially, since
         the clump is round and a square bound reaches empty corners */
      const clampPan = () => {
        const lim = Math.max(0, (rect.W / 2) * (1 - 1 / mag()));
        const r = Math.hypot(tx, ty);
        if (r > lim) {
          const s = r ? lim / r : 0;
          tx *= s;
          ty *= s;
        }
      };

      /* ---- the tween: programmatic moves on the same numbers ---- */
      const stopTween = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      };
      const tweenTo = (
        to: Partial<{
          d: number;
          tx: number;
          ty: number;
          rx: number;
          ry: number;
        }>,
        ms = EASE_MS,
      ) => {
        stopTween();
        const from = { d, tx, ty, rx, ry };
        const target = { ...from, ...to };
        setZoomed(target.d > 1);
        if (still || ms <= 0) {
          ({ d, tx, ty, rx, ry } = target);
          clampPan();
          apply();
          return;
        }
        const t0 = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / ms);
          const e = easeOut(t);
          d = from.d + (target.d - from.d) * e;
          tx = from.tx + (target.tx - from.tx) * e;
          ty = from.ty + (target.ty - from.ty) * e;
          rx = from.rx + (target.rx - from.rx) * e;
          ry = from.ry + (target.ry - from.ry) * e;
          clampPan();
          apply();
          frame = t < 1 ? requestAnimationFrame(step) : 0;
        };
        frame = requestAnimationFrame(step);
      };

      /* the sweep ends on the first deliberate touch — and hands its pose to
         the camera, so the pile continues from where it was instead of
         jumping level */
      const endSweep = () => {
        if (el.classList.contains("is-touched")) return;
        if (scene) {
          const cs = getComputedStyle(scene);
          rx += parseFloat(cs.getPropertyValue("--arx")) || 0;
          ry += parseFloat(cs.getPropertyValue("--ary")) || 0;
        }
        el.classList.add("is-touched");
        el.classList.remove("is-held");
        apply();
      };
      /* while a finger is down the sweep holds its pose (the drag lean adds
         to it); if the browser takes the touch for a page scroll it carries
         on, and only a completed gesture ends it */
      const holdSweep = () => {
        if (!el.classList.contains("is-touched")) el.classList.add("is-held");
      };
      const releaseSweep = () => el.classList.remove("is-held");

      const local = (e: PointerEvent): Pt => ({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      const first2 = () => {
        const it = pts.values();
        return [it.next().value as Pt, it.next().value as Pt];
      };
      /* the middle-layer scene point currently under a screen point */
      const under = (p: Pt): Pt => {
        const C = rect.W / 2,
          f = mag();
        return { x: (p.x - C) / f - tx, y: (p.y - C) / f - ty };
      };
      /* the pan that puts scene point p0 under screen point p at dolly d2 */
      const aim = (p0: Pt, p: Pt, d2: number): Pt => {
        const C = rect.W / 2,
          f = mag(d2);
        return { x: (p.x - C) / f - p0.x, y: (p.y - C) / f - p0.y };
      };

      const startDrag = (p: Pt, onCover: boolean, moved = false) => {
        g = {
          kind: "drag",
          ax: p.x,
          ay: p.y,
          tx0: tx,
          ty0: ty,
          rx0: rx,
          ry0: ry,
          t0: performance.now(),
          moved,
          onCover,
        };
      };
      const startPinch = () => {
        const [a, b] = first2();
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const p0 = under(mid);
        g = {
          kind: "pinch",
          k: mag(),
          d0: Math.hypot(b.x - a.x, b.y - a.y) || 1,
          p0x: p0.x,
          p0y: p0.y,
          moved: false,
        };
      };

      /* ---- device tilt: the phone in the hand is the second camera control ---- */
      type Asking = { requestPermission?: () => Promise<"granted" | "denied"> };
      const needsAsk =
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof (DeviceOrientationEvent as unknown as Asking)
          .requestPermission === "function";
      let granted = !needsAsk;
      let gyroAsked = false;
      let gyroOn = false;
      let visible = false;
      let base: { beta: number; gamma: number } | null = null;
      let gxT = 0,
        gyT = 0,
        gx = 0,
        gy = 0,
        gframe = 0;
      const portrait = () => {
        const o = screen.orientation;
        return !o || !o.type || o.type.startsWith("portrait");
      };
      const gyroTick = () => {
        gx += (gxT - gx) * 0.12;
        gy += (gyT - gy) * 0.12;
        el.style.setProperty("--gx", `${gx.toFixed(2)}deg`);
        el.style.setProperty("--gy", `${gy.toFixed(2)}deg`);
        if (Math.abs(gxT - gx) < 0.02 && Math.abs(gyT - gy) < 0.02) {
          gframe = 0;
          return;
        }
        gframe = requestAnimationFrame(gyroTick);
      };
      const onOrient = (e: DeviceOrientationEvent) => {
        if (!visible || e.beta == null || e.gamma == null) return;
        // on its side the axes swap and gamma wraps at ±90: stay level there
        if (!portrait() || Math.abs(e.gamma) > 75) return;
        if (!base) {
          base = { beta: e.beta, gamma: e.gamma };
          return;
        }
        // level follows the hold slowly (~2s), so a changed grip reads as
        // level and only movement shows as lean
        base.beta += (e.beta - base.beta) * 0.01;
        base.gamma += (e.gamma - base.gamma) * 0.01;
        const ny = clamp(
          (e.gamma - base.gamma) * STAGE.GYRO_GAIN,
          -STAGE.GYRO_MAX,
          STAGE.GYRO_MAX,
        );
        const nx = clamp(
          -(e.beta - base.beta) * STAGE.GYRO_GAIN,
          -STAGE.GYRO_MAX,
          STAGE.GYRO_MAX,
        );
        // a steady hand jitters; below a quarter degree nothing moves and the
        // loop parks
        if (Math.abs(ny - gyT) < 0.25 && Math.abs(nx - gxT) < 0.25) return;
        gyT = ny;
        gxT = nx;
        if (!gframe) gframe = requestAnimationFrame(gyroTick);
      };
      const startGyro = () => {
        if (
          gyroOn ||
          still ||
          !granted ||
          typeof DeviceOrientationEvent === "undefined"
        )
          return;
        gyroOn = true;
        base = null; // level is wherever the phone is held now
        window.addEventListener("deviceorientation", onOrient);
      };
      const stopGyro = () => {
        if (!gyroOn) return;
        gyroOn = false;
        window.removeEventListener("deviceorientation", onOrient);
        if (gframe) cancelAnimationFrame(gframe);
        gframe = 0;
        gxT = gyT = gx = gy = 0;
        el.style.setProperty("--gx", "0deg");
        el.style.setProperty("--gy", "0deg");
      };
      // iOS asks before handing out orientation, and only inside a gesture —
      // so the ask waits for the first deliberate stage gesture, never a
      // scroll-through touch
      const requestGyro = () => {
        const ask = (DeviceOrientationEvent as unknown as Asking)
          .requestPermission;
        if (typeof ask !== "function") return;
        ask.call(DeviceOrientationEvent).then(
          (r) => {
            if (r !== "granted") return;
            granted = true;
            if (visible) startGyro();
          },
          () => {},
        );
      };
      // the sensor runs only while the field is on screen, and the sweep
      // starts once half of it is
      const io = new IntersectionObserver(
        (entries) => {
          const en = entries[entries.length - 1];
          visible = en.isIntersecting;
          if (visible) startGyro();
          else stopGyro();
          if (en.intersectionRatio >= 0.5) el.classList.add("is-seen");
        },
        { threshold: [0, 0.5] },
      );
      io.observe(el);
      const onHidden = () => {
        // a touch interrupted by the OS may never send its up: forget it
        pts.clear();
        g = null;
        if (document.hidden) stopGyro();
        else if (visible) startGyro();
      };
      document.addEventListener("visibilitychange", onHidden);
      window.addEventListener("blur", onHidden);

      /* ---- pointers ---- */
      const onDown = (e: PointerEvent) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        // the first touch of a sequence forgets any phantom finger left by
        // an up that never arrived
        if (e.isPrimary) {
          pts.clear();
          g = null;
        }
        stopTween(); // the gesture takes over from wherever the camera is
        measure();
        if (!rect.W) return;
        const p = local(e);
        pts.set(e.pointerId, p);
        if (pts.size === 1) {
          const onCover = !!(e.target as Element | null)?.closest?.(
            ".shelf-item",
          );
          startDrag(p, onCover);
        } else if (pts.size === 2) startPinch();
        // no preventDefault and no pointer capture: a tap must still reach
        // the cover's button and pin the panel
      };
      // touch-action is decided when the first finger lands, so the first
      // pinch from overview still runs under pan-y; this stops the browser
      // turning a drifting two-finger midpoint into a page scroll
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length >= 2) e.preventDefault();
      };

      const onMove = (e: PointerEvent) => {
        if (!pts.has(e.pointerId) || !g) return;
        const p = local(e);
        pts.set(e.pointerId, p);
        if (g.kind === "pinch" && pts.size >= 2) {
          const [a, b] = first2();
          const dist = Math.hypot(b.x - a.x, b.y - a.y);
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          if (!g.moved) {
            g.moved = true;
            holdSweep();
          }
          const raw = (g.k * dist) / g.d0;
          const k = clamp(raw, RUBBER, STAGE.MAX_K);
          d = dollyFor(k);
          const t = aim({ x: g.p0x, y: g.p0y }, mid, d);
          tx = t.x;
          ty = t.y;
          clampPan();
          apply();
          if (raw !== k) {
            // at a bound, re-anchor: the pinch must answer the moment the
            // fingers turn back, not after they retrace the overshoot
            g.k = k;
            g.d0 = dist;
            const q = under(mid);
            g.p0x = q.x;
            g.p0y = q.y;
          }
        } else if (g.kind === "drag" && pts.size === 1) {
          const dx = p.x - g.ax,
            dy = p.y - g.ay;
          if (!g.moved) {
            if (Math.hypot(dx, dy) <= MOVE_SLOP) return;
            g.moved = true;
            holdSweep();
          }
          // the lean: near covers slide one way, far covers the other. Once
          // dollied in the pan carries the depth, so the lean shrinks with
          // the magnification and what you framed stays framed
          const f = d > 1 ? mag() : 1;
          const gain = STAGE.TILT_GAIN / f,
            cap = STAGE.TILT_MAX / f;
          ry = clamp(g.ry0 + dx * gain, -cap, cap);
          rx = clamp(g.rx0 - dy * gain, -cap, cap);
          if (d > 1) {
            // the scene point under the finger follows the finger
            tx = g.tx0 + dx / mag();
            ty = g.ty0 + dy / mag();
            clampPan();
          }
          apply();
        }
      };

      const toggleZoom = (p: Pt) => {
        if (d > 1) {
          tweenTo({ d: 0, tx: 0, ty: 0, rx: 0, ry: 0 });
          return;
        }
        const p0 = under(p);
        const d2 = dollyFor(STAGE.TAP_K);
        const t = aim(p0, p, d2);
        tweenTo({ d: d2, tx: t.x, ty: t.y, rx: 0, ry: 0 });
      };

      /* the lean settles level; a pinch that went below 1x comes back to
         the overview */
      const settle = () =>
        tweenTo(
          d < 0 ? { d: 0, tx: 0, ty: 0, rx: 0, ry: 0 } : { rx: 0, ry: 0 },
        );

      const end = (e: PointerEvent, cancelled: boolean) => {
        if (!pts.has(e.pointerId)) return;
        const p = pts.get(e.pointerId)!;
        const was = g;
        pts.delete(e.pointerId);

        if (pts.size === 1 && was?.kind === "pinch") {
          // one finger lifted mid-pinch: carry on as a drag from the other
          const [a] = first2();
          startDrag(a, true, true);
          return;
        }
        if (pts.size > 0) return;
        g = null;

        // the browser took the touch (a page scroll): nothing was meant, and
        // the sweep, if it was holding, carries on
        if (cancelled || !was) {
          releaseSweep();
          settle();
          return;
        }

        if (was.moved) {
          // a deliberate gesture: the sweep ends here and hands over its
          // pose, the hint steps down, iOS may be asked
          endSweep();
          if (was.kind === "pinch" || d > 1) dollied = true;
          setHint(dollied ? "done" : "pinch");
          if (needsAsk && !gyroAsked) {
            gyroAsked = true;
            requestGyro();
          }
          settle();
          return;
        }

        // a tap. On a cover it belongs to the cover (it pins the panel); on
        // empty ground it lets a pinned panel go, and twice it toggles the
        // close-up. (Two fingers down and up again without moving is nothing.)
        if (was.kind === "drag" && performance.now() - was.t0 < TAP_MS) {
          endSweep();
          if (!was.onCover) {
            if (
              lastTap &&
              was.t0 - lastTap.t < TAP_MS &&
              Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < TAP_RADIUS
            ) {
              lastTap = null;
              dollied = true;
              setHint("done");
              toggleZoom(p);
              return;
            }
            lastTap = { t: performance.now(), x: p.x, y: p.y };
            groundTap.current?.();
          }
        }
        settle();
      };
      const onUp = (e: PointerEvent) => end(e, false);
      const onCancel = (e: PointerEvent) => end(e, true);

      ctl.current = {
        reset: () => {
          pts.clear();
          g = null;
          lastTap = null;
          base = null; // level is wherever the phone is held now
          tweenTo({ d: 0, tx: 0, ty: 0, rx: 0, ry: 0 });
        },
      };

      el.addEventListener("pointerdown", onDown);
      el.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
      measure();
      apply();

      detach = () => {
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        document.removeEventListener("visibilitychange", onHidden);
        window.removeEventListener("blur", onHidden);
        stopGyro();
        io.disconnect();
        stopTween();
        for (const k of [
          "--dz",
          "--tx",
          "--ty",
          "--rx",
          "--ry",
          "--gx",
          "--gy",
          "touch-action",
        ])
          el.style.removeProperty(k);
        delete el.dataset.zoomed;
        el.classList.remove("is-touched", "is-seen", "has-prop");
        covers.forEach((c) => {
          c.style.removeProperty("--o");
          c.style.removeProperty("--blur");
          delete c.dataset.passing;
          delete c.dataset.gone;
        });
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
  return { zoomed, hint, reset };
}
