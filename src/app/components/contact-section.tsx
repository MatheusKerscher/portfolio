"use client";

import { ArrowRight } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "./social-icons";
import { motion } from "framer-motion";

const vp = { once: true, amount: 0 } as const;

const socialLinks = [
  {
    icon: <GithubIcon size={20} />,
    label: "GitHub",
    href: "https://github.com/MatheusKerscher",
  },
  {
    icon: <LinkedinIcon size={20} />,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/matheus-kerscher/",
  },
  {
    icon: <InstagramIcon size={20} />,
    label: "Instagram",
    href: "https://www.instagram.com/matheuskerscher/",
  },
];

export default function ContactSection() {
  return (
    <section id="contato" className="py-24 px-6 lg:px-8 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="section-label"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
          }}
          viewport={vp}
        >
          04 — Contato
        </motion.p>

        <div className="max-w-2xl">
          <motion.h2
            className="font-bold text-black dark:text-white leading-tight mb-8"
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontSize: "clamp(2rem, 5vw, 4rem)",
              letterSpacing: "-0.02em",
            }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.1,
              ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
            }}
            viewport={vp}
          >
            Vamos construir algo juntos?
          </motion.h2>

          <motion.p
            className="text-gray dark:text-neutral-400 text-lg leading-relaxed mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
            }}
            viewport={vp}
          >
            Estou aberto a oportunidades de trabalho, freelas e colaborações. Se
            tiver um projeto em mente, adoraria conversar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.3,
              ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
            }}
            viewport={vp}
          >
            <a
              href="mailto:matheuskerscher@outlook.com"
              className="group flex items-center gap-3 w-fit mb-12"
            >
              <span
                className="font-bold text-black dark:text-white group-hover:text-[#16a34a]"
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
                  transition: "color 0.3s var(--ease-cubic)",
                  display: "inline-block",
                }}
              >
                matheuskerscher@outlook.com
              </span>
              <ArrowRight
                size={20}
                className="text-[#16a34a] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                style={{
                  transition:
                    "opacity 0.3s var(--ease-cubic), transform 0.4s var(--ease-expo)",
                }}
              />
            </a>
          </motion.div>

          <motion.div
            className="relative pt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.4,
              ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
            }}
            viewport={vp}
          >
            <motion.div
              className="absolute top-0 left-0 h-px bg-border w-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
              }}
              viewport={vp}
              style={{ transformOrigin: "left" }}
            />
            <div className="flex items-center gap-6">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray dark:text-neutral-400 hover:text-[#16a34a]"
                  style={{ transition: "color 0.3s var(--ease-cubic)" }}
                  aria-label={`${link.label} de Matheus Kerscher`}
                >
                  <span aria-hidden="true">{link.icon}</span>
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
