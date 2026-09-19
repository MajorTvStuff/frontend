import Link from "next/link";

/**
 * A REVIEW CONTROL, not site chrome.
 *
 * Two versions of this page exist while the direction is being settled: the
 * copy-led one the client's own layout asked for, and the image-led one that
 * preceded it. This sits on both so they can be flipped between in front of
 * him without touching a URL bar, and it says which is which rather than
 * making him remember.
 *
 * It is deliberately plain and deliberately obtrusive — it should read as a
 * reviewing tool that is going to be removed, never as navigation. When the
 * decision is made, delete this file, the /image-led route and the parked
 * components with it.
 */

const VARIANTS = [
  { key: "copy-led", href: "/", label: "Copy-led", note: "his layout" },
  {
    key: "image-led",
    href: "/image-led",
    label: "Image-led",
    note: "previous",
  },
] as const;

export function VariantSwitch({
  current,
}: {
  current: "copy-led" | "image-led";
}) {
  return (
    <nav className="variant-switch" aria-label="Design variant">
      <span className="variant-switch-tag meta-caps">Variant</span>
      {VARIANTS.map((v) => {
        const here = v.key === current;
        return (
          <Link
            key={v.key}
            href={v.href}
            className="variant-switch-link meta-caps"
            aria-current={here ? "page" : undefined}
            data-here={here || undefined}
          >
            {v.label}
            <span className="variant-switch-note">{v.note}</span>
          </Link>
        );
      })}
    </nav>
  );
}
