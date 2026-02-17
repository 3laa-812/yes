import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages as getMessagesBase,
  getTranslations as getTranslationsBase,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { RamadanProvider } from "@/components/global/RamadanContext";
import { RamadanDecorations } from "@/components/global/RamadanDecorations";
import { PublicSpeedInsights } from "@/components/global/PublicSpeedInsights";
import { cache } from "react";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });
const cairo = Cairo({ subsets: ["arabic"] });

const getMessages = cache(() => getMessagesBase());
const getMetadataTranslations = cache(() => getTranslationsBase("Metadata"));

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMetadataTranslations();
  return {
    title: t("title"),
    description: t("description"),
  };
}

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
          <RamadanProvider>
            <RamadanDecorations />
            {children}
            <Toaster richColors />
            <PublicSpeedInsights />
          </RamadanProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
