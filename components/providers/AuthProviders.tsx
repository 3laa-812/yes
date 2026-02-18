import {ReactNode} from "react";
import {IntlProvider} from "@/components/providers/IntlProvider";
import {Toaster} from "sonner";

interface AuthProvidersProps {
  locale: string;
  children: ReactNode;
}

export async function AuthProviders({locale, children}: AuthProvidersProps) {
  return (
    <IntlProvider
      locale={locale}
      namespaces={["Auth", "Common", "LanguageSwitcher", "Navbar"]}
    >
      {children}
      <Toaster richColors />
    </IntlProvider>
  );
}

