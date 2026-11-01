"use client";

import { useEffect, useRef, useState } from "react";
import { onPlayerChange } from "@/lib/player-bus";

/**
 * THE ENTRY — his reel, in two cuts: one for a computer, one for a phone.
 *
 * Both are his, in Assets/email/: Major_Content_Reel_FINAL for a computer
 * and Major_Content_Reel_MOBILE for a phone ("one for phone, one for PC",
 * 2026-10-22). The same forty-two seconds — his opening lines as title cards
 * between footage of the shows and the books, ending on his logo and TV |
 * FILM | BOOKS — but the mobile cut sets the cards, the credits and the
 * closing logo bigger, so they still read at a phone's width.
 *
 * ENCODED FOR THE WEB in public/brand/ and named for the cut each comes
 * from, major-content-reel-final.* and major-content-reel-mobile.*: VP9/Opus
 * WebM first, H.264/AAC MP4 for Safari; the final cut at 1080p, the mobile
 * cut at 720p, a phone's own width. They were called flow-* once, after the
 * film before these. Every URL is stamped with the date of the export it
 * plays (see REEL) — a new export moves the stamp on.
 *
 * A PHONE is narrow, or — held sideways — short with a finger for a pointer,
 * so a phone on its side still gets the mobile cut. The browser makes the
 * choice once, as the page loads.
 *
 * SHOWN WHOLE, never cropped. The cards are centred, but the footage has a
 * burned-in caption and network bugs within 2% of the frame's edge. His
 * ground is one vertical gradient — black at the top and bottom, navy
 * through the middle, the same on every card — and the banner carries it on
 * past the film's edges (see .hero-film-ground), so through the cards and
 * the logo the edge of the frame does not show.
 *
 * SOUND: it autoplays, asking for its sound; a browser grants that only once
 * the visitor has pressed something — its rule, not the page's — so a first
 * visit plays muted. In the corner, "Sound on" (shown while muted) unmutes it
 * where it is, as does a click on the film itself, and "Replay" restarts it
 * from the top with sound. Each is a click, which is the permission needed.
 *
 * IT PLAYS ONLY WHILE IT IS WATCHED: it pauses once most of it has scrolled
 * away, in a hidden tab, and while a trailer plays in the band's panel, then
 * picks up where it left off. Once it has finished it holds on the logo.
 *
 * AT REST it is its own last frame, the logo, as a still — and the two cuts
 * end differently (the mobile logo is far bigger), so the still is the
 * cut's own: under reduced motion (no source matches, so the film is not
 * even downloaded), and where the browser will not play it at all, as on an
 * iPhone in Low Power Mode. There Replay starts it. The server can't know the
 * screen, so it sends the phone's still and a computer swaps in its own;
 * without JavaScript the phone's is what shows.
 */

/** below this share of the banner on screen, the film stops talking */
const IN_VIEW = 0.35;

const MOTION = "(prefers-reduced-motion: no-preference)";
/* a phone either way up: narrow, or on its side — short, with a finger for
   a pointer */
const PHONE_WAYS = ["(max-width: 767px)", "(max-height: 500px) and (pointer: coarse)"];
const PHONE = PHONE_WAYS.join(", ");
const PHONE_FILM = PHONE_WAYS.map((q) => `${q} and ${MOTION}`).join(", ");

/* Each URL carries the date of the export it plays. When he sends a new
   export of a cut, its files are replaced and its date moves on, so no phone
   and no cache can go on playing the one before under the same address. */
const reel = (cut: "final" | "mobile", exported: string) => ({
  webm: `/brand/major-content-reel-${cut}.webm?v=${exported}`,
  mp4: `/brand/major-content-reel-${cut}.mp4?v=${exported}`,
  still: `/brand/major-content-reel-${cut}-end.webp?v=${exported}`,
});
const REEL = {
  /* his re-export: the book collages on the dark ground every other card
     has, where they had a bright blue one (the mobile cut already did) */
  final: reel("final", "2026-10-23"),
  mobile: reel("mobile", "2026-10-22"),
};

type Film = "waiting" | "playing" | "rest";

