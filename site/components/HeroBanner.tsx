"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * THE OPENING BANNER — his words, his gradient, and his own logo film.
 *
 * The ground and the sequence are copied from his build:
 *
 *   ground     linear-gradient(150deg, #030c17 0%, #0a2038 60%, #0d2740 100%)
 *              under a top-to-bottom scrim, on black
 *   sequence   seven lines, each fading fully out before the next fades in —
 *              0.9s each way, holding 1.4s at full strength
 *
 * THE LOGO IS HIS FILM: Assets/MAJOR-TV-logo-animation.mov, re-edited by him
 * to resolve on MAJOR CONTENT. The chevron pieces, the fold into the M, the
 * MAJOR wipe, CONTENT, and the audio. Encoded for the web in public/brand/,
 * cropped from the 4K source to everything the logo ever lights up — so it
 * stays sharp on a retina screen — and left to run its full 4.5s, since his
 * edit ends by holding on the finished logo. The film is on black; a screen
 * blend drops the black out against the gradient.
 *
 * IT STARTS ON ITS OWN, AND THERE IS NO MUTE. No buttons: the seven lines
 * begin as the page loads and the logo follows. The film always asks for its
 * sound. A browser will only grant that once the visitor has clicked,
 * tapped or pressed a key on the page — its rule, not one a page can
 * change — so for anyone who has, the logo arrives with its audio; for a
 * first visit where nothing has been pressed it plays silently, and the
 * moment anything is pressed while it is running, the sound comes on.
 *
 * ON REDUCED MOTION the banner renders at rest — the finished logo as a
 * still, the sub-line, no film. The sound belongs to the animation,
 * and someone who asked for no animation gets neither.
 */

const FADE_MS = 900; // the opacity transition, each way
const HOLD_MS = 1400; // how long a line stays at full strength
const AFTER_LINES_MS = 300; // the beat between the last line and the logo
const SUB_AFTER_FILM_MS = 500; // film at rest -> TV | FILM | BOOKS

export function HeroBanner({
  lines,
  verticals,
}: {
  /** the seven lines, in his order */
  lines: string[];
  /** TV | FILM | BOOKS */
  verticals: string;
}) {
  const filmRef = useRef<HTMLVideoElement | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [run, setRun] = useState(false);
  const [sub, setSub] = useState(false);
  const [still, setStill] = useState(false); // reduced motion: the held frame

  /* reduced motion: straight to the resting state */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      setRun(true);
      setSub(true);
    }
  }, []);

  /* the seven lines, from the moment the page loads */
  useEffect(() => {
    if (still) return;
    let live = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number, fn: () => void) => {
      timers.push(setTimeout(() => live && fn(), ms));
    };
    const step = (i: number) => {
      if (!live) return;
      if (i >= lines.length) {
        setShown(false); // the last line clears before the logo arrives
        wait(FADE_MS + AFTER_LINES_MS, () => setRun(true));
        return;
      }
      setWord(lines[i]);
      setShown(true);
      wait(FADE_MS + HOLD_MS, () => {
        setShown(false);
        wait(FADE_MS, () => step(i + 1));
      });
    };
    step(0);
    return () => {
      live = false;
      timers.forEach(clearTimeout);
    };
  }, [still, lines]);

  /* the film asks for its sound every time; if the browser says no, it
     plays anyway, silently, rather than stop and wait */
  useEffect(() => {
    if (!run || still) return;
    const film = filmRef.current;
    if (!film) return;
    film.muted = false;
    film.currentTime = 0;
    film.play().catch(() => {
      film.muted = true;
      film.play().catch(() => setSub(true)); // cannot play at all: rest
    });
  }, [run, still]);

  /* ...and the first press anywhere on the page, while it is running,
     turns the sound on — a press is exactly the permission the browser
     was waiting for */
  useEffect(() => {
    if (still) return;
    const unmute = () => {
      const film = filmRef.current;
      if (film && film.muted && !film.paused && !film.ended) film.muted = false;
    };
    const opts = { capture: true, passive: true } as const;
    window.addEventListener("pointerdown", unmute, opts);
    window.addEventListener("keydown", unmute, opts);
    return () => {
      window.removeEventListener("pointerdown", unmute, opts);
      window.removeEventListener("keydown", unmute, opts);
    };
  }, [still]);

  return (
    <section
      className={`hero-banner${run ? " is-running" : ""}`}
      aria-label="Major Content"
    >
      <div className="hero-bg" aria-hidden="true">
        <div className="navy-panel" />
      </div>
      <div className="hero-scrim" aria-hidden="true" />

      <div className="hero-inner">
        {/* the sequence is decoration over a heading that is always there
            for a reader that does not wait for animation */}
        <div className="hero-sequence" aria-hidden="true">
          <span className={shown ? "is-shown" : undefined}>{word}</span>
        </div>

        <h1 className="sr-only">Major Content — {verticals}</h1>

        <div className={`hero-film${run ? " is-shown" : ""}`}>
          {still ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/brand/major-logo-hold.webp" alt="" width={1120} height={468} />
          ) : (
            <video
              ref={filmRef}
              playsInline
              preload="auto"
              poster="/brand/major-logo-hold.webp"
              aria-hidden="true"
              tabIndex={-1}
              onEnded={() => setTimeout(() => setSub(true), SUB_AFTER_FILM_MS)}
            >
              <source src="/brand/major-logo.webm" type="video/webm" />
              <source src="/brand/major-logo.mp4" type="video/mp4" />
            </video>
          )}
        </div>

        <div className={`hero-sub-line${sub ? " is-shown" : ""}`}>
          {verticals}
        </div>
      </div>

      <div className="hero-scroll" aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}
