import { createContext, useContext } from "react";
import {
  inspectorDictionaryFor,
  type InspectorDictionary,
} from "../../data/dictionaries/inspector";
import { defaultLocale, type Locale } from "../../data/locales";

type InspectorContextValue = { locale: Locale; copy: InspectorDictionary };

/**
 * The language of the Inspector and its copy. The dictionaries of every language are part of
 * the Inspector chunk, which is fetched only when the panel is opened.
 */
export const inspectorValue = (locale: Locale): InspectorContextValue => ({
  locale,
  copy: inspectorDictionaryFor(locale),
});

export const InspectorContext = createContext(inspectorValue(defaultLocale));

export const useInspector = () => useContext(InspectorContext);
