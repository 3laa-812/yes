import { StorefrontShell } from "@/components/storefront/StorefrontShell";

export const dynamic = "force-dynamic";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StorefrontShell>{children}</StorefrontShell>
  );
}