import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/store";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.baseUrl),
  title: "made by — Your work deserves a place of its own",
  description: "A beautiful digital home for artists. Portfolio, available work, exhibitions, series, studio and field notes — quiet, editorial, timeless.",
  openGraph: {
    title: "made by — Your work deserves a place of its own",
    description: "A beautiful digital home for artists.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink font-sans min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
