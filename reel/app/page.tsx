import { site, projects, projectDims } from "@/lib/content";
import type { Slide, Trailer } from "@/components/Montage";
import { Montage } from "@/components/Montage";
import { Wall } from "@/components/Wall";
import { Lockup } from "@/components/Lockup";
import { Confirm } from "@/components/Confirm";

/* Hero roster: only sources that hold up full-bleed on a retina display
   (>= ~1100px). The small legacy scans (ME, A MEMOIR, the 500px cookbook
   covers) live in the wall at thumbnail size, where they are sharp. */
const SLIDE_SPEC: { slug: string; fit: "cover" | "contain" }[] = [
  { slug: "drive", fit: "cover" },
  { slug: "true-love", fit: "contain" },
  { slug: "time-of-essence", fit: "cover" },
  { slug: "the-love-playbook", fit: "contain" },
  { slug: "remix-my-space", fit: "cover" },
  { slug: "why-soccer-matters", fit: "contain" },
  { slug: "behind-the-vegas-residency", fit: "cover" },
  { slug: "my-voice", fit: "contain" },
  { slug: "chasing-the-sun", fit: "contain" },
  { slug: "clemente", fit: "contain" },
];

export default function Home() {
  const f = site.founder;
  const slides: Slide[] = SLIDE_SPEC.map((s) => {
    const p = projects.find((x) => x.slug === s.slug)!;
    const d = projectDims(s.slug);
    return { ...s, title: p.title, proof: p.proof, ...d };
  });

  // the covers that flash behind the word flow — the big book sources
  const flash = slides.filter((s) => s.fit === "contain");

  // afterwards, the trailer plays: DRIVE, the Emmy flagship
  const drive = projects.find((p) => p.slug === "drive")!;
  const driveId = drive.trailer
    ? new URL(drive.trailer).searchParams.get("v")
    : null;
  const trailer: Trailer | undefined = driveId
    ? { youtubeId: driveId, title: drive.title, proof: drive.proof }
    : undefined;

  return (
    <>
      {/* ————— slim chrome bar — the reversed wordmark on the navy ————— */}
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Lockup tone="light" className="w-28 sm:w-32" />
        <a
          href={`mailto:${site.contact.email}`}
          className="meta-caps text-paper underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-signal"
        >
          Contact
        </a>
      </header>

      <main>
        {/* ————— the reel: word flow -> covers flash -> logo -> trailer ————— */}
        <Montage slides={slides} introLines={site.introLines} flash={flash} trailer={trailer} />

        {/* ————— the slate label, then the work ————— */}
        <p className="meta-caps mx-auto max-w-[1320px] px-5 pb-2 pt-12 text-mid sm:px-8">
          The slate <span className="text-faint">— {site.tvFilm.label}</span>
        </p>
        <Wall />

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
              <p className="scroll-rise scroll-rise-2 mt-8 text-sm text-mid">
                Published at Celebra | Penguin Random House under founder and
                publisher Raymond Garcia.
              </p>
            </div>
          </section>
        )}

        {/* ————— company: continuity, one statement, the thesis ————— */}
        <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8 sm:py-32">
          <h2 className="meta-caps scroll-rise text-mid">Company</h2>
          {site.positioning && (
            /* RG's own words (call notes 2026-08-19) — pending written sign-off */
            <p className="meta-caps scroll-rise mt-3 text-faint">
              {site.positioning.continuity}
            </p>
          )}
          <p className="scroll-rise mt-8 text-flow font-light leading-normal text-paper">
            {site.company[0]}
          </p>
          <div className="mt-16 border-t border-line pt-10">
            {site.positioning && (
              <p className="scroll-rise scroll-rise-2 text-about font-semibold text-paper">
                {site.positioning.leverage}
              </p>
            )}
            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              <div className="scroll-rise scroll-rise-3">
                <h3 className="meta-caps text-mid">{site.tvFilm.label}</h3>
                <p className="mt-4 text-about text-mid">
                  {site.tvFilm.body.split(". ")[0] + "."}
                </p>
              </div>
              <div className="scroll-rise scroll-rise-3">
                <h3 className="meta-caps text-mid">{site.books.label}</h3>
                <p className="mt-4 text-about text-mid">
                  {site.books.body.split(". ")[0] + "."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ————— founder + contact: the original site's navy band ————— */}
        <section className="bg-band text-paper">
          <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8 sm:py-28">
            <h2 className="meta-caps scroll-rise text-silver">Founder</h2>
            <p className="scroll-rise display-heavy mt-8 text-h2">{f.name}</p>
            <p className="scroll-rise meta-caps mt-2 text-silver/80">{f.role}</p>
            {f.careerLine && (
              <p className="scroll-rise scroll-rise-2 mt-8 max-w-2xl text-about text-paper/85">
                {f.careerLine}
              </p>
            )}
            {/* the recognition line, in the site's own published accent color */}
            <p className="scroll-rise scroll-rise-3 mt-8 max-w-2xl text-about font-medium text-signal">
              {f.recognition}
            </p>

            <div className="mt-16 border-t border-paper/15 pt-10">
              <p className="scroll-rise">
                <Confirm q={site.contact.emailConfirm}>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="display-heavy text-h2 text-paper underline decoration-signal decoration-2 underline-offset-8 transition-colors duration-300 hover:text-silver"
                  >
                    {site.contact.email}
                  </a>
                </Confirm>
              </p>
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
