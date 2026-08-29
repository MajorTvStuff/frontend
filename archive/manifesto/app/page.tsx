import { site } from "@/lib/content";
import { Intro } from "@/components/Intro";
import { Shelf } from "@/components/Shelf";
import { Lockup } from "@/components/Lockup";
import { Confirm } from "@/components/Confirm";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="scroll-rise">
      <p className="meta-caps text-dim">{children}</p>
      <div className="rule-draw mt-3 h-px w-12 bg-red" aria-hidden="true" />
    </div>
  );
}

export default function Home() {
  const f = site.founder;

  return (
    <main>
      {/* ————— 1 · the word-flow intro ————— */}
      <Intro />

      {/* ————— 2 · company ————— */}
      <section className="mx-auto max-w-4xl px-6 py-32 sm:py-44">
        <SectionLabel>Company</SectionLabel>
        <p className="scroll-rise serif-flow mt-10 text-thesis text-white">
          {site.company[0]}
        </p>
        <div className="scroll-rise mt-10 max-w-2xl space-y-6">
          <p className="prose-read text-gray">{site.company[1]}</p>
          <p className="prose-read text-gray">{site.company[2]}</p>
        </div>
      </section>

      {/* ————— 3 · the two rooms ————— */}
      <section className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
        <div className="grid gap-14 lg:grid-cols-[1fr_1px_1fr] lg:gap-16">
          <div className="scroll-rise">
            <h2 className="display-condensed text-h2 text-white">
              TV <span className="text-silver">|</span> FILM
            </h2>
            <p className="prose-read mt-6 text-gray">{site.tvFilm.body}</p>
          </div>
          {/* the brand pipe, at architectural scale */}
          <div aria-hidden="true" className="hidden bg-silver/25 lg:block" />
          <div className="scroll-rise lg:[animation-range:entry_10%_entry_52%]">
            <h2 className="display-condensed text-h2 text-white">Books</h2>
            <p className="prose-read mt-6 text-gray">{site.books.body}</p>
          </div>
        </div>
      </section>

      {/* ————— 4 · the shelf ————— */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <SectionLabel>Projects</SectionLabel>
        </div>
        <h2 className="sr-only">Projects</h2>
        <div className="mt-14">
          <Shelf />
        </div>
        <p className="mx-auto mt-10 max-w-5xl px-6 text-sm text-dim">
          Twenty-four titles, one shelf — shows and books shoulder to shoulder.
          Drift pauses on hover.
        </p>
      </section>

      {/* ————— the credential beat ————— */}
      <section className="mx-auto max-w-5xl px-6 py-32 sm:py-44">
        <p className="scroll-rise display-condensed text-beat text-white">
          Emmy Award-Winning.
          <span className="block text-silver">New York Times Bestselling.</span>
          <span className="block text-red-bright">
            That&rsquo;s Major Content.
          </span>
        </p>
      </section>

      {/* ————— 5 · founder ————— */}
      <section className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
        <SectionLabel>Founder</SectionLabel>
        <h2 className="scroll-rise display-condensed mt-10 text-h2 text-white">
          {f.name}
        </h2>
        <p className="scroll-rise meta-caps mt-2 text-dim">{f.role}</p>
        <div className="mt-10 max-w-2xl space-y-6">
          {f.bio.map((para) => (
            <p key={para.slice(0, 40)} className="prose-read text-gray">
              {para}
            </p>
          ))}
        </div>
        {/* recognition hangs into the margin, on the wing-red rule */}
        <blockquote className="scroll-rise serif-flow relative mt-16 max-w-2xl text-flow italic text-white lg:-ml-16">
          <span
            aria-hidden="true"
            className="absolute -left-6 bottom-2 top-2 w-[2px] bg-red"
          />
          {f.recognition}
        </blockquote>
      </section>

      {/* ————— 6 · contact ————— */}
      <section className="mx-auto max-w-4xl px-6 py-32 sm:py-40">
        <SectionLabel>Contact</SectionLabel>
        <p className="scroll-rise mt-10">
          <Confirm q={site.contact.emailConfirm}>
            <a
              href={`mailto:${site.contact.email}`}
              className="display-condensed break-all text-h2 text-white underline decoration-red decoration-2 underline-offset-8 transition-colors duration-300 hover:text-silver"
            >
              {site.contact.email}
            </a>
          </Confirm>
        </p>
      </section>

      {/* ————— footer ————— */}
      <footer className="mx-auto max-w-5xl px-6 pb-16">
        <div className="hairline-short text-silver" aria-hidden="true" />
        <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
          <Lockup className="w-40 opacity-70" />
          <p className="meta-caps text-dim">
            {site.verticals} · © {new Date().getFullYear()} Major Content
          </p>
        </div>
      </footer>
    </main>
  );
}
