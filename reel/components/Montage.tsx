"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Lockup } from "@/components/Lockup";

export type Slide = {
  slug: string;
  fit: "cover" | "contain";
  title: string;
  proof: string;
  width: number;
  height: number;
};

/**
 * The hero: a slow carousel through the slate — key art full-bleed, book
 * jackets staged on black — with the logo build playing over it. Each
 * slide melts into the next (blur + fade + a slight zoom settle). It
 * advances on its own every few seconds; the arrows and dots let a
 * visitor pilot it manually, and any manual pick simply resets the
 * auto-advance clock. Reduced motion: no auto-advance, instant swaps,
 * controls still work.
 */
const HOLD_MS = 5500;

function Chevron({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 ${flip ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M15 5 8 12l7 7" strokeLinecap="square" />
    </svg>
  );
}

export function Montage({ slides }: { slides: Slide[] }) {
  const SLIDES = slides;
  const [index, setIndex] = useState(0);

  // one clock: every change (auto or manual) schedules the next advance,
  // so picking a slide by hand quietly restarts the timer
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      HOLD_MS
    );
    return () => clearTimeout(t);
  }, [index]);

  const current = SLIDES[index];

  return (
    <section
      className="relative overflow-hidden bg-screen"
      aria-roledescription="carousel"
      aria-label="MAJOR CONTENT — the slate"
    >
      <h1 className="sr-only">
        MAJOR CONTENT — TV | FILM | BOOKS. Bridging content and culture with
        global icons, premium programming, worldwide bestsellers.
      </h1>

      <div className="relative h-[62svh] min-h-[420px] w-full sm:h-[74svh]">
        {/* the backgrounds */}
        <div aria-hidden="true" className="absolute inset-0">
          {SLIDES.map((s, i) => {
            const { width, height } = s;
            const active = i === index;
            return (
              <div
                key={s.slug}
                className={`absolute inset-0 transition-[opacity,filter,transform] duration-[1600ms] ease-out ${
                  active
                    ? "z-10 scale-100 opacity-100 [filter:blur(0px)]"
                    : "scale-[1.045] opacity-0 [filter:blur(18px)]"
                }`}
              >
                <Image
                  src={`/projects/${s.slug}.jpg`}
                  alt=""
                  width={width}
                  height={height}
                  priority={i < 2}
                  sizes="100vw"
                  className={
                    s.fit === "cover"
                      ? "h-full w-full object-cover"
                      : "h-full w-full object-contain py-[4svh]"
                  }
                />
              </div>
            );
          })}
        </div>

        {/* quiet scrim so the lockup and controls always read */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,rgba(8,9,11,0.5)_0%,rgba(8,9,11,0.12)_55%,rgba(8,9,11,0.45)_100%)]"
        />

        {/* the logo builds over the reel, then holds */}
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <Lockup
            animate
            bright
            className="w-[min(26rem,62vw)] [filter:drop-shadow(0_2px_22px_rgba(8,9,11,0.95))_drop-shadow(0_0_6px_rgba(8,9,11,0.7))]"
          />
        </div>

        {/* pilot: arrows */}
        <button
          type="button"
          onClick={() => setIndex((index + SLIDES.length - 1) % SLIDES.length)}
          aria-label="Previous background"
          className="absolute left-3 top-1/2 z-40 -translate-y-1/2 p-3 text-paper/80 transition-colors duration-300 [filter:drop-shadow(0_1px_6px_rgba(8,9,11,0.9))] hover:text-paper sm:left-5"
        >
          <Chevron />
        </button>
        <button
          type="button"
          onClick={() => setIndex((index + 1) % SLIDES.length)}
          aria-label="Next background"
          className="absolute right-3 top-1/2 z-40 -translate-y-1/2 p-3 text-paper/80 transition-colors duration-300 [filter:drop-shadow(0_1px_6px_rgba(8,9,11,0.9))] hover:text-paper sm:right-5"
        >
          <Chevron flip />
        </button>

        {/* pilot: what's playing + dots */}
        <div className="absolute inset-x-0 bottom-0 z-40 flex flex-wrap items-end justify-between gap-4 px-5 pb-5 sm:px-8">
          <p
            aria-live="polite"
            className="meta-caps max-w-[60%] text-paper [text-shadow:0_1px_8px_rgba(8,9,11,0.9)]"
          >
            {current.title}
            <span className="mx-2 text-paper/50" aria-hidden="true">
              ·
            </span>
            <span className="text-silver">{current.proof}</span>
          </p>
          <div
            role="group"
            aria-label="Choose a background"
            className="flex items-center gap-2.5"
          >
            {SLIDES.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={s.title}
                aria-current={i === index ? "true" : undefined}
                className="group p-1"
              >
                <span
                  className={`block h-1.5 w-1.5 rounded-pill transition-all duration-300 [filter:drop-shadow(0_1px_4px_rgba(8,9,11,0.9))] ${
                    i === index
                      ? "w-5 bg-paper"
                      : "bg-paper/45 group-hover:bg-paper/80"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
