import packageJson from "../../../../package.json";
import { site } from "../../data/site";
import { useInspector } from "./inspector-context";

const declared: Record<string, string> = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

/** The packages a visitor would ask about, with the version `package.json` declares for each. */
const STACK = [
  ["Next.js", "next"],
  ["React", "react"],
  ["TypeScript", "typescript"],
  ["Tailwind CSS", "tailwindcss"],
  ["framer-motion", "framer-motion"],
  ["Lenis", "lenis"],
  ["Playwright", "@playwright/test"],
  ["Lighthouse", "lighthouse"],
] as const;

const commit = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;

const linkClass =
  "inline-flex min-h-6 items-center font-bold break-all text-brand underline";

export default function CodeTab() {
  const copy = useInspector().copy.code;

  return (
    <div className="space-y-6">
      <section aria-labelledby="inspector-stack">
        <h3 id="inspector-stack" className="inspector-heading">
          {copy.stack}
        </h3>
        <dl data-stack className="grid grid-cols-[1fr_auto] gap-x-4">
          {STACK.map(([name, packageName]) => (
            <div
              key={packageName}
              className="col-span-2 grid grid-cols-subgrid border-b border-line py-1"
            >
              <dt>{name}</dt>
              <dd className="text-ink-muted tabular-nums">
                {declared[packageName]}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="inspector-source">
        <h3 id="inspector-source" className="inspector-heading">
          {copy.heading}
        </h3>
        <dl className="space-y-2">
          <div>
            <dt className="font-bold">{copy.repository}</dt>
            <dd>
              <a
                href={site.repository}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {site.repository.replace("https://", "")}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-bold">{copy.spec}</dt>
            <dd>
              <a
                href={`${site.repository}/tree/main/.specs`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                .specs/
              </a>
            </dd>
          </div>
          {commit && (
            <div>
              <dt className="font-bold">{copy.commit}</dt>
              <dd className="text-ink-muted tabular-nums">
                {commit.slice(0, 7)}
              </dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
