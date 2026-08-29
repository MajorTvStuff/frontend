import Image from "next/image";
import { projects, site, projectDims, type Project } from "@/lib/content";

/**
 * THE LEVERAGE, AND THE SHELF THAT PROVES IT.
 *
 * The client's one differentiating claim — "Publishing is the leverage for
 * production." — used to be a 15px line four fifths of the way down the page,
 * set smaller than the boilerplate above it. It is now this section's header,
 * at display size, standing beside the single #1 New York Times Bestseller
 * that proves it. The claim arrives exactly where a visitor is asking why a
 * production company gets to be good at this.
 *
 * Below it the books read as a ladder — 340px, 226px, 136px — instead of
 * twenty interchangeable thumbnails: present, but plainly the back catalogue.
 * No titles anywhere ("don't list titles"); the AUTHOR is the proof, and it
 * is what makes the icons band below land as recognition rather than a new
 * list of names.
 */

const LEAD = "the-love-playbook";

/* A hand-picked front table, and a documented PROXY until RG sends his
   priority list. Four of five are New York Times Bestsellers; Pelé is here
   over his proof tier because he is the largest global name on the shelf.
   ME (270x400) and A MEMOIR (264x400) are structurally ineligible at this
   size — the source files simply do not have the pixels. */
const FRONT = [
  "true-love",
  "my-voice",
  "out-of-the-blue",
  "why-soccer-matters",
  "the-22-day-revolution",
];

function Cover({
  p,
  sizes,
  caption,
  lift,
}: {
  p: Project;
  sizes: string;
  caption?: boolean;
  lift?: boolean;
}) {
  const d = projectDims(p.slug);
  return (
    <div className="scroll-pop">
      <Image
        src={`/projects/${p.slug}.jpg`}
        alt={`${p.title}${p.credit ? ` — ${p.credit}` : ""}`}
        width={d.width}
        height={d.height}
        sizes={sizes}
        className={`h-auto w-full ${lift ? "cover-lift" : "cover-flat"}`}
      />
      {caption && p.credit && (
        <p className="meta-caps mt-3 text-mid">{p.credit}</p>
      )}
    </div>
  );
}

export function Wall({ thesis, lede }: { thesis?: string; lede?: string }) {
  const lead = projects.find((p) => p.slug === LEAD)!;
  const front = FRONT.map((s) => projects.find((p) => p.slug === s)!);
  const shown = new Set([LEAD, ...FRONT]);
  const back = projects.filter((p) => p.medium === "book" && !shown.has(p.slug));

  return (
    <section className="mx-auto max-w-[1320px] px-5 pb-14 pt-20 sm:px-8">
      {/* ————— the claim, beside the book that proves it ————— */}
      <div className="grid items-center gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12">
        <div className="scroll-pop w-52 lg:w-full">
          <Image
            src={`/projects/${lead.slug}.jpg`}
            alt={`${lead.title} — ${lead.credit}`}
            width={projectDims(LEAD).width}
            height={projectDims(LEAD).height}
            sizes="(min-width: 1024px) 340px, 208px"
            className="cover-lift h-auto w-full"
          />
        </div>

        <div className="max-w-[680px]">
          <h2 className="meta-caps scroll-rise text-mid">
            The shelf <span className="text-faint">— {site.books.label}</span>
          </h2>
          {thesis && (
            /* RG's own words (call notes) — display-only, pending sign-off */
            <p className="scroll-rise mt-6 text-flow font-light leading-tight text-paper">
              {thesis}
            </p>
          )}
          {lede && (
            <p className="scroll-rise scroll-rise-2 mt-6 text-about text-mid">
              {lede}
            </p>
          )}
          <p className="scroll-rise scroll-rise-3 mt-6 text-strip text-signal">
            {lead.proof}
          </p>
        </div>
      </div>

      {/* ————— the front table: the names you already know ————— */}
      <div className="mt-16 border-t border-line pt-10">
        <h3 className="meta-caps scroll-rise text-mid">
          New York Times Bestsellers
        </h3>
        <div className="mt-6 grid grid-cols-3 items-end gap-6 sm:grid-cols-5 sm:gap-8">
          {front.map((p, i) => (
            <div key={p.slug} style={{ "--d": i } as React.CSSProperties}>
              <Cover
                p={p}
                lift
                caption
                sizes="(min-width: 1024px) 226px, (min-width: 640px) 18vw, 30vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ————— the backlist: present, not paraded ————— */}
      <div className="mt-16 border-t border-line pt-10">
        <h3 className="meta-caps scroll-rise text-faint">
          International &amp; National Bestsellers
        </h3>
        <div className="mt-6 grid grid-cols-4 items-end gap-4 sm:grid-cols-6 sm:gap-5 lg:grid-cols-8 lg:gap-6">
          {back.map((p, i) => (
            <div key={p.slug} style={{ "--d": i } as React.CSSProperties}>
              <Cover
                p={p}
                sizes="(min-width: 1024px) 136px, (min-width: 640px) 15vw, 22vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
