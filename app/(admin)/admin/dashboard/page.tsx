import db from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { DollarSign, ShoppingBag, Package, Users } from "lucide-react";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import {
  OrdersChart,
  RevenueChart,
  StatusChart,
} from "@/components/admin/dashboard/ChartComponents";

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
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store&apos;s performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(Number(stats.revenue))}
          description="+20.1% from last month"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          index={0}
          trend="up"
        />
        <StatsCard
          title="Orders"
          value={`+${stats.orders}`}
          description="+180.1% from last month"
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
          index={1}
          trend="up"
        />
        <StatsCard
          title="Products"
          value={`+${stats.products}`}
          description="+19% from last month"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          index={2}
          trend="neutral"
        />
        <StatsCard
          title="Active Users"
          value={`+${stats.users}`}
          description="+201 since last hour"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          index={3}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <RevenueChart />
        <OrdersChart />
        <StatusChart />
      </div>
    </div>
  );
}
