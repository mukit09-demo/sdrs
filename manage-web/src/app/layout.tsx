import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { appConfig } from "@/lib/config/app";
import "./globals.css";

/** One face, unlike the public site. Nothing here is a headline. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: appConfig.title,
    template: `%s — ${appConfig.title}`,
  },
  // Nothing links here and nothing should index it either. Set on the root so it
  // covers every route in the app, including the sign-in page.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      {/* Browser extensions — password managers especially, on a sign-in page —
          add their own attributes to `<body>` before React hydrates. Shallow, so
          a genuine mismatch inside the app still warns. */}
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
