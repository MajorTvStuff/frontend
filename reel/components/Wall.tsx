import Image from "next/image";
import { projects, projectDims, type Project } from "@/lib/content";

/**
 * The wall: all 24 titles in the copy doc's exact order. Books span 3
 * columns, shows span 6 — a packing that happens to tile the 12-column
 * grid with zero gaps in that order. Caption grammar is Radical's three
 * lines, adapted: Title / credit / proof, inverting on hover.
 */
function Tile({ p }: { p: Project }) {
  const { width, height } = projectDims(p.slug);
  const isShow = p.medium === "show";

  const inner = (
    <>
      <div className="relative overflow-hidden bg-line">
        <Image
          src={`/projects/${p.slug}.jpg`}
          alt={`${p.title}${p.credit ? ` — ${p.credit}` : ""}`}
          width={width}
          height={height}
          sizes={isShow ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 640px) 25vw, 50vw"}
          className="w-full"
        />
        {p.trailer && (
          <span className="meta-caps absolute right-3 top-3 bg-screen/85 px-2.5 py-1.5 text-paper">
            Watch <span aria-hidden="true">↗</span>
          </span>
        )}
      </div>
      <div className="tile-caption -mx-2 mt-1 px-2 py-2">
        <p className="tile-title text-cap font-bold uppercase tracking-wide text-ink transition-colors duration-300">
          {p.title}
        </p>
        {p.credit && (
          <p className="tile-sub mt-0.5 text-sm text-mid transition-colors duration-300">
            {p.credit}
          </p>
        )}
        <p className="tile-sub meta-caps mt-1 text-mid transition-colors duration-300">
          {p.proof}
        </p>
      </div>
    </>
  );

  const span = isShow
    ? "col-span-12 sm:col-span-6"
    : "col-span-6 sm:col-span-3";

  if (p.trailer) {
    return (
      <a
        href={p.trailer}
        target="_blank"
        rel="noopener noreferrer"
        className={`tile block ${span}`}
      >
        {inner}
      </a>
    );
  }
  return <div className={`tile ${span}`}>{inner}</div>;
}

export function Wall() {
  return (
    <section className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8">
      <h2 className="sr-only">Projects</h2>
      <div className="grid grid-cols-12 gap-x-6 gap-y-10 sm:gap-x-7">
        {projects.map((p) => (
          <Tile key={p.slug} p={p} />
        ))}
      </div>
    </section>
  );
}
