import {AuthProviders} from "@/components/providers/AuthProviders";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <AuthProviders locale={locale}>
      <section className="min-h-screen flex items-center justify-center bg-muted">
        {children}
      </section>
    </AuthProviders>
  );
}

