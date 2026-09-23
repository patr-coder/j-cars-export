import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Quality used vehicles, exported worldwide — browse stock, get a quote, and track your shipment.";

export const metadata: Metadata = {
  // Resolves relative canonical/OpenGraph URLs to absolute ones.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "J-cars Exports",
    template: "%s | J-cars Exports",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "J-cars Exports",
    description: DESCRIPTION,
    images: ["/brand/jcars-logo.png"],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
