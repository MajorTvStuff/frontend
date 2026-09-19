"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Lockup } from "@/components/Lockup";

export type Cover = {
  slug: string;
  width: number;
  height: number;
};

export type Primer = {
  eyebrow: string;
  statement: string;
  proofs: string[];
  proofsShort: string[];
};

/**
 * THE HERO — an overture, and then an argument.
 *
 * The intro performs: six lines cut at a 0.58s cadence, six book covers
 * hard-cutting behind them ("quick and explosive"), and the logo building
 * out of the last word onto the DRIVE frame.
 *
 * There is deliberately NO video here. A YouTube embed paints its own
 * transport controls over the picture even while it reports playing, wears
 * the uploader's watermark, and burns in auto-captions — none of which we
 * can style away from outside the iframe, and all of which landed on the
 * brand's first screen. The footage lives on the slate instead, where a
 * visitor asks for it by hovering. When the client sends a hosted MP4 this
 * becomes a muted <video> with no third-party surface at all, and the
 * ambient hero film comes straight back.
 *
 * But the intro is NOT load-bearing. Underneath it, present from the first
 * byte, is the primer: what this company is, and six tokens of proof. A
 * visitor who arrives mid-sequence, scrolls at second one, runs reduced
 * motion, or is a crawler gets the whole argument anyway. Only the primer's
 * opacity is animated, it lands with the logo, and it never leaves.
 *
 * That is the fix for the client's actual brief — "a reference point for
 * folks that didn't get the info search."
 */

/* The intro clip. Drop a file at either path and the sound control appears
   on its own — browsers block autoplaying audio, so it only ever plays from
   the button's tap. */
const AUDIO_SOURCES = ["/intro/opener.mp3", "/intro/opener.wav"];

