import db from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

async function getOrders(userId: string) {
  return await db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });
}

interface OrdersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const session = await auth();
  if (!session?.user || !session.user.id) return redirect("/api/auth/signin");

  const { locale } = await params;
  const orders = await getOrders(session.user.id);
  const t = await getTranslations("Storefront.Account");
  const tOrder = await getTranslations("Storefront.OrderDetails");
  const tStatus = await getTranslations("Storefront.Status");

  const dateLocale = locale === "ar" ? ar : enUS;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("orders")}</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("noOrders")}</h2>
          <p className="text-gray-500 mb-6">{t("noOrdersDesc")}</p>
          <Button asChild>
            <Link href="/">{t("startShopping")}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50/50 flex flex-row items-center justify-between p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                  <div>
                    <p className="text-sm text-gray-500">
                      {tOrder("orderPlaced")}
                    </p>
                    <p className="font-medium">
                      {format(new Date(order.createdAt), "MMM d, yyyy", {
                        locale: dateLocale,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{tOrder("total")}</p>
                    <p className="font-medium">
                      {formatPrice(Number(order.total))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      #{tOrder("orderId")}
                    </p>
                    <p className="font-medium">{order.id.slice(-8)}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/account/orders/${order.id}`}>
                    {tOrder("viewDetails")}
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="space-y-1">
                    <p className="font-medium flex items-center gap-2">
                      {tOrder("status")}:
                      <Badge
                        variant={
                          order.status === "DELIVERED" ? "default" : "secondary"
                        }
                      >
                        {tStatus(order.status)}
                      </Badge>
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} {tOrder("items")}
                    </p>
                  </div>
                  <div className="flex -space-x-2 overflow-hidden">
                    {order.items.slice(0, 4).map((item: any) => (
                      <div
                        key={item.id}
                        className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 overflow-hidden relative"
                      >
                        {/* Using dummy image logic if product images are JSON */}
                        {/* Assuming item.product.images is stringified JSON */}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
