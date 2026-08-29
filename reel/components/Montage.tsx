"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Lockup } from "@/components/Lockup";
import { claimPlayer, releasePlayer, onPlayerChange } from "@/lib/player-bus";

export type Slide = {
  slug: string;
  fit: "cover" | "contain";
  title: string;
  proof: string;
  width: number;
  height: number;
};

export type Trailer = {
  youtubeId: string;
  title: string;
  proof: string;
};

export type Primer = {
  eyebrow: string;
  statement: string;
  proofs: string[];
  proofsShort: string[];
};

/**
 * The hero, in four layers, cut fast — the whole intro lands in ~4.9s.
 *
 * 1. An ambient carousel of the slate — no controls, it just plays.
 *    Slides melt into each other (blur + fade + zoom settle).
 * 2. RG's word-flow sequence over a heavy scrim, with book covers
 *    hard-cutting behind the lines ("quick and explosive") while
 *    "Worldwide Bestsellers" reads.
 * 3. The logo build resolves out of "That's" and holds.
 * 4. Afterwards the trailer fades up and plays muted behind the lockup
 *    (the carousel stays mounted beneath as the offline fallback).
 * The caption tracks whatever is actually visible. Reduced motion: no
 * cycling, no flash, no trailer — finished lockup, first frame.
 */
const TRAILER_AT_MS = 4900;

/* RG's intro audio (the Oprah clip). Drop the file at either path and the
   "Replay with sound" control appears on its own — no code change. Browsers
   block autoplaying audio, so it only ever plays from the button's tap. */
const AUDIO_SOURCES = ["/intro/opener.mp3", "/intro/opener.wav"];

