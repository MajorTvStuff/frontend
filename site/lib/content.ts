import { z } from "zod";
import siteJson from "@/content/site.json";
import projectsJson from "@/content/projects.json";
import researchJson from "@/content/research.json";
import imageDims from "@/lib/image-dims.json";

/**
 * Every string the site renders comes from one of two places, and the two are
 * kept apart on purpose.
 *
 * `site.json` and `projects.json` are the CLIENT'S OWN COPY, verbatim from his
 * copy doc. Nothing there is written by us, and nothing there may be reworded
 * without his sign-off.
 *
 * `research.json` is OURS: the per-title write-ups, compiled from published
 * sources — publisher listings, trade press, network announcements — in our
 * own words, with the sources cited per entry. It carries the facts the copy
 * doc never had: publisher, year, and what RG's role on each title was. That
 * role is never guessed; it comes either from his own approved bio or from
 * the imprint, which is public record. Read the file's own note before
 * touching it.
 */

const Project = z.object({
  slug: z.string(),
  title: z.string(),
  credit: z.string().nullable(),
  medium: z.enum(["show", "book"]),
  proof: z.string(),
  trailer: z.string().nullable(),
});

const Site = z.object({
  note: z.string(),
  name: z.string(),
  domain: z.string(),
  verticals: z.string(),
  introLines: z.array(z.string()),
  company: z.array(z.string()),
  tvFilm: z.object({ label: z.string(), body: z.string() }),
  books: z.object({ label: z.string(), body: z.string() }),
  founder: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.array(z.string()),
    careerLine: z.string().optional(),
    recognition: z.string(),
  }),
  positioning: z
    .object({ note: z.string(), continuity: z.string(), leverage: z.string() })
    .optional(),
  contact: z.object({ email: z.string() }),
  /** The company behind the brand. Terms, privacy and the copyright notices
      all read it from here so there is one place to correct it. */
  legal: z.object({
    note: z.string(),
    entity: z.string(),
    jurisdiction: z.string(),
  }),
  icons: z.array(z.string()).optional(),
});

/** Our researched entry for one title. See content/research.json. */
const Research = z.object({
  summary: z.string(),
  released: z.string(),
  carrier: z.string(),
  award: z.string().optional(),
  /** the award in tile-sized form — the full sentence is too long for a stub */
  awardShort: z.string().optional(),
  role: z.string(),
  roleBasis: z.enum(["client-copy", "imprint", "unconfirmed"]),
  sources: z.array(z.string()),
  confirm: z.string().nullable(),
  onSite: z.boolean(),
  needs: z.array(z.string()),
  /** the six that have no tile yet also carry their own title and credit */
  title: z.string().optional(),
  credit: z.string().optional(),
  medium: z.enum(["show", "book"]).optional(),
  note: z.string().optional(),
});

export type Project = z.infer<typeof Project>;
export type Research = z.infer<typeof Research>;

export const site = Site.parse(siteJson);

export const projects: Project[] = z
  .object({ note: z.string(), projects: z.array(Project) })
  .parse(projectsJson).projects;

const researched = z
  .object({
    note: z.string(),
    roleSources: z.record(z.string(), z.string()),
    titles: z.record(z.string(), Research),
  })
  .parse(researchJson).titles;

/** Our full entry for a title — summary, sources, provenance, open questions.
    SERVER ONLY. Handing the whole object to a client component serialises all
    of it into the page, sources and review questions included; use `credit`
    for anything that renders. */
export function research(slug: string): Research | null {
  return researched[slug] ?? null;
}

/** What a title's write-up looks like once it reaches the page. */
export type Credit = {
  summary: string;
  /** publisher or network, with the date */
  carrier: string;
  /** the award in tile-sized form, where there is one */
  award?: string;
  /** RG's role on this title */
  role: string;
};

/** The display half of a write-up, and ONLY the display half. Our citations
    and our questions for RG stay on the server where they belong. */
