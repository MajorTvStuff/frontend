import Image from "next/image";
import { projectDims } from "@/lib/content";
import { Lockup } from "@/components/Lockup";

/**
 * The reel: hard cuts through the slate — key art full-bleed, book
 * jackets flashed on black — with the logo building over it, fast.
 * Pure CSS: each slide owns one slot of a 9s loop, step-end easing makes
 * every transition an edit, not a fade. Slide 0 is the static frame for
 * reduced-motion and print.
 */
const SLIDES: { slug: string; fit: "cover" | "contain" }[] = [
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

const SLOT = 0.75; // seconds per cut
const LOOP = SLIDES.length * SLOT;

export function Montage() {
  return (
    <section
      className="relative overflow-hidden bg-screen"
      aria-label="MAJOR CONTENT — a reel of the slate"
    >
      <h1 className="sr-only">
        MAJOR CONTENT — TV | FILM | BOOKS. Bridging content and culture with
        global icons, premium programming, worldwide bestsellers.
      </h1>

      <div
        aria-hidden="true"
        className="relative h-[62svh] min-h-[380px] w-full sm:h-[74svh]"
        style={{ "--loop": `${LOOP}s` } as React.CSSProperties}
      >
        {SLIDES.map((s, i) => {
          const { width, height } = projectDims(s.slug);
          return (
            <div
              key={s.slug}
              className={`cut absolute inset-0 ${i === 0 ? "opacity-100" : "opacity-0"}`}
              style={{ "--at": `${i * SLOT}s` } as React.CSSProperties}
            >
              <Image
                src={`/projects/${s.slug}.jpg`}
                alt=""
                width={width}
                height={height}
                priority={i < 2}
                sizes="100vw"
                className={
                  s.fit === "cover"
                    ? "h-full w-full object-cover"
                    : "h-full w-full object-contain py-[4svh]"
                }
              />
            </div>
          );
        })}

        {/* the room's breath: a quiet scrim so the lockup always reads */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,9,11,0.55)_0%,rgba(8,9,11,0.15)_55%,rgba(8,9,11,0.35)_100%)]"
        />

        {/* the logo builds over the reel — the Manifesto's choreography at cut
            pace; a dark glow keeps it legible over white jackets */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Lockup
            animate
            bright
            className="w-[min(26rem,62vw)] [filter:drop-shadow(0_2px_22px_rgba(8,9,11,0.95))_drop-shadow(0_0_6px_rgba(8,9,11,0.7))]"
          />
        </div>
      </div>
    </section>
  );
}
