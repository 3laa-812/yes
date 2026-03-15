"use client";

import { X } from "lucide-react";
import { useAnnouncementBar } from "@/hooks/useAnnouncementBar";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

export function AnnouncementBar() {
  const locale = useLocale();
  const { isVisible, config, dismiss, isDismissed } = useAnnouncementBar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR hydration mismatch and don't render if it's disabled or dismissed
  if (!mounted || isDismissed || !config.enabled || !isVisible) {
    return null;
  }

  const message = locale === "ar" ? config.message_ar : config.message_en;
  const isRtl = locale === "ar";

  return (
    <div
      className="w-full relative overflow-hidden transition-all duration-300 ease-in-out py-2 px-8 flex items-center justify-center min-h-[40px] z-[60]"
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
      }}
      dir={isRtl ? "rtl" : "ltr"}
      role="alert"
      aria-live="polite"
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center relative">
        {/* Desktop View: Centered Text */}
        <div className="hidden md:block text-sm font-medium text-center px-4 w-full">
          {message}
        </div>

        {/* Mobile View: Scrolling Marquee for long text */}
        <div className="md:hidden flex w-[calc(100%-24px)] overflow-hidden relative">
          <div className="whitespace-nowrap animate-marquee text-xs font-medium w-full">
            {message}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={dismiss}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity flex items-center justify-center w-8 h-8 rounded-full z-10"
          style={{ 
            color: config.textColor,
            [isRtl ? 'left' : 'right']: '0',
            [isRtl ? 'right' : 'left']: 'auto'
          }}
          aria-label="Close announcement"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
