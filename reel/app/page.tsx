import { site, projects, projectDims } from "@/lib/content";
import type { Slide } from "@/components/Montage";
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

  return (
    <>
      {/* ————— slim chrome bar, Radical-style ————— */}
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Lockup tone="ink" className="w-28 sm:w-32" />
        <a
          href={`mailto:${site.contact.email}`}
          className="meta-caps text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
        >
          Contact
        </a>
      </header>

      <main>
        {/* ————— the reel: word flow -> logo -> ambient carousel ————— */}
        <Montage slides={slides} introLines={site.introLines} />

        {/* ————— one label, then the work ————— */}
        <p className="meta-caps mx-auto max-w-[1320px] px-5 pb-2 pt-12 text-mid sm:px-8">
          The slate <span className="text-faint">— {site.verticals}</span>
        </p>
        <Wall />

        {/* ————— the icons band: names, not paragraphs ————— */}
        {site.icons && (
          <section className="border-y border-line">
            <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8">
              <h2 className="meta-caps scroll-rise text-mid">Global icons</h2>
              <p className="scroll-rise display-heavy mt-8 text-names leading-snug text-ink">
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
              <p className="scroll-rise mt-8 text-sm text-mid">
                Published at Celebra | Penguin Random House under founder and
                publisher Raymond Garcia.
              </p>
            </div>
          </section>
        )}

        {/* ————— company: one statement, one sentence per room ————— */}
        <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8 sm:py-32">
          <h2 className="meta-caps scroll-rise text-mid">Company</h2>
          <p className="scroll-rise mt-8 text-flow font-light leading-normal text-ink">
            {site.company[0]}
          </p>
          <div className="mt-16 grid gap-10 border-t border-line pt-10 sm:grid-cols-2">
            <div className="scroll-rise">
              <h3 className="meta-caps text-mid">{site.tvFilm.label}</h3>
              <p className="mt-4 text-about text-ink/75">
                {site.tvFilm.body.split(". ")[0] + "."}
              </p>
            </div>
            <div className="scroll-rise">
              <h3 className="meta-caps text-mid">{site.books.label}</h3>
              <p className="mt-4 text-about text-ink/75">
                {site.books.body.split(". ")[0] + "."}
              </p>
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
              <p className="scroll-rise mt-8 max-w-2xl text-about text-paper/85">
                {f.careerLine}
              </p>
            )}
            {/* the recognition line, in the site's own published accent color */}
            <p className="scroll-rise mt-8 max-w-2xl text-about font-medium text-signal">
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
          <Lockup tone="ink" className="w-36 opacity-80" />
          <p className="meta-caps text-mid">
            {site.verticals} · © {new Date().getFullYear()} Major Content
          </p>
        </footer>
      </main>
    </>
  );
}
