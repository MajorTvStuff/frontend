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
const HOLD_MS = 5500;
const CAPTION_LAG_MS = 900;
const TRAILER_AT_MS = 4900;

/* RG's intro audio (the Oprah clip). Drop the file at either path and the
   "Replay with sound" control appears on its own — no code change. Browsers
   block autoplaying audio, so it only ever plays from the button's tap. */
const AUDIO_SOURCES = ["/intro/opener.mp3", "/intro/opener.wav"];

export function Montage({
  slides,
  introLines,
  flash,
  trailer,
}: {
  slides: Slide[];
  introLines: string[];
  flash: Slide[];
  trailer?: Trailer;
}) {
  const [index, setIndex] = useState(0);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  // bumping `run` remounts every intro layer, restarting their CSS timelines
  const [run, setRun] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firstRun = useRef(true);
  const heroRef = useRef<HTMLElement | null>(null);
  const heroVisible = useRef(true);

  // auto-advance only — the reel is ambience, not navigation; it stops
  // once the trailer owns the frame
  useEffect(() => {
    if (showTrailer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), HOLD_MS);
    return () => clearTimeout(t);
  }, [index, slides.length, showTrailer]);

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

  const current = slides[captionIndex];
  const caption =
    showTrailer && trailer
      ? { title: trailer.title, proof: `${trailer.proof} · Trailer` }
      : { title: current.title, proof: current.proof };

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(178deg, #001528 0%, #001d33 60%, #003b59 130%)" }}
    >
      <h1 className="sr-only">
        MAJOR CONTENT — TV | FILM | BOOKS. Bridging content and culture with
        global icons, premium programming, worldwide bestsellers — resonating
        with the collective majority.
      </h1>

      <div className="relative h-[68svh] min-h-[480px] w-full sm:h-[84svh]">
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
                  className={`${
                    s.fit === "cover"
                      ? "h-full w-full object-cover"
                      : "h-full w-full object-contain py-[3svh]"
                  }${active ? " hero-drift" : ""}`}
                />
              </div>
            );
          })}
        </div>

        {/* layer 1b — the trailer, once the intro has resolved */}
        {showTrailer && trailer && (
          <div
            aria-hidden="true"
            className="trailer-in absolute inset-0 z-[15] overflow-hidden opacity-0"
            inert
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.youtubeId}&playsinline=1&rel=0&disablekb=1`}
              title=""
              allow="autoplay; encrypted-media"
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-video min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
            />
          </div>
        )}

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
              className="intro-flash absolute inset-0 flex items-center justify-center opacity-0"
            >
              <Image
                src={`/projects/${s.slug}.jpg`}
                alt=""
                width={s.width}
                height={s.height}
                quality={90}
                sizes="45vh"
                loading="eager"
                className="h-[64%] w-auto object-contain [filter:drop-shadow(0_14px_44px_rgba(0,5,12,0.85))]"
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
              className="intro-line absolute inset-0 flex items-center justify-center px-6 text-center font-light text-intro text-paper opacity-0 [text-shadow:0_2px_22px_rgba(0,18,35,0.95)] [text-wrap:balance]"
            >
              {line}
            </p>
          ))}
        </div>

        {/* layer 3 — the logo resolves and holds */}
        <div
          key={`logo-${run}`}
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
        >
          <Lockup
            animate
            bright
            className="logo-settle w-[min(28rem,66vw)] [filter:drop-shadow(0_2px_22px_rgba(0,18,35,0.95))_drop-shadow(0_0_6px_rgba(0,18,35,0.7))]"
          />
        </div>

        {/* now playing — ambient label, arrives after the intro */}
        <p
          key={`caption-${run}`}
          aria-hidden="true"
          className="hero-caption meta-caps absolute bottom-5 left-5 z-40 max-w-[80%] text-paper [text-shadow:0_1px_8px_rgba(0,18,35,0.9)] sm:left-8"
        >
          {caption.title}
          <span className="mx-2 text-paper/50">·</span>
          <span className="text-silver">{caption.proof}</span>
        </p>

        {/* controls — sound-on appears only when the intro clip exists */}
        <div className="absolute right-5 top-5 z-40 flex gap-2 sm:right-8">
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