export function HeroBanner({
  verticals,
}: {
  /** TV | FILM | BOOKS */
  verticals: string;
}) {
  const bannerRef = useRef<HTMLElement | null>(null);
  const filmRef = useRef<HTMLVideoElement | null>(null);
  const [film, setFilm] = useState<Film>("waiting");
  const [muted, setMuted] = useState(true);
  /* the phone's still until the page knows it is on a computer */
  const [still, setStill] = useState(REEL.mobile.still);
  /* the corner controls reach into the effect's closure through these */
  const unmuteRef = useRef<() => void>(() => {});
  const replayRef = useRef<() => void>(() => {});

  useEffect(() => {
    const banner = bannerRef.current;
    const video = filmRef.current;
    if (!banner || !video) return;

    if (!window.matchMedia(PHONE).matches) setStill(REEL.final.still);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFilm("rest");
      return;
    }

    let live = true;
    let inView = false;
    let trailer = false; // another player holds the page
    let asked = false; // it has asked for its sound
    let refused = false; // the browser will not play it at all

    const play = () => {
      if (!asked) {
        asked = true;
        video.muted = false;
      }
      video.play().then(
        () => {
          if (live) setFilm("playing");
        },
        (err: DOMException) => {
          if (!live || err.name === "AbortError") return; // a pause overtook it
          if (!video.muted) {
            // no sound without a press: it plays silently, and the corner
            // button (or a click on the film) turns the sound on
            video.muted = true;
            play();
            return;
          }
          refused = true;
          setFilm("rest");
        },
      );
    };

    const sync = () => {
      const watched = inView && !document.hidden && !trailer && !refused;
      if (watched && video.paused && !video.ended) play();
      else if (!watched && !video.paused) video.pause();
    };

    /* a click on the film, or the sound button: sound on, where it is */
    unmuteRef.current = () => {
      if (refused || video.paused || video.ended) {
        replayRef.current();
        return;
      }
      video.muted = false;
    };
    /* the replay button: from the top, with its sound — the click that
       pressed it is the permission the browser wants */
    replayRef.current = () => {
      refused = false;
      video.muted = false;
      video.currentTime = 0;
      play();
    };

    const onVolume = () => setMuted(video.muted);
    video.addEventListener("volumechange", onVolume);
    onVolume();

    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.intersectionRatio >= IN_VIEW;
        sync();
      },
      { threshold: [0, IN_VIEW] },
    );
    io.observe(banner);
    document.addEventListener("visibilitychange", sync);
    // back from another page out of the back/forward cache, which paused it
    window.addEventListener("pageshow", sync);
    const off = onPlayerChange((owner) => {
      trailer = owner !== null;
      sync();
    });

    return () => {
      live = false;
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pageshow", sync);
      off();
      video.removeEventListener("volumechange", onVolume);
      video.pause();
    };
  }, []);

  return (
    <section
      ref={bannerRef}
      className="hero-banner"
      data-film={film}
      aria-label="Major Content"
    >
      <div className="hero-film-ground" aria-hidden="true" />

      <h1 className="sr-only">Major Content — {verticals}</h1>

      <div
        className={`hero-film${film === "waiting" ? "" : " is-shown"}`}
        onClick={() => unmuteRef.current()}
      >
        <video
          ref={filmRef}
          playsInline
          preload="auto"
          poster={still}
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          disableRemotePlayback
        >
          {/* the first that the browser can play and whose screen it is */}
          <source src={REEL.mobile.webm} type="video/webm" media={PHONE_FILM} />
          <source src={REEL.final.webm} type="video/webm" media={MOTION} />
          <source src={REEL.mobile.mp4} type="video/mp4" media={PHONE_FILM} />
          <source src={REEL.final.mp4} type="video/mp4" media={MOTION} />
        </video>
      </div>

      {/* sound and replay, in the corner, once there is a film to control */}
      {film !== "waiting" && (
        <div className="hero-controls">
          {film === "playing" && muted && (
            <button
              type="button"
              className="hero-control"
              onClick={() => unmuteRef.current()}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
                <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              <span>Sound on</span>
            </button>
          )}
          <button
            type="button"
            className="hero-control"
            onClick={() => replayRef.current()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12a7 7 0 1 0 2.05-4.95" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M5 4v4h4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
            <span>Replay</span>
          </button>
        </div>
      )}

      <div className="hero-scroll" aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}
