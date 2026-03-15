import { useState, useEffect } from "react";
import { storeConfig } from "@/store/storeConfig";

export function useAnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // default true for SSR safety
  const config = storeConfig.announcementBar;

  useEffect(() => {
    // Run on client side only
    const dismissed = localStorage.getItem("announcementBarDismissed") === "true";
    setIsDismissed(dismissed);

    // Only show if it's enabled and not dismissed
    if (config.enabled && !dismissed) {
      setIsVisible(true);
    }
  }, [config.enabled]);

  const dismiss = () => {
    localStorage.setItem("announcementBarDismissed", "true");
    setIsVisible(false);
    setIsDismissed(true);
  };

  return {
    isVisible,
    config,
    dismiss,
    isDismissed, // useful if you need to know hydration status
  };
}
