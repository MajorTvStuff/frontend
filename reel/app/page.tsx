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

        {/* ————— one line, then the work ————— */}
        <p className="mx-auto max-w-[1320px] px-5 pb-2 pt-10 text-sm text-mid sm:px-8">
          {site.verticals} — the slate, in one wall.
        </p>
        <Wall />

        {/* ————— the icons band: his strongest names, out of the paragraph ————— */}
        {site.icons && (
          <section className="border-y border-line">
            <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8">
              <h2 className="meta-caps scroll-rise text-mid">Global icons</h2>
              <p className="scroll-rise display-heavy mt-6 text-names leading-snug text-ink">
                {site.icons.map((name, i) => (
                  <span key={name}>
                    <span className="whitespace-nowrap">
                      {name}
                      {i < site.icons!.length - 1 && (
                        <span aria-hidden="true" className="ml-3 text-red">
                          ·
                        </span>
                      )}
                    </span>{" "}
                  </span>
                ))}
              </p>
              <p className="scroll-rise mt-6 max-w-xl text-sm text-mid">
                Published at Celebra | Penguin Random House under founder and
                publisher Raymond Garcia.
              </p>
            </div>
          </section>
        )}

        {/* ————— who we are: same light chrome as the wall ————— */}
        <section>
          <div className="mx-auto grid max-w-[1320px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20">
            <div className="scroll-rise">
              <h2 className="meta-caps text-mid">Company</h2>
              <div className="mt-6 space-y-5">
                {site.company.map((para) => (
                  <p key={para.slice(0, 40)} className="text-about text-ink/80">
                    {para}
                  </p>
                ))}
              </div>
              <div className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-8">
                <div>
                  <h3 className="meta-caps text-mid">{site.tvFilm.label}</h3>
                  <p className="mt-3 text-about text-ink/70">
                    {site.tvFilm.body}
                  </p>
                </div>
                <div>
                  <h3 className="meta-caps text-mid">{site.books.label}</h3>
                  <p className="mt-3 text-about text-ink/70">
                    {site.books.body}
                  </p>
                </div>
              </div>
            </div>

            <div className="scroll-rise lg:[animation-range:entry_8%_entry_46%]">
              <h2 className="meta-caps text-mid">Founder</h2>
              <p className="display-heavy mt-6 text-h2 text-ink">{f.name}</p>
              <p className="meta-caps mt-1 text-mid">{f.role}</p>
              <div className="mt-6 space-y-5">
                {f.bio.map((para) => (
                  <p key={para.slice(0, 40)} className="text-about text-ink/70">
                    {para}
                  </p>
                ))}
                <p className="text-about font-semibold text-ink">
                  {f.recognition}
                </p>
              </div>
            </div>
          </div>

          {/* ————— contact + footer ————— */}
          <div className="mx-auto max-w-[1320px] px-5 pb-14 sm:px-8">
            <div className="border-t border-line pt-10">
              <p>
                <Confirm q={site.contact.emailConfirm}>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="display-heavy text-h2 text-ink underline decoration-red decoration-2 underline-offset-8 transition-colors duration-300 hover:text-mid"
                  >
                    {site.contact.email}
                  </a>
                </Confirm>
              </p>
              <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
                <Lockup tone="ink" className="w-36 opacity-80" />
                <p className="meta-caps text-mid">
                  {site.verticals} · © {new Date().getFullYear()} Major Content
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
