"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { BookPanel } from "@/components/BookPanel";
import { useDismiss } from "@/lib/panel";
import type { Credit, Project } from "@/lib/content";

export type BandItem = Project & {
  width: number;
  height: number;
  /** the display half of our write-up, looked up on the server. The panel
      shows it when the tile is pressed; the row itself stays wordless. */
  about?: Credit | null;
};

/**
 * THE PROJECTS BAND — one row, everything in it, drifting.
 *
 * The client's own layout has "full tiles on TV shows and grids on the books
 * … all in one place", and his recording shows why it works: the page holds
 * still while the row moves, so the work is present continuously without ever
 * being the thing you are reading. It is the only imagery in the body of the
 * page, and it is deliberately small — his brief was for the site to breathe
 * with copy and for the pictures to support it.
 *
 * Shows take a tile at their own aspect ratio — three of the four key art
 * files are not 16:9, and a fixed box was cropping a quarter off the height
 * of TIME OF ESSENCE. Books are half height and stack in pairs, which is the
 * grid he described; a book standing full height on its own is what stops
 * the row reading as a filmstrip.
 *
 * The order is the copy doc's, which alternates shows and books for its first
 * half — but only its first half. Left to parity the tail came out as twelve
 * consecutive stamps with no show and nothing full height among them, so the
 * rule caps a run at two pairs and stands the next book up instead. A pair
 * never straddles a show.
 *
 * THREE THINGS THE ROW OWES THE VISITOR, and how each is paid:
 *
 *   it moves      one CSS animation on the track, so the drift costs no
 *                 script and runs on every device he might open it on
 *   it scrolls    the row is a scroll container, so a finger, a trackpad, a
 *                 dragged mouse or the arrow keys can go through all 24 at
 *                 any pace. Any of those pauses the drift, and it picks up
 *                 again six seconds after the last one.
 *   it opens      a press on any tile — click, tap, Enter — opens that
 *                 title's write-up in the same panel the shelf uses. Press
 *                 it again, press another, press off the row, or Escape.
 */

type Cell =
  | { kind: "show"; item: BandItem }
  | { kind: "solo"; item: BandItem }
  | { kind: "pair"; items: [BandItem, BandItem] };

const MAX_RUN = 2; // consecutive pairs before a book stands up on its own
/** how long the row waits after a scroll, drag or tap before drifting again */
const HOLD_MS = 6000;

function lay(items: BandItem[]): Cell[] {
  const cells: Cell[] = [];
  const held: BandItem[] = [];
  let run = 0; // pairs emitted since the last show or solo
  const take = () => {
    if (held.length >= 2 && run < MAX_RUN) {
      cells.push({ kind: "pair", items: [held.shift()!, held.shift()!] });
      run += 1;
    } else {
      cells.push({ kind: "solo", item: held.shift()! });
      run = 0;
    }
  };
  for (const it of items) {
    if (it.medium === "show") {
      while (held.length) take(); // a pair never straddles a show
      cells.push({ kind: "show", item: it });
      run = 0;
    } else {
      held.push(it);
      if (held.length === 2 && run < MAX_RUN) take();
    }
  }
  while (held.length) take();
  return cells;
}

const alt = (p: BandItem) => `${p.title}${p.credit ? ` — ${p.credit}` : ""}`;

function Tile({
  p,
  kind,
  pressed,
  onPress,
  /** the second run is the seam that makes the loop endless: the same tiles
      again, hidden from assistive tech and out of the tab order */
  decorative,
}: {
  p: BandItem;
  kind: "show" | "solo" | "pair";
  pressed: boolean;
  onPress: (p: BandItem) => void;
  decorative: boolean;
}) {
  return (
    <button
      type="button"
      className="band-hit"
      data-pressed={pressed ? "true" : undefined}
      aria-expanded={decorative ? undefined : pressed}
      aria-controls={decorative ? undefined : "book-panel"}
      tabIndex={decorative ? -1 : undefined}
      onClick={() => onPress(p)}
    >
      <Image
        src={`/projects/${p.slug}.jpg`}
        alt={alt(p)}
        width={p.width}
        height={p.height}
        /* its own aspect ratio, not a 16:9 box — only two of the four key
           art files are 16:9, and a box was cropping the rest */
        sizes={kind === "show" ? "340px" : kind === "pair" ? "120px" : "200px"}
        className={kind === "show" ? "band-still" : "band-book"}
        /* a mouse pulling the row by a cover would otherwise start the
           browser's own picture-drag, which kills the scroll one step in */
        draggable={false}
      />
      <span className="sr-only">{p.proof}. Details</span>
    </button>
  );
}

