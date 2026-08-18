import { WORDMARK_WHITE_D, WORDMARK_RED_D } from "@/lib/wordmark";

/**
 * The MAJOR CONTENT lockup, built live:
 * - MAJOR is the traced SVG wordmark (viewBox cropped to the letters; the
 *   legacy descriptor line in the path data falls below y=74 and is never
 *   painted).
 * - CONTENT is real text, one flex-spread row exactly as wide as the
 *   wordmark — the same full-measure descriptor treatment as the BOOKS and
 *   BRAND DEVELOPMENT lockups RG sent.
 * With `animate`, the pieces carry the intro's build classes (wings first,
 * letters revealed out of the M, descriptor settling in last). The natural
 * un-animated state is the finished lockup.
 */
export function Lockup({
  animate = false,
  className = "",
}: {
  animate?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative [container-type:inline-size] ${className}`}>
      <span className="sr-only">MAJOR CONTENT</span>
      <div aria-hidden="true">
        <div className={animate ? "logo-shift" : undefined}>
          <svg
            viewBox="0 0 382 74"
            className="w-full"
            focusable="false"
            aria-hidden="true"
          >
            <g fillRule="evenodd">
              <path
                className={animate ? "logo-letters" : undefined}
                fill="#f4f6f8"
                d={WORDMARK_WHITE_D}
              />
              <path
                className={animate ? "logo-wings" : undefined}
                fill="#a22d32"
                d={WORDMARK_RED_D}
              />
            </g>
          </svg>
        </div>
        <div
          className={`mt-[4.5%] flex justify-between font-light text-silver [font-stretch:92%] ${
            animate ? "logo-descriptor" : ""
          }`}
          style={{ fontSize: "min(2.1rem, 8.2cqw)" }}
        >
          {"CONTENT".split("").map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
