import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getDictionary } from "../data/dictionaries/server";
import CarouselControls from "./carousel-controls";

type CarouselProps = {
  /** Id of the scrollable region; the controls point at it. */
  id: string;
  /** Accessible name of the region, e.g. "Projetos". */
  label: string;
  /** Rendered next to the controls, usually the heading of the carousel. */
  header?: ReactNode;
  /** Width of every item, a CSS length. The track also uses it to centre an item on a phone. */
  itemWidth: string;
  children: ReactNode;
  className?: string;
};

/**
 * Horizontal list on native scroll snap. It is a plain scrollable region, so it works before
 * hydration and without JavaScript, by touch, trackpad and keyboard; the controls only add
 * buttons. The items stay a list for assistive technology.
 *
 * Below `lg` the header takes the whole line and the controls go below the items: the row that
 * holds them dissolves (`contents`) and the controls are ordered last. They stay one element,
 * before the region in the HTML, so nothing changes from `lg` up.
 */
export async function Carousel({
  id,
  label,
  header,
  itemWidth,
  children,
  className,
}: CarouselProps) {
  const { carousel } = await getDictionary();

  return (
    <div
      className={cn("max-lg:flex max-lg:flex-col", className)}
      style={{ "--item-w": itemWidth } as CSSProperties}
    >
      <div className="mb-(--panel-gap-sm) flex items-end justify-between gap-6 max-lg:contents">
        <div className="min-w-0 max-lg:mb-(--panel-gap-sm)">{header}</div>
        <CarouselControls
          viewportId={id}
          previousLabel={carousel.previous(label)}
          nextLabel={carousel.next(label)}
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
