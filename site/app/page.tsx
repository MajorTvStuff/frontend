import {
  site,
  projects,
  projectDims,
  knit,
  youtubeId,
  credit,
} from "@/lib/content";
import type { Cover, Primer } from "@/components/Hero";
import { Hero } from "@/components/Hero";
import type { BandItem } from "@/components/Band";
import { Band } from "@/components/Band";
import { Reveal } from "@/components/Reveal";
import { Lockup } from "@/components/Lockup";
import {
  Section,
  SectionColumn,
  SectionPair,
} from "@/components/Section";
import { VariantSwitch } from "@/components/VariantSwitch";

/**
 * THE PAGE, IN THE CLIENT'S OWN ORDER.
 *
 * He built a version himself and sent the recording (Assets/1288.mp4). It is
 * the clearest brief we have had, and the order below is his:
 *
 *   hero     — the intro lines resolving into the lockup
 *   company  — what the company is, all three paragraphs
 *   band     — every title in one drifting row: full tiles for the shows,
 *              books gridded two high. "All in one place", in his words.
 *   tv|film  — the copy, then the four trailers
 *   books    — the copy
 *   founder  — the whole bio, and the recognition
 *   contact  — the address, and the footer
 *
 * The note that drove it: "I want the site to breathe more with copy and
 * messaging, and have the images be more supportive." So copy leads every
 * section, the only imagery in the body is the one band, and 441 words of his
 * own approved writing that had never been on the site — the entire founder
 * bio among them — are on it now.
 *
 * Every string here is verbatim from his copy doc. Nothing is paraphrased and
 * nothing is cut for length; where a section is long it is simply long.
 *
 * THE TRAILERS ARE IN THE ROW, not under it. They had their own block of
 * four tiles beneath the band, and he cut it: the same four pieces of key
 * art were already in the band a screen earlier, so the page showed its
 * work twice. Pressing a show in the band opens its trailer, playing, in
 * the panel — the trailers are all still here, they are just no longer a
 * gallery of their own.
 *
 * The book clump is PARKED, not deleted: components/Shelf.tsx, lib/clump.ts
 * and lib/stage.ts are intact and still tested. The band covers the books
 * here, and he asked for simplicity.
 */

/* The covers that hard-cut behind the word flow of the intro. Large sources
   only; the small legacy scans stay in the band, where they are sharp. */
const FLASH = [
  "the-love-playbook",
  "true-love",
  "why-soccer-matters",
  "my-voice",
  "chasing-the-sun",
  "clemente",
];

const cover = (slug: string): Cover => ({ slug, ...projectDims(slug) });

export default function Home() {
  const f = site.founder;
  /* the copy doc's own order already alternates shows and books, so the
     band's rhythm is his sequencing rather than ours */
  const band: BandItem[] = projects.map((p) => ({
    ...p,
    ...projectDims(p.slug),
    /* pressing a tile opens this in the panel — the same write-up the
       shelf shows on the other variant, dates excluded */
    about: credit(p.slug),
    /* and, for a show, the trailer itself: the panel embeds it */
    youtubeId: youtubeId(p.trailer),
  }));
  const showRows = projects.filter((p) => p.medium === "show");
  /* the hero's proof tokens, still every one of them verbatim */
  const primer: Primer = {
    eyebrow: site.positioning?.continuity ?? site.verticals,
    statement: site.company[0].split(", focusing")[0] + ".",
    proofs: [
      ...showRows.map((s) => s.proof),
      projects.find((p) => p.slug === "the-love-playbook")!.proof,
    ],
    proofsShort: [
      showRows[0].proof,
      showRows[1].proof,
      projects.find((p) => p.slug === "the-love-playbook")!.proof,
    ],
  };

  return (
    <>
      {/* the chrome sits over the hero, which owns the viewport */}
      <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8">
        <Lockup tone="light" className="w-28 sm:w-32" />
        <a
          href={`mailto:${site.contact.email}`}
          className="btn meta-caps bg-screen/80 text-paper backdrop-blur-sm"
        >
          Contact
        </a>
      </header>

      <VariantSwitch current="copy-led" />

      <main id="main">
        <Hero
          still={cover("drive")}
          introLines={site.introLines}
          flash={FLASH.map(cover)}
          primer={primer}
          ground="soft"
        />

        {/* ————— what the company is ————— */}
        <Section label="Company">
          {/* One size for all three. The first paragraph is the definition
              and the other two qualify it, so it leads on colour — his own
              build sets the whole section at one size, and a paragraph that
              steps up in scale is the thing he called "not breathing". */}
          <p className="reveal lede">{knit(site.company[0])}</p>
          {site.company.slice(1).map((para, i) => (
            <p key={i} className={`reveal reveal-${i + 2} body-copy`}>
              {knit(para)}
            </p>
          ))}
        </Section>

        {/* ————— every title, in one drifting row ————— */}
        <Reveal className="page-section page-section--band">
          <Band items={band} founder={f.name} />
        </Reveal>

        {/* ————— the two halves of the business, side by side ————— */}
        <SectionPair>
          <SectionColumn label={site.tvFilm.label}>
            <p className="reveal lede">{knit(site.tvFilm.body)}</p>
          </SectionColumn>
          <SectionColumn label={site.books.label}>
            <p className="reveal lede">{knit(site.books.body)}</p>
          </SectionColumn>
        </SectionPair>

        {/* ————— the person, at last at full length ————— */}
        <Section label="Founder">
          {/* His name, set the way he sets it: a heading in sentence case,
              not a wall of heavy caps. The role line under it is gone — his
              own first sentence is "Raymond Garcia is the founder and CEO of
              Major Content", so the page was saying it twice. */}
          <h3 className="reveal founder-name">{f.name}</h3>
          <p className="reveal reveal-2 lede">{knit(f.bio[0])}</p>
          {f.bio.slice(1).map((para, i) => (
            <p key={i} className="reveal reveal-3 body-copy">
              {knit(para)}
            </p>
          ))}
          <p className="reveal reveal-4 recognition">{knit(f.recognition)}</p>
        </Section>

        {/* ————— the address ————— */}
        <Reveal className="page-section page-section--address">
          <div className="section-grid">
            <div className="section-body">
              <a
                href={`mailto:${site.contact.email}`}
                className="link contact-line reveal"
              >
                {site.contact.email}
              </a>
            </div>
          </div>
        </Reveal>

        <footer className="page-section page-footer">
          <div className="section-grid">
            <div className="section-body">
              <Lockup tone="light" className="w-28 opacity-80" />
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                <a href="/terms" className="link meta-caps">
                  Terms
                </a>
                <a href="/privacy" className="link meta-caps">
                  Privacy
                </a>
                <p className="meta-caps text-faint">
                  {site.verticals} · © {new Date().getFullYear()}{" "}
                  {site.legal.entity}
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