export function Band({
  items,
  founder,
}: {
  items: BandItem[];
  /** whose role the panel is describing */
  founder: string;
}) {
  const cells = lay(items);
  const bandRef = useRef<HTMLDivElement | null>(null);

  /* PRESSED: one title at a time holds the panel. `shown` outlives it so the
     panel can slide out still showing what it was showing. */
  const [pressed, setPressed] = useState<string | null>(null);
  const [shown, setShown] = useState<BandItem | null>(null);
  const press = useCallback((p: BandItem) => {
    setPressed((cur) => (cur === p.slug ? null : p.slug));
    setShown(p);
  }, []);
  const close = useCallback(() => setPressed(null), []);
  useDismiss(!!pressed, close);

  /* HELD: the drift waits while the visitor is working the row, and for a
     few seconds after they stop, so a scrubbed row does not snatch itself
     back the instant a finger lifts. Hover and focus pause it in CSS. */
  const [held, setHeld] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hold = useCallback(() => {
    setHeld(true);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setHeld(false), HOLD_MS);
  }, []);

  /* DRAG: a touch scrolls the row natively, but a mouse has nothing to pull
     with, so it gets grab-and-pull. A drag that ends on a tile must not open
     it — the click that follows is swallowed in the capture phase.

     The move and the release are watched on the WINDOW, not on the row.
     Pointer capture is the usual way to keep a drag while the cursor wanders
     off, but capturing on a scroll container and then scrolling it makes the
     browser cancel the pointer — the row moved 22px and stopped dead. */
  const dragged = useRef(false);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    hold();
    const el = bandRef.current;
    if (e.pointerType !== "mouse" || !el) return;
    const from = { x: e.clientX, left: el.scrollLeft, moved: false };
    const onMove = (m: PointerEvent) => {
      const dx = m.clientX - from.x;
      if (!from.moved && Math.abs(dx) < 4) return; // a press with a tremor in it
      from.moved = true;
      el.scrollLeft = from.left - dx;
    };
    const onUp = () => {
      dragged.current = from.moved;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragged.current) return;
    dragged.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  /* the sequence is rendered twice and the track travels exactly half its
     width, so the loop closes on itself with no jump */
  const run = (copy: number) => (
    <div className="band-run" aria-hidden={copy === 1 ? "true" : undefined}>
      {cells.map((c, i) => {
        const key = `${copy}-${i}`;
        const tile = (p: BandItem, kind: "show" | "solo" | "pair") => (
          <Tile
            key={p.slug}
            p={p}
            kind={kind}
            pressed={pressed === p.slug}
            onPress={press}
            decorative={copy === 1}
          />
        );
        if (c.kind === "show")
          return (
            <div className="band-cell band-cell--show" key={key}>
              {tile(c.item, "show")}
            </div>
          );
        if (c.kind === "solo")
          return (
            <div className="band-cell band-cell--solo" key={key}>
              {tile(c.item, "solo")}
            </div>
          );
        return (
          <div className="band-cell band-cell--pair" key={key}>
            {tile(c.items[0], "pair")}
            {tile(c.items[1], "pair")}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* A focus stop, so the pause that :focus-within already describes can
          actually happen, and so the arrow keys can scroll the row. */}
      <div
        ref={bandRef}
        className="band"
        role="group"
        aria-label="Selected work"
        tabIndex={0}
        data-held={held || pressed ? "true" : undefined}
        onScroll={hold}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
      >
        <div className="band-track">
          {run(0)}
          {run(1)}
        </div>
      </div>

      <BookPanel
        book={shown}
        open={!!pressed}
        founder={founder}
        onClose={close}
      />
    </>
  );
}
