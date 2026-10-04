"use client";

import { motion } from "framer-motion";
import { ReactNode, CSSProperties } from "react";
import { useRevealEase } from "@/lib/skin";

type MotionSectionProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  direction?: "up" | "left" | "right";
};

const directionMap = {
  up: { y: 60, x: 0 },
  left: { y: 0, x: -50 },
  right: { y: 0, x: 50 },
};

/**
 * Scroll reveal. `data-reveal` lets the <noscript> rule in the root layout show the content when
 * JavaScript is off.
 */
export default function MotionSection({
  children,
  className,
  style,
  delay = 0,
  direction = "up",
}: MotionSectionProps) {
  const { y, x } = directionMap[direction];
  const ease = useRevealEase();

  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.75, delay, ease }}
      viewport={{ once: true, amount: 0 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
