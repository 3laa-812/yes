import type { Metadata } from "next";
import { AuthProviders } from "@/components/providers/AuthProviders";

export const metadata: Metadata = {
  title: "YES Auth",
  description: "Authentication area for YES administrators.",
  robots: {
    index: false,
    follow: false,
  },
};

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

