import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gatherwise.local"),
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
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
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
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
