import { useState } from "react";
import audit from "../../data/audit.json";
import { useInspector } from "./inspector-context";
import {
  isSupported,
  useWebVitals,
  VITALS,
  type Vital,
  type VitalName,
} from "./use-web-vitals";

const kilobytes = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

function format(name: VitalName, value: number) {
  if (name === "CLS") return value.toFixed(3);
  return value >= 1000
    ? `${(value / 1000).toFixed(2)} s`
    : `${Math.round(value)} ms`;
}

/** What the browser transferred for this page view, from the Resource Timing entries. */
function pageWeight() {
  const entries = [
    ...performance.getEntriesByType("navigation"),
    ...performance.getEntriesByType("resource"),
  ] as PerformanceResourceTiming[];
  const sum = (list: PerformanceResourceTiming[]) =>
    list.reduce((total, entry) => total + entry.transferSize, 0);
  return {
    requests: entries.length,
    transferred: sum(entries),
    script: sum(entries.filter((entry) => entry.initiatorType === "script")),
  };
}

function VitalRow({ name, vital }: { name: VitalName; vital?: Vital }) {
  const { copy } = useInspector();
  const supported = isSupported(name);
  let value: string;
  if (vital) value = format(name, vital.value);
  else if (!supported) value = copy.vitals.unsupported;
  else
    value = name === "INP" ? copy.vitals.waitingForInput : copy.vitals.waiting;

  return (
    <div
      data-vital={name}
      data-supported={supported}
      className="flex items-baseline justify-between gap-4 border-b border-line py-2"
    >
      <dt>
        <abbr
          title={copy.vitals.names[name]}
          className="font-bold no-underline"
        >
          {name}
        </abbr>
      </dt>
      <dd className="text-right">
        <span data-value className="tabular-nums">
          {value}
        </span>
        {vital && (
          <span className="ml-2 text-ink-muted">
            {copy.vitals.ratings[vital.rating]}
          </span>
        )}
      </dd>
    </div>
  );
}

export default function PerformanceTab() {
  const { copy } = useInspector();
  const vitals = useWebVitals();
  const [weight] = useState(pageWeight);

  return (
    <div className="space-y-6">
      <section aria-labelledby="inspector-vitals">
        <h3 id="inspector-vitals" className="inspector-heading">
          {copy.vitals.heading}
        </h3>
        <dl>
          {VITALS.map((name) => (
            <VitalRow key={name} name={name} vital={vitals[name]} />
          ))}
        </dl>
      </section>

      <section aria-labelledby="inspector-weight">
        <h3 id="inspector-weight" className="inspector-heading">
          {copy.weight.heading}
        </h3>
        {weight.transferred > 0 ? (
          <p data-weight>
            <strong>{weight.requests}</strong> {copy.weight.requests},{" "}
            <strong>{kilobytes(weight.transferred)}</strong>{" "}
            {copy.weight.transferred},{" "}
            <strong>{kilobytes(weight.script)}</strong> {copy.weight.script}.
          </p>
        ) : (
          <p data-weight>{copy.weight.cached}</p>
        )}
      </section>

      <section aria-labelledby="inspector-lab">
        <h3 id="inspector-lab" className="inspector-heading">
          {copy.lab.heading}
        </h3>
        <table data-lab className="w-full text-left">
          <thead>
            <tr className="border-b border-line">
              <td />
              <th scope="col" className="py-1 font-bold">
                {copy.lab.mobile}
              </th>
              <th scope="col" className="py-1 font-bold">
                {copy.lab.desktop}
              </th>
            </tr>
          </thead>
          <tbody>
            {(
              ["performance", "accessibility", "bestPractices", "seo"] as const
            ).map((category) => (
              <tr key={category} className="border-b border-line">
                <th scope="row" className="py-1 font-normal">
                  {copy.lab.categories[category]}
                </th>
                <td className="tabular-nums">{audit.mobile[category]}</td>
                <td className="tabular-nums">{audit.desktop[category]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-ink-muted">
          {copy.lab.note({
            runs: audit.runs,
            version: audit.lighthouseVersion,
            date: audit.measuredAt,
            commit: audit.commit,
            latency: audit.latency,
          })}
        </p>
      </section>
    </div>
  );
}
