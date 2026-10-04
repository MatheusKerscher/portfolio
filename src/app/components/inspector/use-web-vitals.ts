import { useEffect, useState } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

export const VITALS = ["LCP", "CLS", "INP", "FCP", "TTFB"] as const;
export type VitalName = (typeof VITALS)[number];
export type Vital = { value: number; rating: Metric["rating"] };

/** The performance entry each metric is computed from; a browser without it cannot report it. */
const ENTRY_TYPE: Record<VitalName, string> = {
  LCP: "largest-contentful-paint",
  CLS: "layout-shift",
  INP: "event",
  FCP: "paint",
  TTFB: "navigation",
};

export function isSupported(name: VitalName) {
  return (PerformanceObserver.supportedEntryTypes ?? []).includes(
    ENTRY_TYPE[name],
  );
}

/** Core Web Vitals of the current visit, updated as the browser reports them. */
export function useWebVitals() {
  const [vitals, setVitals] = useState<Partial<Record<VitalName, Vital>>>({});

  useEffect(() => {
    let active = true;
    const report = (metric: Metric) => {
      if (!active) return;
      setVitals((current) => ({
        ...current,
        [metric.name]: { value: metric.value, rating: metric.rating },
      }));
    };
    // Every change, not only the final value: the panel is read while the visit is going on.
    const options = { reportAllChanges: true };
    onLCP(report, options);
    onCLS(report, options);
    onINP(report, options);
    onFCP(report, options);
    onTTFB(report, options);
    return () => {
      active = false;
    };
  }, []);

  return vitals;
}
