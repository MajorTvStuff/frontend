import Image from "next/image";
import type { Project } from "@/lib/content";

export type BandItem = Project & { width: number; height: number };

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
 * It is a server component: the drift is one CSS animation, so none of this
 * costs the browser a script. Hovering or tabbing into it pauses the row;
 * reduced motion stops it altogether and hands back a scrollbar.
 */

type Cell =
  | { kind: "show"; item: BandItem }
  | { kind: "solo"; item: BandItem }
  | { kind: "pair"; items: [BandItem, BandItem] };

const MAX_RUN = 2; // consecutive pairs before a book stands up on its own

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

function Jacket({ p, half }: { p: BandItem; half?: boolean }) {
  return (
    <Image
      src={`/projects/${p.slug}.jpg`}
      alt={alt(p)}
      width={p.width}
      height={p.height}
      sizes={half ? "120px" : "200px"}
      className="band-book"
    />
  );
}

export function Band({ items }: { items: BandItem[] }) {
  const cells = lay(items);
  /* the sequence is rendered twice and the track travels exactly half its
     width, so the loop closes on itself with no jump */
  const run = (copy: number) => (
    <div className="band-run" aria-hidden={copy === 1 ? "true" : undefined}>
      {cells.map((c, i) => {
        const key = `${copy}-${i}`;
        if (c.kind === "show")
          return (
            <div className="band-cell band-cell--show" key={key}>
              {/* its own aspect ratio, not a 16:9 box — only two of the four
                  key art files are 16:9, and the box was cropping the rest */}
              <Image
                src={`/projects/${c.item.slug}.jpg`}
                alt={alt(c.item)}
                width={c.item.width}
                height={c.item.height}
                sizes="340px"
                className="band-still"
              />
            </div>
          );
        if (c.kind === "solo")
          return (
            <div className="band-cell band-cell--solo" key={key}>
              <Jacket p={c.item} />
            </div>
          );
        return (
          <div className="band-cell band-cell--pair" key={key}>
            <Jacket p={c.items[0]} half />
            <Jacket p={c.items[1]} half />
          </div>
        );
      })}
    </div>
  );

  return (
    /* A focus stop, so the pause that :focus-within already describes can
       actually happen — nothing inside is focusable, so without this the rule
       was decorative and the row could not be stopped without a mouse. */
    <div className="band" role="group" aria-label="Selected work" tabIndex={0}>
      <div className="band-track">
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}
