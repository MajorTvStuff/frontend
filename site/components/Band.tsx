"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BookPanel } from "@/components/BookPanel";
import { useDismiss } from "@/lib/panel";
import type { Credit, Project } from "@/lib/content";

export type BandItem = Project & {
  width: number;
  height: number;
  /** the trailer's YouTube id, for the shows — the panel embeds it and it
      plays there, rather than showing the key art again */
  youtubeId?: string | null;
  /** the display half of our write-up, looked up on the server. The panel
      shows it when the tile is pressed; the row itself stays wordless. */
  about?: Credit | null;
};

/**
 * THE PROJECTS BAND — one row, everything in it, stepped through.
 *
 * The client's own layout has "full tiles on TV shows and grids on the books
 * … all in one place". It used to drift; his final mockup holds it still,
 * with a pair of arrows under it, a red progress line, and the place in the
 * row counted out — 01 / 06. A page is one width of the row, so a phone has
 * more of them than a desktop does, and the count says so.
 *
 * Shows take a tile at their own aspect ratio — three of the four key art
 * files are not 16:9, and a fixed box was cropping a quarter off the height
 * of TIME OF ESSENCE. Books are half height and stack in pairs, which is the
 * grid he described; a book standing full height on its own is what stops
 * the row reading as a filmstrip.
 *
 * TRUE LOVE and ME stand alone by name (STAND_ALONE). They are the two the
 * shelf is known for and a stack made them half height — "so we're not
 * dwarfing important books", in the client's words. Side by side at full
 * height they read at the same weight as the shows do. THE GREENPRINT and
 * EXTRA LEAN joined them on 2026-10-21: he sent six books after Celia with
 * each one marked "Big" or "Small", and left to the order rule both of his
 * "Big" ones would have gone into a stack.
 *
 * The order is the copy doc's, which alternates shows and books for its first
 * half — but only its first half. Left to parity the tail came out as twelve
 * consecutive stamps with no show and nothing full height among them, so the
 * rule caps a run at two pairs and stands the next book up instead. A pair
 * never straddles a show. Which books stand up is therefore set by the order:
 * his swaps of 2026-10-20 (LaLa, Rita, Juanes and Celia large) are made in
 * content/projects.json, not here.
 *
 * THREE WAYS THROUGH IT:
 *
 *   the arrows    a page at a time, snapping to the next tile's edge. The
 *                 row stops at 01 (Previous is off there), and Next on the
 *                 last page takes it back to 01 rather than going dead
 *   the row      a scroll container: a finger, a trackpad, the arrow keys,
 *                 or a dragged mouse go through it at any pace
 *   a press       on any tile — click, tap, Enter — opens that title's
 *                 write-up (or its trailer) in the panel. Press it again,
 *                 press another, press off the row, or Escape.
 *
 * Every tile says it can be pressed: a frosted button in its corner (play on
 * a show, + on a book), a caption above the row, and a hover or a tap that
 * lifts the tile and fills the button white. The first tile's button pulses
 * once, the first time the row is seen.
 */

type Cell =
  | { kind: "show"; item: BandItem }
  | { kind: "solo"; item: BandItem }
  | { kind: "pair"; items: [BandItem, BandItem] };

const MAX_RUN = 2; // consecutive pairs before a book stands up on its own
/* The books the client wants standing on their own at the full height of the
   row. TRUE LOVE and ME, side by side: stacked into a pair they came out half
   height, and these are the two names the shelf is known for. THE GREENPRINT
   and EXTRA LEAN: the two he marked "Big" among the six he sent on
   2026-10-21. Any book named here never goes into a stack. */
const STAND_ALONE = new Set(["true-love", "me", "the-greenprint", "extra-lean"]);

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
    } else if (STAND_ALONE.has(it.slug)) {
      while (held.length) take(); // nor does it straddle one of these
      cells.push({ kind: "solo", item: it });
      run = 0;
    } else {
      held.push(it);
      if (held.length === 2 && run < MAX_RUN) take();
    }
  }
  /* The end of the row stacks whatever is left, cap or no cap: nothing comes
     after it to break up a run, and the cap would only stand the last books
     up on their own. LORD HELP ME and NOELLE THE BULLDOG close the row as a
     stack, at the client's word (2026-10-22). */
  while (held.length >= 2) cells.push({ kind: "pair", items: [held.shift()!, held.shift()!] });
  if (held.length) cells.push({ kind: "solo", item: held.shift()! });
  return cells;
}

const alt = (p: BandItem) => `${p.title}${p.credit ? ` — ${p.credit}` : ""}`;
const two = (n: number) => String(n).padStart(2, "0");

