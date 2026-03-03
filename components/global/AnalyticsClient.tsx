"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { PublicSpeedInsights } from "@/components/global/PublicSpeedInsights";

export function AnalyticsClient() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (process.env.NODE_ENV === "production" && isMounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabled(true);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <PublicSpeedInsights />
      <Analytics />
    </>
  );
}
