"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Technology } from "../data/site";

/** Row of technology icons; the description of each one shows on hover and on focus. */
export default function TechnologyIcons({ items }: { items: Technology[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item, i) => (
        <div key={item.name} className="relative">
          <motion.span
            className="stack-icon-container"
            aria-label={item.name}
            role="img"
            tabIndex={0}
            onMouseEnter={() => setActive(item.name)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(item.name)}
            onBlur={() => setActive(null)}
            initial={{ scale: 0.7 }}
            whileInView={{ scale: 1 }}
            transition={{
              delay: 0.3 + i * 0.05,
              duration: 0.4,
              ease: [0.19, 1, 0.22, 1],
            }}
            viewport={{ once: true, amount: 0 }}
          >
            <Image src={item.icon} alt="" aria-hidden width={22} height={22} />
          </motion.span>

          <AnimatePresence>
            {active === item.name && (
              <motion.div
                role="tooltip"
                className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-10 hidden w-44 -translate-x-1/2 flex-col items-center gap-2 rounded-xl border border-line bg-surface p-3 shadow-lg md:flex"
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.18, ease: [0.19, 1, 0.22, 1] }}
              >
                <Image src={item.icon} alt="" width={32} height={32} />
                <p
                  className="text-sm font-semibold text-ink"
                  style={{ fontFamily: "var(--font-syne), sans-serif" }}
                >
                  {item.name}
                </p>
                <p className="text-center text-xs leading-relaxed text-ink-muted">
                  {item.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
