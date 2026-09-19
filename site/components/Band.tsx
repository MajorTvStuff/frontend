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
 * Shows take a full-height 16:9 tile. Books are half height and stack in
 * pairs, which is the grid he described; a book left over at the end of a run
 * stands full height on its own, and that irregularity is what stops the row
 * reading as a filmstrip.
 *
 * The order is the copy doc's order, which already alternates shows and
 * books, so the rhythm comes from the client's own sequencing rather than
 * from us shuffling it. A pair never straddles a show.
 *
 * It is a server component: the drift is one CSS animation, so none of this
 * costs the browser a script. Hovering or tabbing into it pauses the row;
 * reduced motion stops it altogether and hands back a scrollbar.
 */

type Cell =
  | { kind: "show"; item: BandItem }
  | { kind: "solo"; item: BandItem }
  | { kind: "pair"; items: [BandItem, BandItem] };

function lay(items: BandItem[]): Cell[] {
  const cells: Cell[] = [];
  let held: BandItem[] = [];
  const flush = () => {
    while (held.length >= 2)
      cells.push({ kind: "pair", items: [held.shift()!, held.shift()!] });
    if (held.length) cells.push({ kind: "solo", item: held.shift()! });
    held = [];
  };
  for (const it of items) {
    if (it.medium === "show") {
      flush(); // a pair never straddles a show
      cells.push({ kind: "show", item: it });
    } else {
      held.push(it);
      if (held.length === 2)
        cells.push({ kind: "pair", items: [held.shift()!, held.shift()!] });
    }
  }
  flush();
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
              <Image
                src={`/projects/${c.item.slug}.jpg`}
                alt={alt(c.item)}
                fill
                sizes="360px"
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
    <div className="band" role="group" aria-label="Selected work">
      <div className="band-track">
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}
