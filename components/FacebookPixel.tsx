"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

const EXCLUDED_PATHS = ["/dashboard", "/admin", "/auth"];

function shouldLoadPixel(pathname: string): boolean {
  if (!pathname) return false;
  return !EXCLUDED_PATHS.some((path) => pathname.includes(path));
}

/**
 * Meta Pixel Component
 * Loads only on public pages. Excludes /dashboard, /admin, /auth.
 * Disabled in development. Uses afterInteractive strategy.
 */
export function FacebookPixel() {
  const pathname = usePathname();
  const isInitialMount = useRef(true);

  const shouldLoad =
    process.env.NODE_ENV !== "development" &&
    PIXEL_ID &&
    pathname &&
    shouldLoadPixel(pathname);

  // Track PageView on route changes (script handles initial load)
  useEffect(() => {
    if (!shouldLoad || typeof window === "undefined") return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "PageView");
    }
  }, [pathname, shouldLoad]);

  if (!shouldLoad) return null;

  return (
    <>
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
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
          `,
        }}
      />
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1"/>`,
        }}
      />
    </>
  );
}
