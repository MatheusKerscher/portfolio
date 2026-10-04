import { dictionaryFor } from "../data/dictionaries";
import { getLocale } from "../data/dictionaries/server";
import { languageOptions } from "../data/locales";
import { site, social } from "../data/site";
import LanguageSwitch from "./language-switch";
import SkinEasterEgg from "./skin-easter-egg";
import { SocialIcon } from "./social-icons";

const links = [social("github"), social("linkedin")];

export default async function Footer() {
  const locale = await getLocale();
  const dict = dictionaryFor(locale);
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
          {/* Also here: below `md` the one of the navbar is inside a menu that needs JavaScript. */}
          <LanguageSwitch
            label={dict.nav.language}
            options={languageOptions(locale)}
          />
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
