"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocale } from "next-intl";

// Props Interfaces
interface RevenueChartProps {
  data: { name: string; total: number }[];
}

interface OrdersChartProps {
  data: { name: string; orders: number }[];
}

interface StatusChartProps {
  data: { name: string; value: number; color: string }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="col-span-1 lg:col-span-2"
    >
      <Card className="h-full min-h-[400px]">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data} style={{ direction: "ltr" }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1C1C1E" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#1C1C1E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                reversed={isRTL}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                orientation={isRTL ? "right" : "left"}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  textAlign: isRTL ? "right" : "left",
                }}
                cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#1C1C1E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function OrdersChart({ data }: OrdersChartProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="col-span-1"
    >
      <Card className="h-full min-h-[400px]">
        <CardHeader>
          <CardTitle>Weekly Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} style={{ direction: "ltr" }}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                reversed={isRTL}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  textAlign: isRTL ? "right" : "left",
                }}
                cursor={{ fill: "transparent" }}
              />
              <Bar
                dataKey="orders"
                fill="#1C1C1E"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StatusChart({ data }: StatusChartProps) {
  // Pie charts don't usually need axis reversal, but tooltips might need text alignment
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="col-span-1"
    >
      <Card className="h-full min-h-[400px]">
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart style={{ direction: "ltr" }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  textAlign: isRTL ? "right" : "left",
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
