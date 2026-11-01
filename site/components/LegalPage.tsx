import Link from "next/link";
import { CurrentYear } from "@/components/CurrentYear";
import { Lockup } from "@/components/Lockup";
import { site } from "@/lib/content";
import { SHOW_TODOS } from "@/lib/site";

/**
 * Shared chrome for the legal pages.
 *
 * These are written to describe what this site ACTUALLY does — no analytics,
 * no cookies of ours, no forms, no accounts — rather than pasted from a
 * generic template that would claim behaviour the build does not have. Every
 * fact only the client can supply is a visible placeholder, and the review
 * notice stays until a lawyer has read them.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="mx-auto flex max-w-[860px] items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" aria-label="Major Content — home">
          <Lockup tone="light" className="w-28 sm:w-32" />
        </Link>
        <Link href="/" className="link meta-caps">
          Back to the site
        </Link>
      </header>

      <main
        id="main"
        className="mx-auto max-w-[860px] px-5 pb-24 pt-10 sm:px-8"
      >
        {/* the home page's section label, as the page's title */}
        <h1 className="section-label legal-title">
          <span className="section-rule" aria-hidden="true" />
          <span>{title}</span>
        </h1>
        <p className="meta-caps mt-3 text-faint">Last updated {updated}</p>

        {SHOW_TODOS && (
          <p className="legal-review mt-8">
            Draft for review. This describes the site&rsquo;s real behaviour
            accurately, but it has not been read by a lawyer, and the bracketed
            fields need the company&rsquo;s own details before launch.
          </p>
        )}

        <div className="legal mt-10">{children}</div>

        <p className="mt-16 text-about text-mid">
          Questions about this page:{" "}
          <a href={`mailto:${site.contact.email}`} className="link">
            {site.contact.email}
          </a>
        </p>

        {/* the way home at the foot of the page, as well as at the top */}
        <p className="mt-10">
          <Link href="/" className="link meta-caps">
            <span aria-hidden="true">←</span> Back to the site
          </Link>
        </p>
      </main>

      <footer className="mx-auto flex max-w-[860px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-12 sm:px-8">
        <Link href="/terms" className="link meta-caps">
          Terms
        </Link>
        <Link href="/privacy" className="link meta-caps">
          Privacy
        </Link>
        <p className="meta-caps text-mid">
          {site.verticals} · Est. {site.legal.established} · ©{" "}
          <CurrentYear built={new Date().getFullYear()} /> {site.legal.entity}
        </p>
      </footer>
    </>
  );
}
