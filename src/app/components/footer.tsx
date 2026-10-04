import { getDictionary } from "../data/dictionaries/server";
import { site, social } from "../data/site";
import SkinEasterEgg from "./skin-easter-egg";
import { SocialIcon } from "./social-icons";

const links = [social("github"), social("linkedin")];

export default async function Footer() {
  const dict = await getDictionary();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-line px-6 py-8 lg:px-8">
      {/* Right padding below xl: the fixed back-to-top button would cover the icons. */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 pr-16 xl:pr-0">
        <div className="flex items-center gap-1">
          <p className="text-sm text-ink-muted">
            © {currentYear} {site.name}
          </p>
          <SkinEasterEgg label={dict.skin.toggle} />
        </div>

        <div className="flex items-center gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-muted transition-colors duration-200 hover:text-ink"
              aria-label={dict.layout.profileOf(link.name)}
              title={link.name}
            >
              <SocialIcon id={link.id} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
