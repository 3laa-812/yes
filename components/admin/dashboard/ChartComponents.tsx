"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocale, useTranslations } from "next-intl";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ChartDataProps<T = any> {
  data: T[];
}

export function RevenueChart({
  data,
}: ChartDataProps<{ name: string; total: number }>) {
  const locale = useLocale();
  const t = useTranslations("Admin");
  const isRTL = locale === "ar";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="col-span-1 lg:col-span-2"
    >
      <Card className="h-full min-h-[400px] border-[#E6E8EB] bg-white shadow-sm relative overflow-hidden group">
        <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-[#E6E8EB] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <CardHeader>
          <CardTitle className="text-base font-medium">
            {t("Dashboard.revenueOverview")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={data}
              style={{ direction: "ltr" }}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
                opacity={0.6}
              />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                reversed={isRTL}
                dy={10}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  value >= 1000
                    ? `${(value / 1000).toFixed(1)}k`
                    : value.toString()
                }
                orientation={isRTL ? "right" : "left"}
                dx={isRTL ? 10 : -10}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(226, 232, 240, 0.4)",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(4px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                  textAlign: isRTL ? "right" : "left",
                  padding: "12px",
                }}
                itemStyle={{ color: "#0f172a", fontWeight: 600 }}
                cursor={{
                  stroke: "#9CA3AF",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function OrdersChart({
  data,
}: ChartDataProps<{ name: string; orders: number }>) {
  const locale = useLocale();
  const t = useTranslations("Admin");
  const isRTL = locale === "ar";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="col-span-1 border-[#E6E8EB] bg-white shadow-sm relative overflow-hidden group rounded-xl border"
    >
      <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-[#E6E8EB] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader>
        <CardTitle className="text-base font-medium">
          {t("Dashboard.weeklyOrders")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            style={{ direction: "ltr" }}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
              opacity={0.6}
            />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              reversed={isRTL}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              orientation={isRTL ? "right" : "left"}
            />
            <Tooltip
              cursor={{ fill: "rgba(226, 232, 240, 0.4)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(226, 232, 240, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(4px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                textAlign: isRTL ? "right" : "left",
                padding: "12px",
              }}
              itemStyle={{ color: "#0f172a", fontWeight: 600 }}
            />
            <Bar
              dataKey="orders"
              fill="#2563EB"
              radius={[6, 6, 0, 0]}
              barSize={32}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </motion.div>
  );
}

export function StatusChart({
  data,
}: ChartDataProps<{ name: string; value: number; color: string }>) {
  const locale = useLocale();
  const t = useTranslations("Admin");
  const isRTL = locale === "ar";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="col-span-1 lg:col-span-1 border-[#E6E8EB] bg-white shadow-sm relative overflow-hidden group rounded-xl border"
    >
      <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-[#E6E8EB] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader>
        <CardTitle className="text-base font-medium">
          {t("Dashboard.orderStatus")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart
            style={{ direction: "ltr" }}
            margin={{ top: 0, right: 0, bottom: 30, left: 0 }}
          >
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(226, 232, 240, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(4px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                textAlign: isRTL ? "right" : "left",
                padding: "12px",
              }}
              itemStyle={{ color: "#0f172a", fontWeight: 600 }}
            />
            <Legend
              verticalAlign="bottom"
              height={40}
              iconType="circle"
              wrapperStyle={{ fontSize: 13, paddingTop: 10 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </motion.div>
  );
}

export function PaymentMethodsChart({
  data,
}: ChartDataProps<{ name: string; value: number; color: string }>) {
  const locale = useLocale();
  const t = useTranslations("Admin");
  const isRTL = locale === "ar";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="col-span-1 lg:col-span-1 border-[#E6E8EB] bg-white shadow-sm relative overflow-hidden group rounded-xl border"
    >
      <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-[#E6E8EB] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader>
        <CardTitle className="text-base font-medium">
          {t("Dashboard.paymentMethods")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart
            style={{ direction: "ltr" }}
            margin={{ top: 0, right: 0, bottom: 30, left: 0 }}
          >
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={95}
              paddingAngle={0}
              stroke="#ffffff"
              strokeWidth={2}
              dataKey="value"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(226, 232, 240, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(4px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                textAlign: isRTL ? "right" : "left",
                padding: "12px",
              }}
              itemStyle={{ color: "#0f172a", fontWeight: 600 }}
            />
            <Legend
              verticalAlign="bottom"
              height={40}
              iconType="circle"
              wrapperStyle={{ fontSize: 13, paddingTop: 10 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </motion.div>
  );
}
