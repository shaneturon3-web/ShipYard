import { notFound } from "next/navigation";
import { getMessages, isLocale, LOCALES, type Locale } from "@shared/i18n";

export default async function LanguagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getMessages(raw as Locale);

  return (
    <section className="hero">
      <h1>{t.nav.languages}</h1>
      <p>
        {raw === "en" &&
          "We provide care in English, French, and Spanish across intake, scheduling, and follow-up."}
        {raw === "fr" &&
          "Nous offrons des soins en anglais, en français et en espagnol pour l'admission, la planification et le suivi."}
        {raw === "es" &&
          "Ofrecemos atención en inglés, francés y español en admisión, citas y seguimiento."}
      </p>
      <ul>
        {LOCALES.map((l) => (
          <li key={l}>{l.toUpperCase()}</li>
        ))}
      </ul>
    </section>
  );
}
