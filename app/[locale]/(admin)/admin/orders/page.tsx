import db from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/app/[locale]/(admin)/actions";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

async function getOrders() {
  return db.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      shippingAddress: true,
    },
  });
}

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  const t = await getTranslations("Admin.Orders");
  const statusT = await getTranslations("Storefront.Status");
  const locale = await getLocale();
  const dateLocale = locale === "ar" ? ar : enUS;

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">{t("title")}</h1>
      </div>
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("orderId")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("customer")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("phone")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("status")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("method")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("payment")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("total")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("date")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {orders.map((order: any) => (
                <tr
                  key={order.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-medium">
                    #{order.id.slice(-6)}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {order.shippingAddress?.name ||
                          order.user?.name ||
                          t("guest")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {order.user?.email ||
                          order.shippingAddress?.email ||
                          ""}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    {order.shippingAddress?.phone || order.user?.phone || "-"}
                  </td>
                  <td className="p-4 align-middle">
                    <Badge
                      variant={
                        order.status === "DELIVERED" ? "default" : "secondary"
                      }
                    >
                      {/* Use Storefront translation for status to match */}
                      {statusT(order.status)}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">{order.paymentMethod}</td>
                  <td className="p-4 align-middle">
                    <Badge
                      variant={
                        order.paymentStatus === "PAID"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">
                    {formatCurrency(Number(order.total), locale)}
                  </td>
                  <td className="p-4 align-middle">
                    {format(new Date(order.createdAt), "MMM d, yyyy", {
                      locale: dateLocale,
                    })}
                  </td>
                  <td className="p-4 align-middle">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>
                        {t("details")}
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    {t("noOrders")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