export function Hero({
  still,
  introLines,
  flash,
  primer,
  ground = "sharp",
}: {
  still: Cover;
  introLines: string[];
  flash: Cover[];
  primer: Primer;
  /**
   * How the key art behaves behind the type.
   *
   * "sharp" is the original: a full-bleed photograph with just enough scrim
   * for the lockup to read. "soft" defocuses it into colour and light, which
   * is what the client's "the images should be more supportive" asks of the
   * first screen — and it removes a real defect, because the DRIVE art
   * carries its own lockup and it ghosted straight through ours.
   *
   * It is a prop rather than a decision because both variants are live at
   * once and the image-led one has to stay as it was.
   */
  ground?: "sharp" | "soft";
}) {
  // bumping `run` remounts every intro layer, restarting their CSS timelines
  const [run, setRun] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  // probe for the clip — the control exists only if a playable file is there
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    const tryLoad = (i: number) => {
      if (cancelled || i >= AUDIO_SOURCES.length) return;
      const a = new Audio();
      a.preload = "auto";
      a.oncanplaythrough = () => {
        if (cancelled) return;
        audioRef.current = a;
        setAudioReady(true);
      };
      a.onerror = () => tryLoad(i + 1);
      a.src = AUDIO_SOURCES[i];
    };
    tryLoad(0);
    return () => {
      cancelled = true;
    };
  }, []);

  const replayWithSound = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    setRun((r) => r + 1);
    a.currentTime = 0;
    void a.play().catch(() => {});
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(178deg, #001528 0%, #001d33 60%, #003b59 130%)",
      }}
    >
      <div className="relative h-[100svh] min-h-[560px] w-full">
        {/* the still. One image, not a ten-slide carousel: nine of those
            never rendered, and it put a decade-old book jacket full-bleed
            under the brand reveal. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${ground === "soft" ? "hero-ground" : ""}`}
        >
          <Image
            key={`still-${run}`}
            src={`/projects/${still.slug}.jpg`}
            alt=""
            fill
            priority
            quality={90}
            sizes="100vw"
            style={
              ground === "soft" ? { objectPosition: "68% 50%" } : undefined
            }
            className={`hero-drift h-full w-full object-cover ${
              ground === "soft" ? "hero-still" : ""
            }`}
          />
        </div>

        <div
          aria-hidden="true"
          className="grain pointer-events-none absolute inset-0 z-[18] opacity-[0.05]"
        />

        {/* a permanent floor: gives the primer ground to stand on, and
            suppresses the poster's own baked-in title art */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[19]"
          style={{
            background:
              ground === "soft"
                ? "linear-gradient(to top, rgba(0,21,40,.98) 0%, rgba(0,21,40,.94) 30%, rgba(0,21,40,.78) 52%, rgba(0,21,40,.34) 78%, rgba(0,21,40,.18) 100%)"
                : "linear-gradient(to top, rgba(0,21,40,.96) 0%, rgba(0,21,40,.88) 26%, rgba(0,21,40,.62) 46%, rgba(0,21,40,0) 68%)",
          }}
        />

        {/* Resting scrim — just enough for the lockup to read, and on the
            copy-led page enough more that the type owns the frame. */}
        <div
          aria-hidden="true"
          className={
            ground === "soft"
              ? "absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,rgba(0,21,40,0.66)_0%,rgba(0,21,40,0.46)_48%,rgba(0,21,40,0.7)_100%)]"
              : "absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,rgba(0,21,40,0.5)_0%,rgba(0,21,40,0.12)_55%,rgba(0,21,40,0.4)_100%)]"
          }
        />
        {/* intro scrim — heavy through the sequence, released once the logo
            build has actually finished */}
        <div
          key={`scrim-${run}`}
          aria-hidden="true"
          className="intro-scrim absolute inset-0 z-20 bg-screen/80 opacity-0"
        />

        {/* the covers own the upper band... */}
        <div
          key={`flash-${run}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[25]"
        >
          {flash.map((c, i) => (
            <div
              key={c.slug}
              style={{ "--i": i } as React.CSSProperties}
              className="intro-flash absolute inset-0 flex items-start justify-center pt-[8svh] opacity-0"
            >
              <Image
                src={`/projects/${c.slug}.jpg`}
                alt=""
                width={c.width}
                height={c.height}
                quality={90}
                sizes="45vh"
                loading="eager"
                className="h-[42%] w-auto object-contain [filter:drop-shadow(0_14px_44px_rgba(0,5,12,0.85))]"
              />
            </div>
          ))}
        </div>

        {/* ...and the words own the lower one, so they stop colliding */}
        <div
          key={`words-${run}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30"
        >
          {introLines.map((line, i) => (
            <p
              key={line}
              style={{ "--i": i } as React.CSSProperties}
              className="intro-line absolute inset-0 flex items-end justify-center px-6 pb-[26svh] text-center font-light text-intro text-paper opacity-0 [text-shadow:0_2px_22px_rgba(0,18,35,0.95)] [text-wrap:balance]"
            >
              {line}
            </p>
          ))}
        </div>

        {/* the logo resolves out of the last word and holds, clear of the
            poster's own title lockup */}
        <div
          key={`logo-${run}`}
          className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center pt-[20svh]"
        >
          <Lockup
            animate
            bright
            className="logo-settle w-[min(28rem,66vw)] [filter:drop-shadow(0_2px_22px_rgba(0,18,35,0.95))_drop-shadow(0_0_6px_rgba(0,18,35,0.7))]"
          />
        </div>

        {/* THE PRIMER — real DOM text from the first byte. The h1 is the
            company's own sentence, so the page has a genuine heading and
            the crawler, the screen reader and the early scroller all get
            the same answer the intro is performing. */}
        <div
          key={`primer-${run}`}
          className="hero-primer absolute bottom-[13svh] left-5 z-40 max-w-[680px] pr-5 sm:left-8"
        >
          <p className="meta-caps text-mid [text-shadow:0_1px_10px_rgba(0,18,35,0.95)]">
            {primer.eyebrow}
          </p>
          <h1 className="mt-3 text-lede font-light text-paper [text-shadow:0_2px_18px_rgba(0,18,35,0.75)]">
            {primer.statement}
          </h1>
          <p className="mt-5 text-strip text-mid [text-shadow:0_1px_10px_rgba(0,18,35,0.95)]">
            <span className="sm:hidden">
              {primer.proofsShort.map((t, i) => (
                <span key={t}>
                  {i > 0 && <span className="text-signal"> · </span>}
                  {t}
                </span>
              ))}
            </span>
            <span className="hidden sm:inline">
              {primer.proofs.map((t, i) => (
                <span key={t}>
                  {i > 0 && <span className="text-signal"> · </span>}
                  {t}
                </span>
              ))}
            </span>
          </p>
        </div>

        {/* the hero owns the viewport, so it owes the visitor a cue */}
        <div
          aria-hidden="true"
          className="hero-primer absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 [text-shadow:0_1px_10px_rgba(0,18,35,0.95)]"
        >
          <span className="meta-caps text-faint">Scroll</span>
          <span className="block h-7 w-px bg-line" />
        </div>

        <div className="absolute bottom-6 right-6 z-40 flex gap-2">
          {audioReady && (
            <button
              type="button"
              onClick={replayWithSound}
              className="btn meta-caps bg-screen/70 text-paper"
            >
              Replay with sound
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
