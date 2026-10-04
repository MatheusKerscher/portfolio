import type { AchievementId } from "@/lib/pixel-prefs";
import type { SectionKey } from "../../site";

/**
 * The copy of the runtime of the 8-bit skin in Brazilian Portuguese. It is apart from the main
 * dictionary because that runtime, a lazy client chunk, is the only code that imports it.
 */
const pt = {
  sound: { mute: "Silenciar som" },
  pause: {
    open: "Menu de pausa",
    title: "Pausa",
    close: "Fechar menu de pausa",
    level: (years: number) => `Nível ${years}`,
    sound: "Som",
    music: "Música",
    effects: "Efeitos",
  },
  inspector: {
    locked: "Inspetor bloqueado",
    hint: "Visite as cinco fases para liberar",
    unlocked: "Inspetor do site liberado",
  },
  stage: (number: string, name: string) => `Fase ${number} — ${name}`,
  stages: {
    hero: "Início",
    about: "Sobre",
    projects: "Projetos",
    experience: "Currículo",
    contact: "Contato",
  } satisfies Record<SectionKey, string>,
  achievements: {
    heading: "Conquistas",
    unlocked: "Conquista desbloqueada",
    locked: "Bloqueada",
    items: {
      "easter-egg": {
        title: "Passagem secreta",
        description: "Encontrou o modo 8-bit.",
      },
      konami: {
        title: "Código clássico",
        description: "Entrou com o código Konami.",
      },
      explorer: {
        title: "Explorador",
        description: "Visitou as cinco fases.",
      },
      inspector: {
        title: "Detetive",
        description: "Abriu o Inspetor do site.",
      },
      theme: { title: "Dia e noite", description: "Trocou o tema." },
      polyglot: {
        title: "Poliglota",
        description: "Viu o site nos dois idiomas.",
      },
      music: { title: "DJ", description: "Ligou a música." },
      contact: {
        title: "Primeiro contato",
        description: "Clicou no e-mail.",
      },
    } satisfies Record<AchievementId, { title: string; description: string }>,
  },
};

export default pt;
