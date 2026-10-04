/**
 * The languages of the site. A key is the URL segment under `app/[lang]`; the default language
 * is served without it, through the rewrites of `next.config.ts`.
 */
export const locales = {
  pt: { htmlLang: "pt-BR", openGraph: "pt_BR", path: "", label: "PT" },
} as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = "pt";

export const localeCodes = Object.keys(locales) as Locale[];

export const hasLocale = (value: string): value is Locale =>
  Object.hasOwn(locales, value);

/** `generateStaticParams` of everything under `app/[lang]`. */
export const localeParams = () => localeCodes.map((lang) => ({ lang }));

/** The home page of a language: `/` for the default one, `/en` for English. */
export const localePath = (locale: Locale, path = "") =>
  `${locales[locale].path}${path}` || "/";
