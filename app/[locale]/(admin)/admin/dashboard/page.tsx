import { getTranslations } from "next-intl/server";
import { ar, enUS } from "date-fns/locale";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import db from "@/lib/db";
import { Banknote, Package, ShoppingBag, Users } from "lucide-react";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import {
  RevenueChart,
  OrdersChart,
  StatusChart,
} from "@/components/admin/dashboard/ChartComponents";
import { formatCurrency } from "@/lib/utils";

async function getStats(locale: string) {
  const dateLocale = locale === "ar" ? ar : enUS;

  // Calculate date ranges
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);
  const sevenDaysAgo = subDays(today, 7);

  // Parallel data fetching
  const [
    totalRevenueResult,
    totalOrders,
    totalProducts,
    totalUsers,
    recentOrders,
    orderStatusGroups,
  ] = await Promise.all([
    db.order.aggregate({
      _sum: { total: true },
      where: {
        paymentStatus: "PAID",
      },
    }),
    db.order.count(),
    db.product.count({ where: { stock: { gt: 0 } } }), // Active products
    db.user.count(),
    db.order.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        paymentStatus: "PAID", // Only count paid orders for revenue chart
      },
      select: {
        createdAt: true,
        total: true,
      },
    }),
    db.order.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
  ]);

  const revenue = totalRevenueResult._sum.total || 0;

  // Process data for charts

  // 1. Revenue Chart Data (Last 7 days)
  const revenueMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const key = format(date, "MMM dd", { locale: dateLocale });
    revenueMap[key] = 0;
  }

  recentOrders.forEach((order: any) => {
    const key = format(order.createdAt, "MMM dd", { locale: dateLocale });
    if (revenueMap[key] !== undefined) {
      revenueMap[key] += Number(order.total);
    }
  });

  const revenueChartData = Object.entries(revenueMap).map(([name, total]) => ({
    name,
    total,
  }));

  // 2. Orders Chart Data (Last 7 days count)
  // Re-query or reuse recentOrders if we want to count all orders regardless of payment status
  // For simplicity using recentOrders (paid) or we can do another query.
  // Let's assume we want ALL orders for the orders chart, not just paid.
  // We can just fetch all orders for the last 7 days.
  const allRecentOrders = await db.order.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });

  const ordersMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const key = format(date, "EEE", { locale: dateLocale }); // Mon, Tue...
    ordersMap[key] = 0;
  }

  allRecentOrders.forEach((order: any) => {
    const key = format(order.createdAt, "EEE", { locale: dateLocale });
    if (ordersMap[key] !== undefined) {
      ordersMap[key]++;
    }
  });

  const ordersChartData = Object.entries(ordersMap).map(([name, orders]) => ({
    name,
    orders,
  }));

  // 3. Status Chart Data
  const statusColors: Record<string, string> = {
    PENDING: "#fbbf24", // amber-400
    CONFIRMED: "#3b82f6", // blue-500
    SHIPPED: "#8b5cf6", // violet-500
    DELIVERED: "#22c55e", // green-500
    CANCELLED: "#ef4444", // red-500
  };

  const statusChartData = orderStatusGroups.map((group: any) => ({
    name: group.status,
    value: group._count._all,
    color: statusColors[group.status] || "#9ca3af", // gray-400 default
  }));

  return {
    revenue,
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

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const stats = await getStats(locale);
  const t = await getTranslations("Admin");

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
        <p className="text-muted-foreground">{t("overview")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("totalRevenue")}
          value={formatCurrency(Number(stats.revenue), locale)}
          description={t("lifetime")}
          icon={<Banknote className="h-4 w-4 text-muted-foreground" />}
          index={0}
          trend="up"
        />
        <StatsCard
          title={t("totalOrders")}
          value={`+${stats.orders}`}
          description={t("lifetime")}
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
          index={1}
          trend="up"
        />
        <StatsCard
          title={t("products")}
          value={`+${stats.products}`}
          description={t("active")}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          index={2}
          trend="neutral"
        />
        <StatsCard
          title={t("customers")}
          value={`+${stats.users}`}
          description={t("registered")}
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
