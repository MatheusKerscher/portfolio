"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navCopy, site } from "../data/site";
import InspectorToggle from "./inspector/inspector-toggle";
import SkinToggle from "./skin-toggle";
import ThemeToggle from "./theme-toggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      aria-label={navCopy.label}
      data-scrolled={scrolled}
      className="fixed top-0 right-0 left-0 z-50 border-b border-transparent data-[scrolled=true]:border-line data-[scrolled=true]:bg-paper/90 data-[scrolled=true]:backdrop-blur-md"
      style={{
        transition:
          "background-color 0.4s var(--ease-in-out), border-color 0.4s var(--ease-in-out)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <a
          href="#hero"
          aria-label={`${site.initials} — ${site.name}`}
          className="text-xl font-bold tracking-tight text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {site.initials}
        </a>

        <ul className="nav-links-group hidden items-center gap-8 md:flex">
          {navCopy.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative text-sm font-medium text-ink"
                style={{ transition: "opacity 0.3s var(--ease-cubic)" }}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 left-0 h-px w-0 bg-brand group-hover:w-full"
                  style={{ transition: "width 0.4s var(--ease-expo)" }}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <SkinToggle variant="icon" />
          <InspectorToggle />
          <ThemeToggle />

          <button
            className="flex flex-col gap-1.5 p-1 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? navCopy.closeMenu : navCopy.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              className="block h-0.5 w-6 bg-ink"
            />
            <motion.span
              animate={
                menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }
              }
              transition={{ duration: 0.2 }}
              className="block h-0.5 w-6 bg-ink"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              className="block h-0.5 w-6 bg-ink"
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
            className="overflow-hidden border-t border-line bg-paper md:hidden"
          >
            <ul className="flex flex-col gap-4 px-6 py-4">
              {navCopy.links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.4,
                    ease: [0.19, 1, 0.22, 1],
                  }}
                >
                  {/* Lenis scrolls to the anchor; the menu only has to close. */}
                  <a
                    href={link.href}
                    className="text-base font-medium text-ink"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
