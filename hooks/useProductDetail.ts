import { useState } from "react";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

export function useProductDetail({
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
}: {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variants: any[];
  isSoldOut?: boolean;
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isWishlist, setIsWishlist] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(false);
  const [buyFeedback, setBuyFeedback] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();
  const t = useTranslations("Storefront.Product");

  const getVariantStock = (size: string, color: string) => {
    const variant = variants.find((v) => v.size === size && v.color === color);
    return variant ? variant.stock : 0;
  };

  const currentVariantStock =
    selectedSize && selectedColor
      ? getVariantStock(selectedSize, selectedColor)
      : null;

  const isOutOfStock =
    selectedSize && selectedColor
      ? currentVariantStock !== null && currentVariantStock <= 0
      : false;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    if (!selectedSize || !selectedColor) {
      toast.error(t("selectOptions"));
      return;
    }
    if (isOutOfStock) {
      toast.error(t("combinationOutOfStock"));
      return;
    }

    const basePrice = Number(price);
    const hasSecondaryPrice = discountPrice !== null && discountPrice !== undefined;
    const secondaryPrice = hasSecondaryPrice ? Number(discountPrice) : basePrice;

    let originalPrice = basePrice;
    let effectivePrice = basePrice;

    if (hasSecondaryPrice && basePrice > 0 && secondaryPrice > 0 && basePrice !== secondaryPrice) {
      originalPrice = Math.max(basePrice, secondaryPrice);
      effectivePrice = Math.min(basePrice, secondaryPrice);
    }
    const oldPrice = effectivePrice < originalPrice ? originalPrice : undefined;

    addItem({
      id: `${id}-${selectedSize}-${selectedColor}`,
      productId: id,
      name,
      name_en,
      name_ar,
      price: effectivePrice,
      originalPrice: oldPrice,
      image,
      category,
      category_en,
      category_ar,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    });

    setCartFeedback(true);
    setTimeout(() => setCartFeedback(false), 2000);
    toast.success(t("addedToCart"));
  };

  const handleQuickBuy = () => {
    if (isSoldOut) return;
    if (!selectedSize || !selectedColor) {
      toast.error(t("selectOptions"));
      return;
    }
    if (isOutOfStock) {
      toast.error(t("combinationOutOfStock"));
      return;
    }

    setBuyFeedback(true);
    setTimeout(() => {
      clearCart();
      handleAddToCart();
      router.push("/checkout");
    }, 1800);
  };

  const toggleWishlist = () => setIsWishlist(!isWishlist);
  const toggleDesc = () => setDescOpen(!descOpen);

  return {
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
    isOutOfStock,
    currentVariantStock,
    getVariantStock,
    handleAddToCart,
    handleQuickBuy,
  };
}
