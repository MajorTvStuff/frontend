import Image from "next/image";
import { projects, projectDims, type Project } from "@/lib/content";

const SHELF_H = 340; // display height of every tile (px, desktop)

function displayWidth(slug: string) {
  const { width, height } = projectDims(slug);
  return Math.round((width * SHELF_H) / height);
}

function Tile({ p, clone }: { p: Project; clone?: boolean }) {
  const { width, height } = projectDims(p.slug);
  const w = displayWidth(p.slug);

  const media = (
    <Image
      src={`/projects/${p.slug}.jpg`}
      alt={clone ? "" : `${p.title}${p.credit ? ` — ${p.credit}` : ""}`}
      width={width}
      height={height}
      sizes={`${w}px`}
      className="h-[240px] w-auto sm:h-[340px]"
    />
  );

  const caption = (
    // fixed height so every figure is the same height and all 24 spines
    // stand on one shelf line regardless of caption length
    <figcaption className="mt-4 h-[104px] max-w-full">
      <p className="display-condensed text-sm tracking-wide text-white">
        {p.title}
      </p>
      {p.credit && (
        <p className="serif-flow mt-0.5 text-sm italic text-gray">{p.credit}</p>
      )}
      <p className="meta-caps mt-1.5 !text-[0.6rem] text-dim">{p.proof}</p>
      {p.trailer && (
        <p className="meta-caps mt-1.5 !text-[0.6rem] text-silver">
          Watch the trailer <span aria-hidden="true">↗</span>
        </p>
      )}
    </figcaption>
  );

  if (p.trailer) {
    return (
      <figure className="flex-none">
        <a
          href={p.trailer}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={clone ? -1 : undefined}
          className="group block transition-opacity duration-300 hover:opacity-90"
          aria-label={clone ? undefined : `${p.title} — watch the trailer`}
        >
          {media}
          {caption}
        </a>
      </figure>
    );
  }

  return (
    <figure className="flex-none">
      {media}
      {caption}
    </figure>
  );
}

/**
 * The wall as a shelf: all 24 titles at one height, natural widths —
 * square picture books, 2:3 memoirs, 16:9 key art shoulder to shoulder,
 * in the exact order of the copy doc. One slow perpetual drift; hover or
 * keyboard focus pauses it; reduced motion makes it a scrollable shelf.
 */
export function Shelf() {
  return (
    <div className="shelf" aria-label="The Major Content slate — 24 titles">
      <ul className="shelf-track list-none">
        {projects.map((p) => (
          <li key={p.slug} className="flex-none">
            <Tile p={p} />
          </li>
        ))}
      </ul>
      <ul className="shelf-track list-none" aria-hidden="true">
        {projects.map((p) => (
          <li key={p.slug} className="flex-none">
            <Tile p={p} clone />
          </li>
        ))}
      </ul>
    </div>
  );
}
