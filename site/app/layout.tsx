import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const grotesk = localFont({
  src: "../fonts/archivo-var.woff2",
  display: "swap",
  preload: true,
  variable: "--font-grotesk",
  weight: "100 900",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export const viewport: Viewport = {
  themeColor: "#001528",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "MAJOR CONTENT — TV | FILM | BOOKS",
  description:
    "Emmy Award-winning programming and New York Times Bestselling books, one slate. A TV | Film production and literary management company founded by Raymond Garcia.",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={grotesk.variable}>
      <body>
        {/* with no JS, nothing may stay hidden waiting for a reveal */}
        <noscript>
          <style>{`[data-reveal="pending"] *{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a
          href="#main"
          className="meta-caps sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:border focus:border-signal focus:bg-screen focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        {children}
        {/* beta watermark — the one element to delete at launch */}
        <div
          aria-hidden="true"
          className="meta-caps pointer-events-none fixed bottom-3 left-3 z-50 border border-line bg-band/90 px-2.5 py-1.5 !text-[0.6rem] text-silver print:hidden"
        >
          Beta MVP
        </div>
      </body>
    </html>
  );
}
