"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { pageview } from "@/lib/facebookPixel";

export function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Initialize Facebook Pixel
    if (!loaded) {
      import("react-facebook-pixel")
        .then((x) => x.default)
        .then((ReactPixel) => {
          ReactPixel.init(process.env.NEXT_PUBLIC_FB_PIXEL_ID as string); // 1634437144398713
          ReactPixel.pageView();
          setLoaded(true);
        });
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded) {
      import("react-facebook-pixel")
        .then((x) => x.default)
        .then((ReactPixel) => {
          ReactPixel.pageView();
        });
    }
  }, [pathname, searchParams, loaded]);

  return null;
}
