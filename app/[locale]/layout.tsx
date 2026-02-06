import type { Metadata } from "next";
// import { Montserrat } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

// const montserrat = Montserrat({
//   variable: "--font-montserrat",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "YES",
  description: "For Men's Wear",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className={`font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
