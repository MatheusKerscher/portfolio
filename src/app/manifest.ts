import type { MetadataRoute } from "next";
import { dictionaryFor } from "./data/dictionaries";
import { defaultLocale, locales } from "./data/locales";
import { site } from "./data/site";

/** One manifest for the site, in its default language. */
export default function manifest(): MetadataRoute.Manifest {
  const { meta } = dictionaryFor(defaultLocale);

  return {
    name: meta.title,
    short_name: site.name,
    description: meta.description,
    lang: locales[defaultLocale].htmlLang,
    start_url: "/",
    display: "browser",
    background_color: site.themeColor.light,
    theme_color: site.themeColor.light,
    icons: [
      { src: "/avatar/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/avatar/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
