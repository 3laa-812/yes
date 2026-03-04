"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  index: number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  index,
  trend,
  trendValue,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden border-[#E6E8EB] bg-white shadow-sm transition-all hover:bg-background hover:shadow-md relative group">
        <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-[#E6E8EB] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            <div className="text-3xl font-bold tracking-tight">{value}</div>

            <div className="flex items-center text-xs mt-1">
              {trend && (
                <span
                  className={cn(
                    "flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md mr-2 rtl:ml-2 rtl:mr-0",
                    {
                      "bg-emerald-500/10 text-emerald-500": trend === "up",
                      "bg-rose-500/10 text-rose-500": trend === "down",
                      "bg-muted text-muted-foreground": trend === "neutral",
                    },
                  )}
                >
                  {trend === "up" && <TrendingUp className="h-3 w-3" />}
                  {trend === "down" && <TrendingDown className="h-3 w-3" />}
                  {trend === "neutral" && <Minus className="h-3 w-3" />}
                  {trendValue}
                </span>
              )}
              <span className="text-muted-foreground">{description}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
