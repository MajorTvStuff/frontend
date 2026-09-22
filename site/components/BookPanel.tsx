"use client";

import Image from "next/image";
import { SHOW_TODOS } from "@/lib/site";
import type { Cover } from "@/components/Shelf";

const ORIGIN = "https://www.youtube-nocookie.com";

/**
 * The write-up panel — it slides in from the right (up from the bottom on a
 * phone) when a tile or a jacket is pressed: clicked, tapped, or Enter on a
 * keyboard. It stays until it is put away, and pressing another swaps its
 * contents in place rather than flying out and back in.
 *
 * A SHOW OPENS AS A PLAYER. Showing the key art again, at the moment someone
 * pressed the key art, tells them nothing they did not just see: a show with
 * a trailer gets the trailer itself, embedded and playing, and the panel
 * becomes a centred window wide enough for it rather than a side rail. The
 * fourth show has no embeddable trailer — its youtubeId is null — so it
 * keeps the still and a link to where the footage actually lives.
 *
 * The iframe is mounted only while the panel is open, which is also how the
 * sound stops: closing unmounts the player rather than pausing it.
 *
 * The write-ups: the rule has not changed — we invent nothing — but "invent
 * nothing" was never the same as "say nothing". The summaries are ours,
 * written from published sources and cited per title in research.json, and
 * RG's role comes either from his own approved bio or from the imprint,
 * which is a matter of record. Publication dates are left out at his
 * instruction (see dateless() in lib/content.ts).
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
  const playable = !!(book?.youtubeId && open);
  return (
    <>
      {/* the player is a window, not a margin note, so the page behind it
          steps back — and the scrim is one more place to press to close */}
      {playable && (
        <div
          className="book-panel-scrim"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        id="book-panel"
        className={`book-panel${open && book ? " is-open" : ""}${
          playable ? " is-video" : ""
        }`}
        aria-live="polite"
        aria-hidden={!open || !book}
      >
        {book && (
          <div className="book-panel-inner" key={book.slug}>
            {playable ? (
              <div className="book-panel-video">
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
              </div>
            ) : (
              <div className="book-panel-art">
                <Image
                  src={`/projects/${book.slug}.jpg`}
                  alt=""
                  width={book.width}
                  height={book.height}
                  sizes="220px"
                  className="h-auto w-full"
                />
              </div>
            )}

            <div className="book-panel-say">
              <p className="meta-caps mt-6 text-faint">
                {book.medium === "show" ? "The slate" : "The shelf"}
              </p>
              <h3 className="display-heavy mt-2 text-h2 leading-tight text-paper">
                {book.title}
              </h3>
              {book.credit && (
                <p className="mt-2 text-cap text-mid">{book.credit}</p>
              )}

              <p className="meta-caps mt-6 text-signal">{book.proof}</p>

              {/* a show with no embeddable trailer says where its footage is,
                  rather than pretending the still is the trailer */}
              {book.medium === "show" && !book.youtubeId && book.trailer && (
                <p className="mt-6">
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
                  <p className="book-panel-summary mt-6">{r.summary}</p>

                  <dl className="book-panel-facts mt-6">
                    {/* the line is the imprint or the network now that the
                        dates are out of it, so it is labelled as one */}
                    <dt className="meta-caps text-faint">
                      {book.medium === "show" ? "Network" : "Publisher"}
                    </dt>
                    <dd className="mt-1 text-cap text-mid">{r.carrier}</dd>
                    {r.award && (
                      <>
                        <dt className="meta-caps mt-4 text-faint">Award</dt>
                        <dd className="mt-1 text-cap text-mid">{r.award}</dd>
                      </>
                    )}
                    <dt className="meta-caps mt-4 text-faint">{founder}</dt>
                    <dd className="mt-1 text-cap text-mid">{r.role}</dd>
                  </dl>
                </>
              )}

              {!r && SHOW_TODOS && (
                <p className="book-panel-todo mt-6">
                  No write-up for this title yet — see content/research.json.
                </p>
              )}

              <button
                type="button"
                className="btn meta-caps mt-8 book-panel-close"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