/** the corner button's two signs: play for a show, plus for a book */
function Cue({ show }: { show: boolean }) {
  return show ? (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5.5 3.8v8.4L12.2 8z" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Tile({
  p,
  kind,
  pressed,
  pulse,
  onPress,
}: {
  p: BandItem;
  kind: "show" | "solo" | "pair";
  pressed: boolean;
  /** the first tile's button pulses once, the first time the row is seen */
  pulse: boolean;
  onPress: (p: BandItem) => void;
}) {
  return (
    <button
      type="button"
      className="band-hit"
      data-pressed={pressed ? "true" : undefined}
      aria-expanded={pressed}
      aria-controls="book-panel"
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
      {/* frosted dark glass in the corner, so it reads on any artwork: play
          on a show, + on a book, a smaller + on a stacked one */}
      <span
        className={`frost-btn frost-btn--${kind === "show" ? "md" : kind === "solo" ? "sm" : "xs"} band-cue${pulse ? " is-pulse" : ""}`}
        aria-hidden="true"
      >
        <Cue show={kind === "show"} />
      </span>
      <span className="sr-only">{p.proof ? `${p.proof}. ` : ""}Details</span>
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

  /* WHERE THE ROW IS, as pages of its own width: "01 / 06". `of` is 0 until
     the row has been measured, so the server's markup never claims a count
     it cannot know. */
  const [page, setPage] = useState({ at: 0, of: 0 });
  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const w = el.clientWidth;
      const max = el.scrollWidth - w;
      if (w <= 0) return;
      const of = max <= 2 ? 1 : 1 + Math.ceil(max / w - 0.02);
      /* never under 01: a row pulled past its first tile (an older iPhone
         still lets it bounce) reports a negative scrollLeft */
      const at =
        max <= 2
          ? 0
          : el.scrollLeft >= max - 2
            ? of - 1
            : Math.min(of - 1, Math.max(0, Math.round(el.scrollLeft / w)));
      setPage((p) => (p.at === at && p.of === of ? p : { at, of }));
    };
    const soon = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener("scroll", soon, { passive: true });
    const ro = new ResizeObserver(soon);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", soon);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* THE PULSE: one soft pulse on the first tile's button the first time the
     row comes into view — once per visit, and not at all for a visitor who
     has asked for less motion */
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const el = bandRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem("mc-band-pulse")) return;
    } catch {
      /* no storage: it pulses once per page load instead */
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        try {
          sessionStorage.setItem("mc-band-pulse", "1");
        } catch {}
        setPulse(true);
        timer = setTimeout(() => setPulse(false), 2200);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  /* THE ARROWS: a page at a time; the row's snapping lands it on a tile edge.
     At the far end, Next goes back to the first page instead of going dead:
     "once we get to the end … if you press it again, it brings you back to
     one" (the client, 2026-10-21). Previous does not wrap the other way —
     the row stops at 01. */
  const go = (dir: 1 | -1) => {
    const el = bandRef.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = still ? "auto" : "smooth";
    if (dir === 1 && el.scrollLeft >= el.scrollWidth - el.clientWidth - 2)
      el.scrollTo({ left: 0, behavior });
    else el.scrollBy({ left: dir * el.clientWidth, behavior });
  };
  const last = page.of > 1 && page.at >= page.of - 1;

  /* DRAG: a touch scrolls the row natively, but a mouse has nothing to pull
     with, so it gets grab-and-pull. A drag that ends on a tile must not open
     it — the click that follows is swallowed in the capture phase. Snapping
     is lifted for the length of the drag, or it would fight every move.

     The move and the release are watched on the WINDOW, not on the row.
     Pointer capture is the usual way to keep a drag while the cursor wanders
     off, but capturing on a scroll container and then scrolling it makes the
     browser cancel the pointer — the row moved 22px and stopped dead. */
  const dragged = useRef(false);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = bandRef.current;
    if (e.pointerType !== "mouse" || !el) return;
    const from = { x: e.clientX, left: el.scrollLeft, moved: false };
    const onMove = (m: PointerEvent) => {
      const dx = m.clientX - from.x;
      if (!from.moved && Math.abs(dx) < 4) return; // a press with a tremor in it
      if (!from.moved) el.style.scrollSnapType = "none";
      from.moved = true;
      el.scrollLeft = from.left - dx;
    };
    const onUp = () => {
      dragged.current = from.moved;
      el.style.scrollSnapType = "";
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

  const first = items[0]?.slug;
  const tile = (p: BandItem, kind: "show" | "solo" | "pair") => (
    <Tile
      key={p.slug}
      p={p}
      kind={kind}
      pressed={pressed === p.slug}
      pulse={pulse && p.slug === first}
      onPress={press}
    />
  );

  return (
    <>
      {/* the hero's SCROLL style: tap on a touch screen, select with a mouse */}
      <p className="band-hint caption-caps">
        <span className="band-hint-touch">Tap any title to explore</span>
        <span className="band-hint-fine">Select any title to explore</span>
      </p>

      {/* A focus stop, so the arrow keys can scroll the row. */}
      <div
        ref={bandRef}
        id="band-row"
        className="band"
        role="group"
        aria-label="Selected work"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
      >
        <div className="band-track">
          {cells.map((c, i) => {
            if (c.kind === "show")
              return (
                <div className="band-cell band-cell--show" key={i}>
                  {tile(c.item, "show")}
                </div>
              );
            if (c.kind === "solo")
              return (
                <div className="band-cell band-cell--solo" key={i}>
                  {tile(c.item, "solo")}
                </div>
              );
            return (
              <div className="band-cell band-cell--pair" key={i}>
                {tile(c.items[0], "pair")}
                {tile(c.items[1], "pair")}
              </div>
            );
          })}
        </div>
      </div>

      <div className="band-controls">
        <button
          type="button"
          className="round-btn band-arrow"
          aria-label="Previous"
          aria-controls="band-row"
          disabled={page.at === 0}
          onClick={() => go(-1)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3 5 8l5 5" />
          </svg>
        </button>
        {/* off only when the whole row fits; on the last page it is the
            way back to the first */}
        <button
          type="button"
          className="round-btn band-arrow"
          aria-label={last ? "Back to the start" : "Next"}
          aria-controls="band-row"
          disabled={page.of === 1}
          onClick={() => go(1)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="m6 3 5 5-5 5" />
          </svg>
        </button>
        <div className="band-progress" aria-hidden="true">
          <i
            style={{
              width: `${100 / Math.max(1, page.of)}%`,
              transform: `translateX(${page.at * 100}%)`,
            }}
          />
        </div>
        <p
          className="band-count"
          aria-live="polite"
          data-measured={page.of > 0 ? "true" : undefined}
        >
          <span>{two(page.at + 1)}</span> / {two(Math.max(1, page.of))}
        </p>
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
