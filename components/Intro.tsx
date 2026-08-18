import { site } from "@/lib/content";
import { Lockup } from "@/components/Lockup";

/**
 * The word-flow intro — RG's hero sequence built as live text, not video.
 * Lines fade in and out on black, "That's" resolves into the logo build,
 * and the frame holds on the finished lockup (per the copy doc: plays once,
 * never repeats). Pure CSS timing; scrolling past it is the skip button.
 * Reduced-motion and print land directly on the finished frame, because the
 * un-animated state of every element IS the final state.
 */
export function Intro() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
      {/* the real, indexable sentence behind the choreography */}
      <h1 className="sr-only">
        MAJOR CONTENT — TV | FILM | BOOKS. Bridging content and culture with
        global icons, premium programming, worldwide bestsellers — resonating
        with the collective majority.
      </h1>

      {/* word-flow lines, absolutely stacked on the same center */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {site.introLines.map((line, i) => (
          <p
            key={line}
            style={
              {
                "--i": i,
                // line 1 is the thesis and set a step larger; it is also the
                // largest paint of the sequence, so LCP locks at its early
                // appearance instead of chasing later, longer lines
                fontSize: i > 0 ? "calc(var(--text-flow) * 0.86)" : undefined,
              } as React.CSSProperties
            }
            className="intro-line serif-flow absolute inset-0 flex items-center justify-center text-center text-flow text-gray opacity-0"
          >
            {line}
          </p>
        ))}
      </div>

      {/* the answer: the lockup builds and holds */}
      <div className="w-[min(34rem,78vw)]">
        <Lockup animate />
        <p
          aria-hidden="true"
          className="logo-verticals meta-caps mt-10 text-center text-dim"
        >
          {site.verticals}
        </p>
      </div>

      {/* quiet cue that the page continues */}
      <div
        aria-hidden="true"
        className="intro-scrollcue absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="h-10 w-px bg-silver/40" />
      </div>
    </section>
  );
}
