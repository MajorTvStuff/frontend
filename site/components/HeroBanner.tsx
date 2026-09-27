"use client";

import { useEffect, useRef, useState } from "react";

/**
 * THE OPENING BANNER, COPIED FROM THE CLIENT'S OWN BUILD.
 *
 * He sent the build and asked for this hero word for word, gradient and all,
 * so every value here is his, not ours:
 *
 *   ground     linear-gradient(150deg, #030c17 0%, #0a2038 60%, #0d2740 100%)
 *              under a top-to-bottom scrim, on black
 *   sequence   seven lines, each fading fully out before the next fades in —
 *              0.9s each way, holding 1.4s at full strength
 *   logo       the chevron flips open (1.4s, the right page 0.45s behind the
 *              left), the M rises at 1.9s, AJOR wipes in at 2.9s, CONTENT
 *              fades at 4.9s
 *   sub-line   TV | FILM | BOOKS, 6.7s after the logo starts
 *
 * The lines come from content/site.json, which is his copy doc; the staging
 * — "with" alone on its line, then "Global Icons" — is his build's.
 *
 * ON NO JAVASCRIPT AND ON REDUCED MOTION the banner renders at its resting
 * state: logo up, sub-line up, no sequence. Nobody waits nine seconds for a
 * company name, and nobody who asked for less motion gets a slideshow.
 */

const FADE_MS = 900; // the opacity transition, each way
const HOLD_MS = 1400; // how long a line stays at full strength
const AFTER_LINES_MS = 300; // the beat between the last line and the logo
const SUB_LINE_MS = 6700; // logo start -> TV | FILM | BOOKS

