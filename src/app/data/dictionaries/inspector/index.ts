import type { Locale } from "../../locales";
import en from "./en";
import pt from "./pt";

export type InspectorDictionary = typeof pt;

const dictionaries: Record<Locale, InspectorDictionary> = { pt, en };

export const inspectorDictionaryFor = (locale: Locale) => dictionaries[locale];
