"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type Lenis from "lenis";
import { useLenis } from "./lenis-context";
import ThemeToggle from "./theme-toggle";

type NavbarProps = {
  /** Resolved by the layout: a Client Component does not import a dictionary. */
  copy: {
    label: string;
    brand: string;
    brandLabel: string;
    homeHref: string;
    links: { label: string; href: string }[];
    openMenu: string;
    closeMenu: string;
    lightTheme: string;
    darkTheme: string;
  };
  /** In the bar from `md` up, and inside the menu below it, where the bar has no room. */
  languageSwitch: ReactNode;
  /** Shown at the bottom of the menu: the links to the profiles. */
  menuFooter: ReactNode;
  /**
   * The toggles of the 8-bit skin and the slots of its runtime. The theme toggle is imported
   * here instead: rendered by the
   * layout as a Client Component of its own, it made the bundler ship the gesture and layout
   * features of framer-motion, 14 KB that nothing uses.
   */
  actions: ReactNode;
};

/**
 * What the open menu changes outside itself: it fills the screen, so the page behind it does not
 * scroll and cannot be reached by the keyboard or by assistive technology.
 */
function setPageLocked(locked: boolean, lenis: Lenis | null) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
  document
    .querySelectorAll<HTMLElement>("main, footer")
    .forEach((element) => (element.inert = locked));
}

export default function Navbar({
  copy,
  languageSwitch,
  menuFooter,
  actions,
}: NavbarProps) {
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const instance = lenis.current;
    setPageLocked(true, instance);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    // The menu exists below `md` only: a viewport that grows past it closes the menu.
    const wide = window.matchMedia("(min-width: 48rem)");
    const onWide = () => wide.matches && setMenuOpen(false);
    document.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onWide);

    return () => {
      setPageLocked(false, instance);
      document.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
    };
  }, [menuOpen, lenis]);

  return (
    // Opaque: the stacked sections pin at its bottom edge, and what scrolls past must not show
    // through it.
    <nav
      aria-label={copy.label}
      data-scrolled={scrolled}
      className="fixed top-0 right-0 left-0 z-50 border-b border-transparent bg-paper data-[scrolled=true]:border-line"
      style={{ transition: "border-color 0.4s var(--ease-in-out)" }}
    >
      <div
        data-nav-bar
        className="mx-auto flex h-(--nav-h) max-w-6xl items-center justify-between px-6 lg:px-8"
      >
        <a
          href={copy.homeHref}
          aria-label={copy.brandLabel}
          className="text-xl font-bold tracking-tight text-ink max-lg:flex max-lg:h-11 max-lg:min-w-11 max-lg:items-center"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {copy.brand}
        </a>

        <ul className="nav-links-group hidden items-center gap-8 md:flex">
          {copy.links.map((link) => (
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

        {/* Below `lg` the controls are 44 px targets: the margin puts the glyph of the last one,
            not its box, at the edge of the content. The 8-bit skin has one control more, which
            fits a 320 px wide screen without the gap. */}
        <div className="flex items-center gap-2 max-lg:-mr-2.5 max-sm:pixel:gap-0">
          <div className="hidden md:block">{languageSwitch}</div>
          {actions}
          <ThemeToggle
            lightLabel={copy.lightTheme}
            darkLabel={copy.darkTheme}
          />

          <button
            ref={menuButton}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? copy.closeMenu : copy.openMenu}
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
          // From the bar to the bottom of the screen. It scrolls on its own if it has to, on a
          // short screen, without passing the gesture on to the page.
          <motion.div
            id="mobile-nav"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-x-0 top-(--nav-h) bottom-0 flex flex-col overflow-y-auto overscroll-contain border-t border-line bg-paper md:hidden"
          >
            <ul className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-8">
              {copy.links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.05 + i * 0.06,
                    duration: 0.45,
                    ease: [0.19, 1, 0.22, 1],
                  }}
                >
                  {/*
                    Lenis scrolls to the anchor; the menu only has to close. The page is free by
                    then: React runs the cleanup of the effect above inside the click, before the
                    event reaches the listener of Lenis on `window`.
                  */}
                  <a
                    href={link.href}
                    className="flex min-h-14 items-center px-6 text-3xl font-bold text-ink"
                    style={{ fontFamily: "var(--font-display)" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="flex flex-col items-center gap-2 border-t border-line px-6 py-6">
              {languageSwitch}
              {menuFooter}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
