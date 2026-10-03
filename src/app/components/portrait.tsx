import Image from "next/image";
import { cn } from "@/lib/utils";
import { heroCopy, site } from "../data/site";

/**
 * The portrait of the hero. Its sizes are multiples of 46 px, half the grid of the 92 px sprite,
 * so the pixel-art version keeps whole pixels at every breakpoint.
 */
export default function Portrait({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-[138px] w-[138px] shrink-0 sm:h-[276px] sm:w-[276px] xl:h-[368px] xl:w-[368px]",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-2 translate-y-2 bg-pixel-yellow sm:translate-x-3 sm:translate-y-3"
      />
      {/* Above the fold and a candidate for LCP: fetched eagerly and with high priority. */}
      <Image
        src={site.portrait.src}
        alt={heroCopy.portraitAlt}
        width={site.portrait.width}
        height={site.portrait.height}
        sizes="(min-width: 1280px) 368px, (min-width: 640px) 276px, 138px"
        fetchPriority="high"
        loading="eager"
        className="relative h-full w-full border border-ink object-cover"
      />
    </div>
  );
}
