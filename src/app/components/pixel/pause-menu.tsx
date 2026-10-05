import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ACHIEVEMENTS,
  setEffects,
  setMusic,
  usePixelPrefs,
} from "@/lib/pixel-prefs";
import { yearsOfExperience } from "../../data/curriculum";
import type { PixelDictionary } from "../../data/dictionaries/pixel";
import { site } from "../../data/site";
import MiniSprite from "../mini-sprite";
import PixelIcon from "../pixel-icon";
import { close as closeIcon, lock, pause, trophy } from "../pixel-icons";
import { award } from "./achievements";
import { toggleSound } from "./sound-toggle";

type SwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** A row of the menu: the whole row is the switch, and the knob shows where it is. */
function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex min-h-9 w-full items-center justify-between gap-4 px-4 py-1 text-left font-bold hover:bg-ink hover:text-paper max-lg:min-h-11"
    >
      {label}
      <span aria-hidden="true" className="px-switch" />
    </button>
  );
}

/**
 * The PAUSE menu of the 8-bit skin: the switches of the sound, the music and the effects, the
 * level, and the achievements. A non-modal dialog, like the Inspector: the page behind it stays
 * in use.
 */
export default function PauseMenu({ copy }: { copy: PixelDictionary }) {
  const prefs = usePixelPrefs();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    title.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const { items } = copy.achievements;

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label={copy.pause.open}
        title={copy.pause.open}
        aria-expanded={open}
        aria-controls={open ? "pause-menu" : undefined}
        onClick={() => setOpen((current) => !current)}
        className="flex h-8 w-8 items-center justify-center text-ink transition-colors duration-200 hover:text-brand aria-expanded:bg-ink aria-expanded:text-paper max-lg:h-11 max-lg:w-11"
      >
        <PixelIcon grid={pause} />
      </button>
      {open &&
        // Into `body`: inside the navbar it would be laid out as one of its controls.
        createPortal(
          <div
            id="pause-menu"
            role="dialog"
            aria-modal="false"
            aria-labelledby="pause-title"
            // The menu scrolls on its own; Lenis must leave its wheel events alone.
            data-lenis-prevent
            className="px-panel fixed top-[calc(var(--nav-h)+1.25rem)] right-4 z-[65] flex max-h-[calc(100svh-var(--nav-h)-3rem)] w-72 max-w-[calc(100vw-2rem)] flex-col bg-surface text-sm text-ink"
          >
            <header className="flex items-center justify-between gap-3 bg-ink px-4 py-3 text-paper">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden bg-brand">
                  <MiniSprite size={30} />
                </span>
                <div>
                  <h2
                    id="pause-title"
                    ref={title}
                    tabIndex={-1}
                    className="text-base leading-none font-bold tracking-widest uppercase outline-none"
                  >
                    {copy.pause.title}
                  </h2>
                  <p className="mt-1 text-xs leading-none">
                    {site.initials} · {copy.pause.level(yearsOfExperience)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label={copy.pause.close}
                onClick={close}
                className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-paper hover:bg-paper hover:text-ink focus-visible:outline-paper max-lg:h-11 max-lg:w-11"
              >
                <PixelIcon grid={closeIcon} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="border-b-2 border-ink py-2">
                <Switch
                  label={copy.pause.sound}
                  checked={prefs.sound}
                  onChange={toggleSound}
                />
                <Switch
                  label={copy.pause.music}
                  checked={prefs.music}
                  onChange={(music) => {
                    setMusic(music);
                    if (music) award("music");
                  }}
                />
                <Switch
                  label={copy.pause.effects}
                  checked={prefs.effects}
                  onChange={setEffects}
                />
              </div>

              <section aria-labelledby="pause-achievements" className="p-4">
                <h3
                  id="pause-achievements"
                  className="mb-3 flex items-baseline justify-between text-xs font-bold tracking-widest text-ink-muted uppercase"
                >
                  {copy.achievements.heading}
                  <span data-achievements className="tabular-nums">
                    {prefs.achievements.length}/{ACHIEVEMENTS.length}
                  </span>
                </h3>
                <ul className="space-y-3">
                  {ACHIEVEMENTS.map((id) => {
                    const unlocked = prefs.achievements.includes(id);
                    return (
                      <li key={id} className="flex gap-3">
                        <PixelIcon
                          grid={unlocked ? trophy : lock}
                          className={`mt-0.5 shrink-0 ${unlocked ? "text-brand" : "text-ink-muted"}`}
                        />
                        {unlocked ? (
                          <p>
                            <strong className="block">{items[id].title}</strong>
                            <span className="text-ink-muted">
                              {items[id].description}
                            </span>
                          </p>
                        ) : (
                          <p className="text-ink-muted">
                            <span aria-hidden="true">???</span>
                            <span className="sr-only">
                              {copy.achievements.locked}
                            </span>
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
