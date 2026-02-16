"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { pageView, shouldLoadPixel } from "@/lib/facebookPixel";

function PixelEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only track pageviews on allowed routes
    if (pathname && shouldLoadPixel(pathname)) {
      pageView();
    }
  }, [pathname, searchParams]);

  return null;
}

export function FacebookPixelTracker() {
  return (
    <Suspense fallback={null}>
      <PixelEvents />
    </Suspense>
  );
}
