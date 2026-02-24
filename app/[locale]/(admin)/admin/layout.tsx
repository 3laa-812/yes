import { AdminProviders } from "@/components/providers/AdminProviders";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <AdminProviders locale={locale}>
      {children}
    </AdminProviders>
  );
}
