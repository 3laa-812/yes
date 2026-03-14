import { getTranslations } from "next-intl/server";
import { ar, enUS } from "date-fns/locale";
import { format, subDays, startOfDay, startOfMonth } from "date-fns";
import db from "@/lib/db";
import {
  Banknote,
  ShoppingBag,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import dynamic from "next/dynamic";
import { formatCurrency } from "@/lib/utils";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/admin/dashboard/DashboardSkeleton";

async function getStats(locale: string) {
  const dateLocale = locale === "ar" ? ar : enUS;

  // Calculate date ranges
  const today = new Date();
  const startOfTodayDate = startOfDay(today);
  const startOfMonthDate = startOfMonth(today);
  const sevenDaysAgo = subDays(today, 6); // 7 days including today

  // Parallel data fetching
  const [
    totalRevenueResult,
    todayRevenueResult,
    totalOrdersCount,
    confirmedOrdersCount,
    totalUsers,
    ordersTodayCount,
    ordersThisMonthCount,
    pendingPaymentsCount,
    recentOrders,
    orderStatusGroups,
    paymentMethodGroups,
  ] = await Promise.all([
    // Revenue = CONFIRMED orders only
    db.order.aggregate({
      _sum: { total: true },
      where: { status: "CONFIRMED" },
    }),
    // Today's revenue = CONFIRMED orders placed today
    db.order.aggregate({
      _sum: { total: true },
      where: { status: "CONFIRMED", createdAt: { gte: startOfTodayDate } },
    }),
    db.order.count(),
    db.order.count({ where: { status: "CONFIRMED" } }),
    db.user.count(),
    db.order.count({ where: { createdAt: { gte: startOfTodayDate } } }),
    db.order.count({ where: { createdAt: { gte: startOfMonthDate } } }),
    db.order.count({ where: { paymentStatus: "PENDING" } }),
    db.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        createdAt: true,
        total: true,
        status: true,
      },
    }),
    db.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    db.order.groupBy({
      by: ["paymentMethod"],
      _count: { _all: true },
    }),
  ]);

  const revenue = totalRevenueResult._sum.total || 0;
  const todayRevenue = todayRevenueResult._sum.total || 0;

  // Process data for charts
  const revenueMap: Record<string, number> = {};
  const ordersMap: Record<string, number> = {};

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateKey = format(date, "MMM dd", { locale: dateLocale });
    const dayKey = format(date, "EEE", { locale: dateLocale });
    revenueMap[dateKey] = 0;
    ordersMap[dayKey] = 0;
  }

  recentOrders.forEach((order) => {
    // Orders Chart (All orders)
    const dayKey = format(order.createdAt, "EEE", { locale: dateLocale });
    if (ordersMap[dayKey] !== undefined) {
      ordersMap[dayKey]++;
    }

    // Revenue Chart (Only CONFIRMED)
    if (order.status === "CONFIRMED") {
      const dateKey = format(order.createdAt, "MMM dd", { locale: dateLocale });
      if (revenueMap[dateKey] !== undefined) {
        revenueMap[dateKey] += Number(order.total);
      }
    }
  });

  const revenueChartData = Object.entries(revenueMap).map(([name, total]) => ({
    name,
    total,
  }));
  const ordersChartData = Object.entries(ordersMap).map(([name, orders]) => ({
    name,
    orders,
  }));

  // Status Chart Data - Premium Colors (Muted)
  const statusColors: Record<string, string> = {
    PENDING: "#D97706", // Muted Amber
    CONFIRMED: "#2563EB", // Muted Royal Blue
    SHIPPED: "#6366F1", // Muted Indigo
    DELIVERED: "#059669", // Muted Emerald
    CANCELLED: "#DC2626", // Deep Red
    PENDING_VERIFICATION: "#B45309", // Dark Amber
    REJECTED: "#475569", // Slate Gray
  };

  const statusChartData = orderStatusGroups.map((group) => ({
    name: group.status,
    value: group._count._all,
    color: statusColors[group.status] || "#9ca3af",
  }));

  // Payment Methods Chart Data - Premium Colors (Muted Stripe/Shopify styling)
  const paymentColors: Record<string, string> = {
    COD: "#64748B", // Slate Gray
    ONLINE: "#2563EB", // Muted Royal Blue
    VODAFONE_CASH: "#DC2626", // Deep Red
    INSTAPAY: "#7C3AED", // Muted Purple
    BANK_TRANSFER: "#111827", // Primary Text Black
    MEEZA: "#92400E", // Dark Amber / Bronze
  };

  const paymentChartData = paymentMethodGroups.map((group) => ({
    name: group.paymentMethod,
    value: group._count._all,
    color: paymentColors[group.paymentMethod] || "#9ca3af",
  }));

  return {
    revenue,
    todayRevenue,
    confirmedOrders: confirmedOrdersCount,
    ordersToday: ordersTodayCount,
    ordersThisMonth: ordersThisMonthCount,
    users: totalUsers,
    pendingPayments: pendingPaymentsCount,
    totalOrders: totalOrdersCount,
    chartData: {
      revenue: revenueChartData,
      orders: ordersChartData,
      status: statusChartData,
      paymentMethods: paymentChartData,
    },
  };
}

