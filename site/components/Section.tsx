import { Mark } from "@/components/Mark";
import { Reveal } from "@/components/Reveal";

/**
 * A SECTION OF THE ARGUMENT.
 *
 * The client's own layout stacks a label on top of its copy, centred, four
 * times over. That is the right structure and the wrong hierarchy: every
 * section arrives at exactly the same weight, so nothing leads and the eye
 * has no way in.
 *
 * So the label moves into a rail of its own and stays there while its copy
 * scrolls past it — the reader always knows which part of the argument they
 * are inside — and each section takes a number, because there are four and
 * they are meant to be read in order. The copy column keeps a single reading
 * measure whatever the viewport does.
 *
 * Below the rail breakpoint it collapses back to his stack, which is what a
 * phone wants anyway.
 */
export function Section({
  index,
  label,
  children,
  className = "",
}: {
  /** its place in the argument — there are four, and the order is the point */
  index: number;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={`page-section ${className}`}>
      <div className="section-grid">
        <div className="section-rail">
          <span className="section-index meta-caps reveal" aria-hidden="true">
            {String(index).padStart(2, "0")}
          </span>
          <h2 className="section-label meta-caps reveal">
            <Mark className="section-mark" />
            <span>{label}</span>
          </h2>
        </div>
        <div className="section-body">{children}</div>
      </div>
    </Reveal>
  );
}
