import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders into one of the empty slots the root layout leaves in the navbar
 * (`<span data-px-slot>`), so a control of the runtime sits among the others without being part
 * of the first load. The runtime only renders in the browser, where the slot already exists.
 */
export default function Slot({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const target = document.querySelector(`[data-px-slot="${name}"]`);
  return target ? createPortal(children, target) : null;
}
