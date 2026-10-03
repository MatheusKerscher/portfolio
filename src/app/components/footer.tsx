import { layoutCopy, social } from "../data/site";
import { SocialIcon } from "./social-icons";

const links = [social("github"), social("linkedin")];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-line px-6 py-8 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          {layoutCopy.copyright(currentYear)}
        </p>

        <div className="flex items-center gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-muted transition-colors duration-200 hover:text-ink"
              aria-label={layoutCopy.profileOf(link.name)}
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
