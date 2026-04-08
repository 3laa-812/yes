"use client";

import { useProductDetail } from "@/hooks/useProductDetail";
import { cn } from "@/lib/utils";
import { Flame, Check } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getColorDisplayNameDefault, getColorValueDefault } from "@/lib/colors";
import { formatCurrency } from "@/lib/utils";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variants: any[];
  locale?: "en" | "ar";
  isSoldOut?: boolean;
  description: string;
}

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
  locale: localeProp,
  isSoldOut = false,
  description,
}: ProductSelectorProps) {
  const clientLocale = useLocale() as "en" | "ar";
  const locale = localeProp ?? clientLocale;
  const t = useTranslations("Storefront.Product");
  const tDetails = useTranslations("Storefront.ProductDetails");

  const {
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    isWishlist,
    toggleWishlist,
    descOpen,
    toggleDesc,
    cartFeedback,
    buyFeedback,
    getVariantStock,
    handleAddToCart,
    handleQuickBuy,
  } = useProductDetail({
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
    variants,
    isSoldOut,
  });

  const basePrice = Number(price);
  const hasSecondaryPrice = discountPrice !== null && discountPrice !== undefined;
  const secondaryPrice = hasSecondaryPrice ? Number(discountPrice) : basePrice;

  let originalPrice = basePrice;
  let effectivePrice = basePrice;

  if (hasSecondaryPrice && basePrice > 0 && secondaryPrice > 0 && basePrice !== secondaryPrice) {
    originalPrice = Math.max(basePrice, secondaryPrice);
    effectivePrice = Math.min(basePrice, secondaryPrice);
  }
  const isDiscounted = effectivePrice < originalPrice;
  const saveAmount = originalPrice - effectivePrice;

  // Social proof deterministic random
  const socialProofCount = (Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 37) + 12;

  // Render color name text below color row
  const selectedColorName = selectedColor ? getColorDisplayNameDefault(selectedColor, locale) : "";

  return (
    <div className="flex-1 flex flex-col pt-4 lg:pt-0 pb-20 lg:pb-0">
      <div className="flex justify-between items-start mb-2 lg:mb-4">
        <h1 className="text-xl lg:text-3xl font-[600] text-[#1e1810] leading-tight flex-1 pr-3">
          {name}
        </h1>
        <button
          onClick={toggleWishlist}
          className={cn(
            "w-[36px] h-[36px] rounded-full border border-[#e8dfd4] flex items-center justify-center text-[15px] shrink-0 transition-all cursor-pointer font-[Plus_Jakarta_Sans]",
            isWishlist
              ? "bg-[#f5ede8] border-[#7c3a1e] text-[#7c3a1e]"
              : "bg-[#f7f3ee] text-[#b8a898]"
          )}
        >
          {isWishlist ? "♥" : "♡"}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 lg:mb-5">
        <span className="text-[22px] lg:text-[26px] font-[700] text-[#7c3a1e]">
          {formatCurrency(effectivePrice, locale)}
        </span>
        {isDiscounted && (
          <>
            <span className="text-[14px] lg:text-[16px] text-[#8a7a68] line-through">
              {formatCurrency(originalPrice, locale)}
            </span>
            <span className="bg-[#f5ede8] text-[#7c3a1e] text-[10px] lg:text-[11px] font-[600] px-2 py-[2px] rounded-full tracking-[0.04em]">
              SAVE {formatCurrency(saveAmount, locale)}
            </span>
          </>
        )}
      </div>

      {!isSoldOut && (
        <div className="flex items-center gap-[7px] bg-[#f5ede8] border border-[#7c3a1e]/15 rounded-[10px] px-3 py-[9px] mb-4 w-full">
          <Flame className="w-4 h-4 text-[#7c3a1e] shrink-0" />
          <span className="text-[12px] font-[500] text-[#7c3a1e]">
            {socialProofCount} people bought this today — only a few left
          </span>
        </div>
      )}

      {isSoldOut && (
        <div className="mb-4 flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-white text-xs font-bold shrink-0">
            ✕
          </span>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{t("soldOutTitle")}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t("soldOutDesc")}</p>
          </div>
        </div>
      )}

      <div className="h-[1px] bg-[#e8dfd4] my-[14px]"></div>

      <div className="mb-4">
        <div className="text-[11px] font-[600] tracking-[0.08em] text-[#8a7a68] uppercase mb-[10px]">
          {t("color") || "Color"}
        </div>
        <div className="flex gap-[9px] items-center mb-1 flex-wrap">
          {colors.filter(Boolean).map((color) => {
            const isSelected = selectedColor === color;
            const displayName = getColorDisplayNameDefault(color, locale);
            const value = getColorValueDefault(color) || "#cccccc";
            return (
              <button
                key={color}
                type="button"
                onClick={() => !isSoldOut && setSelectedColor(color)}
                disabled={isSoldOut}
                className={cn(
                  "flex flex-col items-center gap-1 cursor-pointer group",
                  isSoldOut && "opacity-40 cursor-not-allowed"
                )}
              >
                <div
                  className="w-[32px] h-[32px] rounded-full border-[2px] transition-all relative flex items-center justify-center"
                  style={{ borderColor: "transparent" }}
                >
                  <div
                    className={cn(
                      "absolute inset-[-4px] rounded-full border-[1.5px] transition-colors",
                      isSelected ? "border-[#7c3a1e]" : "border-transparent"
                    )}
                  ></div>
                  <div
                    className="w-full h-full rounded-full border shadow-sm border-black/10"
                    style={{ backgroundColor: value }}
                  />
                </div>
                <span className="text-[9px] text-[#b8a898] font-[500] mt-1">{displayName}</span>
              </button>
            );
          })}
        </div>
        <div className="text-[12px] text-[#1e1810] font-[500] mt-2 mb-1">
          {selectedColorName || " "}
        </div>
      </div>

      <div className="h-[1px] bg-[#e8dfd4] mb-[14px]"></div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-[10px]">
          <div className="text-[11px] font-[600] tracking-[0.08em] text-[#8a7a68] uppercase m-0">
            {t("size") || "Size"}
          </div>
          <div className="text-[11px] text-[#7c3a1e] font-[500] cursor-pointer underline underline-offset-4">
            {t("sizeGuide") || "Size Guide"}
          </div>
        </div>
        <div className="flex gap-[7px] flex-wrap mb-1">
          {sizes.map((size) => {
            let isAvailable = true;
            if (selectedColor && !isSoldOut) {
              isAvailable = getVariantStock(size, selectedColor) > 0;
            }

            const isSelected = selectedSize === size;
            const oos = (!isAvailable && !!selectedColor) || isSoldOut;

            return (
              <button
                key={size}
                onClick={() => !isSoldOut && !oos && setSelectedSize(size)}
                disabled={oos}
                className={cn(
                  "min-w-[52px] h-[40px] border-[1.5px] rounded-[10px] font-[Plus_Jakarta_Sans] text-[12px] cursor-pointer transition-all flex items-center justify-center select-none relative overflow-hidden",
                  isSelected
                    ? "border-[#7c3a1e] bg-[#f5ede8] text-[#7c3a1e] font-[600]"
                    : "border-[#e8dfd4] bg-[#fdfaf7] text-[#1e1810] font-[500] hover:border-[#cfc0b0]",
                  oos &&
                    "opacity-70 !bg-[#f7f3ee] text-[#b8a898] hover:border-[#e8dfd4] cursor-not-allowed before:absolute before:inset-0 before:top-1/2 before:h-[1px] before:bg-gradient-to-r before:from-[#b8a898]/50 before:to-[#b8a898]/50 before:-rotate-[25deg] before:w-[150%] before:-ml-[25%]"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
        {selectedColor && !isSoldOut && sizes.some(s => getVariantStock(s, selectedColor) <= 0) && (
          <div className="text-[10px] text-[#b8a898] mt-2 mb-1">
            Some sizes are sold out · <span className="text-[#7c3a1e] cursor-pointer font-medium hover:underline">Notify me</span>
          </div>
        )}
      </div>

      <div className="h-[1px] bg-[#e8dfd4] my-[14px]"></div>

      <div className="mb-4">
        <div className="text-[11px] font-[600] tracking-[0.08em] text-[#8a7a68] uppercase mb-[10px]">
          About this piece
        </div>
        <div
          className="text-[13px] leading-[1.7] text-[#8a7a68] font-[400] prose prose-sm max-w-none"
          style={{
            display: descOpen ? "block" : "-webkit-box",
            WebkitLineClamp: descOpen ? "unset" : "3",
            WebkitBoxOrient: "vertical",
            overflow: descOpen ? "visible" : "hidden",
          }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <span
          className="text-[12px] text-[#7c3a1e] font-[500] cursor-pointer mt-[6px] inline-block hover:underline"
          onClick={toggleDesc}
        >
          {descOpen ? "Show less" : "Read more"}
        </span>
      </div>

      <div className="flex justify-between gap-[8px] mt-[14px] mb-8 lg:mb-0">
        <div className="flex-1 bg-[#fdfaf7] border border-[#e8dfd4] rounded-[10px] p-[10px_8px] text-center">
          <div className="text-[18px] mb-[4px] leading-none">🚚</div>
          <div className="text-[9px] text-[#8a7a68] font-[500] leading-[1.3]">2–4 Days Delivery</div>
        </div>
        <div className="flex-1 bg-[#fdfaf7] border border-[#e8dfd4] rounded-[10px] p-[10px_8px] text-center">
          <div className="text-[18px] mb-[4px] leading-none">↩</div>
          <div className="text-[9px] text-[#8a7a68] font-[500] leading-[1.3]">Free Returns</div>
        </div>
        <div className="flex-1 bg-[#fdfaf7] border border-[#e8dfd4] rounded-[10px] p-[10px_8px] text-center">
          <div className="text-[18px] mb-[4px] leading-none">✦</div>
          <div className="text-[9px] text-[#8a7a68] font-[500] leading-[1.3]">Premium Details</div>
        </div>
      </div>

      {/* Sticky CTA for Mobile & Normal layout for Desktop */}
      <div className="fixed bottom-0 left-0 right-0 bg-muted border-t border-[#e8dfd4] p-[12px_16px] z-50 lg:static lg:bg-transparent lg:border-none lg:p-0 lg:mt-8">
        <div className="flex gap-[9px] max-w-[390px] mx-auto lg:max-w-none">
          <button
            onClick={handleAddToCart}
            disabled={(!selectedSize || !selectedColor) || isSoldOut}
            className={cn(
              "flex-1 h-[50px] font-[Plus_Jakarta_Sans] rounded-[14px] text-[13px] font-[600] flex items-center justify-center gap-[7px] transition-all",
              cartFeedback
                ? "bg-[#edf7f2] border-2 border-[#2d6a4f] text-[#2d6a4f]"
                : "bg-[#f7f3ee] border-[1.5px] border-[#e8dfd4] text-[#1e1810] hover:border-[#cfc0b0]",
              ((!selectedSize || !selectedColor) && !cartFeedback) || isSoldOut ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
            )}
          >
            {cartFeedback ? (
              <>
                <Check className="w-[16px] h-[16px] stroke-[#2d6a4f] stroke-[2.5]" />
                ✓ Added to cart
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-[#1e1810] fill-none stroke-[1.8]">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {t("addToCart") || "Add to Cart"}
              </>
            )}
          </button>

          <button
            onClick={handleQuickBuy}
            disabled={(!selectedSize || !selectedColor) || isSoldOut}
            className={cn(
              "flex-[2] h-[50px] font-[Plus_Jakarta_Sans] rounded-[14px] text-[14px] font-[600] flex items-center justify-center gap-[7px] transition-colors border-none",
              buyFeedback
                ? "bg-[#7c3a1e] text-[#fdfaf7] opacity-80"
                : "bg-[#1e1810] text-[#fdfaf7] hover:bg-[#7c3a1e]",
              ((!selectedSize || !selectedColor) && !buyFeedback) || isSoldOut ? "opacity-60 cursor-not-allowed bg-gray-500" : "cursor-pointer"
            )}
          >
            {buyFeedback ? "Processing..." : t("quickBuy") || "Quick Buy"}
          </button>
        </div>
        <div className="text-center text-[10px] text-[#b8a898] pt-[8px] flex items-center justify-center gap-[5px] max-w-[390px] mx-auto lg:max-w-none">
          <svg viewBox="0 0 24 24" className="w-[12px] h-[12px] stroke-[#b8a898] fill-none stroke-[1.8] shrink-0">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          Estimated delivery: 2–4 business days
        </div>
      </div>
    </div>
  );
}
