import { dictionaryFor } from "../data/dictionaries";
import { getLocale } from "../data/dictionaries/server";
import { languageOptions } from "../data/locales";
import { site } from "../data/site";
import LanguageSwitch from "./language-switch";
import ProfileLinks from "./profile-links";
import SkinEasterEgg from "./skin-easter-egg";

export default async function Footer() {
  const locale = await getLocale();
  const dict = dictionaryFor(locale);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-line px-6 py-8 lg:px-8">
      {/*
        Right padding between lg and xl: the fixed back-to-top button would cover the icons. Below
        lg the footer is a centred column, and that button only shows while scrolling up.
      */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 pr-16 max-lg:flex-col max-lg:justify-center max-lg:gap-2 max-lg:pr-0 xl:pr-0">
        <div className="flex items-center gap-1">
          <p className="text-sm text-ink-muted">
            © {currentYear} {site.name}
          </p>
          <SkinEasterEgg label={dict.skin.toggle} />
        </div>

        <div className="flex items-center gap-4 max-lg:gap-1">
          {/* Also here: below `md` the one of the navbar is inside a menu that needs JavaScript. */}
          <LanguageSwitch
            label={dict.nav.language}
            options={languageOptions(locale)}
          />
          <ProfileLinks ids={["github", "linkedin"]} />
        </div>
      </div>
    </footer>
  );
}
