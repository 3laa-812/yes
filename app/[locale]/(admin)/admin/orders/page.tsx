import db from "@/lib/db";
import { getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { OrdersTableClient } from "@/components/admin/orders/OrdersTableClient";

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

export default async function AdminOrdersPage({
  params,
}: {
  params: { locale: string };
}) {
  const orders = await getOrders();
  const locale = await getLocale();
  const session = await auth();

  return (
    <OrdersTableClient
      orders={orders}
      locale={locale}
      currentRole={session?.user?.role}
    />
  );
}
