import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { GuestAccountForm } from "./GuestAccountForm";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: "Order Success | YES",
  description:
    "Your YES order has been placed successfully. View your order details or continue shopping stylish men’s wear.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderId = params.orderId as string;
  const t = await getTranslations("Checkout");

  let order = null;
  if (orderId) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
  }

  const isGuestOrder = order && !order.userId;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t("orderConfirmed")}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        {t("thankYouPurchase")}
        {orderId ? ` #${orderId.slice(-6)}` : ""}
      </p>

      {isGuestOrder && (
        <div className="w-full max-w-sm mt-8">
          <GuestAccountForm orderId={orderId} />
        </div>
      )}

      <div className="mt-8 flex gap-4">
        {orderId && !isGuestOrder && (
          <Button asChild>
            <Link href={`/orders/${orderId}`}>{t("viewOrder")}</Link>
          </Button>
        )}
        <Button variant={isGuestOrder ? "default" : "outline"} asChild>
          <Link href="/">{t("continueShopping")}</Link>
        </Button>
      </div>
    </div>
  );
}
