import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { hasLocale, type Locale } from "../locales";
import { dictionaryFor } from "./index";

/** The language of the route being rendered. An unknown one is a 404. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}

/** The copy of the route being rendered, for any Server Component, without a prop. */
export async function getDictionary() {
  return dictionaryFor(await getLocale());
}
