import type { Metadata } from "next";
import { Catamaran, Syne } from "next/font/google";
import "./globals.css";

import BackToTop from "./components/back-to-top";
import Footer from "./components/footer";
import JsonLd from "./components/json-ld";
import { MotionProvider } from "./components/motion-provider";
import Navbar from "./components/navbar";
import SmoothScrollProvider from "./components/smooth-scroll-provider";
import { ThemeProvider } from "./components/theme-provider";
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

/** Without JavaScript the scroll reveals never run, so their hidden start state is undone. */
const noScriptCss =
  "[data-reveal]{opacity:1!important;transform:none!important}";

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
  alternates: {
    canonical: site.url,
    languages: { "pt-BR": site.url },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={site.language} suppressHydrationWarning>
      <body
        className={`${catamaran.variable} ${syne.variable} font-(family-name:--font-catamaran) antialiased`}
      >
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
              <JsonLd />
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
