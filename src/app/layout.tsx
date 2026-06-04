import type { Metadata } from "next";
import { Catamaran, Syne } from "next/font/google";
import "./globals.css";

import BackToTop from "./components/back-to-top";
import Footer from "./components/footer";
import JsonLd from "./components/json-ld";
import Navbar from "./components/navbar";
import SmoothScrollProvider from "./components/smooth-scroll-provider";
import { ThemeProvider } from "./components/theme-provider";

const catamaran = Catamaran({
  variable: "--font-catamaran",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const BASE_URL = "https://kerscher.dev.br";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Matheus Kerscher — Desenvolvedor FullStack",
    template: "%s | Matheus Kerscher",
  },
  description:
    "Portfólio de Matheus Kerscher, desenvolvedor FullStack especializado em React, Next.js e Node.js. Baseado no Paraná, Brasil.",
  keywords: [
    "Matheus Kerscher",
    "Desenvolvedor FullStack",
    "React",
    "Next.js",
    "Node.js",
    "TypeScript",
    "Paraná",
    "Brasil",
    "freelancer",
    "desenvolvimento web",
  ],
  authors: [{ name: "Matheus Kerscher", url: BASE_URL }],
  creator: "Matheus Kerscher",
  alternates: {
    canonical: BASE_URL,
    languages: { "pt-BR": BASE_URL },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE_URL,
    siteName: "Matheus Kerscher",
    title: "Matheus Kerscher — Desenvolvedor FullStack",
    description:
      "Portfólio de Matheus Kerscher, desenvolvedor FullStack especializado em React, Next.js e Node.js. Baseado no Paraná, Brasil.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Matheus Kerscher — Desenvolvedor FullStack",
    description:
      "Portfólio de Matheus Kerscher, desenvolvedor FullStack especializado em React, Next.js e Node.js. Baseado no Paraná, Brasil.",
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${catamaran.variable} ${syne.variable} font-(family-name:--font-catamaran) antialiased`}
      >
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-[#16a34a] focus:text-white focus:rounded focus:font-semibold"
          >
            Pular para o conteúdo principal
          </a>
          <SmoothScrollProvider>
            <JsonLd />
            <Navbar />
            <main id="main-content">{children}</main>
            <Footer />
            <BackToTop />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
