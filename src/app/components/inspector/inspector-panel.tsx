"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Locale } from "../../data/locales";
import AccessibilityTab from "./accessibility-tab";
import CodeTab from "./code-tab";
import { InspectorContext, inspectorValue } from "./inspector-context";
import Overlays, { type OverlayKind } from "./overlays";
import PerformanceTab from "./performance-tab";
import PixelIcon from "../pixel-icon";
import { close } from "../pixel-icons";
import SeoTab from "./seo-tab";

const TABS = ["performance", "accessibility", "seo", "code"] as const;

// No transition: the background flips at once, and a text colour that fades behind it would
// pass through an unreadable pair.
const triggerClass =
  "h-auto rounded-none border-0 px-1 py-2 text-[11px] font-bold tracking-wider text-ink uppercase shadow-none transition-none data-[state=active]:bg-ink data-[state=active]:text-paper data-[state=active]:shadow-none";

/**
 * The Inspector: what this page measures about itself, in the visitor's own browser. It is a
 * non-modal dialog, because its overlays point at the page, which has to stay readable and
 * scrollable behind it. Rendered into `body`: a fixed element inside the navbar would be placed
 * relative to it once the navbar has a backdrop filter.
 */
export default function InspectorPanel({
  locale,
  onClose,
}: {
  locale: Locale;
  onClose: () => void;
}) {
  const value = useMemo(() => inspectorValue(locale), [locale]);
  const { copy } = value;
  const title = useRef<HTMLHeadingElement>(null);
  const [overlays, setOverlays] = useState<OverlayKind[]>([]);

  useEffect(() => {
    title.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const toggleOverlay = (kind: OverlayKind) =>
    setOverlays((current) =>
      current.includes(kind)
        ? current.filter((item) => item !== kind)
        : [...current, kind],
    );

  return createPortal(
    <InspectorContext.Provider value={value}>
      <Overlays kinds={overlays} />
      <div
        id="inspector-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="inspector-title"
        data-inspector
        // The panel scrolls on its own; Lenis must leave its wheel events alone.
        data-lenis-prevent
        className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[70svh] flex-col border-2 border-ink bg-surface text-sm text-ink shadow-[6px_6px_0_var(--ink)] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[26rem]"
      >
        <header className="flex items-start justify-between gap-4 bg-ink px-4 py-3 text-paper">
          <div>
            <h2
              id="inspector-title"
              ref={title}
              tabIndex={-1}
              className="text-base font-bold tracking-widest uppercase outline-none"
              style={{ fontFamily: "var(--font-pixel), var(--font-display)" }}
            >
              {copy.title}
            </h2>
            <p className="mt-1 text-xs leading-snug">{copy.intro}</p>
          </div>
          <button
            type="button"
            aria-label={copy.close}
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-paper hover:bg-paper hover:text-ink focus-visible:outline-paper"
          >
            <PixelIcon grid={close} />
          </button>
        </header>

        <Tabs defaultValue="performance" className="min-h-0 flex-1 gap-0">
          <TabsList className="h-auto w-full rounded-none border-b-2 border-ink bg-transparent p-0">
            {TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className={triggerClass}>
                {copy.tabs[tab]}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <TabsContent value="performance">
              <PerformanceTab />
            </TabsContent>
            <TabsContent value="accessibility">
              <AccessibilityTab
                overlays={overlays}
                onToggleOverlay={toggleOverlay}
              />
            </TabsContent>
            <TabsContent value="seo">
              <SeoTab />
            </TabsContent>
            <TabsContent value="code">
              <CodeTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </InspectorContext.Provider>,
    document.body,
  );
}
