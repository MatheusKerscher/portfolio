"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

type CountUpProps = { value: number; suffix?: string };

/**
 * Server-renders the final number, so crawlers and visitors without JavaScript read it, then
 * counts up from zero the first time it scrolls into view.
 */
export default function CountUp({ value, suffix = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const finalText = `${value}${suffix}`;

  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion) return;
    if (!inView) {
      node.textContent = `0${suffix}`;
      return;
    }
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = `${Math.round(latest)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value, suffix]);

  return (
    <>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {finalText}
      </span>
      <span className="sr-only">{finalText}</span>
    </>
  );
}