export function HeroBanner({
  lines,
  verticals,
}: {
  /** the seven lines, in his order */
  lines: string[];
  /** TV | FILM | BOOKS */
  verticals: string;
}) {
  const heroRef = useRef<HTMLElement | null>(null);
  const wordRef = useRef<HTMLSpanElement | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [run, setRun] = useState(false);
  const [sub, setSub] = useState(false);

  useEffect(() => {
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (quiet.matches) {
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
        wait(FADE_MS + AFTER_LINES_MS, () => {
          setRun(true);
          wait(SUB_LINE_MS, () => setSub(true));
        });
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

  return (
    <section
      ref={heroRef}
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
          <span ref={wordRef} className={shown ? "is-shown" : undefined}>
            {word}
          </span>
        </div>

        <h1 className="sr-only">Major Content — {verticals}</h1>
        <svg
          className={`hero-logo${run ? " is-shown" : ""}`}
          viewBox="5 72 310 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <g className="chevron">
            <g className="page-left">
              <path
                fillRule="nonzero"
                d="M 23.34375 87.042969 L 23.34375 80.53125 L 44.773438 102.34375 Z M 23.34375 87.042969 "
              />
            </g>
            <g className="page-right">
              <path
                fillRule="nonzero"
                d="M 48.367188 102.34375 L 69.703125 87.042969 L 69.703125 80.53125 Z M 48.367188 102.34375 "
              />
            </g>
          </g>
          <g className="mletter">
            <path
              fillRule="nonzero"
              d="M 46.566406 105.769531 L 33.902344 96.882812 L 17.171875 84.742188 L 17.179688 103.171875 L 46.515625 125.90625 L 75.710938 103.363281 L 75.71875 84.933594 Z M 46.566406 105.769531 "
            />
            <path
              fillRule="nonzero"
              d="M 17.179688 103.171875 L 33.902344 116.132812 L 33.902344 133.359375 L 17.191406 133.359375 Z M 17.179688 103.171875 "
            />
          </g>
          <g className="ajor">
            <path
              fillRule="nonzero"
              d="M 75.710938 103.363281 L 58.992188 116.289062 L 58.992188 133.550781 L 75.703125 133.550781 L 75.710938 103.476562 Z M 75.710938 103.363281 "
            />
            <path
              fillRule="nonzero"
              d="M 94.113281 133.582031 L 118.550781 88.605469 L 103.074219 88.605469 L 78.339844 133.582031 Z M 94.113281 133.582031 "
            />
            <path
              fillRule="nonzero"
              d="M 118.550781 88.605469 L 110.84375 102.785156 L 115.632812 111.597656 L 106.054688 111.597656 L 98.5 125.511719 L 123.132812 125.449219 L 127.546875 133.578125 L 143.4375 133.578125 Z M 118.550781 88.605469 "
            />
            <path
              fillRule="nonzero"
              d="M 169.414062 88.546875 L 169.414062 113.082031 C 169.414062 113.226562 169.402344 113.347656 169.398438 113.488281 L 169.398438 134.398438 C 178.617188 131.894531 184.265625 124.179688 184.265625 113.351562 L 184.265625 88.546875 Z M 169.414062 88.546875 "
            />
            <path
              fillRule="nonzero"
              d="M 162.507812 120.742188 C 158.347656 120.742188 157.273438 119.652344 156.390625 118.339844 L 153.53125 114.085938 L 141.066406 122.335938 L 144.011719 126.65625 C 147.902344 132.375 154.125 135.277344 162.507812 135.277344 C 164.976562 135.277344 167.28125 134.972656 169.398438 134.398438 L 169.398438 113.488281 C 169.265625 120.160156 165.929688 120.742188 162.507812 120.742188 "
            />
            <path
              fillRule="nonzero"
              d="M 243.058594 111.152344 C 243.058594 100.574219 237.53125 92.710938 228.289062 89.171875 L 221.402344 101.691406 C 225.339844 102.734375 228.65625 105.335938 228.65625 111.152344 C 228.65625 119.472656 221.867188 121.21875 216.171875 121.21875 C 214.472656 121.21875 212.675781 121.0625 210.992188 120.621094 L 204.101562 133.148438 C 207.621094 134.488281 211.675781 135.210938 216.171875 135.210938 C 232.503906 135.210938 243.058594 125.765625 243.058594 111.152344 "
            />
            <path
              fillRule="nonzero"
              d="M 203.6875 111.152344 C 203.6875 102.828125 210.476562 101.082031 216.171875 101.082031 C 217.886719 101.082031 219.703125 101.242188 221.402344 101.691406 L 228.289062 89.171875 C 224.757812 87.816406 220.6875 87.09375 216.171875 87.09375 C 199.84375 87.09375 189.289062 96.535156 189.289062 111.152344 C 189.289062 121.742188 194.835938 129.613281 204.101562 133.148438 L 210.992188 120.621094 C 207.03125 119.589844 203.6875 116.988281 203.6875 111.152344 "
            />
            <path
              fillRule="nonzero"
              d="M 302.621094 133.617188 L 288.625 117.816406 L 288.628906 117.816406 L 288.628906 117.8125 L 288.902344 117.652344 C 293.941406 114.75 296.605469 110.222656 296.605469 104.5625 C 296.605469 94.890625 289.019531 88.640625 277.277344 88.640625 L 261.363281 88.640625 L 261.382812 101.457031 L 278.171875 101.457031 C 281.15625 101.457031 282.199219 102.363281 282.199219 104.007812 C 282.199219 105.046875 281.570312 106.496094 278.515625 106.496094 L 261.382812 106.488281 L 261.417969 120.53125 L 272.238281 120.53125 L 283.613281 133.636719 Z M 302.621094 133.617188 "
            />
            <path
              fillRule="nonzero"
              d="M 261.386719 88.605469 L 247.089844 88.605469 L 247.089844 133.664062 L 261.386719 133.664062 Z M 261.386719 88.605469 "
            />
          </g>
          <text
            className="subtitle"
            x="17.02"
            y="157.4"
            fontSize="15"
            letterSpacing="36.4984"
          >
            CONTENT
          </text>
        </svg>

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
