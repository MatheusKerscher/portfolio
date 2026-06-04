"use client";

import { motion, useInView, type Transition } from "framer-motion";
import { ElementType, CSSProperties, useRef } from "react";

type AnimatedTextProps = {
  children: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  stagger?: number;
  /** Use "mount" for elements visible on page load (hero). Default "scroll" for whileInView. */
  trigger?: "mount" | "scroll";
};

const makeTransition = (delay: number): Transition => ({
  duration: 0.75,
  delay,
  ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
});

export default function AnimatedText({
  children,
  as: Tag = "p",
  className,
  style,
  delay = 0,
  stagger = 0.04,
  trigger = "scroll",
}: AnimatedTextProps) {
  const words = children.split(" ");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ display: "flex", flexWrap: "wrap", gap: "0 0.3em", ...style }}
    >
      {words.map((word, i) => {
        const wordDelay = delay + i * stagger;
        const transition = makeTransition(wordDelay);
        const shouldAnimate = trigger === "mount" || inView;

        return (
          <span key={i} style={{ overflow: "hidden", display: "inline-block" }}>
            <motion.span
              style={{ display: "inline-block" }}
              initial={{ y: "110%" }}
              animate={{ y: shouldAnimate ? "0%" : "110%" }}
              transition={transition}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
