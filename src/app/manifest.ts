import type { MetadataRoute } from "next";
import { site } from "./data/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.title,
    short_name: site.name,
    description: site.description,
    lang: site.language,
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
