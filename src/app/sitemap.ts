import type { MetadataRoute } from "next";
import { signaturePage, site } from "./data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: site.contentUpdatedAt,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}${signaturePage.path}`,
      lastModified: site.contentUpdatedAt,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
