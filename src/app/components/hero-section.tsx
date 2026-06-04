"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import AnimatedText from "./animated-text";

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center px-6 lg:px-8 max-w-6xl mx-auto pt-16 overflow-hidden"
    >
      <motion.div style={{ y, opacity }} className="max-w-4xl">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          style={{ transformOrigin: "left" }}
          className="w-16 h-0.5 bg-[#16a34a] mb-8"
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
          className="text-sm font-semibold tracking-widest uppercase text-[#16a34a] mb-6"
        >
          Desenvolvedor FullStack · PR, Brasil
        </motion.p>

        <AnimatedText
          as="h1"
          trigger="mount"
          delay={0.4}
          stagger={0.05}
          className="font-bold text-black dark:text-white leading-none mb-6"
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: "clamp(3rem, 9vw, 7.5rem)",
            letterSpacing: "-0.03em",
          }}
        >
          MATHEUS KERSCHER
        </AnimatedText>

        <AnimatedText
          as="p"
          trigger="mount"
          delay={0.6}
          stagger={0.03}
          className="text-lg md:text-xl text-gray dark:text-neutral-400 max-w-xl mb-10 leading-relaxed"
        >
          Construo aplicações web com foco em experiência de usuário,
          performance e código limpo.
        </AnimatedText>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1, ease: [0.19, 1, 0.22, 1] }}
          className="flex flex-wrap gap-4"
        >
          <a href="#projetos" className="btn-accent">
            Ver Projetos →
          </a>
          <a href="#contato" className="btn-outline">
            Entre em Contato
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-10 right-6 lg:left-8 flex flex-col items-center gap-2 text-gray dark:text-neutral-400"
      >
        <span className="text-xs tracking-widest uppercase rotate-90 origin-left translate-x-6 mb-2">
          Scroll
        </span>
        <motion.div
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
          className="w-px h-10 bg-gray mt-8"
        />
      </motion.div>
    </section>
  );
}
