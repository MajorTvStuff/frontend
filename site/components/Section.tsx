import { Mark } from "@/components/Mark";
import { Reveal } from "@/components/Reveal";

/**
 * A SECTION, LAID OUT THE WAY HIS IS.
 *
 * It used to have a numbered rail: 01, 02, 03, 04 down the left, the label
 * sticky beside a centred 62-character column. He sent screens of his own
 * build and it has none of that — the mark and the label sit together on one
 * line, the copy runs directly under them at a single size, and the left
 * edge of the label is the left edge of the copy, the whole way down.
 *
 * The numbers went with it. Four sections in a fixed order do not need to be
 * counted out loud, and his build never numbered them.
 *
 * TV | FILM and BOOKS are a PAIR in his layout — two labelled columns side
 * by side, not two stops one after the other. SectionPair puts them there,
 * and below 900px they stack, which is the only thing a phone can do.
 */

function Head({ label }: { label: string }) {
  return (
    <h2 className="section-label meta-caps reveal">
      <Mark className="section-mark" />
      <span>{label}</span>
    </h2>
  );
}

export function Section({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={`page-section ${className}`}>
      <div className="section-grid">
        <Head label={label} />
        <div className="section-body">{children}</div>
      </div>
    </Reveal>
  );
}

/** the two halves of the business, side by side, as he has them */
export function SectionPair({ children }: { children: React.ReactNode }) {
  return (
    <Reveal className="page-section">
      <div className="section-grid section-grid--pair">{children}</div>
    </Reveal>
  );
}

/** one column of that pair */
export function SectionColumn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-col">
      <Head label={label} />
      <div className="section-body">{children}</div>
    </div>
  );
}
