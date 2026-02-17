"use client";

import { usePathname } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";

const EXCLUDED_PATHS = ["/dashboard", "/admin", "/auth"];

export function PublicSpeedInsights() {
  const pathname = usePathname();

  if (
    !pathname ||
    EXCLUDED_PATHS.some((segment) => pathname.includes(segment))
  ) {
    return null;
  }

  return <SpeedInsights />;
}

