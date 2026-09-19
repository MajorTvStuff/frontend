"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReveal } from "@/lib/reveal";
import { usePointerSpring } from "@/lib/pointer";
import { STAGE, depthOf, foreshorten, useDepthStage } from "@/lib/stage";
import { BookPanel } from "@/components/BookPanel";
import type { Project, Credit } from "@/lib/content";
import type { ClumpItem } from "@/lib/clump";

export type Cover = Project & {
  width: number;
  height: number;
  /** The display half of our write-up, looked up on the server. Named
      `about`, not `credit`: a Project's own `credit` is the author line. */
  about?: Credit | null;
};
/** a backlist cover with its place in the clump (see lib/clump.ts) */
export type Placed = Cover & ClumpItem;

/**
 * THE LEVERAGE, AND THE SHELF THAT PROVES IT.
 *
 * The client's one differentiating claim — publishing as the engine behind
 * the production slate — used to be a 15px line four fifths of the way down
 * the page, set smaller than the boilerplate above it. It is this section's
 * header now, at display size, standing beside the single #1 New York Times
 * Bestseller that proves it. The claim arrives exactly where a visitor is
 * asking why a production company gets to be good at this.
 *
 * Below it the front table holds the five names you know at 226px, and the
 * rest gather in a round, tight clump — a word cloud of jackets, placed by
 * lib/clump.ts on the server — present, but plainly the back catalogue,
 * which is what the client asked for ("not loud and proud, but not throw
 * them away"). No titles anywhere: the AUTHOR is the proof, and naming
 * authors is what makes the icons band below land as recognition rather
 * than a new list.
 */

