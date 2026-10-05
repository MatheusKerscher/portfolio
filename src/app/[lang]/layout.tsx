import type { Metadata, Viewport } from "next";
import { Catamaran, Pixelify_Sans, Syne } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

import BackToTop from "../components/back-to-top";
import Footer from "../components/footer";
import InspectorToggle from "../components/inspector/inspector-toggle";
import LanguageSwitch from "../components/language-switch";
import { MotionProvider } from "../components/motion-provider";
import Navbar from "../components/navbar";
import PixelRuntimeGate from "../components/pixel/pixel-runtime-gate";
import ProfileLinks from "../components/profile-links";
import SkinToggle from "../components/skin-toggle";
import SmoothScrollProvider from "../components/smooth-scroll-provider";
import { ThemeProvider } from "../components/theme-provider";
import { restoreScrollScript } from "@/lib/scroll-position";
import { skinScript } from "@/lib/skin-script";
import { dictionaryFor } from "../data/dictionaries";
import { inspectorDictionaryFor } from "../data/dictionaries/inspector";
import { getLocale } from "../data/dictionaries/server";
import {
  hasLocale,
  languageOptions,
  localeParams,
  locales,
} from "../data/locales";
import { sections, site } from "../data/site";

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

// Only the languages of `locales` exist: any other first segment is a 404.
export const dynamicParams = false;

export const generateStaticParams = localeParams;

// Canonical, Open Graph and Twitter tags are set per page, through `pageMetadata`.
export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { meta } = dictionaryFor(lang);

  return {
    metadataBase: new URL(site.url),
    title: {
      default: meta.title,
      template: `%s | ${site.name}`,
    },
    description: meta.description,
    keywords: meta.keywords,
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
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: site.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: site.themeColor.dark },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const dict = dictionaryFor(locale);
  const { nav } = dict;

  return (
    // The font variables sit on <html> so the custom properties of :root can refer to them.
    <html
      lang={locales[locale].htmlLang}
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
            {dict.layout.skipLink}
          </a>
          <MotionProvider>
            <SmoothScrollProvider>
              {/* The navbar and its toggles are Client Components: their copy is resolved here. */}
              <Navbar
                copy={{
                  label: nav.label,
                  brand: site.initials,
                  brandLabel: `${site.initials} — ${site.name}`,
                  homeHref: `#${sections.hero}`,
                  links: (["projects", "experience", "contact"] as const).map(
                    (key) => ({
                      label: nav.links[key],
                      href: `#${sections[key]}`,
                    }),
                  ),
                  openMenu: nav.openMenu,
                  closeMenu: nav.closeMenu,
                  lightTheme: nav.lightTheme,
                  darkTheme: nav.darkTheme,
                }}
                languageSwitch={
                  <LanguageSwitch
                    label={nav.language}
                    options={languageOptions(locale)}
                  />
                }
                menuFooter={
                  <div className="flex items-center gap-1">
                    <ProfileLinks ids={["linkedin", "github", "instagram"]} />
                  </div>
                }
                actions={
                  <>
                    {/* Displayed only inside the 8-bit skin. */}
                    <SkinToggle label={dict.skin.toggle} />
                    {/* One box for the Inspector and for the lock that the runtime of the skin
                        shows in its place until it is unlocked: the bar does not move when one
                        replaces the other. */}
                    <span className="hidden h-8 w-8 max-lg:h-11 max-lg:w-11 pixel:block">
                      <InspectorToggle
                        label={inspectorDictionaryFor(locale).toggle}
                        locale={locale}
                      />
                      <span data-px-slot="inspector" className="contents" />
                    </span>
                    {/* Filled by the runtime of the skin, once it is fetched: the mute button,
                        from `sm` up, and the PAUSE menu. Their room is kept from the first paint. */}
                    <span
                      data-px-slot="sound"
                      className="hidden h-8 w-8 max-lg:h-11 max-lg:w-11 sm:pixel:block"
                    />
                    <span
                      data-px-slot="pause"
                      className="hidden h-8 w-8 max-lg:h-11 max-lg:w-11 pixel:block"
                    />
                  </>
                }
              />
              <main id="main-content">{children}</main>
              <Footer />
              <BackToTop label={nav.backToTop} />
              <PixelRuntimeGate locale={locale} />
            </SmoothScrollProvider>
          </MotionProvider>
        </ThemeProvider>
        {/* After the content: it scrolls to a section, which has to exist by then. */}
        <script dangerouslySetInnerHTML={{ __html: restoreScrollScript }} />
      </body>
    </html>
  );
}
