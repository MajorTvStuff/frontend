import Image from "next/image";
import { projects, site, type Project } from "@/lib/content";

/**
 * THE SHELF — the 20 books, present but past tense: three clusters in
 * descending size = descending importance, keyed on the proof lines
 * (a proxy until RG sends his priority list). No titles listed — the
 * cover art speaks; title + author reveal on hover and live in alt text.
 * Proof is stated once per cluster header instead of 20 caption blocks.
 */

function Cover({ p, d }: { p: Project; d: number }) {
  return (
    <div
      className="scroll-pop group relative"
      style={{ "--d": d } as React.CSSProperties}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-panel">
        <Image
          src={`/projects/${p.slug}.jpg`}
          alt={`${p.title}${p.credit ? ` — ${p.credit}` : ""}`}
          fill
          sizes="(min-width: 1024px) 12vw, (min-width: 640px) 22vw, 25vw"
          className="object-contain"
        />
        {/* info on demand — never listed */}
        <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-screen/90 px-2 py-1.5 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="meta-caps !text-[0.6rem] text-paper">{p.title}</p>
          {p.credit && (
            <p className="mt-0.5 text-[0.7rem] leading-tight text-silver">
              {p.credit}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Cluster({
  header,
  books,
  grid,
}: {
  header: string;
  books: Project[];
  grid: string;
}) {
  return (
    <div className="mt-10">
      <h3 className="meta-caps scroll-rise text-faint">{header}</h3>
      <div className={`mt-4 grid ${grid}`}>
        {books.map((p, i) => (
          <Cover key={p.slug} p={p} d={i} />
        ))}
      </div>
    </div>
  );
}

export function Wall() {
  const books = projects.filter((p) => p.medium === "book");
  // importance proxy = the proof lines, doc order within each tier;
  // RG's priority list replaces this the moment he sends it
  const tier1 = books.filter((p) => p.proof === "#1 New York Times Bestseller");
  const tier2 = books.filter((p) => p.proof === "New York Times Bestseller");
  const tier3 = books.filter(
    (p) =>
      p.proof !== "#1 New York Times Bestseller" &&
      p.proof !== "New York Times Bestseller"
  );

  return (
    <section className="mx-auto max-w-[1320px] px-5 pb-14 pt-20 sm:px-8">
      {/* ————— the shelf: the books, tiered by importance ————— */}
      <h2 className="meta-caps scroll-rise text-mid">
        The shelf <span className="text-faint">— {site.books.label}</span>
      </h2>

      <Cluster
        header="#1 New York Times Bestseller"
        books={tier1}
        grid="w-36 grid-cols-1 sm:w-44"
      />
      <Cluster
        header="New York Times Bestsellers"
        books={tier2}
        grid="grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-8"
      />
      <Cluster
        header="International & National Bestsellers"
        books={tier3}
        grid="grid-cols-4 gap-2.5 sm:grid-cols-6 sm:gap-3 lg:grid-cols-11"
      />
    </section>
  );
}
