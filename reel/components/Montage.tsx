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

export type Trailer = {
  youtubeId: string;
  title: string;
  proof: string;
};

/**
 * The hero, in four layers:
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
const TRAILER_AT_MS = 10600;

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
    const t = setTimeout(() => setShowTrailer(true), TRAILER_AT_MS);
    return () => clearTimeout(t);
  }, [trailer, run]);

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
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(178deg, #001528 0%, #001d33 60%, #003b59 130%)" }}
    >
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

        {/* layer 1b — the trailer, once the intro has resolved */}
        {showTrailer && trailer && (
          <div
            aria-hidden="true"
            className="trailer-in absolute inset-0 z-[15] overflow-hidden opacity-0"
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.youtubeId}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`}
              title=""
              tabIndex={-1}
              allow="autoplay; encrypted-media"
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-video min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
            />
          </div>
        )}

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
                className="h-[58%] w-auto object-contain [filter:drop-shadow(0_14px_44px_rgba(0,5,12,0.85))]"
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
              className="intro-line absolute inset-0 flex items-center justify-center px-6 text-center font-light text-flow text-paper opacity-0 [text-shadow:0_2px_18px_rgba(0,18,35,0.9)]"
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
            className="w-[min(26rem,62vw)] [filter:drop-shadow(0_2px_22px_rgba(0,18,35,0.95))_drop-shadow(0_0_6px_rgba(0,18,35,0.7))]"
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

        {/* sound on — appears only when the intro clip exists */}
        {audioReady && (
          <button
            type="button"
            onClick={replayWithSound}
            className="meta-caps absolute right-5 top-5 z-40 border border-paper/25 bg-screen/70 px-3 py-2 text-paper transition-colors duration-300 hover:border-signal hover:text-signal sm:right-8"
          >
            Replay with sound
          </button>
        )}
      </div>
    </section>
  );
}
