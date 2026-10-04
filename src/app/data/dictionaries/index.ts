import type { Locale } from "../locales";
import pt from "./pt";

/** The shape every language has to satisfy. */
export type Dictionary = typeof pt;

const dictionaries: Record<Locale, Dictionary> = { pt };

/**
 * The copy of a language. Server Components use `getDictionary()` of `./server` instead, which
 * reads the language of the route; this one is for route handlers, metadata and tests, which
 * are given the language.
 */
export const dictionaryFor = (locale: Locale) => dictionaries[locale];
