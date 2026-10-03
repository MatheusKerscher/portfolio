"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/** Honours the visitor's `prefers-reduced-motion` setting for every motion component. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
