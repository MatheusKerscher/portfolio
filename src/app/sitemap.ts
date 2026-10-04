import type { MetadataRoute } from "next";
import { localeCodes, localePath, locales } from "./data/locales";
import { site } from "./data/site";

const absolute = (path: string) => `${site.url}${path === "/" ? "" : path}`;

/** The home page once per language, each entry naming the others. */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    localeCodes.map((code) => [
      locales[code].htmlLang,
      absolute(localePath(code)),
    ]),
  );

  return localeCodes.map((code) => ({
    url: absolute(localePath(code)),
    lastModified: site.contentUpdatedAt,
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
  }));
}
