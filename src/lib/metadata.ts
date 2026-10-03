import type { Metadata } from "next";
import { site } from "@/app/data/site";

type PageMetadata = { path: string; title?: string; description?: string };

/**
 * Metadata of one page. Each page sets its own canonical: one declared in the root layout would
 * be inherited by every route and point them all at the home page.
 */
export function pageMetadata({
  path,
  title,
  description = site.description,
}: PageMetadata): Metadata {
  const fullTitle = title ? `${title} | ${site.name}` : site.title;

  return {
    ...(title && { title }),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: site.locale,
      url: path,
      siteName: site.name,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
