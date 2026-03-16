"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OfferCardProps {
  product: {
    id: string;
    name_ar?: string | null;
    name_en?: string | null;
    images?: string | null;
    price: number | string;
    discountPrice?: number | string | null;
  };
  locale: string;
  isFeatured?: boolean;
  index?: number;
}

function getDiscountBadgeLabel(percentage: number): string {
  if (percentage >= 30) return "HOT DEAL";
  if (percentage >= 15) return "SALE";
  return ""; // Will show -X% only
}

export function OfferCard({
  product,
  locale,
  isFeatured = false,
  index = 0,
}: OfferCardProps) {
  const t = useTranslations("Storefront.Product");

  const name =
    locale === "ar" ? product.name_ar ?? product.name_en : product.name_en ?? product.name_ar;

  let imageUrl = "/placeholder.png";
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images as string);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imageUrl = parsed[0];
      }
    } catch {
      // ignore
    }
  }

  const price = Number(product.price);
  const discountPrice = product.discountPrice
    ? Number(product.discountPrice)
    : null;

  let discountPercentage = 0;
  if (discountPrice != null && discountPrice < price) {
    discountPercentage = Math.round(((price - discountPrice) / price) * 100);
  }

  const badgeLabel = getDiscountBadgeLabel(discountPercentage);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/${locale}/products/${product.id}`;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Link
        href={`/products/${product.id}`}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-card shadow-md transition-all duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isFeatured
            ? "min-h-[380px] md:min-h-[420px]"
            : "min-h-[320px] md:min-h-[360px]"
        )}
      >
        {/* Image container */}
        <div
          className={cn(
            "relative w-full overflow-hidden bg-muted",
            isFeatured ? "aspect-4/3 md:aspect-3/4 md:flex-1" : "aspect-4/5"
          )}
        >
          <Image
            src={imageUrl}
            alt={name ?? ""}
            fill
            sizes={
              isFeatured
                ? "(max-width: 768px) 85vw, 50vw"
                : "(max-width: 768px) 85vw, 25vw"
            }
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Discount badge - top corner, RTL-aware */}
          {discountPercentage > 0 && (
            <div
              className="absolute top-3 z-10 flex flex-col gap-1.5 ltr:left-3 rtl:right-3"
              dir="ltr"
            >
              {badgeLabel && (
                <span className="inline-block rounded-md bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
                  {badgeLabel}
                </span>
              )}
              <span className="inline-flex w-fit rounded-lg bg-destructive px-2.5 py-1 text-sm font-bold text-destructive-foreground shadow-sm">
                -{discountPercentage}%
              </span>
            </div>
          )}

          {/* Hover overlay with actions */}
          <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex flex-col gap-2 p-4">
              <Button
                size={isFeatured ? "default" : "sm"}
                className="w-full bg-white font-medium text-black hover:bg-gray-100"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {t("addToCart")}
              </Button>
<Button
                asChild
                variant="outline"
                size={isFeatured ? "default" : "sm"}
                className="w-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link
                  href={`/products/${product.id}`}
                  className="inline-flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {t("viewProduct")}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-end p-4">
          <h3
            className={cn(
              "font-semibold text-foreground line-clamp-2",
              isFeatured ? "text-base md:text-lg" : "text-sm md:text-base"
            )}
          >
            {name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {discountPrice != null && discountPrice < price ? (
              <>
                <span className="text-lg font-bold text-destructive">
                  {formatCurrency(discountPrice, locale)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(price, locale)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(price, locale)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
