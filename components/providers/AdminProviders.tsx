import {ReactNode} from "react";
import {IntlProvider} from "@/components/providers/IntlProvider";
import {Toaster} from "sonner";
import {AnalyticsClient} from "@/components/global/AnalyticsClient";

interface AdminProvidersProps {
  locale: string;
  children: ReactNode;
}

export async function AdminProviders({
  locale,
  children,
}: AdminProvidersProps) {
  return (
    <IntlProvider
      locale={locale}
      namespaces={["Admin", "Common", "LanguageSwitcher", "Navbar"]}
    >
      {children}
      <Toaster richColors />
      <AnalyticsClient />
    </IntlProvider>
  );
}

