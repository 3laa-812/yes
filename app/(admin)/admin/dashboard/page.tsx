import db from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { DollarSign, ShoppingBag, Package, Users } from "lucide-react";

async function getStats() {
  const totalRevenue = await db.order.aggregate({
    _sum: {
      total: true,
    },
  });

  const totalOrders = await db.order.count();
  const totalProducts = await db.product.count();
  const totalUsers = await db.user.count();

  return {
    revenue: totalRevenue._sum.total || 0,
    orders: totalOrders,
    products: totalProducts,
    users: totalUsers,
  };
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold">
            {formatPrice(Number(stats.revenue))}
          </div>
          <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Orders</h3>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold">+{stats.orders}</div>
          <p className="text-xs text-muted-foreground">
            +180.1% from last month
          </p>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Products</h3>
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold">+{stats.products}</div>
          <p className="text-xs text-muted-foreground">+19% from last month</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Active Now</h3>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold">+{stats.users}</div>
          <p className="text-xs text-muted-foreground">+201 since last hour</p>
        </div>
      </div>
    </div>
  );
}
