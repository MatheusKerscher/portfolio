"use client";

import Image from "next/image";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "./social-icons";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import AnimatedText from "./animated-text";
import MotionSection from "./motion-section";

const socialLinks = [
  {
    icon: <Mail size={18} />,
    label: "matheuskerscher@outlook.com",
    href: "mailto:matheuskerscher@outlook.com",
  },
  {
    icon: <LinkedinIcon size={18} />,
    label: "in/matheus-kerscher",
    href: "https://www.linkedin.com/in/matheus-kerscher/",
  },
  {
    icon: <GithubIcon size={18} />,
    label: "/MatheusKerscher",
    href: "https://github.com/MatheusKerscher",
  },
  {
    icon: <InstagramIcon size={18} />,
    label: "@MatheusKerscher",
    href: "https://www.instagram.com/matheuskerscher/",
  },
];

const stacks = [
  {
    src: "/nextjs.svg",
    label: "Next.js",
    description: "Framework React com SSR e geração estática",
  },
  {
    src: "/react.svg",
    label: "React",
    description: "Biblioteca para interfaces declarativas e reativas",
  },
  {
    src: "/typescript.svg",
    label: "TypeScript",
    description: "JavaScript com tipagem estática e maior previsibilidade",
  },
  {
    src: "/nodejs.svg",
    label: "Node.js",
    description: "Runtime JavaScript para servidores e APIs",
  },
  {
    src: "/tailwindcss.svg",
    label: "Tailwind CSS",
    description: "Framework CSS utilitário para estilização rápida",
  },
  {
    src: "/git.svg",
    label: "Git",
    description: "Controle de versão distribuído para colaboração",
  },
  {
    src: "/javascript.svg",
    label: "JavaScript",
    description: "Linguagem dinâmica base da web moderna",
  },
  {
    src: "/html.svg",
    label: "HTML5",
    description: "Linguagem de marcação para estrutura de páginas",
  },
  {
    src: "/css.svg",
    label: "CSS3",
    description: "Linguagem de estilo para design e animações",
  },
];

type StatProps = { value: number; label: string; suffix?: string };

function AnimatedStat({ value, label, suffix = "+" }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const step = (timestamp: number, startTime: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame((t) => step(t, startTime));
    };
    requestAnimationFrame((t) => step(t, t));
  }, [inView, value]);

  return (
    <div
      ref={ref}
      className="text-center lg:text-left flex flex-col-reverse gap-1"
    >
      <dt className="text-xs text-gray uppercase tracking-widest">{label}</dt>
      <dd
        className="font-bold text-black leading-none"
        style={{
          fontFamily: "var(--font-syne), sans-serif",
          fontSize: "clamp(2rem, 4vw, 3rem)",
        }}
      >
        {count}
        {suffix}
      </dd>
    </div>
  );
}

export default function AboutSection() {
  const [hoveredStack, setHoveredStack] = useState<string | null>(null);

  return (
    <section id="sobre" className="py-24 px-6 lg:px-8 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <MotionSection>
          <p className="section-label">01 — Sobre</p>
        </MotionSection>

        <div className="mt-2 space-y-8">
          <AnimatedText
            as="h2"
            delay={0.1}
            stagger={0.04}
            className="section-heading"
          >
            Apaixonado por criar experiências digitais que fazem sentido.
          </AnimatedText>

          <MotionSection delay={0.2}>
            <dl className="flex gap-10 py-6 border-y border-border">
              <AnimatedStat value={3} label="anos de exp." />
              <AnimatedStat value={8} label="clientes" />
            </dl>
          </MotionSection>

          <MotionSection delay={0.3}>
            <p className="text-gray text-lg leading-relaxed">
              Sou desenvolvedor FullStack com foco em React e Node.js, baseado
              no Paraná, Brasil. Gosto de transformar ideias complexas em
              interfaces simples e funcionais, sempre com atenção aos detalhes e
              à qualidade do código.
            </p>
          </MotionSection>

          <MotionSection delay={0.4}>
            <ul className="nav-links-group flex flex-col gap-2">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray hover:text-[#16a34a] w-fit"
                    style={{
                      transition:
                        "color 0.3s var(--ease-cubic), opacity 0.3s var(--ease-cubic)",
                    }}
                  >
                    <span aria-hidden="true">{link.icon}</span>
                    <span className="text-sm">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </MotionSection>

          <MotionSection delay={0.5}>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-gray mb-4">
                Principais Stacks
              </p>
              <div className="flex flex-wrap gap-3">
                {stacks.map((stack, i) => (
                  <div key={stack.label} className="relative">
                    <motion.span
                      className="stack-icon-container"
                      aria-label={stack.label}
                      role="img"
                      tabIndex={0}
                      onMouseEnter={() => setHoveredStack(stack.label)}
                      onMouseLeave={() => setHoveredStack(null)}
                      onFocus={() => setHoveredStack(stack.label)}
                      onBlur={() => setHoveredStack(null)}
                      initial={{ scale: 0.7 }}
                      whileInView={{ scale: 1 }}
                      transition={{
                        delay: 0.3 + i * 0.05,
                        duration: 0.4,
                        ease: [0.19, 1, 0.22, 1],
                      }}
                      viewport={{ once: true, amount: 0 }}
                    >
                      <Image
                        src={stack.src}
                        alt=""
                        aria-hidden
                        width={22}
                        height={22}
                      />
                    </motion.span>

                    <AnimatePresence>
                      {hoveredStack === stack.label && (
                        <motion.div
                          role="tooltip"
                          className="hidden md:flex absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 z-10 w-44 p-3 rounded-xl bg-white border border-border shadow-lg flex-col items-center gap-2 pointer-events-none"
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          transition={{
                            duration: 0.18,
                            ease: [0.19, 1, 0.22, 1],
                          }}
                        >
                          <Image
                            src={stack.src}
                            alt={stack.label}
                            width={32}
                            height={32}
                          />
                          <p
                            className="font-semibold text-sm text-black"
                            style={{
                              fontFamily: "var(--font-syne), sans-serif",
                            }}
                          >
                            {stack.label}
                          </p>
                          <p className="text-xs text-gray text-center leading-relaxed">
                            {stack.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </MotionSection>
        </div>
      </div>
    </section>
  );
}
