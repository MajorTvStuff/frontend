"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { claimPlayer, releasePlayer } from "@/lib/player-bus";
import { SHOW_TODOS } from "@/lib/site";
import type { Cover } from "@/components/Shelf";

const ORIGIN = "https://www.youtube-nocookie.com";

/**
 * The write-up panel — a window over the page on a desktop, a sheet up from
 * the bottom on a phone, opened by pressing a tile or a jacket: click, tap,
 * or Enter on a keyboard. Pressing another swaps its contents in place.
 *
 * AS HIS NOTES OF 2026-10-21 HAVE IT:
 *   - the page dims behind it, for a book exactly as for a show
 *   - the way out is a "×" at the top right, a tap anywhere off it, a swipe
 *     down on a phone, or Escape; there is no Close button at the foot
 *   - the kicker carries the red line ("— The slate", "— The shelf") and
 *     the title is set in the header font, light, caps, spaced
 *   - on a phone a book stands its cover on top and the text runs full
 *     width under it
 *   - no years anywhere in it: research.json's summaries and award lines
 *     are written without them, and the carrier line loses its date
 *
 * A SHOW OPENS ON ITS KEY ART, with a frosted play button over it. The
 * trailer is only fetched when that is pressed — so nothing loads from
 * YouTube until a visitor asks for it, which is what the privacy page says —
 * and it then plays in place. The fourth show has no embeddable trailer —
 * its youtubeId is null — so it keeps the still and a link to where the
 * footage lives. (He has asked for the trailers as files of his own; until
 * they arrive, YouTube's player is what the button opens.)
 *
 * The player is mounted only while it plays, which is also how the sound
 * stops: closing unmounts it rather than pausing it.
 *
 * The write-ups: the rule has not changed — we invent nothing — but "invent
 * nothing" was never the same as "say nothing". The summaries are ours,
 * written from published sources and cited per title in research.json, and
 * RG's role comes either from his own approved bio or from the imprint,
 * which is a matter of record.
 */
export function BookPanel({
  book,
  open,
  founder,
  onClose,
}: {
  book: Cover | null;
  open: boolean;
  /** whose role the panel is describing */
  founder: string;
  onClose: () => void;
}) {
  const r = book?.about ?? null;
  const isShow = book?.medium === "show";
  const shown = open && !!book;

  /* the trailer stays behind its poster until play is pressed; a new title,
     or the panel closing, puts it back */
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    setPlaying(false);
  }, [book?.slug, open]);
  const playable = !!(book?.youtubeId && open && playing);

  /* one player on the page: while a trailer plays here it holds it, and the
     banner's film stops rather than play on underneath */
  useEffect(() => {
    if (!playable) return;
    claimPlayer("panel");
    return () => releasePlayer("panel");
  }, [playable]);

  /* SWIPE DOWN TO CLOSE — the sheet, on a phone. Only from the top of its
     own scroll, so a reader scrolling back up a long write-up is scrolling,
     and the sheet follows the finger until it lets go. */
  const sheetRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = sheetRef.current;
    if (!el || !shown) return;
    let y0 = 0;
    let dy = 0;
    let dragging = false;
    const start = (e: TouchEvent) => {
      if (!window.matchMedia("(max-width: 639px)").matches) return;
      if (el.scrollTop > 0) return;
      y0 = e.touches[0].clientY;
      dy = 0;
      dragging = true;
    };
    const move = (e: TouchEvent) => {
      if (!dragging) return;
      dy = e.touches[0].clientY - y0;
      if (dy <= 0) {
        el.style.transform = "";
        return;
      }
      e.preventDefault();
      el.style.transition = "none";
      el.style.transform = `translateY(${dy}px)`;
    };
    const end = () => {
      if (!dragging) return;
      dragging = false;
      el.style.transition = "";
      el.style.transform = "";
      if (dy > 90) onClose();
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: false });
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
    };
  }, [shown, onClose]);

  return (
    <>
      {/* the page steps back behind it, and the dimmed page is one more
          place to press to put it away */}
      {shown && (
        <div className="book-panel-scrim" aria-hidden="true" onClick={onClose} />
      )}

      <aside
        ref={sheetRef}
        id="book-panel"
        className={`book-panel ${isShow ? "is-show" : "is-book"}${shown ? " is-open" : ""}`}
        aria-live="polite"
        aria-hidden={!shown}
        aria-label={book ? book.title : undefined}
      >
        {book && (
          <div className="book-panel-inner" key={book.slug}>
            <div className="book-panel-top">
              <span className="book-panel-grip" aria-hidden="true" />
              <button
                type="button"
                className="round-btn book-panel-close"
                aria-label="Close"
                onClick={onClose}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>

            {isShow ? (
              <div className="book-panel-video">
                {playable ? (
                  <iframe
                    title={`${book.title} — trailer`}
                    src={
                      `${ORIGIN}/embed/${book.youtubeId}` +
                      `?autoplay=1&mute=0&controls=1&rel=0&playsinline=1` +
                      `&cc_load_policy=0&iv_load_policy=3&modestbranding=1`
                    }
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <Image
                      src={`/projects/${book.slug}.jpg`}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 50rem, 100vw"
                      className="book-panel-poster"
                    />
                    {book.youtubeId && (
                      <button
                        type="button"
                        className="frost-btn frost-btn--lg book-panel-play"
                        aria-label={`Play the ${book.title} trailer`}
                        onClick={() => setPlaying(true)}
                      >
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                          <path d="M5.5 3.8v8.4L12.2 8z" fill="currentColor" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="book-panel-art">
                <Image
                  src={`/projects/${book.slug}.jpg`}
                  alt=""
                  width={book.width}
                  height={book.height}
                  sizes="(min-width: 640px) 14rem, 8rem"
                  className="h-auto w-full"
                />
              </div>
            )}

            <div className="book-panel-say">
              <p className="book-panel-kicker">
                <span className="section-rule" aria-hidden="true" />
                {isShow ? "The slate" : "The shelf"}
              </p>
              <h3 className="book-panel-title">{book.title}</h3>
              {book.credit && <p className="book-panel-credit">{book.credit}</p>}
              {book.proof && <p className="book-panel-proof">{book.proof}</p>}

              {/* a show with no embeddable trailer says where its footage is,
                  rather than pretending the still is the trailer */}
              {isShow && !book.youtubeId && book.trailer && (
                <p className="mt-5">
                  <a
                    className="link meta-caps"
                    href={book.trailer}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Watch on Facebook ↗
                  </a>
                </p>
              )}

              {r && (
                <>
                  <p className="book-panel-summary">{r.summary}</p>

                  <dl className="book-panel-facts">
                    {/* the line is the imprint or the network now that the
                        dates are out of it, so it is labelled as one */}
                    <dt>{isShow ? "Network" : "Publisher"}</dt>
                    <dd>{r.carrier}</dd>
                    {r.award && (
                      <>
                        <dt>Award</dt>
                        <dd>{r.award}</dd>
                      </>
                    )}
                    {/* A title he has no established role on says nothing
                        about him. CELIA: MY LIFE published two months before
                        he joined Rayo, so the imprint inference that carries
                        every other title does not hold there, and an empty
                        role prints nothing at all rather than a hedge. */}
                    {r.role && (
                      <>
                        <dt>{founder}</dt>
                        <dd>{r.role}</dd>
                      </>
                    )}
                  </dl>
                </>
              )}

              {!r && SHOW_TODOS && (
                <p className="book-panel-todo mt-6">
                  No write-up for this title yet — see content/research.json.
                </p>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
