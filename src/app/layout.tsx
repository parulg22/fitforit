/**
 * Root layout - fonts, metadata, and global structure
 */

import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitForIt — AI Outfit Planner for Trips & Events",
  description:
    "Plan outfits for your next trip or event. Virtual try-on, packing list generator, and smart outfit recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={sora.variable}>
      <body className="min-h-screen bg-surface-50 font-sans antialiased text-surface-900">
        <Nav />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
