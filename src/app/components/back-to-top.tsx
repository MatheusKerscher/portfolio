"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "./lenis-context";

/** How far the page has to move against the current direction before the button reacts. */
const TURN = 8;

/**
 * From `lg` up it shows once the page has left the top. Below it, where it floats over a single
 * column of content, it shows only while the visitor scrolls back up.
 */
export default function BackToTop({ label }: { label: string }) {
  const lenis = useLenis();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 64rem)");
    // Where the page last changed direction, and whether it has been going up since.
    let anchor = window.scrollY;
    let goingUp = false;

    const handleScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - anchor) >= TURN) {
        goingUp = y < anchor;
        anchor = y;
      }
      setVisible(y > 300 && (wide.matches || goingUp));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    wide.addEventListener("change", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      wide.removeEventListener("change", handleScroll);
    };
  }, []);

  function scrollToTop() {
    if (lenis.current) lenis.current.scrollTo(0);
    else window.scrollTo({ top: 0 });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
          onClick={scrollToTop}
          aria-label={label}
          className="fixed right-6 bottom-6 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-md border border-line-strong bg-paper text-ink-muted shadow-sm transition-colors duration-200 hover:border-brand hover:text-brand max-lg:right-4 max-lg:bottom-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