export function Montage({
  still,
  introLines,
  flash,
  trailer,
  primer,
}: {
  still: Slide;
  introLines: string[];
  flash: Slide[];
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

  // afterwards, the trailer plays — once the intro has fully resolved
  // (re-armed on every replay: `run` resets the whole hero timeline)
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
  useEffect(() => {
    return onPlayerChange((who) => {
      if (who !== "hero") setShowTrailer(false);
    });
  }, []);

  // hold/give up the claim as the hero's own trailer comes and goes
  useEffect(() => {
    if (showTrailer) claimPlayer("hero");
    else releasePlayer("hero");
    return () => releasePlayer("hero");
  }, [showTrailer]);

  // the hero player is also destroyed when the hero leaves — otherwise it
  // keeps decoding (and looping) off-screen. Not remounted on re-entry:
  // "Replay with sound" re-arms the whole hero.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        heroVisible.current = e.isIntersecting;
        if (!e.isIntersecting) setShowTrailer(false);
      },
      // retire the hero once its bottom rises past mid-screen — a plain
      // threshold-0 exit fires ~1s later than the slate's cue band, and the
      // two players overlap for that window on a slow, deliberate scroll
      { threshold: 0, rootMargin: "0px 0px -50% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // probe for the intro clip — the sound control exists only if a playable
  // file is actually there
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

  // the sound-on tap: restart the intro from the top, audio in sync
  const replayWithSound = () => {
    const a = audioRef.current;
    if (!a) return;
    setShowTrailer(false);
    setRun((r) => r + 1);
    a.currentTime = 0;
    void a.play().catch(() => {});
  };

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(178deg, #001528 0%, #001d33 60%, #003b59 130%)" }}
    >
      <div className="relative h-[100svh] min-h-[560px] w-full">
        {/* layer 1 — one still. The ten-slide carousel is gone: nine of its
            slides never rendered, and it put a 2014 book jacket full-bleed
            under the brand reveal, which is the opposite of "not loud and
            proud" about the old catalogue. */}
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            src={`/projects/${still.slug}.jpg`}
            alt=""
            fill
            priority
            quality={90}
            sizes="100vw"
            className="hero-drift h-full w-full object-cover"
          />
        </div>

        {/* layer 1b — the trailer, once the intro has resolved */}
        {showTrailer && trailer && (
          <div
            aria-hidden="true"
            className="trailer-in absolute inset-0 z-[15] overflow-hidden opacity-0"
            inert
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.youtubeId}&playsinline=1&rel=0&disablekb=1&start=6`}
              title=""
              allow="autoplay; encrypted-media"
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-video min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
            />
          </div>
        )}

        {/* a permanent floor: gives the primer ground to stand on and
            suppresses the poster's own baked-in title art */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[19]"
          style={{
            background:
              "linear-gradient(to top, rgba(0,21,40,.92) 0%, rgba(0,21,40,.72) 22%, rgba(0,21,40,0) 46%)",
          }}
        />

        {/* film grain over the imagery, under the scrims and type */}
        <div
          aria-hidden="true"
          className="grain pointer-events-none absolute inset-0 z-[18] opacity-[0.05]"
        />

        {/* resting scrim — just enough for the lockup to read */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,rgba(0,21,40,0.5)_0%,rgba(0,21,40,0.12)_55%,rgba(0,21,40,0.4)_100%)]"
        />
        {/* intro scrim — heavy during the word flow, then lets the reel through */}
        <div
          key={`scrim-${run}`}
          aria-hidden="true"
          className="intro-scrim absolute inset-0 z-20 bg-screen/80 opacity-0"
        />

        {/* layer 2a — quick and explosive: covers hard-cut behind the words */}
        <div
          key={`flash-${run}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[25]"
        >
          {flash.map((s, i) => (
            <div
              key={s.slug}
              style={{ "--i": i } as React.CSSProperties}
              className="intro-flash absolute inset-0 flex items-start justify-center pt-[8svh] opacity-0"
            >
              <Image
                src={`/projects/${s.slug}.jpg`}
                alt=""
                width={s.width}
                height={s.height}
                quality={90}
                sizes="45vh"
                loading="eager"
                className="h-[46%] w-auto object-contain [filter:drop-shadow(0_14px_44px_rgba(0,5,12,0.85))]"
              />
            </div>
          ))}
        </div>

        {/* layer 2b — the word flow */}
        <div
          key={`words-${run}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30"
        >
          {introLines.map((line, i) => (
            <p
              key={line}
              style={{ "--i": i } as React.CSSProperties}
              className="intro-line absolute inset-0 flex items-end justify-center px-6 pb-[16svh] text-center font-light text-intro text-paper opacity-0 [text-shadow:0_2px_22px_rgba(0,18,35,0.95)] [text-wrap:balance]"
            >
              {line}
            </p>
          ))}
        </div>

        {/* layer 3 — the logo resolves and holds */}
        <div
          key={`logo-${run}`}
          className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center pt-[22svh]"
        >
          <Lockup
            animate
            bright
            className="logo-settle w-[min(28rem,66vw)] [filter:drop-shadow(0_2px_22px_rgba(0,18,35,0.95))_drop-shadow(0_0_6px_rgba(0,18,35,0.7))]"
          />
        </div>

        {/* THE PRIMER — the page's actual argument, and the fix for the
            client's "a reference point for folks that didn't get the info
            search". Real DOM text from the first byte: crawlers, screen
            readers, reduced-motion visitors and anyone who scrolls at second
            one all get it. Only its opacity is animated, and it never leaves. */}
        <div className="hero-primer absolute bottom-[13svh] left-5 z-40 max-w-[680px] pr-5 sm:left-8">
          <p className="meta-caps text-faint">{primer.eyebrow}</p>
          <h1 className="mt-3 text-lede font-light text-paper [text-shadow:0_2px_18px_rgba(0,18,35,0.75)]">
            {primer.statement}
          </h1>
          <p className="mt-5 text-strip text-mid">
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

        {/* a real scroll cue, since the hero now owns the whole viewport */}
        <div
          aria-hidden="true"
          className="hero-primer absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <span className="meta-caps text-faint">Scroll</span>
          <span className="block h-7 w-px bg-line" />
        </div>

        {/* controls — sound-on appears only when the intro clip exists */}
        <div className="absolute bottom-6 right-6 z-40 flex gap-2">
          {showTrailer && (
            <button
              type="button"
              onClick={() => setShowTrailer(false)}
              className="hero-btn meta-caps border border-paper/25 bg-screen/70 px-3 py-2 text-paper"
            >
              Stop
            </button>
          )}
          {audioReady && (
            <button
              type="button"
              onClick={replayWithSound}
              className="hero-btn meta-caps border border-paper/25 bg-screen/70 px-3 py-2 text-paper"
            >
              Replay with sound
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
