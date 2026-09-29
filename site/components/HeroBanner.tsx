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
 * THE LOGO IS THE REAL ANIMATION, not a rebuild of it. His build redrew the
 * logo in SVG and got it wrong: it dropped the little TV under MAJOR, it had
 * no sound, and its end state came apart at the seams. So this plays
 * Assets/MAJOR-TV-logo-animation.mov itself — the chevron pieces, the fold
 * into the M, the MAJOR wipe with its sheen, the TV, and the audio — encoded
 * for the web in public/brand/:
 *
 *   major-logo.webm / .mp4   cropped to everything the logo ever lights up,
 *                            and ending on its sharpest complete frame (4.74s,
 *                            measured) so it comes to rest on the logo instead
 *                            of running on into the clip's blur-out exit.
 *                            The audio is all inside that window.
 *   major-logo-hold.webp     that frame, for anyone who asked for less motion
 *
 * The film is on black; `mix-blend-mode: screen` drops the black out against
 * his gradient, so there is no box around the logo.
 *
 * SOUND. No browser lets a page start sound on its own for a first-time
 * visitor. So it tries — and if the visitor has already clicked anything,
 * the logo arrives with its audio — and when the browser says no, the film
 * plays silently and a Sound button appears beside it, which replays it
 * from the top with the audio on.
 *
 * ON REDUCED MOTION the banner renders at rest: the held frame, the
 * sub-line, no sequence and no film.
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
  const [silent, setSilent] = useState(false); // the browser refused sound

  /* the seven lines, then the film */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      setRun(true);
      setSub(true);
      return;
    }

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
  }, [lines]);

  /* the film: with sound if the browser allows it, silent if not */
  useEffect(() => {
    if (!run || still) return;
    const film = filmRef.current;
    if (!film) return;
    film.currentTime = 0;
    film.muted = false;
    film.play().catch(() => {
      film.muted = true;
      setSilent(true);
      film.play().catch(() => setSub(true)); // cannot play at all: rest
    });
  }, [run, still]);

  const withSound = useCallback(() => {
    const film = filmRef.current;
    if (!film) return;
    film.muted = false;
    film.currentTime = 0;
    setSilent(false);
    film.play().catch(() => {
      film.muted = true;
      setSilent(true);
    });
  }, []);

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
        {/* the sequence is decoration over a heading that is always there for
            a reader that does not wait for animation */}
        <div className="hero-sequence" aria-hidden="true">
          <span className={shown ? "is-shown" : undefined}>{word}</span>
        </div>

        <h1 className="sr-only">Major Content — {verticals}</h1>

        <div className={`hero-film${run ? " is-shown" : ""}`}>
          {still ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/brand/major-logo-hold.webp" alt="" width={604} height={246} />
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

        {/* only when the browser would not let the logo speak on its own */}
        {silent && (
          <button type="button" className="hero-sound meta-caps" onClick={withSound}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor" />
              <path
                d="M11 5.5c1.2 1.4 1.2 3.6 0 5M12.8 3.8c2.1 2.4 2.1 6 0 8.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            Sound
          </button>
        )}
      </div>

      <div className="hero-scroll" aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}
