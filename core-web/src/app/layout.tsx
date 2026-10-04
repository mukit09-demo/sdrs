import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { siteConfig } from "@/lib/config/site";
import "./globals.css";

/** Body copy. Exposed to Tailwind as `--font-sans` via `@theme` in globals.css. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** Headings — tighter, more editorial. Maps to `--font-display`. */
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.legalName}`,
    // Page-level titles become "Projects | SDRS".
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.legalName}`,
    description: siteConfig.tagline,
    url: siteConfig.url,
  },
  // Image comes from `src/app/opengraph-image.png` via the file convention.
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      // `globals.css` sets `scroll-behavior: smooth` so in-page anchors glide.
      // Next 16 no longer suspends that during route changes unless told to, and
      // a navigation that smooth-scrolls to the top of the new page feels slow.
      // This opts back in: smooth for anchors, instant for navigation.
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${interTight.variable} h-full antialiased`}
    >
      {/* Browser extensions — Grammarly, password managers — add their own
          attributes to `<body>` before React hydrates, which React then reports
          as a mismatch we cannot fix from here. This is deliberately on `<body>`
          rather than higher up: the flag is shallow, covering only this
          element's own attributes, so a genuine mismatch anywhere inside the
          app still warns. */}
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-white"
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
