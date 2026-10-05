"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { useSkin } from "@/lib/skin";
import type { Locale } from "../../data/locales";

// Fetched when the Inspector is first opened, so it adds nothing to the page load it measures.
const InspectorPanel = dynamic(() => import("./inspector-panel"), {
  ssr: false,
});

/** A pixel-art magnifying glass, one path on a 16×16 grid. */
function Magnifier() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 1h5v1h2v2h1v5h-1v1h1v1h1v1h1v1h1v2h-2v-1h-1v-1h-1v-1h-1v-1H9v1H4v-1H2V9H1V4h1V2h2zm0 2v1H3v5h1v1h5V9h1V4H9V3z" />
    </svg>
  );
}

type InspectorToggleProps = { label: string; locale: Locale };

/**
 * The Inspector belongs to the 8-bit skin, where an achievement unlocks it: its toggle is
 * displayed by the stylesheet of the runtime of the skin (`pixel.css`), which knows when.
 */
export default function InspectorToggle({
  label,
  locale,
}: InspectorToggleProps) {
  const pixel = useSkin() === "8bit";
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  // Leaving the skin closes the panel, and it stays closed when the skin comes back.
  if (open && !pixel) setOpen(false);

  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls={open ? "inspector-panel" : undefined}
        data-px="inspector"
        onClick={() => setOpen((current) => !current)}
        className="hidden h-8 w-8 items-center justify-center text-ink transition-colors duration-200 hover:text-brand aria-expanded:bg-ink aria-expanded:text-paper max-lg:h-11 max-lg:w-11"
      >
        <Magnifier />
      </button>
      {open && <InspectorPanel locale={locale} onClose={close} />}
    </>
  );
}
