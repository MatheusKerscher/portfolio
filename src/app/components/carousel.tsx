import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { carouselCopy } from "../data/site";
import CarouselControls from "./carousel-controls";

type CarouselProps = {
  /** Id of the scrollable region; the controls point at it. */
  id: string;
  /** Accessible name of the region, e.g. "Projetos". */
  label: string;
  /** Rendered next to the controls, usually the heading of the carousel. */
  header?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Horizontal list on native scroll snap. It is a plain scrollable region, so it works before
 * hydration and without JavaScript, by touch, trackpad and keyboard; the controls only add
 * buttons. The items stay a list for assistive technology.
 */
export function Carousel({
  id,
  label,
  header,
  children,
  className,
}: CarouselProps) {
  return (
    <div className={className}>
      <div className="mb-6 flex items-end justify-between gap-6">
        <div className="min-w-0">{header}</div>
        <CarouselControls
          viewportId={id}
          previousLabel={carouselCopy.previous(label)}
          nextLabel={carouselCopy.next(label)}
        />
      </div>
      <div
        id={id}
        role="region"
        aria-label={label}
        tabIndex={0}
        data-carousel
        className="carousel-viewport"
      >
        <ul className="carousel-track">{children}</ul>
      </div>
    </div>
  );
}

export function CarouselItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <li className={cn("carousel-item", className)}>{children}</li>;
}
