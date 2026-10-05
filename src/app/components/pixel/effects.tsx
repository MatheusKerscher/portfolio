import { useEffect, useRef } from "react";
import { motionAllowed } from "@/lib/pixel-prefs";

/** What answers a press with particles. */
const TARGET = 'a, button, label:has(input), [role="tab"], [data-px="sprite"]';

const BITS = 8;
const MAX_BURSTS = 4;
const BURST_TIME = 400;

/** Plays a one-shot animation class of `pixel.css` on an element, from its start. */
export function animate(element: Element | null, name: string, time: number) {
  if (!element || !motionAllowed()) return;
  element.classList.remove(name);
  // Reading the layout lets an animation that is still running start again.
  void element.getBoundingClientRect();
  element.classList.add(name);
  window.setTimeout(() => element.classList.remove(name), time);
}

/** Eight squares that fly out from a point, on the grid of the skin, and are removed. */
function burst(layer: HTMLElement | null, x: number, y: number) {
  if (!layer || layer.childElementCount >= MAX_BURSTS) return;
  const group = document.createElement("div");
  group.className = "px-burst";
  group.style.left = `${x}px`;
  group.style.top = `${y}px`;
  for (let index = 0; index < BITS; index += 1) {
    const bit = document.createElement("i");
    const angle = (index / BITS) * Math.PI * 2;
    const reach = index % 2 === 0 ? 28 : 40;
    bit.style.setProperty("--dx", `${Math.round(Math.cos(angle) * reach)}px`);
    bit.style.setProperty("--dy", `${Math.round(Math.sin(angle) * reach)}px`);
    group.append(bit);
  }
  layer.append(group);
  window.setTimeout(() => group.remove(), BURST_TIME);
}

/**
 * The page answers a press: particles where it lands, a jump of the sprite, a bump of a
 * carousel that is at its end and of the lock of the Inspector. None of it happens while the effects are off or the visitor has
 * asked for less motion.
 */
export default function Effects() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !motionAllowed()) return;
      if (event.target.closest(TARGET)) {
        burst(layer.current, event.clientX, event.clientY);
      }
    };

    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest(TARGET);
      // A press from the keyboard has no pointer: its particles come from the control.
      if (control && event.detail === 0 && motionAllowed()) {
        const box = control.getBoundingClientRect();
        burst(
          layer.current,
          box.left + box.width / 2,
          box.top + box.height / 2,
        );
      }

      animate(event.target.closest('[data-px="sprite"]'), "px-jump", 400);
      animate(event.target.closest('[data-px="lock"]'), "px-bump", 240);
      const end = event.target.closest(
        '[aria-controls^="carousel-"][aria-disabled="true"]',
      );
      if (end) {
        animate(
          document.getElementById(end.getAttribute("aria-controls") ?? ""),
          "px-bump",
          240,
        );
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  // Its children are added and removed by hand; React renders none.
  return <div ref={layer} aria-hidden="true" className="px-fx" />;
}
