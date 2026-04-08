"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { formatCurrency } from "@/lib/utils";
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
  isSoldOut?: boolean;
  /** Hex or oklch color strings shown as swatches */
  colors?: string[];
  /** Size labels e.g. ["XS","S","M","L"] */
  sizes?: string[];
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
  isSoldOut = false,
  colors = [],
  sizes = [],
}: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations("Storefront.Product");
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const [wishlisted, setWishlisted] = useState(false);
  const [activeColor, setActiveColor] = useState(0);
  const [quickBuyState, setQuickBuyState] = useState<"idle" | "added">("idle");

  // ── Price logic ──────────────────────────────────────────────────
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
    originalPrice = Math.max(basePrice, secondaryPrice);
    currentPrice = Math.min(basePrice, secondaryPrice);
    isDiscounted = currentPrice < originalPrice;
  }

  const discountPercentage = isDiscounted
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // ── Localized labels ─────────────────────────────────────────────
  const displayName = locale === "ar" ? name_ar || name : name_en || name;
  const displayCategory =
    locale === "ar" ? category_ar || category : category_en || category;

  // ── Handlers ─────────────────────────────────────────────────────
  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((w) => !w);
  }

  function handleQuickBuy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    clearCart();
    addItem({
      id: `${id}-quickbuy`,
      productId: id,
      name,
      name_en: name_en || name,
      name_ar: name_ar || name,
      price: currentPrice,
      originalPrice: originalPrice > currentPrice ? originalPrice : undefined,
      image,
      category,
      category_en: category_en || category,
      category_ar: category_ar || category,
      size: "",
      color: colors[activeColor] ?? "",
      quantity: 1,
      isSoldOut: false,
    });

    setQuickBuyState("added");
    setTimeout(() => {
      setQuickBuyState("idle");
      router.push("/checkout");
    }, 1400);
  }

  return (
    <Link href={`/products/${id}`} className="group block" aria-label={displayName}>
      {/* ── Card wrapper ──────────────────────────────────────────── */}
      <div
        className={[
          "relative overflow-hidden rounded-[var(--radius)]",
          "bg-card border border-border",
          "transition-all duration-250 cursor-pointer",
          "hover:-translate-y-0.5",
          "hover:shadow-[0_8px_24px_oklch(0.45_0.18_30/0.10)]",
          "hover:border-[oklch(0.78_0.05_85)]",
        ].join(" ")}
      >
        {/* ── Image area ────────────────────────────────────────── */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
          <Image
            src={image}
            alt={displayName}
            fill
            className={[
              "h-full w-full object-cover object-center",
              "transition-transform duration-400 ease-out",
              "group-hover:scale-[1.04]",
              isSoldOut ? "opacity-60" : "",
            ].join(" ")}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Discount badge */}
          {!isSoldOut && isDiscounted && (
            <span
              className="absolute top-2.5 left-2.5 z-10
                         bg-accent text-accent-foreground
                         text-[9px] font-semibold
                         px-2 py-0.5 rounded-full tracking-wide"
            >
              -{discountPercentage}%
            </span>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={[
              "absolute top-2.5 right-2.5 z-10",
              "w-7 h-7 rounded-full flex items-center justify-center",
              "transition-all duration-200",
              "backdrop-blur-sm",
              wishlisted
                ? "bg-accent/15 text-accent"
                : "bg-background/60 text-muted-foreground hover:text-accent hover:bg-accent/10",
            ].join(" ")}
          >
            <span className="text-base leading-none select-none">
              {wishlisted ? "♥" : "♡"}
            </span>
          </button>

          {/* Sold-out overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center pointer-events-none z-10">
              <span
                className="border border-border text-muted-foreground
                            text-[10px] tracking-widest uppercase
                            px-4 py-1.5 rounded-full bg-card"
              >
                {t("soldOutLabel")}
              </span>
            </div>
          )}

          {/* Quick Buy — hover-reveal, hidden when sold out */}
          {!isSoldOut && (
            <button
              onClick={handleQuickBuy}
              className={[
                "absolute bottom-2 inset-x-2 z-10",
                "text-xs font-medium py-2.5 rounded-[10px]",
                "transition-all duration-200",
                // reveal animation
                "opacity-0 translate-y-1.5",
                "group-hover:opacity-100 group-hover:translate-y-0",
                // state colors
                quickBuyState === "added"
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground",
              ].join(" ")}
              aria-label={t("quickBuy")}
            >
              {quickBuyState === "added" ? `${t("quickBuy")} ✓` : t("quickBuy")}
            </button>
          )}
        </div>

        {/* ── Card body ────────────────────────────────────────── */}
        <div className="px-3 pt-2.5 pb-3 space-y-1.5">
          {/* Category tag */}
          <p className="text-[9px] font-medium tracking-widest text-muted-foreground uppercase">
            {displayCategory}
          </p>

          {/* Product name */}
          <h3 className="text-sm font-semibold text-card-foreground line-clamp-1 leading-snug">
            {displayName}
          </h3>

          {/* Color swatches */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1 pt-0.5">
              {colors.map((color, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveColor(i);
                  }}
                  aria-label={`Color option ${i + 1}`}
                  className="rounded-full transition-all duration-150"
                  style={{
                    width: 12,
                    height: 12,
                    background: color,
                    outline:
                      i === activeColor
                        ? "2px solid var(--accent)"
                        : "1px solid var(--border)",
                    outlineOffset: i === activeColor ? 1.5 : 0,
                  }}
                />
              ))}
            </div>
          )}

          {/* Price row */}
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span
              className={[
                "text-[13px] font-semibold",
                isSoldOut ? "text-muted-foreground" : "text-accent",
              ].join(" ")}
            >
              {formatCurrency(currentPrice, locale)}
            </span>
            {isDiscounted && !isSoldOut && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatCurrency(originalPrice, locale)}
              </span>
            )}
          </div>

          {/* Size chips */}
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="text-[9px] text-muted-foreground border border-border
                             px-1.5 py-0.5 rounded-sm tracking-wide leading-none"
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
