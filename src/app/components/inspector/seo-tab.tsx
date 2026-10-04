import { useState } from "react";
import { localePath } from "../../data/locales";
import { useInspector } from "./inspector-context";

type Node = { "@type"?: string; name?: string };

/** What a crawler reads from this page: taken from the document, not from the source data. */
function readPage() {
  const attribute = (selector: string, name: string) =>
    document.querySelector(selector)?.getAttribute(name) ?? "";

  const structured: Node[] = [];
  for (const script of document.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    try {
      const data = JSON.parse(script.textContent ?? "");
      structured.push(...(data["@graph"] ?? [data]));
    } catch {
      // Not valid JSON: nothing to list.
    }
  }

  return {
    title: document.title,
    description: attribute('meta[name="description"]', "content"),
    canonical: attribute('link[rel="canonical"]', "href"),
    language: document.documentElement.lang,
    structured,
  };
}

export default function SeoTab() {
  const { copy: inspector, locale } = useInspector();
  const copy = inspector.seo;
  // llms.txt exists once per language; the sitemap and robots.txt are for the whole site.
  const files = [
    localePath(locale, "/llms.txt"),
    "/sitemap.xml",
    "/robots.txt",
  ];
  const [page] = useState(readPage);

  return (
    <div className="space-y-6">
      <section aria-labelledby="inspector-seo">
        <h3 id="inspector-seo" className="inspector-heading">
          {copy.heading}
        </h3>
        <dl data-seo className="space-y-2">
          {(
            [
              ["title", page.title],
              ["description", page.description],
              ["canonical", page.canonical],
              ["language", page.language],
            ] as const
          ).map(([key, value]) => (
            <div key={key}>
              <dt className="font-bold">{copy[key]}</dt>
              <dd data-field={key} className="break-words text-ink-muted">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="inspector-structured">
        <h3 id="inspector-structured" className="inspector-heading">
          {copy.structured}
        </h3>
        {page.structured.length > 0 ? (
          <ul data-structured>
            {page.structured.map((node, index) => (
              <li key={index} className="border-b border-line py-1.5">
                <strong>{node["@type"]}</strong>
                {node.name && (
                  <span className="text-ink-muted"> — {node.name}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-muted">{copy.none}</p>
        )}
      </section>

      <section aria-labelledby="inspector-files">
        <h3 id="inspector-files" className="inspector-heading">
          {copy.files}
        </h3>
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {files.map((path) => (
            <li key={path}>
              <a
                href={path}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-6 items-center font-bold text-brand underline"
              >
                {path}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
