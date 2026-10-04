import type { Metadata } from "next";
import { dictionaryFor } from "@/app/data/dictionaries";
import {
  defaultLocale,
  localeCodes,
  localePath,
  locales,
  type Locale,
} from "@/app/data/locales";
import { site } from "@/app/data/site";

/** The same page in every language, as `hreflang` wants it: on each of them, itself included. */
export const languageAlternates = () => ({
  ...Object.fromEntries(
    localeCodes.map((code) => [locales[code].htmlLang, localePath(code)]),
  ),
  "x-default": localePath(defaultLocale),
});

/**
 * Metadata of the home page in one language. The page sets its own canonical: one declared in
 * the root layout would be inherited by every route below it.
 */
export function pageMetadata(locale: Locale): Metadata {
  const { meta } = dictionaryFor(locale);
  const path = localePath(locale);
  const otherLocales: Locale[] = localeCodes.filter((code) => code !== locale);

  return {
    description: meta.description,
    alternates: { canonical: path, languages: languageAlternates() },
    openGraph: {
      type: "website",
      locale: locales[locale].openGraph,
      alternateLocale: otherLocales.map((code) => locales[code].openGraph),
      url: path,
      siteName: site.name,
      title: meta.title,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}
