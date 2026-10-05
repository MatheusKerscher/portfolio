"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import PixelIcon from "./pixel-icon";
import { moon, sun } from "./pixel-icons";

type ThemeToggleProps = { lightLabel: string; darkLabel: string };

export default function ThemeToggle({
  lightLabel,
  darkLabel,
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return <div className="h-8 w-8 max-lg:h-11 max-lg:w-11" />;

  const isDark = resolvedTheme === "dark";
  const Vector = isDark ? Moon : Sun;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? lightLabel : darkLabel}
      data-px="theme"
      className="relative flex h-8 w-8 items-center justify-center text-ink transition-colors duration-200 hover:text-brand max-lg:h-11 max-lg:w-11"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
          transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
          className="absolute"
        >
          <Vector size={18} data-icon="vector" className="pixel:hidden" />
          <PixelIcon grid={isDark ? moon : sun} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
