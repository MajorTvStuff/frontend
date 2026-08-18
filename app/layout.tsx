import type { Metadata } from "next";
import { grotesk, serif } from "@/lib/fonts";
import { site } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Concept 03 · The Manifesto — MAJOR CONTENT",
  description:
    "Bridging content and culture: Emmy Award-winning programming and New York Times Bestselling books. A TV | Film production and literary management company founded by Raymond Garcia.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "MAJOR CONTENT",
    description: "Bridging Content and Culture. TV | FILM | BOOKS.",
    url: "/",
    images: ["/brand/og.png"],
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Major Content",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/major-mark.svg`,
  slogan: "Bridging Content and Culture",
  founder: {
    "@type": "Person",
    name: site.founder.name,
    jobTitle: site.founder.role,
  },
  knowsAbout: [
    "Television production",
    "Film production",
    "Literary management",
    "Publishing",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${grotesk.variable} ${serif.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        {children}
        {/* concept-phase watermark — remove when a direction is chosen */}
        <div
          aria-hidden="true"
          className="meta-caps pointer-events-none fixed bottom-3 right-3 z-50 border border-silver/25 bg-ground/70 px-2.5 py-1.5 !text-[0.6rem] text-silver/70 print:hidden"
        >
          Concept 03 · The Manifesto
        </div>
      </body>
    </html>
  );
}
