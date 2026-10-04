import { useEffect, useState } from "react";

export const OVERLAY_KINDS = ["landmarks", "headings", "focus"] as const;
export type OverlayKind = (typeof OVERLAY_KINDS)[number];

type Box = {
  key: string;
  kind: OverlayKind;
  label: string;
  top: number;
  left: number;
  width: number;
  height: number;
  /** Pushes the label down when other boxes start at the same corner. */
  labelOffset: number;
};

const SELECTORS: Record<OverlayKind, string> = {
  landmarks: "nav, main, footer, section[aria-labelledby], [role='region']",
  headings: "h1, h2, h3",
  focus: "a[href], button, input, [tabindex='0']",
};

const ROLES: Record<string, string> = {
  nav: "navigation",
  main: "main",
  footer: "contentinfo",
  section: "region",
};

const LABEL_HEIGHT = 16;

const STYLES: Record<OverlayKind, { box: string; label: string }> = {
  landmarks: {
    box: "outline-2 outline-brand",
    label: "bg-brand text-on-brand",
  },
  headings: {
    box: "outline-2 outline-dashed outline-ink",
    label: "bg-surface text-ink outline-1 outline-ink",
  },
  focus: { box: "", label: "bg-ink text-paper" },
};

function accessibleName(element: Element) {
  const labelledBy = element.getAttribute("aria-labelledby");
  const name =
    element.getAttribute("aria-label") ??
    (labelledBy && document.getElementById(labelledBy)?.textContent) ??
    "";
  return name.trim().slice(0, 28);
}

function label(kind: OverlayKind, element: Element, index: number) {
  const tag = element.tagName.toLowerCase();
  if (kind === "headings") return tag;
  if (kind === "focus") return String(index + 1);
  const role = element.getAttribute("role") ?? ROLES[tag] ?? tag;
  const name = accessibleName(element);
  return name ? `${role}: ${name}` : role;
}

/**
 * The visible part of an element, or null when it is outside the viewport or covered. A panel
 * pinned under the next one is inside the viewport but not on screen, so the point in the
 * middle of the visible part is hit-tested.
 */
function visibleBox(element: Element) {
  const rect = element.getBoundingClientRect();
  const top = Math.max(rect.top, 0);
  const left = Math.max(rect.left, 0);
  const bottom = Math.min(rect.bottom, window.innerHeight);
  const right = Math.min(rect.right, window.innerWidth);
  if (bottom - top < 1 || right - left < 1) return null;
  // The Inspector itself is on top of the page and does not count as covering it.
  const hit = document
    .elementsFromPoint((left + right) / 2, (top + bottom) / 2)
    .find((candidate) => !candidate.closest("[data-inspector]"));
  if (!hit || !(element === hit || element.contains(hit))) return null;
  return { top, left, width: right - left, height: bottom - top };
}

function measure(kinds: OverlayKind[]): Box[] {
  const corners = new Map<string, number>();
  return kinds.flatMap((kind) =>
    Array.from(document.querySelectorAll(SELECTORS[kind]))
      .filter((element) => !element.closest("[data-inspector]"))
      .flatMap((element, index) => {
        const box = visibleBox(element);
        if (!box) return [];
        const corner = `${Math.round(box.top)}:${Math.round(box.left)}`;
        const sharing = corners.get(corner) ?? 0;
        corners.set(corner, sharing + 1);
        return [
          {
            ...box,
            key: `${kind}-${index}`,
            kind,
            label: label(kind, element, index),
            labelOffset: sharing * LABEL_HEIGHT,
          },
        ];
      }),
  );
}

/** Outlines drawn over the page for the kinds that are switched on. */
export default function Overlays({ kinds }: { kinds: OverlayKind[] }) {
  const [boxes, setBoxes] = useState<Box[]>([]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setBoxes(measure(kinds));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [kinds]);

  return (
    <div
      data-inspector
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {boxes.map((box) => (
        <div
          key={box.key}
          data-overlay={box.kind}
          className={`absolute ${STYLES[box.kind].box}`}
          style={{
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
            outlineOffset: -2,
          }}
        >
          <span
            className={`absolute left-0 px-1 text-[11px] leading-4 font-bold whitespace-nowrap ${STYLES[box.kind].label}`}
            style={{ top: box.labelOffset }}
          >
            {box.label}
          </span>
        </div>
      ))}
    </div>
  );
}
