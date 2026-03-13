"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { formatCurrency } from "@/lib/utils";
import { ScaleHover } from "@/components/ui/motion";
import { useLocale, useTranslations } from "next-intl";
import { useCartStore } from "@/lib/store";
import { useRouter } from "@/i18n/routing";

interface ProductCardProps {
  id: string;
  name: string;
  name_en?: string;
  name_ar?: string;
  price: string | number;
  image: string;
  category: string;
  category_en?: string;
  category_ar?: string;
  discountPrice?: number | null;
}

export function ProductCard({
  id,
  name,
  name_en,
  name_ar,
  price,
  image,
  category,
  category_en,
  category_ar,
  discountPrice,
}: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations("Storefront.Product");
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const basePrice = Number(price);
  const hasSecondaryPrice =
    discountPrice !== null && discountPrice !== undefined;
  const secondaryPrice = hasSecondaryPrice ? Number(discountPrice) : basePrice;

  let originalPrice = basePrice;
  let currentPrice = basePrice;
  let isDiscounted = false;

  if (
    hasSecondaryPrice &&
    basePrice > 0 &&
    secondaryPrice > 0 &&
    basePrice !== secondaryPrice
  ) {
    // Treat the higher value as the original price and the lower as the discounted price
    originalPrice = Math.max(basePrice, secondaryPrice);
    currentPrice = Math.min(basePrice, secondaryPrice);
    isDiscounted = currentPrice < originalPrice;
  }

  const discountPercentage = isDiscounted
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <Link href={`/products/${id}`} className="group block">
      <ScaleHover className="relative overflow-hidden rounded-xl glass-card">
        <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100 relative">
          <Image
            src={image}
            alt={name || name_en || "Product Image"}
            fill
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {isDiscounted ? (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
              -{discountPercentage}%
            </div>
          ) : null}
          
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-sm flex items-center gap-1 group-hover:opacity-0 transition-opacity">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            {t("delivery", { fallback: "Fast Delivery" }).split(":")[0]}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-2 md:p-4 opacity-100 md:opacity-0 translate-y-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-10">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                clearCart();
                addItem({
                  id: `${id}-quickbuy`,
                  productId: id,
                  name: name,
                  name_en: name_en || name,
                  name_ar: name_ar || name,
                  price: currentPrice,
                  originalPrice: originalPrice > currentPrice ? originalPrice : undefined,
                  image: image,
                  category: category,
                  category_en: category_en || category,
                  category_ar: category_ar || category,
                  size: "",
                  color: "",
                  quantity: 1,
                });
                
                router.push("/checkout");
              }}
              className="w-full bg-black/80 backdrop-blur-sm text-white h-12 min-h-[48px] rounded-full text-sm font-semibold text-center hover:bg-black transition-colors shadow-lg flex items-center justify-center"
            >
              {t("quickBuy")}
            </button>
          </div>
        </div>
        <div className="p-3 space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {locale === "ar"
              ? category_ar || category
              : category_en || category}
          </p>
          <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary/80 transition-colors">
            {locale === "ar" ? name_ar || name : name_en || name}
          </h3>
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-bold ${isDiscounted ? "text-primary" : "text-foreground"}`}
            >
              {formatCurrency(currentPrice, locale)}
            </p>
            {isDiscounted ? (
              <p className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                {formatCurrency(originalPrice, locale)}
              </p>
            ) : null}
          </div>
        </div>
      </ScaleHover>
    </Link>
  );
}
