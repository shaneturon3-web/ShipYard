/** Human/Machine config — trilingual consumer dictionary (Phase 03). */

export type DictionaryLocale = "en" | "fr" | "es";

export type DictionaryEntry = {
  heroTitle: string;
  heroSubtitle: string;
  bookingBtn: string;
  disclaimer: string;
};

export const dictionary: Record<DictionaryLocale, DictionaryEntry> = {
  fr: {
    heroTitle: "Clinique Virtuelle PsyNova",
    heroSubtitle:
      "Soutien psychologique humain, adapté à votre réalité multiculturelle.",
    bookingBtn: "Prendre un rendez-vous sécurisé",
    disclaimer:
      "Le jugement clinique demeure l'entière responsabilité du professionnel agréé.",
  },
  en: {
    heroTitle: "PsyNova Virtual Clinic",
    heroSubtitle:
      "Human psychological support, tailored to your multicultural reality.",
    bookingBtn: "Secure Online Booking",
    disclaimer:
      "Clinical judgment always remains with the licensed professional.",
  },
  es: {
    heroTitle: "Clínica Virtual PsyNova",
    heroSubtitle:
      "Apoyo psicológico humano, adaptado a su realidad multicultural.",
    bookingBtn: "Reservar Cita Segura",
    disclaimer:
      "El juicio clínico sigue siendo responsabilidad exclusiva del profesional licenciado.",
  },
};

export const DEFAULT_DICTIONARY_LOCALE: DictionaryLocale = "fr";

export function resolveDictionary(lang?: string): DictionaryEntry {
  if (lang === "en" || lang === "fr" || lang === "es") {
    return dictionary[lang];
  }
  return dictionary[DEFAULT_DICTIONARY_LOCALE];
}
