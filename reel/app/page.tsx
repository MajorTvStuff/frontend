import { site, projects, projectDims, youtubeId } from "@/lib/content";
import type { Slide, Trailer, Primer } from "@/components/Montage";
import { Montage } from "@/components/Montage";
import type { Show } from "@/components/Slate";
import { Slate } from "@/components/Slate";
import { Wall } from "@/components/Wall";
import { Lockup } from "@/components/Lockup";
import { Confirm } from "@/components/Confirm";

/* The covers that hard-cut behind the word flow. Only sources that hold up
   full-bleed on a retina display — the small legacy scans stay on the shelf,
   where they are sharp. */
const FLASH_SPEC = [
  "the-love-playbook",
  "true-love",
  "why-soccer-matters",
  "my-voice",
  "chasing-the-sun",
  "clemente",
];

export default function Home() {
  const f = site.founder;
  const slide = (slug: string): Slide => {
    const p = projects.find((x) => x.slug === slug)!;
    return {
      slug,
      fit: "cover",
      title: p.title,
      proof: p.proof,
      ...projectDims(slug),
    };
  };

  const flash = FLASH_SPEC.map(slide);

  // afterwards, the trailer plays: DRIVE, the Emmy flagship
  const drive = projects.find((p) => p.slug === "drive")!;
  const driveId = youtubeId(drive.trailer);
  const trailer: Trailer | undefined = driveId
    ? { youtubeId: driveId, title: drive.title, proof: drive.proof }
    : undefined;

  // the slate: four shows, four trailer tiles. A Facebook-only trailer yields
  // youtubeId null, which keeps it out of the player by construction.
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

  const lead = projects.find((p) => p.slug === "the-love-playbook")!;

  /* The primer. Every string is verbatim client copy or a mechanical slice of
     one — the statement is company[0] up to its list of formats, the proof
     tokens are the shows' own proof lines plus the one #1 bestseller. */
  const primer: Primer = {
    eyebrow: site.positioning?.continuity ?? site.verticals,
    statement: site.company[0].split(", focusing")[0] + ".",
    proofs: [...shows.map((s) => s.proof), lead.proof],
    proofsShort: [shows[0].proof, shows[1].proof, lead.proof],
  };

  return (
    <>
      {/* ————— the chrome sits over the hero, which owns the viewport ————— */}
      <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8">
        <Lockup tone="light" className="w-28 sm:w-32" />
        <a
          href={`mailto:${site.contact.email}`}
          className="hero-btn meta-caps border border-line px-3 py-2 text-paper"
        >
          Contact
        </a>
      </header>

      <main id="main">
        {/* ————— the reel: word flow -> covers flash -> logo -> trailer ————— */}
        <Montage
          still={slide("drive")}
          introLines={site.introLines}
          flash={flash}
          trailer={trailer}
          primer={primer}
        />

        {/* ————— the slate: each show gets its trailer moment ————— */}
        <Slate shows={shows} label={site.tvFilm.label} />

        {/* ————— the leverage, then the shelf that proves it ————— */}
        <Wall
          thesis={site.positioning?.leverage}
          lede={site.books.body.split(". ")[1]}
        />

        {/* ————— the icons band: names, not paragraphs ————— */}
        {site.icons && (
          <section className="border-y border-line">
            <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8">
              <h2 className="meta-caps scroll-rise text-mid">Global icons</h2>
              <p className="scroll-rise display-heavy mt-8 text-names leading-snug text-paper">
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
          </section>
        )}

        {/* ————— founder + contact: the original site's navy band ————— */}
        <section className="bg-band text-paper">
          <div className="mx-auto grid max-w-[1320px] gap-x-16 gap-y-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,680px)_minmax(0,1fr)]">
            <div>
              <h2 className="meta-caps scroll-rise text-silver">Founder</h2>
              <p className="scroll-rise display-heavy mt-6 text-h2">{f.name}</p>
              <p className="scroll-rise meta-caps mt-2 text-silver/80">{f.role}</p>
              {f.careerLine && (
                <p className="scroll-rise scroll-rise-2 mt-6 text-about text-paper/85">
                  {f.careerLine}
                </p>
              )}
            </div>

            <div>
              {/* the only accent-coloured sentence in the document */}
              <p className="scroll-rise scroll-rise-2 max-w-[496px] text-about font-medium text-signal">
                {f.recognition}
              </p>
              <div className="mt-10 border-t border-paper/15 pt-8">
                <p className="scroll-rise scroll-rise-3">
                  <Confirm q={site.contact.emailConfirm}>
                    <a
                      href={`mailto:${site.contact.email}`}
                      className="hero-btn display-heavy text-h2 text-paper underline decoration-signal decoration-2 underline-offset-8"
                    >
                      {site.contact.email}
                    </a>
                  </Confirm>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ————— footer ————— */}
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