function Jacket({
  p,
  sizes,
  className,
  caption,
  index,
  onPress,
  pressed,
}: {
  p: Cover;
  sizes: string;
  /** the reveal class — it rides the WRAPPER, because the tilt owns the
      image's transform and two rules on one property cancel each other */
  className: string;
  caption?: boolean;
  index?: number;
  onPress: (p: Cover) => void;
  pressed: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  usePointerSpring(ref);
  return (
    <div
      ref={ref}
      className={`tilt-cover ${className}${pressed ? " is-pressed" : ""}`}
      style={
        index === undefined
          ? undefined
          : ({ "--d": index } as React.CSSProperties)
      }
    >
      {/* The details open on a PRESS — a click, a tap, Enter or Space — and
          never on hover or focus. On a phone a tap fires hover-in and
          hover-out around itself, so a hover glance there opened the panel
          and shut it again in the same gesture; the trailers had the same
          fault and got the same cure. The cursor still tilts the jacket, so
          a mouse can tell it is live without it doing anything yet. */}
      <button
        type="button"
        className="jacket-hit"
        aria-expanded={pressed}
        aria-controls="book-panel"
        onClick={() => onPress(p)}
      >
        <span className="sr-only">
          {p.title}
          {p.credit ? ` — ${p.credit}` : ""}. {p.proof}. Details
        </span>
      </button>
      {/* three elements, three transforms: the wrapper reveals, this one
          holds the press, and the image tilts with the cursor. Sharing any
          two of them on one element makes the last one written win. */}
      <div className="jacket-press">
        <Image
          src={`/projects/${p.slug}.jpg`}
          alt={`${p.title}${p.credit ? ` — ${p.credit}` : ""}`}
          width={p.width}
          height={p.height}
          sizes={sizes}
          className={
            p.medium === "book" && caption
              ? "cover-lift h-auto w-full"
              : "cover h-auto w-full"
          }
        />
      </div>
      {caption && p.credit && (
        <p className="meta-caps mt-3 text-mid">{p.credit}</p>
      )}
    </div>
  );
}

export function Shelf({
  label,
  thesis,
  lede,
  lead,
  front,
  back,
  fieldPx,
  founder,
}: {
  label: string;
  thesis?: string;
  lede?: string;
  lead: Cover;
  front: Cover[];
  back: Placed[];
  /** the field width at which the largest backlist cover is full size */
  fieldPx: number;
  /** whose role the panel is describing */
  founder: string;
}) {
  const claimRef = useRef<HTMLDivElement | null>(null);
  const frontRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);
  useReveal(claimRef);
  useReveal(frontRef);
  useReveal(backRef);
  const leadRef = useRef<HTMLDivElement | null>(null);
  usePointerSpring(leadRef);
  // one spring for the whole backlist: every cover reads the same --px/--py
  // and multiplies it by its own depth, so near covers travel further than
  // far ones and the field reads as a space rather than a grid
  const fieldRef = useRef<HTMLDivElement | null>(null);
  usePointerSpring(fieldRef, { onlyWhileHovered: false });

  /* PRESS A JACKET, GET ITS DETAILS. One book at a time holds the panel:
     pressing another swaps the contents in place, pressing the same one
     again puts it away, and so do Close, Escape and a press anywhere off the
     shelf. `shown` outlives `open` so the panel can slide out still showing
     the book it was showing, instead of emptying first. */
  const [shown, setShown] = useState<Cover | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const pressedRef = useRef<string | null>(null);
  pressedRef.current = pressed;

  const pressBook = useCallback((p: Cover) => {
    const next = pressedRef.current === p.slug ? null : p.slug;
    pressedRef.current = next;
    setPressed(next);
    if (next) setShown(p);
  }, []);

  const closeBook = useCallback(() => {
    pressedRef.current = null;
    setPressed(null);
  }, []);

  // phones have no cursor to follow, so the field becomes a 3D scene with a
  // camera the fingers move instead — same depth, more of it (lib/stage.ts).
  // A tap on empty ground puts an open panel away.
  const stage = useDepthStage(fieldRef, {
    onGroundTap: () => {
      if (pressedRef.current) closeBook();
    },
  });
  const { reset: resetCamera, zoomed } = stage;
  const resetStage = useCallback(() => {
    resetCamera();
    closeBook();
  }, [resetCamera, closeBook]);

  // Escape puts the panel away, or brings the camera back
  useEffect(() => {
    if (!pressed && !zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (pressedRef.current) closeBook();
      else resetCamera();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pressed, zoomed, closeBook, resetCamera]);

  /* A press anywhere else puts it away too. `click`, not pointerdown: a
     finger that scrolls the page never produces one, so reading on past the
     shelf cannot close what someone just opened. The panel itself is
     transparent to the pointer (so the covers under it stay reachable), so
     a click that lands inside its box counts as on it, not as off it. */
  useEffect(() => {
    if (!pressed) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t?.closest(".jacket-hit, .stage-reset")) return; // they handle it
      const panel = document.getElementById("book-panel");
      const r = panel?.getBoundingClientRect();
      if (
        r &&
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      )
        return;
      closeBook();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pressed, closeBook]);

  // the phone stage spaces the covers evenly in depth by their size rank —
  // the biggest nearest — so the back layer is really at the back
  const depthRank = new Map(
    [...back]
      .sort((a, b) => a.z - b.z || a.slug.localeCompare(b.slug))
      .map((p, i) => [p.slug, i] as const),
  );

  return (
    <section className="mx-auto max-w-[1320px] px-5 pb-14 pt-24 sm:px-8">
      {/* ————— the claim, beside the book that proves it ————— */}
      <div
        ref={claimRef}
        data-reveal="pending"
        className="grid items-center gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14"
      >
        {/* No panel on this one. It is the section's argument, not an item
            in the shelf, and a popup firing over the claim it sits beside
            interrupts the one sentence the section exists to make. */}
        <div ref={leadRef} className="reveal tilt-cover w-52 lg:w-full">
          <Image
            src={`/projects/${lead.slug}.jpg`}
            alt={`${lead.title} — ${lead.credit}`}
            width={lead.width}
            height={lead.height}
            sizes="(min-width: 1024px) 340px, 208px"
            className="cover-lift h-auto w-full"
          />
        </div>

        <div className="max-w-[680px]">
          <h2 className="meta-caps reveal text-mid">
            The shelf <span className="text-faint">— {label}</span>
          </h2>
          {thesis && (
            /* the client's own words — display-only, pending written sign-off */
            <p className="reveal reveal-2 mt-6 text-flow font-light text-paper">
              {thesis}
            </p>
          )}
          {lede && (
            <p className="reveal reveal-3 mt-6 text-about text-mid">{lede}</p>
          )}
          <p className="reveal reveal-4 mt-6 text-strip text-signal">
            {lead.proof}
          </p>
        </div>
      </div>

      {/* ————— the front table: the names you already know ————— */}
      <div
        ref={frontRef}
        data-reveal="pending"
        className="mt-20 border-t border-line pt-10"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h3 className="meta-caps reveal text-mid">
            New York Times Bestsellers
          </h3>
          {/* with no hover preview, nothing else says the covers open — the
              same wording the trailer tiles use, chosen by the pointer */}
          <p
            className="meta-caps reveal reveal-2 text-faint"
            aria-hidden="true"
          >
            <span className="on-touch">Tap</span>
            <span className="on-hover">Click</span> a cover for details
          </p>
        </div>
        <div className="mt-8 grid grid-cols-3 items-end gap-6 sm:grid-cols-5 sm:gap-8">
          {front.map((p, i) => (
            <Jacket
              key={p.slug}
              p={p}
              index={i}
              caption
              className="cover-cut"
              sizes="(min-width: 1024px) 226px, (min-width: 640px) 18vw, 30vw"
              onPress={pressBook}
              pressed={pressed === p.slug}
            />
          ))}
        </div>
      </div>

      {/* ————— the backlist: a clump, not a grid ————— */}
      <div
        ref={backRef}
        data-reveal="pending"
        className="mt-20 border-t border-line pt-10"
      >
        <h3 className="meta-caps reveal text-faint">
          International &amp; National Bestsellers
        </h3>
        {/* phones: say it before the covers arrive — it reveals with the
            heading, ahead of the cascade — and step it down as the visitor
            learns: after a drag only the pinch is left to discover, after a
            pinch it goes. It stays aria-hidden: it describes a two-finger
            affordance assistive tech cannot use, and the covers themselves
            are ordinary buttons. Shown only where the stage is, in the same
            px query as the stage. */}
        <p
          className="stage-hint reveal reveal-2 meta-caps"
          data-state={stage.hint}
          aria-hidden="true"
        >
          <span className="stage-hint-dot" />
          <span>Pinch to zoom in</span>
          {stage.hint === "full" && (
            <>
              <span className="text-signal">·</span>
              <span>drag to look around</span>
            </>
          )}
        </p>
        {/* a square field, centred; every size inside it is a percentage of
            its width, so the whole clump scales as one object. On phones the
            field gains perspective and the scene inside it carries the
            camera (lib/stage.ts). */}
        <div
          ref={fieldRef}
          className="shelf-field mt-10"
          style={
            {
              "--field-max": `${fieldPx}px`,
              "--P": `${STAGE.P}px`,
              "--depth": `${STAGE.DEPTH}px`,
            } as React.CSSProperties
          }
        >
          {/* the way back out, once the field owns the drag — first in the
              tab order, before fourteen covers, and 44px tall for a thumb */}
          {stage.zoomed && (
            <button
              type="button"
              className="btn meta-caps stage-reset bg-screen/80 text-paper backdrop-blur-sm"
              onClick={resetStage}
            >
              Reset view
            </button>
          )}
          <div className="shelf-scene">
            {back.map((p, i) => {
              /* phones: each cover sits at its own depth, and its resting
                 place is pre-divided by the foreshortening at that depth, so
                 the scene projects to exactly the flat clump until the
                 camera moves — the depth is there, it only shows when asked */
              const Z = depthOf(depthRank.get(p.slug) ?? 0, back.length);
              const f = foreshorten(Z);
              return (
                <div
                  key={p.slug}
                  className="shelf-item"
                  style={
                    {
                      "--z": p.z,
                      "--d": i,
                      "--tilt": `${p.tilt}deg`,
                      "--x": p.x,
                      "--y": p.y,
                      "--w": `${p.w}%`,
                      "--Z": `${Z.toFixed(1)}px`,
                      "--lx": (50 + (p.x - 50) / f).toFixed(3),
                      "--ly": (50 + (p.y - 50) / f).toFixed(3),
                      "--lw": (p.w / f).toFixed(3),
                    } as React.CSSProperties
                  }
                >
                  <Jacket
                    p={p}
                    className="reveal-d"
                    // phones ask for what the dolly can show, not the rest
                    // size: the isolated layer is the last thing that
                    // should be soft
                    sizes="(min-width: 1024px) 176px, (min-width: 768px) 140px, 45vw"
                    onPress={pressBook}
                    pressed={pressed === p.slug}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BookPanel
        book={shown}
        open={!!pressed}
        founder={founder}
        onClose={closeBook}
      />
    </section>
  );
}
