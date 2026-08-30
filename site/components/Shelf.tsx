"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReveal } from "@/lib/reveal";
import { usePointerSpring } from "@/lib/pointer";
import { BookPanel } from "@/components/BookPanel";
import type { Project } from "@/lib/content";

export type Cover = Project & { width: number; height: number };

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
 * Below it the books read as a ladder — 340 / 226 / 136 — instead of twenty
 * interchangeable thumbnails: present, but plainly the back catalogue, which
 * is what the client asked for ("not loud and proud, but not throw them
 * away"). No titles anywhere: the AUTHOR is the proof, and naming authors is
 * what makes the icons band below land as recognition rather than a new list.
 */

function Jacket({
  p,
  sizes,
  className,
  caption,
  index,
  onOpen,
  onClose,
  onLock,
  locked,
}: {
  p: Cover;
  sizes: string;
  /** the reveal class — it rides the WRAPPER, because the tilt owns the
      image's transform and two rules on one property cancel each other */
  className: string;
  caption?: boolean;
  index?: number;
  onOpen: (p: Cover) => void;
  onClose: (p: Cover) => void;
  onLock: (p: Cover) => void;
  locked: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  usePointerSpring(ref);
  return (
    <div
      ref={ref}
      className={`tilt-cover ${className}${locked ? " is-locked" : ""}`}
      style={index === undefined ? undefined : ({ "--d": index } as React.CSSProperties)}
      onPointerEnter={() => onOpen(p)}
      onPointerLeave={() => onClose(p)}
    >
      <button
        type="button"
        className="jacket-hit"
        aria-pressed={locked}
        onFocus={() => onOpen(p)}
        onBlur={() => onClose(p)}
        onClick={() => onLock(p)}
      >
        <span className="sr-only">
          {p.title}
          {p.credit ? ` — ${p.credit}` : ""}. {p.proof}.{" "}
          {locked ? "Pinned. Activate to unpin." : "Activate to pin."}
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

/* Deterministic pseudo-randomness per slug, so the server and the client
   agree and the scatter never reshuffles between renders. */
function hash(slug: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

const COLS = 5;

/**
 * Scatter the backlist across a field instead of stacking it in rows.
 *
 * Pure random placement collides; a grid reads as a grid. So: a coarse grid
 * supplies the skeleton — which guarantees nothing overlaps — and every
 * cover is then thrown off its cell by up to a third of a cell in each
 * direction, given its own size, and tipped a few degrees. By the time all
 * three vary together there is no row left to read, but also no pile-up.
 */
function scatter(slug: string, i: number, count: number) {
  const rows = Math.ceil(count / COLS);
  const row = Math.floor(i / COLS);
  const col = i % COLS;
  // A short last row must still span the full width, or the field empties
  // out on one side — 14 books over five columns leaves the bottom right
  // bare unless the last four are spread across the whole width instead.
  const inThisRow = Math.min(COLS, count - row * COLS);
  const cx = ((col + 0.5) / inThisRow) * 100;
  const cy = ((row + 0.5) / rows) * 100;
  const jx = (hash(slug, 1) - 0.5) * (100 / inThisRow) * 0.6;
  const jy = (hash(slug, 2) - 0.5) * (100 / rows) * 0.26;
  return {
    x: Math.min(90, Math.max(10, cx + jx)),
    y: Math.min(88, Math.max(12, cy + jy)),
    z: hash(slug, 3),
    tilt: (hash(slug, 4) - 0.5) * 7,
  };
}

export function Shelf({
  label,
  thesis,
  lede,
  lead,
  front,
  back,
}: {
  label: string;
  thesis?: string;
  lede?: string;
  lead: Cover;
  front: Cover[];
  back: Cover[];
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

  /* The panel stays put while the reader moves along the shelf and only
     leaves once they have actually left — a short close delay stops it
     flying out and back in over every gap between two jackets. */
  const [shown, setShown] = useState<Cover | null>(null);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // which jacket is currently claiming the panel. Leave and enter fire in an
  // order that is not guaranteed when the pointer crosses straight from one
  // jacket to the next, so a pending close checks whether it is still the
  // one being left before it acts — otherwise moving along the shelf closes
  // the panel instead of swapping its contents.
  const claim = useRef<string | null>(null);
  /* Clicking a jacket PINS the panel: it stops following the cursor and stays
     on that book until it is unpinned. Hovering is a glance; pinning is a
     decision, and the two should not fight each other. */
  const [pinned, setPinned] = useState<string | null>(null);
  const pinnedRef = useRef<string | null>(null);
  pinnedRef.current = pinned;

  const openBook = useCallback((p: Cover) => {
    if (pinnedRef.current) return; // pinned: a passing cursor must not steal it
    if (closeTimer.current) clearTimeout(closeTimer.current);
    claim.current = p.slug;
    setShown(p);
    setOpen(true);
  }, []);

  const closeBook = useCallback((p?: Cover) => {
    if (pinnedRef.current) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const leaving = p?.slug;
    closeTimer.current = setTimeout(() => {
      if (leaving && claim.current !== leaving) return; // someone else has it
      claim.current = null;
      setOpen(false);
    }, 220);
  }, []);

  const lockBook = useCallback((p: Cover) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPinned((cur) => {
      const next = cur === p.slug ? null : p.slug;
      pinnedRef.current = next;
      return next;
    });
    claim.current = p.slug;
    setShown(p);
    setOpen(true);
  }, []);

  const unpin = useCallback(() => {
    pinnedRef.current = null;
    setPinned(null);
    setOpen(false);
  }, []);

  // Escape lets go of a pinned panel
  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && unpin();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pinned, unpin]);

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
        <h3 className="meta-caps reveal text-mid">New York Times Bestsellers</h3>
        <div className="mt-8 grid grid-cols-3 items-end gap-6 sm:grid-cols-5 sm:gap-8">
          {front.map((p, i) => (
            <Jacket
              key={p.slug}
              p={p}
              index={i}
              caption
              className="cover-cut"
              sizes="(min-width: 1024px) 226px, (min-width: 640px) 18vw, 30vw"
              onOpen={openBook}
              onClose={closeBook}
              onLock={lockBook}
              locked={pinned === p.slug}
            />
          ))}
        </div>
      </div>

      {/* ————— the backlist: a field, not a grid ————— */}
      <div
        ref={backRef}
        data-reveal="pending"
        className="mt-20 border-t border-line pt-10"
      >
        <h3 className="meta-caps reveal text-faint">
          International &amp; National Bestsellers
        </h3>
        <div ref={fieldRef} className="shelf-field mt-10">
          {back.map((p, i) => {
            const s = scatter(p.slug, i, back.length);
            return (
              <div
                key={p.slug}
                className="shelf-item"
                style={
                  {
                    "--z": s.z.toFixed(3),
                    "--d": i,
                    "--tilt": `${s.tilt.toFixed(2)}deg`,
                    left: `${s.x.toFixed(2)}%`,
                    top: `${s.y.toFixed(2)}%`,
                  } as React.CSSProperties
                }
              >
                <Jacket
                  p={p}
                  className="reveal-d"
                  sizes="(min-width: 1024px) 176px, (min-width: 640px) 140px, 104px"
                  onOpen={openBook}
                  onClose={closeBook}
                  onLock={lockBook}
                  locked={pinned === p.slug}
                />
              </div>
            );
          })}
        </div>
      </div>

      <BookPanel book={shown} open={open} pinned={!!pinned} onClose={unpin} />
    </section>
  );
}
