import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import db from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

async function getOrders() {
  return await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
    take: 20,
  });
}

export default async function OrdersPage() {
  const orders = await getOrders();
  const t = await getTranslations("Storefront.Orders");
  const tStatus = await getTranslations("Storefront.Status");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentOrders")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t("orderId")}</TableHead>
                <TableHead className="text-start">{t("date")}</TableHead>
                <TableHead className="text-start">{t("status")}</TableHead>
                <TableHead className="text-start">{t("total")}</TableHead>
                <TableHead className="text-end">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.id.slice(-6)}
                  </TableCell>
                  <TableCell>
                    {format(order.createdAt, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "DELIVERED"
                          ? "default"
                          : order.status === "CANCELLED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {tStatus(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                  <TableCell className="text-end">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/orders/${order.id}`}>
                        {t("viewDetails")}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-500"
                  >
                    {t("noOrders")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
