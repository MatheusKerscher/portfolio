"use client";

import dynamic from "next/dynamic";
import { useSkin } from "@/lib/skin";
import type { Locale } from "../../data/locales";

// Fetched when the 8-bit skin is on, so the normal skin pays nothing for it.
const PixelRuntime = dynamic(() => import("./pixel-runtime"), { ssr: false });

/**
 * What the 8-bit skin does beyond its shapes: sound, particles, scenery, the HUD, achievements.
 * This is all of it that the first load carries.
 */
export default function PixelRuntimeGate({ locale }: { locale: Locale }) {
  return useSkin() === "8bit" ? <PixelRuntime locale={locale} /> : null;
}
