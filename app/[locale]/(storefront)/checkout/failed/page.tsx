import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: "Payment Failed | YES",
  description:
    "Your payment could not be processed. Review your details or choose another method to complete your YES order.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FailedPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations("Checkout");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <XCircle className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t("paymentFailed")}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        {t("paymentFailedDesc")}
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/checkout">{t("tryAgain")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">{t("backHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
