import { site, projects, projectDims } from "@/lib/content";
import type { Cover, Primer } from "@/components/Hero";
import { Hero } from "@/components/Hero";
import type { BandItem } from "@/components/Band";
import { Band } from "@/components/Band";
import { Reveal } from "@/components/Reveal";
import { Lockup } from "@/components/Lockup";
import { Section } from "@/components/Section";
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
          ground="soft"
        />

        {/* ————— what the company is ————— */}
        <Section index={1} label="Company">
          {/* the first paragraph is the definition of the company; the other
              two qualify it, so it leads and they follow */}
          <p className="reveal lede">{site.company[0]}</p>
          {site.company.slice(1).map((para, i) => (
            <p key={i} className={`reveal reveal-${i + 2} body-copy`}>
              {para}
            </p>
          ))}
        </Section>

        {/* ————— every title, in one drifting row ————— */}
        <Reveal className="page-section page-section--band">
          <Band items={band} />
        </Reveal>

        {/* ————— the two halves of the business, as copy ————— */}
        <Section index={2} label={site.tvFilm.label}>
          <p className="reveal lede">{site.tvFilm.body}</p>
        </Section>

        <Section index={3} label={site.books.label}>
          <p className="reveal lede">{site.books.body}</p>
        </Section>

        {/* The one differentiating claim in the whole argument, and the only
            sentence on the page given a screen of its own. His own words,
            from the call notes — display-only until he signs them off. */}
        {site.positioning?.leverage && (
          <Reveal className="page-section claim-section">
            <blockquote className="claim reveal">
              {site.positioning.leverage}
            </blockquote>
          </Reveal>
        )}

        {/* ————— the person, at last at full length ————— */}
        <Section index={4} label="Founder">
          <p className="reveal display-heavy founder-name">{f.name}</p>
          <p className="reveal meta-caps founder-role">{f.role}</p>
          {/* the first paragraph is the credits — it is the reason to read
              the other four, so it carries the lede weight */}
          <p className="reveal reveal-2 lede">{f.bio[0]}</p>
          {f.bio.slice(1).map((para, i) => (
            <p key={i} className="reveal reveal-3 body-copy">
              {para}
            </p>
          ))}
          <p className="reveal reveal-4 recognition">{f.recognition}</p>
        </Section>

        {/* ————— the address ————— */}
        <Reveal className="page-section">
          <div className="section-grid">
            <div className="section-rail" aria-hidden="true" />
            <div className="section-body">
              <a
                href={`mailto:${site.contact.email}`}
                className="link contact-email display-heavy reveal decoration-signal decoration-2 underline-offset-8"
              >
                {site.contact.email}
              </a>
            </div>
          </div>
        </Reveal>

        <footer className="page-section page-footer">
          <div className="section-grid">
            <div className="section-rail" aria-hidden="true" />
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
