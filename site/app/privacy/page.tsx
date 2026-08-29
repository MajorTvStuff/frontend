import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy — MAJOR CONTENT",
  description:
    "What this site collects, which is almost nothing, and the one third party it loads.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy" updated="August 2026">
      <h2>The short version</h2>
      <p>
        This site does not collect personal information. There are no accounts,
        no forms, no newsletter, no analytics and no advertising. We do not set
        cookies. Nothing you do here is tracked or stored by us.
      </p>

      <h2>What happens when you visit</h2>
      <p>
        The pages, images and fonts are served from this site&rsquo;s own
        domain. As with any website, the hosting provider processes the
        technical information a browser must send in order to receive a page —
        your IP address, the page requested, and your browser and device type —
        and may keep it briefly in server logs for security and reliability.
        That processing is the host&rsquo;s, and it is described in{" "}
        <span className="ph">[hosting provider and link to their policy]</span>.
      </p>

      <h2>The one third party: trailers</h2>
      <p>
        The slate carries trailers for our shows. Nothing loads from YouTube
        until you ask for a trailer by hovering, tapping or activating one; the
        page shows still key art until then. When a trailer does load, it is
        embedded from <strong>youtube-nocookie.com</strong>, Google&rsquo;s
        reduced-tracking host, which means Google does not set its usual
        advertising cookies for that playback. Google still receives your IP
        address and technical details in order to deliver the video, and may use
        local storage in your browser for playback. That processing is
        Google&rsquo;s and is covered by the{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          Google Privacy Policy
        </a>
        . If you never activate a trailer, no request is made to Google at all.
      </p>

      <h2>Contacting us</h2>
      <p>
        The contact link opens your own email application. If you write to us,
        we hold your message and address for as long as we need them to reply
        and to keep a record of the correspondence. We do not add you to any
        list.
      </p>

      <h2>Children</h2>
      <p>
        This is a business site aimed at industry professionals. It is not
        directed at children and we do not knowingly collect information from
        them.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct or
        delete personal information a business holds about you, and to object to
        certain processing. Because this site collects nothing, in practice this
        applies only to email you have sent us. Write to{" "}
        <span className="ph">[privacy contact address]</span> and we will
        respond within the period the applicable law requires.
      </p>

      <h2>Changes</h2>
      <p>
        If the site starts doing something this page does not describe — a
        contact form, a mailing list, analytics — this page will be updated
        before that change goes live, not after.
      </p>

      <h2>Who we are</h2>
      <p>
        <span className="ph">
          [Registered company name, address and jurisdiction]
        </span>
      </p>
    </LegalPage>
  );
}
