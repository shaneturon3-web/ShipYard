import Link from "next/link";
import { getDictionary, isLocale, localePath, type Locale } from "@shared/i18n";
import { notFound } from "next/navigation";

/** Phase 04 — premium clinical landing shell (dictionary-driven, no inline copy). */
export default async function QPCVirtualClinic({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const content = getDictionary(locale);

  return (
    <div className="qpc-virtuelle-shell">
      <header className="qpc-virtuelle-header">
        <h1>{content.heroTitle}</h1>
        <p className="qpc-virtuelle-subtitle">{content.heroSubtitle}</p>

        <div className="qpc-virtuelle-cta">
          <Link className="qpc-virtuelle-btn" href={localePath(locale, "/book")}>
            {content.bookingBtn}
          </Link>
        </div>

        <footer className="qpc-virtuelle-footer">
          <blockquote>&ldquo;{content.disclaimer}&rdquo;</blockquote>
        </footer>
      </header>
    </div>
  );
}
