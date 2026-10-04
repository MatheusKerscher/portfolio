import type { Locale } from "../../locales";
import pt from "./pt";

export type InspectorDictionary = typeof pt;

const dictionaries: Record<Locale, InspectorDictionary> = { pt };

export const inspectorDictionaryFor = (locale: Locale) => dictionaries[locale];
