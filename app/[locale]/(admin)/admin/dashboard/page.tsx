import db from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { DollarSign, ShoppingBag, Package, Users } from "lucide-react";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import {
  OrdersChart,
  RevenueChart,
  StatusChart,
} from "@/components/admin/dashboard/ChartComponents";
import { subDays, format, startOfDay, endOfDay } from "date-fns";

async function getStats() {
  const totalRevenue = await db.order.aggregate({
    _sum: {
      total: true,
    },
    where: {
      status: { not: "CANCELLED" },
    },
  });

  const totalOrders = await db.order.count();
  const totalProducts = await db.product.count();
  const totalUsers = await db.user.count();

  // 1. Revenue Data (Last 7 Days)
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentOrders = await db.order.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
      status: { not: "CANCELLED" },
    },
    select: {
      createdAt: true,
      total: true,
    },
  });

  const revenueMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    revenueMap[format(date, "MMM dd")] = 0;
  }

  recentOrders.forEach((order: any) => {
    const dateKey = format(order.createdAt, "MMM dd");
    if (revenueMap[dateKey] !== undefined) {
      revenueMap[dateKey] += Number(order.total);
    }
  });

  const revenueChartData = Object.entries(revenueMap).map(([name, total]) => ({
    name,
    total,
  }));

  // 2. Orders Data (Last 7 Days count)
  const recentAllOrders = await db.order.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });

  const days = [];
  for (let i = 6; i >= 0; i--) {
    days.push(subDays(new Date(), i));
  }

  const ordersChartData = days.map((date) => {
    const dayName = format(date, "EEE");
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const count = recentAllOrders.filter(
      (o: any) => o.createdAt >= dayStart && o.createdAt <= dayEnd,
    ).length;
    return { name: dayName, orders: count };
  });

  // 3. Status Data
  const statusCounts = await db.order.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const statusColors: Record<string, string> = {
    PENDING: "#f59e0b", // Amber
    CONFIRMED: "#3b82f6", // Blue
    SHIPPED: "#10b981", // Emerald
    DELIVERED: "#6366f1", // Indigo
    CANCELLED: "#ef4444", // Red
  };

  const statusChartData = statusCounts.map((item: any) => ({
    name: item.status,
    value: item._count.status,
    color: statusColors[item.status] || "#9ca3af",
  }));

  if (statusChartData.length === 0) {
    statusChartData.push({ name: "No Orders", value: 1, color: "#e5e7eb" });
  }

  return {
    revenue: totalRevenue._sum.total || 0,
    orders: totalOrders,
    products: totalProducts,
    users: totalUsers,
    chartData: {
      revenue: revenueChartData,
      orders: ordersChartData,
      status: statusChartData,
    },
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
          description="Lifetime"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          index={0}
          trend="up"
        />
        <StatsCard
          title="Total Orders"
          value={`+${stats.orders}`}
          description="Lifetime"
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
          index={1}
          trend="up"
        />
        <StatsCard
          title="Products"
          value={`+${stats.products}`}
          description="Total active"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          index={2}
          trend="neutral"
        />
        <StatsCard
          title="Users"
          value={`+${stats.users}`}
          description="Registered"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          index={3}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <RevenueChart data={stats.chartData.revenue} />
        <OrdersChart data={stats.chartData.orders} />
        <StatusChart data={stats.chartData.status} />
      </div>
    </div>
  );
}
