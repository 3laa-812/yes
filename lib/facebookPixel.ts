/**
 * Facebook Pixel Analytics Library
 * Centralized analytics logic for Facebook Pixel integration
 */

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

declare global {
  interface Window {
    fbq: (
      action: "init" | "track" | "trackCustom",
      eventName: string,
      options?: Record<string, any>
    ) => void;
    _fbq?: any;
  }
}

/**
 * Check if current route should have pixel loaded
 * Excludes dashboard, admin, and auth routes
 */
export function shouldLoadPixel(pathname: string): boolean {
  if (!pathname) return false;

  const excludedPaths = ["/dashboard", "/admin", "/auth"];
  return !excludedPaths.some((path) => pathname.includes(path));
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Safe debug logging (only in development)
 */
function debugLog(message: string, ...args: any[]): void {
  if (isDevelopment()) {
    console.log(`[Facebook Pixel] ${message}`, ...args);
  }
}

/**
 * Check if Facebook Pixel is initialized
 * Returns true if fbq exists (even if script is blocked, queue will handle it)
 */
export function isPixelInitialized(): boolean {
  if (typeof window === "undefined") return false;
  
  // Check if fbq exists (either as function or queued)
  return (
    typeof window.fbq === "function" ||
    (typeof (window as any)._fbq !== "undefined" && Array.isArray((window as any)._fbq))
  );
}

/**
 * Initialize fbq queue if it doesn't exist
 * This ensures events can be queued even if script is blocked
 */
export function ensurePixelQueue(): void {
  if (typeof window === "undefined") return;
  
  if (!window.fbq && !(window as any)._fbq) {
    (window as any).fbq = function(...args: any[]) {
      ((window as any)._fbq = (window as any)._fbq || []).push(args);
    };
    (window as any).fbq.loaded = false;
    (window as any).fbq.version = "2.0";
    (window as any).fbq.queue = [];
  }
}

/**
 * Track PageView event
 * Should be called on route changes (not just initial load)
 */
export function pageView(): void {
  ensurePixelQueue();
  
  if (!isPixelInitialized()) {
    debugLog("PageView skipped: Pixel not initialized");
    return;
  }

  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
      debugLog("PageView tracked");
    } else {
      // Queue the event if fbq is not yet a function
      (window as any)._fbq = (window as any)._fbq || [];
      (window as any)._fbq.push(["track", "PageView"]);
      debugLog("PageView queued");
    }
  } catch (error) {
    debugLog("PageView error:", error);
  }
}

/**
 * Track custom event
 * @param eventName - Standard Facebook Pixel event name
 * @param payload - Event payload/parameters
 */
export function trackEvent(
  eventName: string,
  payload: Record<string, any> = {}
): void {
  ensurePixelQueue();
  
  if (!isPixelInitialized()) {
    debugLog(`Event "${eventName}" skipped: Pixel not initialized`);
    return;
  }

  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", eventName, payload);
      debugLog(`Event "${eventName}" tracked`, payload);
    } else {
      // Queue the event if fbq is not yet a function
      (window as any)._fbq = (window as any)._fbq || [];
      (window as any)._fbq.push(["track", eventName, payload]);
      debugLog(`Event "${eventName}" queued`, payload);
    }
  } catch (error) {
    debugLog(`Event "${eventName}" error:`, error);
  }
}

/**
 * Track ViewContent event (product page)
 */
export function trackViewContent(product: {
  id: string;
  name: string;
  price: number | string;
  currency: string;
  category?: string;
}): void {
  trackEvent("ViewContent", {
    content_name: product.name,
    content_ids: [product.id],
    content_type: "product",
    value: Number(product.price),
    currency: product.currency,
    content_category: product.category,
  });
}

/**
 * Track AddToCart event
 */
export function trackAddToCart(data: {
  productId: string;
  productName: string;
  price: number;
  currency?: string;
  quantity?: number;
}): void {
  trackEvent("AddToCart", {
    content_ids: [data.productId],
    content_name: data.productName,
    content_type: "product",
    currency: data.currency || "EGP",
    value: data.price,
    contents: [{ id: data.productId, quantity: data.quantity || 1 }],
  });
}

/**
 * Track InitiateCheckout event
 */
export function trackInitiateCheckout(data: {
  contentIds: string[];
  value: number;
  currency?: string;
  numItems: number;
  contents: Array<{ id: string; quantity: number }>;
}): void {
  trackEvent("InitiateCheckout", {
    content_ids: data.contentIds,
    content_category: "checkout",
    num_items: data.numItems,
    value: data.value,
    currency: data.currency || "EGP",
    contents: data.contents,
  });
}

/**
 * Track Purchase event
 */
export function trackPurchase(order: {
  id: string;
  value: number;
  currency: string;
  contents: Array<{ id: string; quantity: number }>;
}): void {
  trackEvent("Purchase", {
    content_ids: order.contents.map((item) => item.id),
    content_type: "product",
    value: order.value,
    currency: order.currency,
    num_items: order.contents.reduce((acc, item) => acc + item.quantity, 0),
    contents: order.contents,
    order_id: order.id,
  });
}

/**
 * Track Contact event (WhatsApp button click)
 */
export function trackContact(): void {
  trackEvent("Contact");
}

// Legacy exports for backward compatibility (deprecated)
/** @deprecated Use trackEvent instead */
export const event = trackEvent;
