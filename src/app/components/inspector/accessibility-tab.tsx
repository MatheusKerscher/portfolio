import { contrastRatio } from "@/lib/contrast";
import { palettePairs } from "@/lib/palette-contract";
import { inspectorCopy } from "../../data/site";
import { OVERLAY_KINDS, type OverlayKind } from "./overlays";
import { usePageState } from "./use-page-state";

const copy = inspectorCopy;
const token = (variable: string) => variable.replace(/^--/, "");

type AccessibilityTabProps = {
  overlays: OverlayKind[];
  onToggleOverlay: (kind: OverlayKind) => void;
};

export default function AccessibilityTab({
  overlays,
  onToggleOverlay,
}: AccessibilityTabProps) {
  // Re-renders when the theme or the skin changes, so the ratios below are the current ones.
  const page = usePageState();
  const style = getComputedStyle(document.documentElement);
  const value = (variable: string) => style.getPropertyValue(variable).trim();

  return (
    <div className="space-y-6">
      <section aria-labelledby="inspector-overlays">
        <h3 id="inspector-overlays" className="inspector-heading">
          {copy.overlays.heading}
        </h3>
        <div className="flex flex-wrap gap-2">
          {OVERLAY_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={overlays.includes(kind)}
              onClick={() => onToggleOverlay(kind)}
              className="min-h-8 border-2 border-ink px-3 py-1 font-bold aria-pressed:bg-ink aria-pressed:text-paper"
            >
              {copy.overlays[kind]}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="inspector-contrast">
        <h3 id="inspector-contrast" className="inspector-heading">
          {copy.contrast.heading}
        </h3>
        <ul data-contrast>
          {palettePairs.map((pair) => {
            const ratio = contrastRatio(
              value(pair.foreground),
              value(pair.background),
            );
            const passes = ratio >= pair.minimum;
            return (
              <li
                key={`${pair.foreground}-${pair.background}`}
                data-pass={passes}
                className="flex items-center gap-3 border-b border-line py-1.5"
              >
                <span
                  aria-hidden="true"
                  className="flex h-6 w-9 shrink-0 items-center justify-center border border-line-strong text-xs font-bold"
                  style={{
                    color: `var(${pair.foreground})`,
                    background: `var(${pair.background})`,
                  }}
                >
                  Aa
                </span>
                <span className="min-w-0 flex-1">
                  {token(pair.foreground)} {copy.contrast.on}{" "}
                  {token(pair.background)}
                </span>
                <span className="text-right tabular-nums">
                  <strong>{ratio.toFixed(2)}:1</strong>{" "}
                  <span className="text-ink-muted">
                    {copy.contrast.minimum} {pair.minimum} ·{" "}
                    {passes ? copy.contrast.pass : copy.contrast.fail}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="inspector-preferences">
        <h3 id="inspector-preferences" className="inspector-heading">
          {copy.preferences.heading}
        </h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <dt>{copy.preferences.reducedMotion}</dt>
          <dd>
            {page.reducedMotion ? copy.preferences.on : copy.preferences.off}
          </dd>
          <dt>{copy.preferences.theme}</dt>
          <dd>
            {page.theme === "dark"
              ? copy.preferences.dark
              : copy.preferences.light}
          </dd>
          <dt>{copy.preferences.skin}</dt>
          <dd>
            {page.skin === "8bit"
              ? copy.preferences.pixel
              : copy.preferences.normal}
          </dd>
        </dl>
      </section>
    </div>
  );
}
