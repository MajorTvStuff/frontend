import { site, projects, projectDims } from "@/lib/content";
import type { Slide } from "@/components/Montage";
import { Montage } from "@/components/Montage";
import { Wall } from "@/components/Wall";
import { Lockup } from "@/components/Lockup";
import { Confirm } from "@/components/Confirm";

const SLIDE_SPEC: { slug: string; fit: "cover" | "contain" }[] = [
  { slug: "drive", fit: "cover" },
  { slug: "true-love", fit: "contain" },
  { slug: "time-of-essence", fit: "cover" },
  { slug: "the-love-playbook", fit: "contain" },
  { slug: "remix-my-space", fit: "cover" },
  { slug: "me", fit: "contain" },
  { slug: "behind-the-vegas-residency", fit: "cover" },
  { slug: "why-soccer-matters", fit: "contain" },
  { slug: "estefan-kitchen", fit: "contain" },
  { slug: "my-voice", fit: "contain" },
  { slug: "clemente", fit: "contain" },
  { slug: "out-of-the-blue", fit: "contain" },
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
        {/* ————— the reel ————— */}
        <Montage slides={slides} />

        {/* ————— one line, then the work ————— */}
        <p className="mx-auto max-w-[1320px] px-5 pb-2 pt-10 text-sm text-mid sm:px-8">
          {site.verticals} — the slate, in one wall.
        </p>
        <Wall />

        {/* ————— who we are: dense, editorial, on black ————— */}
        <section className="bg-screen text-paper">
          <div className="mx-auto grid max-w-[1320px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20">
            <div className="scroll-rise">
              <h2 className="meta-caps text-silver">Company</h2>
              <div className="mt-6 space-y-5">
                {site.company.map((para) => (
                  <p key={para.slice(0, 40)} className="text-about text-paper/80">
                    {para}
                  </p>
                ))}
              </div>
              <div className="mt-10 grid grid-cols-2 gap-6 border-t border-paper/15 pt-8">
                <div>
                  <h3 className="meta-caps text-silver">{site.tvFilm.label}</h3>
                  <p className="mt-3 text-about text-paper/70">
                    {site.tvFilm.body}
                  </p>
                </div>
                <div>
                  <h3 className="meta-caps text-silver">{site.books.label}</h3>
                  <p className="mt-3 text-about text-paper/70">
                    {site.books.body}
                  </p>
                </div>
              </div>
            </div>

            <div className="scroll-rise lg:[animation-range:entry_8%_entry_46%]">
              <h2 className="meta-caps text-silver">Founder</h2>
              <p className="display-heavy mt-6 text-h2">{f.name}</p>
              <p className="meta-caps mt-1 text-paper/50">{f.role}</p>
              <div className="mt-6 space-y-5">
                {f.bio.map((para) => (
                  <p key={para.slice(0, 40)} className="text-about text-paper/70">
                    {para}
                  </p>
                ))}
                <p className="text-about font-semibold text-paper/90">
                  {f.recognition}
                </p>
              </div>
            </div>
          </div>

          {/* ————— contact + footer ————— */}
          <div className="mx-auto max-w-[1320px] px-5 pb-14 sm:px-8">
            <div className="border-t border-paper/15 pt-10">
              <p>
                <Confirm q={site.contact.emailConfirm}>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="display-heavy text-h2 text-paper underline decoration-red decoration-2 underline-offset-8 transition-colors duration-300 hover:text-silver"
                  >
                    {site.contact.email}
                  </a>
                </Confirm>
              </p>
              <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
                <Lockup className="w-36 opacity-70" />
                <p className="meta-caps text-paper/50">
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
