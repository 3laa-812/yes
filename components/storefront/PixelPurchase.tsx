"use client";

import { useEffect } from "react";
import { event } from "@/lib/facebookPixel";

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
    event("Purchase", {
      content_ids: order.contents.map((item) => item.id),
      content_type: "product",
      value: order.value,
      currency: order.currency,
      num_items: order.contents.reduce((acc, item) => acc + item.quantity, 0),
      contents: order.contents,
      order_id: order.id,
    });
  }, [order]);

  return null;
}
