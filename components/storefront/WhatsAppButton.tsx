"use client";

import { MessageCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { trackContact } from "@/lib/facebookPixel";

export function WhatsAppButton() {
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !whatsappNumber) return null;

  const isRtl = locale === "ar";

  const handleClick = () => {
    trackContact();
  };

  return createPortal(
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onClick={handleClick}
      className={cn(
        "fixed bottom-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:ring-4 hover:ring-[#25D366]/30",
        isRtl ? "left-6" : "right-6",
        "animate-in fade-in zoom-in duration-500",
      )}
    >
      <MessageCircle className="h-8 w-8" />
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-75 duration-1000" />
    </a>,
    document.body,
  );
}
