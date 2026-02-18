"use client";

import {useEffect, useState} from "react";
import {Analytics} from "@vercel/analytics/next";
import {PublicSpeedInsights} from "@/components/global/PublicSpeedInsights";

export function AnalyticsClient() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      setEnabled(true);
    }
  }, []);

  if (!enabled) return null;

  return (
    <>
      <PublicSpeedInsights />
      <Analytics />
    </>
  );
}

