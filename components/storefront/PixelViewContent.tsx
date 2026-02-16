"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/facebookPixel";

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
    trackViewContent(product);
  }, [product]);

  return null;
}
