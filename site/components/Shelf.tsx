"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReveal } from "@/lib/reveal";
import { usePointerSpring } from "@/lib/pointer";
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
}: {
  p: Cover;
  sizes: string;
  /** the reveal class — it rides the WRAPPER, because the tilt owns the
      image's transform and two rules on one property cancel each other */
  className: string;
  caption?: boolean;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  usePointerSpring(ref);
  return (
    <div
      ref={ref}
      className={`tilt-cover ${className}`}
      style={index === undefined ? undefined : ({ "--d": index } as React.CSSProperties)}
    >
      <Image
        src={`/projects/${p.slug}.jpg`}
        alt={`${p.title}${p.credit ? ` — ${p.credit}` : ""}`}
        width={p.width}
        height={p.height}
        sizes={sizes}
        className={p.medium === "book" && caption ? "cover-lift h-auto w-full" : "cover h-auto w-full"}
      />
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
}: {
  label: string;
  thesis?: string;
  lede?: string;
  lead: Cover;
  front: Cover[];
  back: Cover[];
}) {
  const ref = useRef<HTMLElement | null>(null);
  useReveal(ref);
  const leadRef = useRef<HTMLDivElement | null>(null);
  usePointerSpring(leadRef);

  return (
    <section
      ref={ref}
      data-reveal="pending"
      className="mx-auto max-w-[1320px] px-5 pb-14 pt-24 sm:px-8"
    >
      {/* ————— the claim, beside the book that proves it ————— */}
      <div className="grid items-center gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14">
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
      <div className="mt-20 border-t border-line pt-10">
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
            />
          ))}
        </div>
      </div>

      {/* ————— the backlist: present, not paraded ————— */}
      <div className="mt-20 border-t border-line pt-10">
        <h3 className="meta-caps reveal text-faint">
          International &amp; National Bestsellers
        </h3>
        <div className="mt-8 grid grid-cols-4 items-end gap-4 sm:grid-cols-6 sm:gap-5 lg:grid-cols-8 lg:gap-6">
          {back.map((p, i) => (
            <Jacket
              key={p.slug}
              p={p}
              index={i}
              className="reveal-d"
              sizes="(min-width: 1024px) 136px, (min-width: 640px) 15vw, 22vw"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
