"use client";

type LanguageSwitchProps = {
  /** Accessible name of the group, e.g. "Idioma". */
  label: string;
  options: {
    code: string;
    /** What is shown: "PT", "EN". */
    label: string;
    /** The language named in itself: "Português", "English". */
    name: string;
    /** BCP 47 tag of the language the link leads to. */
    hrefLang: string;
    href: string;
    current: boolean;
  }[];
  className?: string;
};

/**
 * The same page in the other language. Plain links: a change of language is a full page load in
 * any case, and they work without JavaScript. The click keeps the section being read, because
 * the anchors are the same in every language.
 */
export default function LanguageSwitch({
  label,
  options,
  className = "",
}: LanguageSwitchProps) {
  return (
    <ul
      aria-label={label}
      data-language-switch
      className={`flex items-center text-xs font-bold tracking-widest ${className}`}
    >
      {options.map((option, index) => (
        <li key={option.code} className="flex items-center">
          {index > 0 && (
            <span aria-hidden="true" className="text-ink-muted">
              ·
            </span>
          )}
          <a
            href={option.href}
            hrefLang={option.hrefLang}
            lang={option.hrefLang}
            title={option.name}
            aria-current={option.current ? "true" : undefined}
            onClick={(event) => {
              event.currentTarget.href = option.href + window.location.hash;
            }}
            className="flex min-h-8 min-w-8 items-center justify-center text-ink-muted transition-colors duration-200 hover:text-brand aria-[current]:text-ink aria-[current]:underline aria-[current]:decoration-brand aria-[current]:decoration-2 aria-[current]:underline-offset-4"
          >
            {option.label}
            <span className="sr-only"> — {option.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
