import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import {
  dictionary,
  DEFAULT_DICTIONARY_LOCALE,
  resolveDictionary,
  type DictionaryEntry,
  type DictionaryLocale,
} from "./dictionary";
import type { Locale, Messages } from "./types";
import { DEFAULT_LOCALE, LOCALES } from "./types";

export {
  DEFAULT_LOCALE,
  LOCALES,
  dictionary,
  DEFAULT_DICTIONARY_LOCALE,
  resolveDictionary,
};
export type { Locale, Messages, DictionaryEntry, DictionaryLocale };

const catalogs: Record<Locale, Messages> = { en, fr, es };

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? catalogs[DEFAULT_LOCALE];
}

export function localePath(locale: Locale, path = ""): string {
  const base = `/${locale}`;
  return path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;
}

/** Consumer-facing shell copy — Phase 03 dictionary layer. */
export function getDictionary(locale: Locale): DictionaryEntry {
  return dictionary[locale] ?? dictionary[DEFAULT_DICTIONARY_LOCALE];
}
