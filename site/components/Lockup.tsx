import { WORDMARK_WHITE_D, WORDMARK_RED_D } from "@/lib/wordmark";

/**
 * The MAJOR CONTENT lockup (traced SVG letters + real-text descriptor).
 * tone "light" = white letters for dark grounds; "ink" = near-black for
 * the light chrome. The wing red is constant — it is the logo.
 */
export function Lockup({
  animate = false,
  tone = "light",
  bright = false,
  className = "",
}: {
  animate?: boolean;
  tone?: "light" | "ink";
  /** white descriptor for over-imagery contexts */
  bright?: boolean;
  className?: string;
}) {
  const letterFill = tone === "light" ? "#f4f6f8" : "#0c0e12";
  const descriptorClass = bright
    ? "text-paper"
    : tone === "light"
      ? "text-silver"
      : "text-mid";

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
                fill={letterFill}
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
          className={`mt-[4.5%] flex justify-between font-light [font-stretch:92%] ${descriptorClass} ${
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
