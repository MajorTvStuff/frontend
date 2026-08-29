"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Lockup } from "@/components/Lockup";
import { claimPlayer, releasePlayer, onPlayerChange } from "@/lib/player-bus";

export type Cover = {
  slug: string;
  width: number;
  height: number;
};

export type Trailer = {
  youtubeId: string;
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
 * hard-cutting behind them ("quick and explosive"), the logo building out
 * of the last word, and the trailer taking the frame at 4.9s.
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

const TRAILER_AT_MS = 4900;

/* The intro clip. Drop a file at either path and the sound control appears
   on its own — browsers block autoplaying audio, so it only ever plays from
   the button's tap. */
const AUDIO_SOURCES = ["/intro/opener.mp3", "/intro/opener.wav"];

export function Hero({
  still,
  introLines,
  flash,
  trailer,
  primer,
}: {
  still: Cover;
  introLines: string[];
  flash: Cover[];
  trailer?: Trailer;
  primer: Primer;
}) {
  const [showTrailer, setShowTrailer] = useState(false);
  // bumping `run` remounts every intro layer, restarting their CSS timelines
  const [run, setRun] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const heroVisible = useRef(true);

  // the trailer arrives once the intro has resolved, and only if the hero is
  // still on screen (re-armed on every replay: `run` resets the timeline)
  useEffect(() => {
    if (!trailer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => {
      if (heroVisible.current) setShowTrailer(true);
    }, TRAILER_AT_MS);
    return () => clearTimeout(t);
  }, [trailer, run]);

  // whoever else takes the player wins: the slate claims it as you scroll
  // into the wall, and the hero lets go on the spot
  useEffect(() => onPlayerChange((who) => who !== "hero" && setShowTrailer(false)), []);

  useEffect(() => {
    if (showTrailer) claimPlayer("hero");
    else releasePlayer("hero");
    return () => releasePlayer("hero");
  }, [showTrailer]);

  // the hero's player is destroyed when the hero leaves, so it cannot keep
  // decoding off-screen behind the slate's own trailers
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        heroVisible.current = e.isIntersecting;
        if (!e.isIntersecting) setShowTrailer(false);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
    setShowTrailer(false);
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
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            key={`still-${run}`}
            src={`/projects/${still.slug}.jpg`}
            alt=""
            fill
            priority
            quality={90}
            sizes="100vw"
            className="hero-drift h-full w-full object-cover"
          />
        </div>

        {/* the footage, once the intro has resolved. start=6 so the resting
            frame is the film itself and never a network bumper. */}
        {showTrailer && trailer && (
          <div
            aria-hidden="true"
            inert
            className="trailer-in absolute inset-0 z-[15] overflow-hidden opacity-0"
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.youtubeId}&playsinline=1&rel=0&disablekb=1&start=6&cc_load_policy=0&iv_load_policy=3`}
              title=""
              allow="autoplay; encrypted-media"
              /* scaled past the frame on purpose: the embed paints its own title
                 bar and transport controls at its edges, and this is ambience
                 the visitor never touches. Cropping them out is the only way
                 to keep a third party's chrome off the brand's first screen. */
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-video min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.35] border-0"
            />
          </div>
        )}

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
              "linear-gradient(to top, rgba(0,21,40,.96) 0%, rgba(0,21,40,.88) 26%, rgba(0,21,40,.62) 46%, rgba(0,21,40,0) 68%)",
          }}
        />

        {/* resting scrim — just enough for the lockup to read */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,rgba(0,21,40,0.5)_0%,rgba(0,21,40,0.12)_55%,rgba(0,21,40,0.4)_100%)]"
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
          {showTrailer && (
            <button
              type="button"
              onClick={() => setShowTrailer(false)}
              className="btn meta-caps bg-screen/70 text-paper"
            >
              Stop
            </button>
          )}
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
