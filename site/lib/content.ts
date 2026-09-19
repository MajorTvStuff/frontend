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
export function credit(slug: string): Credit | null {
  const r = researched[slug];
  if (!r || !r.onSite) return null;
  return {
    summary: r.summary,
    carrier: r.carrier,
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

export const project = (slug: string): Project =>
  projects.find((p) => p.slug === slug)!;
