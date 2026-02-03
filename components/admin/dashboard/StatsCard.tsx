"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  index: number;
  trend?: "up" | "down" | "neutral";
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  index,
  trend,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p
            className={cn("text-xs text-muted-foreground", {
              "text-green-500": trend === "up",
              "text-red-500": trend === "down",
            })}
          >
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
