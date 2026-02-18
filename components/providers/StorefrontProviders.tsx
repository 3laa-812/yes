import {ReactNode} from "react";
import {IntlProvider} from "@/components/providers/IntlProvider";
import {RamadanProvider} from "@/components/global/RamadanContext";
import {RamadanDecorations} from "@/components/global/RamadanDecorations";
import {Toaster} from "sonner";
import {AnalyticsClient} from "@/components/global/AnalyticsClient";
import {WhatsAppButton} from "@/components/storefront/WhatsAppButton";

interface StorefrontProvidersProps {
  locale: string;
  children: ReactNode;
}

export async function StorefrontProviders({
  locale,
  children,
}: StorefrontProvidersProps) {
  return (
    <IntlProvider
      locale={locale}
      namespaces={[
        "HomePage",
        "Hero",
        "Navbar",
        "Footer",
        "Cart",
        "Checkout",
        "Storefront",
        "Common",
        "LanguageSwitcher",
        "Product",
      ]}
    >
      <RamadanProvider>
        <RamadanDecorations />
        {children}
        <Toaster richColors />
        <WhatsAppButton />
        <AnalyticsClient />
      </RamadanProvider>
    </IntlProvider>
  );
}

