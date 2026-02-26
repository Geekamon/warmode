import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: {
    default: "WarMode — Activate War Mode",
    template: "%s — WarMode",
  },
  description: "Virtual coworking & accountability platform built for Nigeria. Go to war with your goals.",
  metadataBase: new URL("https://warmode-drab.vercel.app"),
  openGraph: {
    title: "WarMode — Activate War Mode",
    description: "Virtual coworking & accountability platform built for Nigeria. Go to war with your goals.",
    siteName: "WarMode",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
