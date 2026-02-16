"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/facebookPixel";

interface PixelPurchaseProps {
  order: {
    id: string;
    value: number;
    currency: string;
    contents: {
      id: string;
      quantity: number;
    }[];
  };
}

export function PixelPurchase({ order }: PixelPurchaseProps) {
  useEffect(() => {
    trackPurchase(order);
  }, [order]);

  return null;
}
