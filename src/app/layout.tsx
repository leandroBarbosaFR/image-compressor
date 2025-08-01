import "./globals.css";
import Footer from "./components/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Squeezit - Free Online Image Compressor & Converter",
  description:
    "Use Squeezit to compress and convert images online instantly. Reduce file sizes without losing quality. Supports JPEG, PNG, WebP, AVIF, HEIC and more.",
  keywords: [
    "online image compressor",
    "free image converter",
    "jpeg to webp",
    "png to jpeg",
    "optimize images for web",
    "batch image compression",
    "squeezit tool",
  ],
  alternates: {
    canonical: "https://www.squeezit.fr/",
  },
  authors: [{ name: "Squeezit" }],
  openGraph: {
    title: "Squeezit - Compress & Convert Images in Seconds",
    description:
      "Free online image compression and conversion tool. Supports JPEG, PNG, WebP, AVIF, HEIC and more.",
    url: "https://www.squeezit.fr/",
    siteName: "Squeezit",
    images: [
      {
        url: "https://www.squeezit.fr/og-image.png",
        width: 1200,
        height: 630,
        alt: "Squeezit Online Image Compressor",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3707272403739034"
          crossOrigin="anonymous"
        ></Script>
      </head>
      <body className="flex flex-col min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
