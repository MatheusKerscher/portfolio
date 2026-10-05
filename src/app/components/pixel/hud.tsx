import { useEffect, useRef } from "react";
import { play } from "@/lib/pixel-audio";
import { INSPECTOR_KEY } from "@/lib/pixel-prefs";
import type { PixelDictionary } from "../../data/dictionaries/pixel";
import { sections, type SectionKey } from "../../data/site";
import PixelIcon from "../pixel-icon";
import { lock, trophy } from "../pixel-icons";
import { award } from "./achievements";
import { announceStage, clearNotices, useNotices } from "./notices";

const SEGMENTS = 20;
const STAGES = Object.keys(sections) as SectionKey[];

/** "00" for the hero, then the number each section already shows in its label. */
const numberOf = (stage: SectionKey) =>
  String(STAGES.indexOf(stage)).padStart(2, "0");

/**
 * The HUD of the 8-bit skin: an XP bar under the navbar that fills with the scroll, a notice
 * when the section changes, the toasts of the achievements and the hint of the locked Inspector.
 * Nothing here takes a click.
 */
export default function Hud({ copy }: { copy: PixelDictionary }) {
  const bar = useRef<HTMLDivElement>(null);
  const { stage, toasts, hint } = useNotices();

  useEffect(() => {
    const scenery = document.querySelector<HTMLElement>(".px-scenery");
    let frame = 0;
    const measure = () => {
      frame = 0;
      const end = document.documentElement.scrollHeight - window.innerHeight;
      const filled =
        end > 0 ? Math.round((window.scrollY / end) * SEGMENTS) : 0;
      bar.current?.style.setProperty("--xp", String(filled));
      bar.current?.setAttribute("data-xp", String(filled));
      // On the layer, not on the root: a custom property is inherited by everything below it.
      scenery?.style.setProperty(
        "--px-scroll",
        String(Math.round(window.scrollY)),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    const visited = new Set<string>();
    let current: string | null = null;
    // The current section is the one that crosses the middle of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.target.id === current) continue;
          const first = current === null;
          current = entry.target.id;
          announceStage(current as SectionKey);
          if (!first) play("stage");
          visited.add(current);
          if (visited.size === STAGES.length) award("explorer");
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    document
      .querySelectorAll(".stack-slot")
      .forEach((slot) => observer.observe(slot));
    return () => {
      observer.disconnect();
      clearNotices();
    };
  }, []);

  return (
    <>
      <div ref={bar} aria-hidden="true" data-xp="0" className="px-xp">
        <i />
      </div>
      <div className="px-notices">
        {/* The headings of the page already say where one is: the notice is decoration. */}
        {stage && (
          <p key={stage} aria-hidden="true" className="px-notice px-stage">
            {copy.stage(numberOf(stage), copy.stages[stage])}
          </p>
        )}
        {/* Always in the page, so what is added to it is announced. */}
        <div role="status" className="px-toasts">
          {toasts.map((id) => (
            <p key={id} className="px-notice px-toast">
              <PixelIcon grid={trophy} className="text-brand" />
              <span>
                <span className="px-toast-label">
                  {copy.achievements.unlocked}
                </span>
                <strong>{copy.achievements.items[id].title}</strong>
                {id === INSPECTOR_KEY && (
                  <span className="px-toast-reward">
                    {copy.inspector.unlocked}
                  </span>
                )}
              </span>
            </p>
          ))}
          {hint > 0 && (
            <p key={hint} className="px-notice px-toast">
              <PixelIcon grid={lock} className="text-ink-muted" />
              <span>
                <span className="px-toast-label">{copy.inspector.locked}</span>
                <strong>{copy.inspector.hint}</strong>
              </span>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
