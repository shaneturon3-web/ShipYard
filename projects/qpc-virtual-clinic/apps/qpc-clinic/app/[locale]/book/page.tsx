import { notFound } from "next/navigation";
import { getMessages, isLocale, type Locale } from "@shared/i18n";
import { BookForm } from "./book-form";

const DEMO_SLOTS = [
  {
    slotId: "stub-1",
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 3_600_000).toISOString(),
  },
];

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getMessages(locale);

  return (
    <>
      <h1>{t.book.title}</h1>
      <p>{t.book.subtitle}</p>
      <BookForm
        locale={locale}
        providerId="default-provider"
        slots={DEMO_SLOTS}
        labels={t.book}
      />
    </>
  );
}
