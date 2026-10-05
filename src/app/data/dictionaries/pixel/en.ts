import type { PixelDictionary } from "./index";

/** The copy of the runtime of the 8-bit skin in English. */
const en = {
  sound: { mute: "Mute sound" },
  pause: {
    open: "Pause menu",
    title: "Pause",
    close: "Close pause menu",
    level: (years: number) => `Level ${years}`,
    sound: "Sound",
    music: "Music",
    effects: "Effects",
  },
  inspector: {
    locked: "Inspector locked",
    hint: "Visit the five stages to unlock it",
    unlocked: "Site inspector unlocked",
  },
  stage: (number: string, name: string) => `Stage ${number} — ${name}`,
  stages: {
    hero: "Start",
    about: "About",
    projects: "Projects",
    experience: "Experience",
    contact: "Contact",
  },
  achievements: {
    heading: "Achievements",
    unlocked: "Achievement unlocked",
    locked: "Locked",
    items: {
      "easter-egg": {
        title: "Secret passage",
        description: "Found the 8-bit mode.",
      },
      konami: {
        title: "Classic code",
        description: "Entered with the Konami code.",
      },
      explorer: {
        title: "Explorer",
        description: "Visited the five stages.",
      },
      inspector: {
        title: "Detective",
        description: "Opened the site Inspector.",
      },
      theme: { title: "Day and night", description: "Changed the theme." },
      polyglot: {
        title: "Polyglot",
        description: "Saw the site in both languages.",
      },
      music: { title: "DJ", description: "Turned the music on." },
      contact: {
        title: "First contact",
        description: "Clicked the email.",
      },
    },
  },
} satisfies PixelDictionary;

export default en;
