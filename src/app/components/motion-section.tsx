"use client";

import { motion } from "framer-motion";
import { ReactNode, CSSProperties } from "react";

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

export default function MotionSection({
  children,
  className,
  style,
  delay = 0,
  direction = "up",
}: MotionSectionProps) {
  const { y, x } = directionMap[direction];

  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.75, delay, ease: [0.19, 1, 0.22, 1] }}
      viewport={{ once: true, amount: 0 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
