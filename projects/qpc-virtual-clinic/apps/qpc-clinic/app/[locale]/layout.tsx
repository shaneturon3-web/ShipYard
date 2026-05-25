import { notFound } from "next/navigation";
import { getMessages, isLocale, localePath, LOCALES, type Locale } from "@shared/i18n";
import Link from "next/link";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }, { locale: "es" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getMessages(locale);

  return (
    <>
      <header className="site-header">
        <strong>{t.meta.siteName}</strong>
        <nav>
          <Link href={localePath(locale)}>{t.nav.home}</Link>
          <Link href={localePath(locale, "/book")}>{t.nav.book}</Link>
          <Link href={localePath(locale, "/languages")}>{t.nav.languages}</Link>
        </nav>
        <div className="lang-switch" role="navigation" aria-label="Language">
          {LOCALES.map((l) => (
            <Link
              key={l}
              href={localePath(l)}
              aria-current={l === locale ? "true" : undefined}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">{t.footer.rights}</footer>
    </>
  );
}