/* Dates come out of the display view at the client's instruction — he
   wants the write-ups without publication dates — so `carrier` reaches the
   page as the publisher or the network and whatever else it said, minus the
   date and minus the words left hanging by its removal ("premiered", a
   stranded "in"). research.json keeps the full line: it is the citation, and
   what we can show is a separate question from what we know. */
const DATE =
  /\b(?:\d{1,2}\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b|\b(?:19|20)\d{2}\b/g;
/* "premiered", "published" and their kind are only left hanging once their
   date is gone, and a preposition stranded the same way ("followed in 2013
   with more" -> "followed in with more"). Each is removed only where nothing
   follows it. */
const HANGING_VERB =
  /(?:,|;)?\s*\b(?:premiered|aired|published|released|first\s+aired)\b\s*(?=$|[;,.)\u2014|])/gi;
const HANGING_PREP = /\b(?:in|on|from)\s+(?=$|[,.;)\u2014]|with\b|and\b)/gi;

/** A carrier line with its publication date taken out — "Celebra | Penguin
    — 28 January 2014" becomes "Celebra | Penguin". Two passes, because
    removing a date can strand a word whose own removal stands another one
    up behind it. */
export function dateless(line: string): string {
  let s = line.replace(DATE, "");
  for (let i = 0; i < 2; i++) {
    s = s
      .replace(HANGING_VERB, "")
      .replace(HANGING_PREP, "")
      .replace(/\s{2,}/g, " ")
      .replace(/,\s*\./g, ".")
      .replace(/\u2014\s*[;,]\s*/g, "\u2014 ")
      .replace(/[;,]\s*(?=[;,.]|$)/g, "")
      .replace(/\s+([.,;])/g, "$1");
  }
  return s
    .trim()
    .replace(/\s*[\u2014,;|-]\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function credit(slug: string): Credit | null {
  const r = researched[slug];
  if (!r || !r.onSite) return null;
  return {
    summary: r.summary,
    carrier: dateless(r.carrier),
    ...(r.awardShort ? { award: r.awardShort } : {}),
    role: r.role,
  };
}

/** The titles we have researched that have no tile yet, because they have no
    cover art and no proof line. Named in RG's bio; see docs/ROADMAP.md. */
export const awaitingArt: (Research & { slug: string })[] = Object.entries(
  researched,
)
  .filter(([, r]) => !r.onSite)
  .map(([slug, r]) => ({ slug, ...r }));

const dims = imageDims as unknown as Record<string, [number, number]>;

/** Natural pixel dimensions of /public/projects/<slug>.jpg */
export function projectDims(slug: string): { width: number; height: number } {
  const d = dims[slug];
  if (!d) throw new Error(`no image dims for project "${slug}"`);
  return { width: d[0], height: d[1] };
}

/** The `v` param of a youtube.com/youtu.be watch URL; null for anything else.
    A Facebook permalink yields null, which is what keeps a non-embeddable
    show out of the player's target list by construction rather than branch. */
export function youtubeId(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("youtu.be")) return u.pathname.slice(1) || null;
    if (!u.hostname.endsWith("youtube.com")) return null;
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

/**
 * Keeps the names that must not come apart on a line break.
 *
 * It swaps the SPACE CHARACTER for a no-break space and nothing else — no
 * word is added, removed or reordered, so the copy is still verbatim. Two
 * things need it: the company's own name, which was breaking as "Major /
 * Content" in the middle of the BOOKS pitch and again in the first line of
 * the bio; and the pipe-joined imprints ("Celebra | Penguin Random House",
 * "REG | Strategic Innovations"), which were leaving the bar hanging at the
 * end of a line, where it reads as a typo in a brand whose own vocabulary
 * is built on that pipe.
 */
export const knit = (s: string): string =>
  s
    .replace(/\b(MAJOR|Major) (CONTENT|Content)\b/g, "$1\u00a0$2")
    .replace(/(\S) \| (\S)/g, "$1\u00a0|\u00a0$2");

export const project = (slug: string): Project =>
  projects.find((p) => p.slug === slug)!;
