"use client";

import { motion, useInView } from "framer-motion";
import { ElementType, CSSProperties, Fragment, useRef } from "react";
import { useRevealEase } from "@/lib/skin";

type AnimatedTextProps = {
  children: string;
  as?: ElementType;
  id?: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  stagger?: number;
};

/**
 * Reveals a line word by word when it scrolls into view. The spaces between the words are not
 * rendered inside the flex container, but they keep the text content readable ("two words", not
 * "twowords") for crawlers and assistive technology.
 */
export default function AnimatedText({
  children,
  as: Tag = "p",
  id,
  className,
  style,
  delay = 0,
  stagger = 0.04,
}: AnimatedTextProps) {
  const words = children.split(" ");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  const ease = useRevealEase();

  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      style={{ display: "flex", flexWrap: "wrap", gap: "0 0.3em", ...style }}
    >
      {words.map((word, i) => (
        <Fragment key={i}>
          <span style={{ overflow: "hidden", display: "inline-block" }}>
            <motion.span
              data-reveal
              style={{ display: "inline-block" }}
              initial={{ y: "110%" }}
              animate={{ y: inView ? "0%" : "110%" }}
              transition={{ duration: 0.75, delay: delay + i * stagger, ease }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
