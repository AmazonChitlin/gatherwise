import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";
import "@/styles/civic-signal.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap"
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Gatherwise | Ready. Set. Local.",
    template: "%s | Gatherwise"
  },
  description:
    "AI-powered event readiness for organizers, vendors, and venues in the Arizona pilot.",
  openGraph: {
    title: "Gatherwise | Ready. Set. Local.",
    description:
      "AI-powered event readiness for organizers, vendors, and venues in the Arizona pilot.",
    siteName: "Gatherwise",
    url: "/",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Gatherwise | Ready. Set. Local.",
    description:
      "AI-powered event readiness for organizers, vendors, and venues in the Arizona pilot."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body className={`${manrope.variable} ${newsreader.variable}`}>
        <a className="gw-skip-link" href="#main-content">
          Skip to main content
        </a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
