"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  };
  /** In the bar from `md` up, and inside the menu below it, where the bar has no room. */
  languageSwitch: ReactNode;
  /** The toggles at the end of the bar. */
  actions: ReactNode;
};

export default function Navbar({ copy, languageSwitch, actions }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          className="text-xl font-bold tracking-tight text-ink"
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

        <div className="flex items-center gap-2">
          <div className="hidden md:block">{languageSwitch}</div>
          {actions}

          <button
            className="flex flex-col gap-1.5 p-1 md:hidden"
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
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
            className="overflow-hidden border-t border-line bg-paper md:hidden"
          >
            <ul className="flex flex-col gap-4 px-6 py-4">
              {copy.links.map((link, i) => (
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
              <li className="border-t border-line pt-2">{languageSwitch}</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
