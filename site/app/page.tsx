import {
  site,
  projects,
  projectDims,
  knit,
  youtubeId,
  credit,
} from "@/lib/content";
import Image from "next/image";
import { CurrentYear } from "@/components/CurrentYear";
import { HeroBanner } from "@/components/HeroBanner";
import type { BandItem } from "@/components/Band";
import { Band } from "@/components/Band";
import { Reveal } from "@/components/Reveal";
import { Lockup } from "@/components/Lockup";
import { TopBar } from "@/components/TopBar";
import {
  Section,
  SectionColumn,
  SectionPair,
} from "@/components/Section";

/**
 * THE PAGE, IN THE CLIENT'S OWN ORDER.
 *
 * He built a version himself and sent the recording (Assets/1288.mp4). It is
 * the clearest brief we have had, and the order below is his:
 *
 *   hero     — his own film: the opening lines as title cards between
 *              footage, ending on the logo and TV | FILM | BOOKS
 *   company  — what the company is, all three paragraphs
 *   band     — every title in one row, stepped through with arrows: full
 *              tiles for the shows, books gridded two high. "All in one
 *              place", in his words.
 *   tv|film  — the copy, then the four trailers
 *   books    — the copy
 *   founder  — his portrait, the whole bio, and the recognition
 *   footer   — no address: the navbar's Contact button carries it
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

/**
 * His final mockup lights only the opening clause of a section's first
 * paragraph — what the company is, what it makes — and lets the rest fall
 * back to the reading grey. `at` is where the clause ends; if the copy ever
 * changes and it is not found, the whole paragraph stays lit.
 */
function Lead({ text, at }: { text: string; at: string }) {
  const i = text.indexOf(at);
  if (i < 0) return <span className="lede-key">{knit(text)}</span>;
  return (
    <>
      <span className="lede-key">{knit(text.slice(0, i))}</span>
      {knit(text.slice(i))}
    </>
  );
}

/**
 * A sentence he asked for in bold, marked **like this** in site.json the way
 * his email marked it: the literary-representation line he added to his bio
 * on 2026-10-21.
 */
function Bolded({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/).map((part, i) =>
        i % 2 ? (
          <strong key={i} className="copy-bold">
            {knit(part)}
          </strong>
        ) : (
          knit(part)
        ),
      )}
    </>
  );
}

export default function Home() {
  const f = site.founder;
  /* the copy doc's own order already alternates shows and books, so the
     band's rhythm is his sequencing rather than ours */
  const band: BandItem[] = projects.map((p) => ({
    ...p,
    ...projectDims(p.slug),
    /* pressing a tile opens this in the panel: its write-up, dates
       excluded */
    about: credit(p.slug),
    /* and, for a show, the trailer itself: the panel embeds it */
    youtubeId: youtubeId(p.trailer),
  }));
  return (
    <>
      {/* Nothing sits over the banner: his film spends forty seconds
          arriving at MAJOR CONTENT, and a lockup in the corner saying it
          the whole time was, in his words, too redundant. The navbar
          arrives once the page starts to scroll. */}
      <TopBar email={site.contact.email} />

      <main id="main">
        <HeroBanner verticals={site.verticals} />

        {/* ————— what the company is ————— */}
        <Section label="Company">
          {/* One size for all three. The first paragraph is the definition
              and the other two qualify it, so it leads on colour — his own
              build sets the whole section at one size, and a paragraph that
              steps up in scale is the thing he called "not breathing". */}
          <p className="reveal lede">
            <Lead text={site.company[0]} at=" whose work" />
          </p>
          {site.company.slice(1).map((para, i) => (
            <p key={i} className={`reveal reveal-${i + 2} body-copy`}>
              {knit(para)}
            </p>
          ))}
        </Section>

        {/* ————— every title, in one row ————— */}
        <Reveal className="page-section page-section--band">
          <Band items={band} founder={f.name} />
        </Reveal>

        {/* ————— the two halves of the business, side by side ————— */}
        <SectionPair>
          <SectionColumn label={site.tvFilm.label}>
            <p className="reveal lede">
              <Lead text={site.tvFilm.body} at=" with credits" />
            </p>
          </SectionColumn>
          <SectionColumn label={site.books.label}>
            <p className="reveal lede">
              <Lead text={site.books.body} at=" by industry-leading" />
            </p>
          </SectionColumn>
        </SectionPair>

        {/* ————— the person, at last at full length ————— */}
        <Section label="Founder">
          {/* His portrait, with his name and role beside it, as his final
              mockup sets them; then his bio, and the recognition marked as
              key copy with the red rule */}
          <div className="founder-card reveal">
            <Image
              src="/founder/raymond-garcia.jpg"
              alt={f.name}
              width={720}
              height={900}
              sizes="(min-width: 900px) 220px, 30vw"
              className="founder-photo"
            />
            <div className="founder-id">
              <h3 className="founder-name">{f.name}</h3>
              <p className="founder-role">{f.role}</p>
            </div>
          </div>
          {/* his name and title lit, the rest of the bio in the reading grey */}
          <p className="reveal reveal-3 body-copy">
            <Lead text={f.bio[0]} at=", drawing on" />
          </p>
          {f.bio.slice(1).map((para, i) => (
            <p key={i} className="reveal reveal-3 body-copy">
              <Bolded text={para} />
            </p>
          ))}
          <p className="reveal reveal-4 recognition">{knit(f.recognition)}</p>
        </Section>

        {/* The address section is gone at his word: the Contact button in the
            navbar is enough. */}
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
                  {site.verticals} · Est. {site.legal.established} · ©{" "}
                  <CurrentYear built={new Date().getFullYear()} />{" "}
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
