import type { Locale } from "../../locales";
import en from "./en";
import pt from "./pt";

export type PixelDictionary = typeof pt;

const dictionaries: Record<Locale, PixelDictionary> = { pt, en };

export const pixelDictionaryFor = (locale: Locale) => dictionaries[locale];
