"use client";

import { useEffect } from "react";
import { event } from "@/lib/facebookPixel";

interface PixelViewContentProps {
  product: {
    id: string;
    name: string;
    price: number | string;
    currency: string;
    category?: string;
  };
}

export function PixelViewContent({ product }: PixelViewContentProps) {
  useEffect(() => {
    event("ViewContent", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: Number(product.price),
      currency: product.currency,
      content_category: product.category,
    });
  }, [product]);

  return null;
}
