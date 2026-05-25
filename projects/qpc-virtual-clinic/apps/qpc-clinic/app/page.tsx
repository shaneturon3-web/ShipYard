import { redirect } from "next/navigation";
import { DEFAULT_DICTIONARY_LOCALE } from "@shared/i18n";

/** Root entry — Quebec default locale (fr). */
export default function RootPage() {
  redirect(`/${DEFAULT_DICTIONARY_LOCALE}`);
}
