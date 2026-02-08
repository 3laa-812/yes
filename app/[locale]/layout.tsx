import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });
const cairo = Cairo({ subsets: ["arabic"] });

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
  const fontClass =
    locale === "ar" ? cairo.className : plusJakartaSans.className;

  return (
    <html lang={locale} dir={dir}>
      <body className={`${fontClass} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
