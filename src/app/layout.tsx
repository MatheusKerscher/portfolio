import type { Metadata, Viewport } from "next";
import { Catamaran, Pixelify_Sans, Syne } from "next/font/google";
import "./globals.css";

import BackToTop from "./components/back-to-top";
import Footer from "./components/footer";
import { MotionProvider } from "./components/motion-provider";
import Navbar from "./components/navbar";
import SmoothScrollProvider from "./components/smooth-scroll-provider";
import { ThemeProvider } from "./components/theme-provider";
import { skinScript } from "@/lib/skin-script";
import { layoutCopy, site } from "./data/site";

const catamaran = Catamaran({
  variable: "--font-catamaran",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

// Only the 8-bit skin uses it. Not preloaded, so the normal skin never downloads it.
const pixelify = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

/**
 * Without JavaScript the scroll reveals never run, so their hidden start state is undone, and
 * controls that only work with JavaScript are removed.
 */
const noScriptCss =
  "[data-reveal]{opacity:1!important;transform:none!important}[data-js-only]{display:none!important}";

// Canonical, Open Graph and Twitter tags are set per page, through `pageMetadata`.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: site.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: site.themeColor.dark },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variables sit on <html> so the custom properties of :root can refer to them.
    <html
      lang={site.language}
      className={`${catamaran.variable} ${syne.variable} ${pixelify.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: skinScript }} />
      </head>
      <body className="font-(family-name:--font-catamaran) antialiased">
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: noScriptCss }} />
        </noscript>
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:font-semibold focus:text-on-brand"
          >
            {layoutCopy.skipLink}
          </a>
          <MotionProvider>
            <SmoothScrollProvider>
              <Navbar />
              <main id="main-content">{children}</main>
              <Footer />
              <BackToTop />
            </SmoothScrollProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
