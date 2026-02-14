import db from "@/lib/db";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

async function getOrder(id: string, userId: string) {
  return await db.order.findUnique({
    where: { id, userId }, // Ensure user owns the order
    include: {
      items: { include: { product: true } },
      shippingAddress: true,
    },
  });
}

const STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default async function OrderDetailsPage({ params }: Props) {
  const session = await auth();
  if (!session?.user || !session.user.id) return redirect("/api/auth/signin");

  const { id, locale } = await params;
  const order = await getOrder(id, session.user.id);

  if (!order) notFound();

  const t = await getTranslations("Storefront.Account");
  const tOrder = await getTranslations("Storefront.OrderDetails");
  const tStatus = await getTranslations("Storefront.Status");
  const tProduct = await getTranslations("Storefront.Product");

  const dateLocale = locale === "ar" ? ar : enUS;

  const currentStepIndex =
    STEPS.indexOf(order.status) === -1 && order.status === "CANCELLED"
      ? -1
      : STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/account/orders"
          className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> {t("backToOrders")}
        </Link>
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <h1 className="text-3xl font-bold">
            {tOrder("title")} #{order.id.slice(-8)}
          </h1>
          <p className="text-gray-500">
            {t("placedOn")}{" "}
            {format(new Date(order.createdAt), "MMM d, yyyy", {
              locale: dateLocale,
            })}
          </p>
        </div>
      </div>

      {/* Tracker */}
      <div className="mb-10 overflow-x-auto pb-4">
        {isCancelled ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg font-medium border border-red-100">
            {t("cancelledMessage")}
          </div>
        ) : (
          <div className="flex items-center justify-between min-w-[600px]">
            {STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step}
                  className="flex flex-col items-center gap-2 relative flex-1"
                >
                  {idx !== 0 && (
                    <div
                      className={`absolute top-3 right-1/2 w-full h-[2px] -translate-y-1/2 -z-10 ${
                        idx <= currentStepIndex ? "bg-black" : "bg-gray-200"
                      }`}
                    />
                  )}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-black text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${isCurrent ? "text-black" : "text-gray-500"}`}
                  >
                    {tStatus(step)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("items")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="relative h-24 w-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {item.product.images && (
                      <Image
                        src={JSON.parse(item.product.images)[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {tProduct("size")}: {item.selectedSize} |{" "}
                      {tProduct("color")}: {item.selectedColor}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm">
                        {tOrder("qty")}: {item.quantity}
                      </div>
                      <div className="font-medium">
                        {formatCurrency(Number(item.price), locale)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("subtotal")}</span>
                  <span>{formatCurrency(Number(order.total), locale)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t("shipping")}</span>
                  <span>{t("free")}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>{t("total")}</span>
                  <span>{formatCurrency(Number(order.total), locale)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("deliveryDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-1">
                  {t("address")}
                </h4>
                {order.shippingAddress && (
                  <p className="text-sm text-gray-500">
                    {order.shippingAddress.name}
                    <br />
                    {order.shippingAddress.street}
                    <br />
                    {order.shippingAddress.city}
                    <br />
                    {order.shippingAddress.country}
                    <br />
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-1">
                  {t("paymentMethod")}
                </h4>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  {order.paymentMethod}
                  <Badge
                    variant={
                      order.paymentStatus === "PAID" ? "default" : "outline"
                    }
                    className="text-[10px] h-5"
                  >
                    {order.paymentStatus}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
