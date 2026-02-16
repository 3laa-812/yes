"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";

interface ProductSelectorProps {
  id: string;
  name: string;
  name_en: string;
  name_ar: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  category: string;
  category_en: string;
  category_ar: string;
  sizes: string[];
  colors: string[];
  variants: any[]; // Using any to avoid importing prisma types client-side if complex, but ideally should be typed
}

import { useTranslations } from "next-intl";
import { trackAddToCart } from "@/lib/facebookPixel";

// ... (keep interface)

export function ProductSelector({
  id,
  name,
  name_en,
  name_ar,
  price,
  discountPrice,
  image,
  category,
  category_en,
  category_ar,
  sizes,
  colors,
  variants,
}: ProductSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const t = useTranslations("Storefront.Product");

  // Helper to check stock
  const getVariantStock = (size: string, color: string) => {
    const variant = variants.find((v) => v.size === size && v.color === color);
    return variant ? variant.stock : 0;
  };

  const isOutOfStock =
    selectedSize && selectedColor
      ? getVariantStock(selectedSize, selectedColor) <= 0
      : false;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error(t("selectOptions"));
      return;
    }

    if (isOutOfStock) {
      toast.error(t("combinationOutOfStock"));
      return;
    }

    const effectivePrice =
      discountPrice && discountPrice < price ? discountPrice : price;
    const originalPrice =
      discountPrice && discountPrice < price ? price : undefined;

    addItem({
      id: `${id}-${selectedSize}-${selectedColor}`,
      productId: id,
      name,
      name_en,
      name_ar,
      price: effectivePrice,
      originalPrice: originalPrice,
      image,
      category,
      category_en,
      category_ar,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    });

    trackAddToCart({
      productId: id,
      productName: name,
      price: effectivePrice,
      currency: "EGP",
      quantity: 1,
    });

    toast.success(t("addedToCart"));
  };

  return (
    <div className="mt-10">
      {/* Colors */}
      <div>
        <h3 className="text-sm font-medium text-foreground">{t("color")}</h3>
        <div className="mt-4 flex items-center space-x-3">
          {colors.map((color) => {
            // Optional: Check if color is available in any size?
            // For now just standard selection
            return (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "relative -m-0.5 flex cursor-pointer item-center justify-center rounded-full p-0.5 focus:outline-none ring-offset-background transition-all",
                  selectedColor === color
                    ? "ring-2 ring-primary ring-offset-2"
                    : "ring-1 ring-border hover:ring-primary/50",
                )}
              >
                <span
                  aria-hidden="true"
                  className="h-8 w-8 rounded-full border border-black/10"
                  style={{ backgroundColor: color }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">{t("size")}</h3>
          <a
            href="#"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t("sizeGuide")}
          </a>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4">
          {sizes.map((size) => {
            // Check if size is available for selected color (if color selected)
            let isAvailable = true;
            if (selectedColor) {
              isAvailable = getVariantStock(size, selectedColor) > 0;
            }

            return (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                disabled={!isAvailable && !!selectedColor}
                className={cn(
                  "group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase focus:outline-none sm:flex-1 sm:py-6 transition-all",
                  selectedSize === size
                    ? "bg-primary text-primary-foreground shadow-sm border-primary hover:bg-primary/90"
                    : "bg-card text-foreground shadow-sm border-border hover:bg-muted font-normal",
                  !isAvailable && !!selectedColor
                    ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground decoration-muted-foreground/50 line-through"
                    : "",
                )}
              >
                <span>{size}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={isOutOfStock || !selectedSize || !selectedColor}
        size="lg"
        className="w-full mt-10 rounded-full h-14 text-base font-bold shadow-lg"
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {isOutOfStock ? t("outOfStock") : t("addToCart")}
      </Button>
    </div>
  );
}
