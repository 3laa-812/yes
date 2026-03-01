import type { Metadata } from "next";
import { AdminProviders } from "@/components/providers/AdminProviders";

export const metadata: Metadata = {
  title: "YES Admin",
  description:
    "YES admin dashboard for managing products, orders, customers and store settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <AdminProviders locale={locale}>{children}</AdminProviders>;
}
