"use client";

import { useEffect, useRef, useState } from "react";
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
 * The hero, in three layers:
 * 1. An ambient carousel of the slate — no controls, it just plays.
 *    Slides melt into each other (blur + fade + zoom settle).
 * 2. RG's word-flow sequence over a heavy scrim: the six lines breathe in
 *    and out at reel pace while the slate flashes behind them, then the
 *    scrim relaxes.
 * 3. The logo build resolves out of "That's" and holds.
 * The caption tracks the slide that is actually visible (it swaps mid-
 * transition, not at state change). Reduced motion: no cycling, finished
 * lockup, first frame.
 */
const HOLD_MS = 5500;
const CAPTION_LAG_MS = 900;

export function Montage({
  slides,
  introLines,
}: {
  slides: Slide[];
  introLines: string[];
}) {
  const [index, setIndex] = useState(0);
  const [captionIndex, setCaptionIndex] = useState(0);
  const firstRun = useRef(true);

  // auto-advance only — the reel is ambience, not navigation
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), HOLD_MS);
    return () => clearTimeout(t);
  }, [index, slides.length]);

  // the caption follows the image: it flips once the incoming slide
  // dominates the crossfade, so credit and picture never disagree
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = setTimeout(() => setCaptionIndex(index), CAPTION_LAG_MS);
    return () => clearTimeout(t);
  }, [index]);

  const current = slides[captionIndex];

  return (
    <section className="relative overflow-hidden bg-screen">
      <h1 className="sr-only">
        MAJOR CONTENT — TV | FILM | BOOKS. Bridging content and culture with
        global icons, premium programming, worldwide bestsellers — resonating
        with the collective majority.
      </h1>

      <div className="relative h-[62svh] min-h-[440px] w-full sm:h-[76svh]">
        {/* layer 1 — the ambient reel */}
        <div aria-hidden="true" className="absolute inset-0">
          {slides.map((s, i) => {
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
                  width={s.width}
                  height={s.height}
                  priority={i < 2}
                  quality={90}
                  sizes="100vw"
                  className={
                    s.fit === "cover"
                      ? "h-full w-full object-cover"
                      : "h-full w-full object-contain py-[3svh]"
                  }
                />
              </div>
            );
          })}
        </div>

        {/* resting scrim — just enough for the lockup to read */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,rgba(8,9,11,0.5)_0%,rgba(8,9,11,0.12)_55%,rgba(8,9,11,0.4)_100%)]"
        />
        {/* intro scrim — heavy during the word flow, then lets the reel through */}
        <div
          aria-hidden="true"
          className="intro-scrim absolute inset-0 z-20 bg-screen/80 opacity-0"
        />

        {/* layer 2 — the word flow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30">
          {introLines.map((line, i) => (
            <p
              key={line}
              style={{ "--i": i } as React.CSSProperties}
              className="intro-line absolute inset-0 flex items-center justify-center px-6 text-center font-light text-flow text-paper opacity-0 [text-shadow:0_2px_18px_rgba(8,9,11,0.9)]"
            >
              {line}
            </p>
          ))}
        </div>

        {/* layer 3 — the logo resolves and holds */}
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <Lockup
            animate
            bright
            className="w-[min(26rem,62vw)] [filter:drop-shadow(0_2px_22px_rgba(8,9,11,0.95))_drop-shadow(0_0_6px_rgba(8,9,11,0.7))]"
          />
        </div>

        {/* now playing — ambient label, arrives after the intro */}
        <p
          aria-hidden="true"
          className="hero-caption meta-caps absolute bottom-5 left-5 z-40 max-w-[80%] text-paper [text-shadow:0_1px_8px_rgba(8,9,11,0.9)] sm:left-8"
        >
          {current.title}
          <span className="mx-2 text-paper/50">·</span>
          <span className="text-silver">{current.proof}</span>
        </p>
      </div>
    </section>
  );
}