const RevenueChart = dynamic(() =>
  import("@/components/admin/dashboard/ChartComponents").then(
    (mod) => mod.RevenueChart,
  ),
);
const OrdersChart = dynamic(() =>
  import("@/components/admin/dashboard/ChartComponents").then(
    (mod) => mod.OrdersChart,
  ),
);
const StatusChart = dynamic(() =>
  import("@/components/admin/dashboard/ChartComponents").then(
    (mod) => mod.StatusChart,
  ),
);
const PaymentMethodsChart = dynamic(() =>
  import("@/components/admin/dashboard/ChartComponents").then(
    (mod) => mod.PaymentMethodsChart,
  ),
);

async function DashboardContent({ locale }: { locale: string }) {
  const stats = await getStats(locale);
  const t = await getTranslations("Admin");

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatsCard
          title={t("totalRevenue")}
          value={formatCurrency(Number(stats.revenue), locale)}
          description={t("confirmedOnly")}
          icon={<Banknote className="h-5 w-5" />}
          index={0}
          trend="up"
        />
        <StatsCard
          title={t("todayRevenue")}
          value={formatCurrency(Number(stats.todayRevenue), locale)}
          description={t("today")}
          icon={<TrendingUp className="h-5 w-5" />}
          index={1}
          trend={Number(stats.todayRevenue) > 0 ? "up" : "neutral"}
        />
        <StatsCard
          title={t("confirmedOrders")}
          value={stats.confirmedOrders}
          description={t("confirmed")}
          icon={<CheckCircle2 className="h-5 w-5" />}
          index={2}
          trend={stats.confirmedOrders > 0 ? "up" : "neutral"}
        />
        <StatsCard
          title={t("ordersToday")}
          value={stats.ordersToday}
          description={t("today")}
          icon={<ShoppingBag className="h-5 w-5" />}
          index={3}
          trend={stats.ordersToday > 0 ? "up" : "neutral"}
        />
        <StatsCard
          title={t("customers")}
          value={stats.users}
          description={t("registered")}
          icon={<Users className="h-5 w-5" />}
          index={4}
          trend="up"
        />
        <StatsCard
          title={t("pendingPayments")}
          value={stats.pendingPayments}
          description={t("requiresAction")}
          icon={<Clock className="h-5 w-5" />}
          index={5}
          trend={stats.pendingPayments > 0 ? "down" : "neutral"}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={stats.chartData.revenue} />
        <OrdersChart data={stats.chartData.orders} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PaymentMethodsChart data={stats.chartData.paymentMethods} />
        <div className="col-span-1 lg:col-span-2">
          <StatusChart data={stats.chartData.status} />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Admin");

  return (
    <div className="flex flex-col gap-8 bg-background min-h-screen p-6 -m-4 md:-m-8 rounded-lg">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
          {t("dashboard")}
        </h1>
        <p className="text-[#6B7280]">{t("overview")}</p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent locale={locale} />
      </Suspense>
    </div>
  );
}
