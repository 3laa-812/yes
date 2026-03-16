import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface BundleProduct {
  id: string;
  name_ar?: string | null;
  name_en?: string | null;
  images?: string | null;
  price: number | string;
  discountPrice?: number | string | null;
  category?: { name_en: string; name_ar: string } | null;
}

export interface OfferBundleCardProps {
  offerId: string;
  title_en?: string | null;
  title_ar?: string | null;
  products: BundleProduct[];
  bundlePrice?: number | null;
  locale: string;
  index?: number;
  variant?: "strip" | "card";
}

function getFirstImageUrl(images: string | null | undefined): string {
  if (!images) return "/placeholder.png";
  try {
    const parsed = JSON.parse(images as string);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
  } catch {
    // ignore
  }
  return "/placeholder.png";
}

export function OfferBundleCard({
  offerId,
  title_en,
  title_ar,
  products,
  bundlePrice: bundlePriceProp,
  locale,
  index = 0,
  variant = "strip",
}: OfferBundleCardProps) {
  const isRTL = locale === "ar";
  const t = useTranslations("Storefront.Bundles");
  const addItem = useCartStore((state) => state.addItem);

  const productCurrentPrices = products.map(p => Number(p.discountPrice ?? p.price));
  const currentTotal = productCurrentPrices.reduce((sum, price) => sum + price, 0);

  const bundlePrice =
    bundlePriceProp != null && bundlePriceProp > 0
      ? Number(bundlePriceProp)
      : Math.round(currentTotal * 0.85);

  const savings = Math.max(0, currentTotal - bundlePrice);

  const handleAddBundleToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    products.forEach((product, i) => {
      const currentPrice = Number(product.discountPrice ?? product.price);
      const name =
        locale === "ar" ? product.name_ar ?? product.name_en : product.name_en ?? product.name_ar;
      const category = product.category;
      const categoryName = category
        ? locale === "ar"
          ? category.name_ar
          : category.name_en
        : "";
      addItem({
        id: `${product.id}-bundle-${offerId}-${i}`,
        productId: product.id,
        name: name ?? "",
        name_en: product.name_en ?? "",
        name_ar: product.name_ar ?? "",
        price: Math.round((currentPrice / currentTotal) * bundlePrice),
        originalPrice: currentPrice,
        image: getFirstImageUrl(product.images),
        category: categoryName,
        category_en: category?.name_en ?? "",
        category_ar: category?.name_ar ?? "",
        size: "",
        color: "",
        quantity: 1,
      });
    });

    toast.success(t("addedToCart"));
  };

  if (products.length < 2) return null;

  const isCard = variant === "card";
  const offerTitle = isRTL ? title_ar ?? title_en : title_en ?? title_ar;

  const header = isCard && (
    <div className="mb-4 space-y-0.5">
      <h3 className="text-lg font-black tracking-tight text-foreground sm:text-xl">
        {offerTitle || t("title")}
      </h3>
    </div>
  );

  const productList = (
    <div
      className={cn(
        "flex w-full items-stretch gap-3 sm:gap-4",
        isCard 
          ? "flex-row overflow-x-auto pb-1 scrollbar-none snap-x" 
          : "flex-row items-center flex-wrap lg:flex-nowrap"
      )}
    >
      {products.map((product, idx) => {
        const name = locale === "ar" ? product.name_ar ?? product.name_en : product.name_en ?? product.name_ar;
        const currentPrice = Number(product.discountPrice ?? product.price);
        
        return (
          <div key={product.id + idx} className="flex shrink-0 items-center gap-3 sm:gap-4 snap-start">
            {idx > 0 && (
              <div className={cn("flex shrink-0 items-center justify-center", isCard ? "pt-10" : "px-0.5")}>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/80 text-foreground/40 shadow-sm border border-border/50">
                  <Plus className="h-3 w-3" strokeWidth={3} />
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-2 w-28 sm:w-36 md:w-40">
              <ProductThumb
                imageUrl={getFirstImageUrl(product.images)}
                name={name ?? ""}
                price={currentPrice}
                locale={locale}
                variant={variant}
                showDetails={isCard}
              />
              {isCard && (
                 <div className="px-1">
                    <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
                      {name}
                    </p>
                    <p className="text-[9px] font-medium text-muted-foreground/70">
                      {formatCurrency(currentPrice, locale)}
                    </p>
                 </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const priceBox = (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border transition-all duration-300",
        "bg-linear-to-br from-primary/10 via-primary/5 to-background",
        "p-4 sm:p-5 text-center shadow-md hover:shadow-lg",
        isCard ? "mt-4 w-full border-primary/20" : "min-w-[170px] sm:min-w-[200px] border-primary/25 ml-auto"
      )}
    >
      <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-primary/10 blur-2xl" />
      
      <div className="relative z-10 space-y-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            {t("original")}
          </p>
          <p className="mt-0.5 text-xs font-semibold line-through text-muted-foreground/40 decoration-1.5">
            {productCurrentPrices.map(price => formatCurrency(price, locale)).join(" + ")}
          </p>
        </div>

        <div className="space-y-0.5">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary">
            {t("bundlePrice")}
          </p>
          <p className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {formatCurrency(bundlePrice, locale)}
          </p>
        </div>

        {savings > 0 && (
          <div className="flex flex-col items-center pt-1">
             <div className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-[10px] font-black tracking-widest text-primary-foreground shadow-md shadow-primary/20">
              {t("youSave", { amount: formatCurrency(savings, locale) }).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ctaButton = (
    <Button
      onClick={handleAddBundleToCart}
      size={isCard ? "lg" : "default"}
      className={cn(
        "group relative w-full overflow-hidden font-black transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg hover:shadow-primary/20",
        isCard ? "mt-4 py-7 rounded-xl" : "mt-3"
      )}
    >
      <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/95 to-primary transition-opacity duration-300 group-hover:opacity-90" />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/30 transition-transform duration-300 translate-y-full group-hover:translate-y-0" />
      <ShoppingCart className="relative z-10 h-4 w-4 ltr:mr-2 rtl:ml-2" strokeWidth={2.5} />
      <span className="relative z-10 uppercase tracking-widest text-xs">{t("addBundleToCart")}</span>
    </Button>
  );

  if (isCard) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-[82vw] min-w-[82vw] shrink-0 snap-center flex-col rounded-[2rem] border bg-card p-5 shadow-xl transition-all hover:shadow-2xl sm:w-[70vw] sm:min-w-[70vw] md:w-[400px] md:min-w-[400px]"
      >
        {header}
        {productList}
        {priceBox}
        {ctaButton}
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex min-w-full shrink-0 snap-center items-center gap-6 rounded-[2rem] border bg-card/60 backdrop-blur-md p-6 shadow-xl transition-all hover:shadow-2xl hover:bg-card md:p-8"
    >
      <div className="flex flex-1 items-center gap-6 lg:gap-10">
        {productList}
        
        <div className="hidden lg:flex shrink-0 items-center justify-center" aria-hidden>
          <div className="h-[2px] w-8 bg-border/40" />
          <div className="mx-2 text-2xl font-light text-muted-foreground/20">=</div>
          <div className="h-[2px] w-8 bg-border/40" />
        </div>

        <div className="flex flex-1 flex-col items-end gap-2">
          {priceBox}
          <div className="w-full max-w-[200px]">
             {ctaButton}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ProductThumb({
  imageUrl,
  name,
  price,
  locale,
  variant,
  showDetails = false,
}: {
  imageUrl: string;
  name: string;
  price: number;
  locale: string;
  variant: "strip" | "card";
  showDetails?: boolean;
}) {
  const isCard = variant === "card";
  return (
    <div
      className={cn(
        "group/thumb relative flex flex-col overflow-hidden rounded-[1rem] bg-muted transition-transform duration-500 hover:scale-[1.05]",
        isCard ? "w-full aspect-[1/1]" : "w-28 shrink-0 sm:w-32 md:w-36 aspect-[4/5]"
      )}
    >
      <div className="relative flex-1 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes={isCard ? "(max-width: 640px) 40vw, 250px" : "150px"}
          className="object-cover transition-transform duration-700 group-hover/thumb:scale-110"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/thumb:opacity-100" />
      </div>
      
      {!showDetails && (
        <>
          <div className="absolute bottom-0 inset-x-0 p-3 bg-background/90 backdrop-blur-xl border-t border-border/10 translate-y-full transition-transform duration-500 group-hover/thumb:translate-y-0">
            <p className="truncate text-[10px] font-black uppercase tracking-wider text-foreground" title={name}>
              {name}
            </p>
            <p className="text-[9px] font-bold text-primary">
              {formatCurrency(price, locale)}
            </p>
          </div>
          <div className="p-2 transition-opacity duration-300 group-hover/thumb:opacity-0">
             <p className="truncate text-[9px] font-bold text-foreground/80" title={name}>
              {name}
            </p>
            <p className="text-[8px] font-medium text-muted-foreground">
              {formatCurrency(price, locale)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
