import { getDictionary } from "../data/dictionaries/server";
import { social, type SocialId } from "../data/site";
import { SocialIcon } from "./social-icons";

type ProfileLinksProps = { ids: SocialId[] };

/**
 * Icon-only links to the profiles, in the footer and in the menu. They are siblings without a
 * wrapper, laid out by their parent. Below `lg` each one is a 44 px touch target.
 */
export default async function ProfileLinks({ ids }: ProfileLinksProps) {
  const { layout } = await getDictionary();

  return ids.map(social).map((link) => (
    <a
      key={link.id}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink-muted transition-[color,opacity] duration-200 hover:text-ink max-lg:flex max-lg:h-11 max-lg:w-11 max-lg:items-center max-lg:justify-center"
      aria-label={layout.profileOf(link.name)}
      title={link.name}
    >
      <SocialIcon id={link.id} />
    </a>
  ));
}
