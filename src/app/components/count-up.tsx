"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type CountUpProps = { value: number; suffix?: string };

const DURATION = 1200;

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

    let frame = 0;
    let start = 0;
    const step = (now: number) => {
      start ||= now;
      const progress = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = `${Math.round(eased * value)}${suffix}`;
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
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
