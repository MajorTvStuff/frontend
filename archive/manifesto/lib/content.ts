import { z } from "zod";
import siteJson from "@/content/site.json";
import projectsJson from "@/content/projects.json";
import imageDims from "@/lib/image-dims.json";

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
    recognition: z.string(),
  }),
  contact: z.object({ email: z.string(), emailConfirm: z.string() }),
});

export type Project = z.infer<typeof Project>;

export const site = Site.parse(siteJson);

export const projects: Project[] = z
  .object({ note: z.string(), projects: z.array(Project) })
  .parse(projectsJson).projects;

const dims = imageDims as unknown as Record<string, [number, number]>;

/** Natural pixel dimensions of /public/projects/<slug>.jpg */
export function projectDims(slug: string): { width: number; height: number } {
  const d = dims[slug];
  if (!d) throw new Error(`no image dims for project "${slug}"`);
  return { width: d[0], height: d[1] };
}
