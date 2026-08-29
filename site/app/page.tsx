import { site, projects, project, projectDims, youtubeId } from "@/lib/content";
import type { Cover, Primer, Trailer } from "@/components/Hero";
import { Hero } from "@/components/Hero";
import type { Show } from "@/components/Slate";
import { Slate } from "@/components/Slate";
import type { Cover as Jacket } from "@/components/Shelf";
import { Shelf } from "@/components/Shelf";
import { Reveal } from "@/components/Reveal";
import { Lockup } from "@/components/Lockup";
import { Confirm } from "@/components/Confirm";

/**
 * The argument, in the order a cold visitor needs it:
 *
 *   hero    — what this company is, and six tokens of proof, at t=0
 *   slate   — the present tense, proved with footage
 *   shelf   — the claim that explains the slate, and the books that prove it
 *   icons   — the network, as names
 *   founder — the person who is both publisher and producer
 *
 * The client's brief was "a reference point for folks that didn't get the
 * info search." So the page states, then proves, then re-states, then proves
 * again — and never proves something it has not yet claimed.
 */

/* The covers that hard-cut behind the word flow. Large sources only; the
   small legacy scans stay on the shelf, where they are sharp. */
const FLASH = [
  "the-love-playbook",
  "true-love",
  "why-soccer-matters",
  "my-voice",
  "chasing-the-sun",
  "clemente",
];

const LEAD = "the-love-playbook";

/* A hand-picked front table, and a documented PROXY until the client sends
   his priority list. Four of five are New York Times Bestsellers; Pelé is
   here over his proof tier because he is the largest global name on the
   shelf. ME and A MEMOIR are structurally ineligible at this size — the
   source scans do not have the pixels. */
const FRONT = [
  "true-love",
  "my-voice",
  "out-of-the-blue",
  "why-soccer-matters",
  "the-22-day-revolution",
];

const cover = (slug: string): Cover => ({ slug, ...projectDims(slug) });
const jacket = (slug: string): Jacket => ({
  ...project(slug),
  ...projectDims(slug),
});

export default function Home() {
  const f = site.founder;
  const drive = project("drive");
  const driveId = youtubeId(drive.trailer);
  const trailer: Trailer | undefined = driveId ? { youtubeId: driveId } : undefined;

  const shows: Show[] = projects
    .filter((p) => p.medium === "show")
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      credit: p.credit,
      proof: p.proof,
      trailer: p.trailer,
      ...projectDims(p.slug),
      youtubeId: youtubeId(p.trailer),
    }));

  const lead = jacket(LEAD);
  const shown = new Set([LEAD, ...FRONT]);
  const back = projects
    .filter((p) => p.medium === "book" && !shown.has(p.slug))
    .map((p) => jacket(p.slug));

  /* Every string is verbatim client copy or a mechanical slice of one: the
     statement is company[0] up to its list of formats; the proof tokens are
     the shows' own proof lines plus the one #1 bestseller. */
  const primer: Primer = {
    eyebrow: site.positioning?.continuity ?? site.verticals,
    statement: site.company[0].split(", focusing")[0] + ".",
    proofs: [...shows.map((s) => s.proof), lead.proof],
    proofsShort: [shows[0].proof, shows[1].proof, lead.proof],
  };

  return (
    <>
      {/* the chrome sits over the hero, which owns the viewport */}
      <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8">
        <Lockup tone="light" className="w-28 sm:w-32" />
        <a
          href={`mailto:${site.contact.email}`}
          className="btn meta-caps text-paper"
        >
          Contact
        </a>
      </header>

      <main id="main">
        <Hero
          still={cover("drive")}
          introLines={site.introLines}
          flash={FLASH.map(cover)}
          trailer={trailer}
          primer={primer}
        />

        <Slate shows={shows} label={site.tvFilm.label} />

        <Shelf
          label={site.books.label}
          thesis={site.positioning?.leverage}
          lede={site.books.body.split(". ")[1]}
          lead={lead}
          front={FRONT.map(jacket)}
          back={back}
        />

        {/* the network, as names — the densest "cool info" on the page */}
        {site.icons && (
          <Reveal className="border-y border-line">
            <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8">
              <h2 className="meta-caps reveal text-mid">Global icons</h2>
              <p className="reveal reveal-2 display-heavy mt-8 text-names leading-snug text-paper">
                {site.icons.map((name, i) => (
                  <span key={name}>
                    <span className="whitespace-nowrap">
                      {name}
                      {i < site.icons!.length - 1 && (
                        <span aria-hidden="true" className="ml-3 text-signal">
                          ·
                        </span>
                      )}
                    </span>{" "}
                  </span>
                ))}
              </p>
            </div>
          </Reveal>
        )}

        {/* the person who is both halves of the argument */}
        <Reveal className="bg-band text-paper">
          <div className="mx-auto grid max-w-[1320px] gap-x-16 gap-y-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,680px)_minmax(0,1fr)]">
            <div>
              <h2 className="meta-caps reveal text-silver">Founder</h2>
              <p className="reveal display-heavy mt-6 text-h2">{f.name}</p>
              <p className="reveal reveal-2 meta-caps mt-2 text-silver/80">
                {f.role}
              </p>
              {f.careerLine && (
                <p className="reveal reveal-3 mt-6 text-about text-paper/85">
                  {f.careerLine}
                </p>
              )}
            </div>

            <div>
              {/* the only accent-coloured sentence in the document */}
              <p className="reveal reveal-2 max-w-[496px] text-about font-medium text-signal">
                {f.recognition}
              </p>
              <div className="mt-10 border-t border-paper/15 pt-8">
                <p className="reveal reveal-3">
                  <Confirm q={site.contact.emailConfirm}>
                    <a
                      href={`mailto:${site.contact.email}`}
                      className="link display-heavy text-h2 decoration-signal decoration-2 underline-offset-8"
                    >
                      {site.contact.email}
                    </a>
                  </Confirm>
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <footer className="mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-8 px-5 py-12 sm:px-8">
          <Lockup tone="light" className="w-36 opacity-80" />
          <p className="meta-caps text-mid">
            {site.verticals} · © {new Date().getFullYear()} Major Content
          </p>
        </footer>
      </main>
    </>
  );
}
