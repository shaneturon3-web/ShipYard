import type en from "./locales/en.json";

export type Locale = "en" | "fr" | "es";

export const LOCALES: Locale[] = ["en", "fr", "es"];

export const DEFAULT_LOCALE: Locale = "fr";

export type Messages = typeof en;
