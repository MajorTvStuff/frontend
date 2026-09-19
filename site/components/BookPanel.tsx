"use client";

import Image from "next/image";
import { SHOW_TODOS } from "@/lib/site";
import type { Cover } from "@/components/Shelf";

/**
 * The book panel — slides in from the right when a jacket is hovered,
 * focused or tapped, and stays while the reader moves along the shelf,
 * swapping its contents rather than flying in and out.
 *
 * It now carries the write-up. The rule it was built under has not changed —
 * we invent nothing — but "invent nothing" was never the same as "say
 * nothing": the summaries are ours, written from published sources and cited
 * per title in content/research.json, and RG's role comes either from his own
 * approved bio or from the imprint, which is a matter of record. A title with
 * no entry yet still shows only what the copy doc gives us.
 */
export function BookPanel({
  book,
  open,
  pinned,
  founder,
  onClose,
}: {
  book: Cover | null;
  open: boolean;
  pinned: boolean;
  /** whose role the panel is describing */
  founder: string;
  onClose: () => void;
}) {
  const r = book?.about ?? null;
  return (
    <aside
      className={`book-panel${open && book ? " is-open" : ""}${pinned ? " is-pinned" : ""}`}
      aria-live="polite"
      aria-hidden={!open || !book}
    >
      {book && (
        <div className="book-panel-inner" key={book.slug}>
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

          <p className="meta-caps mt-6 text-faint">
            {pinned ? "Pinned" : "The shelf"}
          </p>
          <h3 className="display-heavy mt-2 text-h2 leading-tight text-paper">
            {book.title}
          </h3>
          {book.credit && (
            <p className="mt-2 text-cap text-mid">{book.credit}</p>
          )}

          <p className="meta-caps mt-6 text-signal">{book.proof}</p>

          {r && (
            <>
              <p className="book-panel-summary mt-6">{r.summary}</p>

              <dl className="book-panel-facts mt-6">
                <dt className="meta-caps text-faint">Published</dt>
                <dd className="mt-1 text-cap text-mid">{r.carrier}</dd>
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
            {pinned ? "Unpin" : "Close"}
          </button>
        </div>
      )}
    </aside>
  );
}
