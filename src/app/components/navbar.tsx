"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "./lenis-context";
import ThemeToggle from "./theme-toggle";

const links = [
  { label: "Projetos", href: "#projetos" },
  { label: "Currículo", href: "#curriculo" },
  { label: "Contato", href: "#contato" },
];

export default function Navbar() {
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleMobileLinkClick(href: string) {
    setPendingHref(href);
    setMenuOpen(false);
  }

  function handleExitComplete() {
    if (pendingHref && lenis) {
      lenis.scrollTo(pendingHref, { offset: -80 });
      setPendingHref(null);
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: scrolled ? "var(--nav-scrolled-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #e5e5e5" : "1px solid transparent",
        transition:
          "background 0.4s var(--ease-in-out), border-color 0.4s var(--ease-in-out)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <a
          href="#hero"
          className="font-bold text-xl tracking-tight text-black dark:text-white"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          MK
        </a>

        <ul className="nav-links-group hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-black dark:text-white relative group"
                style={{ transition: "opacity 0.3s var(--ease-cubic)" }}
              >
                {link.label}
                <span
                  className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#16a34a] group-hover:w-full"
                  style={{ transition: "width 0.4s var(--ease-expo)" }}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              className="block w-6 h-0.5 bg-black dark:bg-white"
            />
            <motion.span
              animate={
                menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }
              }
              transition={{ duration: 0.2 }}
              className="block w-6 h-0.5 bg-black dark:bg-white"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              className="block w-6 h-0.5 bg-black dark:bg-white"
            />
          </button>
        </div>
      </div>

      <AnimatePresence onExitComplete={handleExitComplete}>
        {menuOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
            className="md:hidden overflow-hidden bg-[var(--page-bg)] border-t border-border"
          >
            <ul className="flex flex-col px-6 py-4 gap-4">
              {links.map((link, i) => (
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
                  <a
                    href={link.href}
                    className="text-base font-medium text-black dark:text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMobileLinkClick(link.href);
                    }}
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
