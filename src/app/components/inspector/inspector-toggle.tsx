"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { inspectorCopy } from "../../data/site";

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

export default function InspectorToggle() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label={inspectorCopy.toggle}
        title={inspectorCopy.toggle}
        aria-expanded={open}
        aria-controls={open ? "inspector-panel" : undefined}
        onClick={() => setOpen((current) => !current)}
        className="flex h-8 w-8 items-center justify-center text-ink transition-colors duration-200 hover:text-brand aria-expanded:bg-ink aria-expanded:text-paper"
      >
        <Magnifier />
      </button>
      {open && <InspectorPanel onClose={close} />}
    </>
  );
}
