import { motion } from "motion/react";

import type { FloatIconProps } from "../types";

const getRandomArray = () => {
  const range = 22 + Math.random() * 48;
  return [
    0,
    Math.random() * range,
    -Math.random() * range,
    Math.random() * range,
    0,
  ];
};

const FloatIcon = ({ cover, duration, position }: FloatIconProps) => {
  return (
    <motion.div
      className={`absolute ${position} w-12 h-12 md:w-18 md:h-18 bg-contain z-1 bg-no-repeat bg-center bg-white rounded`}
      style={{
        backgroundImage:
          `url('${cover}')`
      }}
      animate={{
        x: getRandomArray(),
        y: getRandomArray(),
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

export default FloatIcon;
