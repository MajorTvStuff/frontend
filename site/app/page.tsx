import { site, projects, projectDims } from "@/lib/content";
import type { Cover, Primer } from "@/components/Hero";
import { Hero } from "@/components/Hero";
import type { BandItem } from "@/components/Band";
import { Band } from "@/components/Band";
import { Reveal } from "@/components/Reveal";
import { Lockup } from "@/components/Lockup";
import { SectionLabel } from "@/components/Mark";
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
 *   tv|film  — the copy
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
 * The slate of playable trailers and the book clump are PARKED, not deleted —
 * components/Slate.tsx, components/Shelf.tsx and lib/clump.ts are intact and
 * still tested. His layout has neither, and he asked for simplicity; where
 * the trailers belong in this order is a question for the call.
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
  }));
  const shows = projects.filter((p) => p.medium === "show");

  /* the hero's proof tokens, still every one of them verbatim */
  const primer: Primer = {
    eyebrow: site.positioning?.continuity ?? site.verticals,
    statement: site.company[0].split(", focusing")[0] + ".",
    proofs: [
      ...shows.map((s) => s.proof),
      projects.find((p) => p.slug === "the-love-playbook")!.proof,
    ],
    proofsShort: [
      shows[0].proof,
      shows[1].proof,
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
        />

        {/* ————— what the company is ————— */}
        <Reveal className="page-section">
          <div className="measure">
            <SectionLabel className="reveal">Company</SectionLabel>
            {site.company.map((para, i) => (
              <p key={i} className={`reveal reveal-${i + 2} body-copy`}>
                {para}
              </p>
            ))}
          </div>
        </Reveal>

        {/* ————— every title, in one drifting row ————— */}
        <Reveal className="page-section page-section--band">
          <Band items={band} />
        </Reveal>

        {/* ————— the two halves of the business, as copy ————— */}
        <Reveal className="page-section">
          <div className="measure">
            <SectionLabel className="reveal">{site.tvFilm.label}</SectionLabel>
            <p className="reveal reveal-2 body-copy">{site.tvFilm.body}</p>
          </div>
        </Reveal>

        <Reveal className="page-section">
          <div className="measure">
            <SectionLabel className="reveal">{site.books.label}</SectionLabel>
            <p className="reveal reveal-2 body-copy">{site.books.body}</p>
            {site.positioning?.leverage && (
              /* his own line, from the call notes — display-only until he
                 signs it off in writing */
              <p className="reveal reveal-3 leverage">
                {site.positioning.leverage}
              </p>
            )}
          </div>
        </Reveal>

        {/* ————— the person, at last at full length ————— */}
        <Reveal className="page-section">
          <div className="measure">
            <SectionLabel className="reveal">Founder</SectionLabel>
            <p className="reveal reveal-2 display-heavy mt-6 text-h2 text-paper">
              {f.name}
            </p>
            <p className="reveal reveal-2 meta-caps mt-2 text-faint">
              {f.role}
            </p>
            {f.bio.map((para, i) => (
              <p key={i} className="reveal reveal-3 body-copy">
                {para}
              </p>
            ))}
            <p className="reveal reveal-4 recognition">{f.recognition}</p>
          </div>
        </Reveal>

        {/* ————— the address ————— */}
        <Reveal className="page-section">
          <div className="measure">
            <a
              href={`mailto:${site.contact.email}`}
              className="link contact-email display-heavy reveal decoration-signal decoration-2 underline-offset-8"
            >
              {site.contact.email}
            </a>
          </div>
        </Reveal>

        <footer className="page-section page-footer">
          <div className="measure">
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
        </footer>
      </main>
    </>
  );
}
