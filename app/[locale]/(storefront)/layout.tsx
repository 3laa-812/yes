import {StorefrontShell} from "@/components/storefront/StorefrontShell";
import {StorefrontProviders} from "@/components/providers/StorefrontProviders";

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <StorefrontProviders locale={locale}>
      <StorefrontShell>{children}</StorefrontShell>
    </StorefrontProviders>
  );
}