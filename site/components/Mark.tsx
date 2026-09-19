import { WORDMARK_WHITE_D, WORDMARK_RED_D } from "@/lib/wordmark";

/**
 * The M on its own — the same traced letterforms as the full lockup, with
 * the viewBox cropped to the first glyph. The client's own layout puts this
 * in front of every section label, and it is the only mark on the page that
 * repeats, so it stays small and quiet.
 */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 76"
      className={className}
      focusable="false"
      aria-hidden="true"
    >
      <g fillRule="evenodd">
        <path fill="currentColor" d={WORDMARK_WHITE_D} />
        <path fill="#a22d32" d={WORDMARK_RED_D} />
      </g>
    </svg>
  );
}

/**
 * A section label: the mark, then the name, in the small caps the rest of
 * the page uses for its quiet type.
 */
export function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`section-label meta-caps ${className}`}>
      <Mark className="section-mark" />
      <span>{children}</span>
    </h2>
  );
}
