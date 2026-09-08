import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms — MAJOR CONTENT",
  description: "The terms on which this site is made available.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <LegalPage title="Terms of Use" updated="August 2026">
      <h2>What this site is</h2>
      <p>
        This site is published by {site.legal.entity}, a{" "}
        {site.legal.jurisdiction} company, under the name MAJOR CONTENT, to
        describe its work. It is informational. Nothing on it is an offer, a
        solicitation for investment, or a promise of representation, and no
        agreement is formed by reading it or by writing to the address shown.
      </p>

      <h2>Unsolicited material</h2>
      <p>
        Please do not send scripts, manuscripts, pitches, treatments or other
        creative material through the contact address. Anything received without
        a prior written agreement in place is not reviewed, is not treated as
        confidential, and creates no obligation of any kind. Ideas arrive
        independently and often in parallel, and we cannot be responsible for
        similarities between anything you send and work already in development.
      </p>

      <h2>Our content</h2>
      <p>
        The text, layout, code and design of this site belong to us or are used
        with permission. You are welcome to link to the site and to quote from
        it with attribution. Reproducing it wholesale, or presenting it as your
        own, is not permitted.
      </p>

      <h2>Other people&rsquo;s content</h2>
      <p>
        Book jackets, key art, series titles, network names and logos shown here
        remain the property of their respective publishers, networks,
        distributors and rights holders. They appear to identify work this
        company has been involved with. Trailers are embedded from YouTube and
        are subject to YouTube&rsquo;s own terms.
      </p>

      <h2>Accuracy</h2>
      <p>
        We try to keep credits and descriptions accurate and current, but the
        site is provided as it is, without warranty of any kind. Availability
        may be interrupted, and content may change without notice.
      </p>

      <h2>Links out</h2>
      <p>
        Where the site links elsewhere — YouTube, Facebook, a publisher — we do
        not control those destinations and are not responsible for them.
      </p>

      <h2>Liability</h2>
      <p>
        To the fullest extent the law allows, we are not liable for any indirect
        or consequential loss arising from use of this site. Nothing here limits
        liability that cannot lawfully be limited.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the State of{" "}
        {site.legal.jurisdiction}, without regard to its conflict of laws rules,
        and the state and federal courts sitting in {site.legal.jurisdiction}{" "}
        have exclusive jurisdiction.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may be updated. The date at the top shows when they last
        were.
      </p>
    </LegalPage>
  );
}
