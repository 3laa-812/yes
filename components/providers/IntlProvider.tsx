import {ReactNode} from "react";
import {NextIntlClientProvider} from "next-intl";
import {loadMessages} from "@/lib/i18n";

interface IntlProviderProps {
  locale: string;
  namespaces: string[];
  children: ReactNode;
}

export async function IntlProvider({
  locale,
  namespaces,
  children,
}: IntlProviderProps) {
  const messages = await loadMessages(locale, namespaces);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

