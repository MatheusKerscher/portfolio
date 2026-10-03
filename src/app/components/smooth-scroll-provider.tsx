"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { LenisContext } from "./lenis-context";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      autoRaf: true,
      // In-page links scroll through Lenis instead of jumping.
      anchors: true,
      // Lets a horizontally scrollable child (a carousel) take its own wheel gestures.
      allowNestedScroll: true,
    });

    lenisRef.current = instance;

    return () => {
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  );
}
