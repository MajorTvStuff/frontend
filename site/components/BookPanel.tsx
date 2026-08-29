"use client";

import Image from "next/image";
import { SHOW_TODOS } from "@/lib/site";
import type { Cover } from "@/components/Shelf";

/**
 * The book panel — slides in from the right when a jacket is hovered,
 * focused or tapped, and stays while the reader moves along the shelf,
 * swapping its contents rather than flying in and out.
 *
 * IT CARRIES NO SYNOPSIS, deliberately. The content files hold a title, an
 * author and a proof line per book and nothing else, and writing plot
 * summaries for twenty real published books would be inventing facts about
 * other people's work. The slot for a synopsis is visible in the beta
 * (NEXT_PUBLIC_SHOW_TODOS) so the client can see exactly what is missing;
 * it renders nothing at all in production until he sends them.
 */
export function BookPanel({
  book,
  open,
  pinned,
  onClose,
}: {
  book: Cover | null;
  open: boolean;
  pinned: boolean;
  onClose: () => void;
}) {
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

          {SHOW_TODOS && (
            <p className="book-panel-todo mt-6">
              Synopsis pending — RG to supply one paragraph per title, plus his
              role on it. We will not write these.
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
