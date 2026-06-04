import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://kerscher.dev.br/sitemap.xml",
    host: "https://kerscher.dev.br",
  };
}
