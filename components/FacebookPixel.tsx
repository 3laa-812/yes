"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useMemo } from "react";
import {
  FB_PIXEL_ID,
  shouldLoadPixel,
  isDevelopment,
} from "@/lib/facebookPixel";

/**
 * Facebook Pixel Script Component
 * Loads Facebook Pixel script only on allowed routes
 * Respects locale (RTL/LTR) and excludes dashboard/admin/auth routes
 */
export function FacebookPixel() {
  const pathname = usePathname();
  const locale = useLocale();

  // Map locale to Facebook Pixel locale format
  // Facebook supports: en_US, ar_AR, etc.
  const fbLocale = useMemo(() => {
    return locale === "ar" ? "ar_AR" : "en_US";
  }, [locale]);

  // Check if pixel should load on this route
  const shouldLoad = useMemo(() => {
    return pathname ? shouldLoadPixel(pathname) : false;
  }, [pathname]);

  // Don't load in development or on excluded routes
  if (isDevelopment() || !shouldLoad || !FB_PIXEL_ID) {
    return null;
  }

  return (
    <Script
      id="fb-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/${fbLocale}/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
        `,
      }}
    />
  );
}
