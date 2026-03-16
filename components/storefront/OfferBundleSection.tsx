"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OfferBundleCard, type BundleProduct } from "./OfferBundleCard";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface BundleOffer {
  id: string;
  title_en?: string | null;
  title_ar?: string | null;
  /** When backend supports it */
  bundlePrice?: number | null;
  products?: BundleProduct[];
}

interface OfferBundleSectionProps {
  offers: BundleOffer[];
  locale: string;
}

export function OfferBundleSection({ offers, locale }: OfferBundleSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Storefront.Bundles");

  if (!offers?.length) return null;

  const bundles = offers.filter(
    (o) => o.products && o.products.length >= 2
  );

  if (bundles.length === 0) return null;

  const isRTL = locale === "ar";

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.8;
    el.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <SectionReveal delay={0.1} className="w-full pt-10">
      <section
        className={cn(
          "relative rounded-[2rem] md:rounded-[3.5rem] md:px-12 md:py-16",
          "bg-linear-to-br from-muted/80 via-muted/40 to-background",
          "shadow-[0_8px_40px_rgba(0,0,0,0.04),0_1px_4px_rgba(0,0,0,0.02)]"
        )}
      >
        {/* Advanced decorative gradients */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 10% 10%, hsl(var(--primary) / 0.05), transparent 40%), radial-gradient(circle at 90% 90%, hsl(var(--primary) / 0.03), transparent 40%)",
          }}
        />
        
        <div className="container relative mx-auto max-w-7xl">
          {/* Section header */}
          <header className="mb-8 text-center md:mb-12">
            <h2 className="text-3xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {t("title")}
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-primary/20" />
            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-muted-foreground md:text-lg">
              {t("subtitle")}
            </p>
          </header>

          {/* Desktop: horizontal scroll row with big arrows */}
          <div className="group/scroll relative hidden md:block">
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-8 pt-4 scroll-smooth scrollbar-none"
              style={{ paddingInline: "2px" }}
              role="list"
            >
              {bundles.map((offer, index) => (
                <div
                  key={offer.id}
                  className="w-full max-w-4xl shrink-0"
                  role="listitem"
                >
                  <OfferBundleCard
                    offerId={offer.id}
                    title_en={offer.title_en}
                    title_ar={offer.title_ar}
                    products={offer.products!}
                    bundlePrice={offer.bundlePrice}
                    locale={locale}
                    index={index}
                    variant="strip"
                  />
                </div>
              ))}
            </div>

            {bundles.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "absolute left-0 top-1/2 z-20 h-14 w-14 -translate-y-1/2 -translate-x-7 rounded-full border-2 bg-background/80 shadow-2xl backdrop-blur-xl transition-all duration-300",
                    "opacity-0 group-hover/scroll:opacity-100 hover:scale-110 hover:bg-background",
                    isRTL && "left-auto right-0 translate-x-7"
                  )}
                  onClick={() => scroll("left")}
                  aria-label={locale === "ar" ? "تمرير لليسار" : "Scroll left"}
                >
                  <ChevronLeft className={cn("h-6 w-6", isRTL && "rotate-180")} />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "absolute right-0 top-1/2 z-20 h-14 w-14 -translate-y-1/2 translate-x-7 rounded-full border-2 bg-background/80 shadow-2xl backdrop-blur-xl transition-all duration-300",
                    "opacity-0 group-hover/scroll:opacity-100 hover:scale-110 hover:bg-background",
                    isRTL && "right-auto left-0 -translate-x-7"
                  )}
                  onClick={() => scroll("right")}
                  aria-label={locale === "ar" ? "تمرير لليمين" : "Scroll right"}
                >
                  <ChevronRight className={cn("h-6 w-6", isRTL && "rotate-180")} />
                </Button>
              </>
            )}
          </div>

          {/* Mobile: swipeable carousel */}
          <div
            className="flex justify-center snap-x snap-mandatory gap-5 overflow-x-auto pb-8 -mx-4 px-4 md:hidden scrollbar-none"
            role="list"
          >
            {bundles.map((offer, index) => (
              <OfferBundleCard
                key={offer.id}
                offerId={offer.id}
                title_en={offer.title_en}
                title_ar={offer.title_ar}
                products={offer.products!}
                bundlePrice={offer.bundlePrice}
                locale={locale}
                index={index}
                variant="card"
              />
            ))}
          </div>
          
          {/* Scroll progress/dots for mobile */}
          {bundles.length > 1 && (
             <div className="flex justify-center gap-2 md:hidden">
                {bundles.map((_, i) => (
                   <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary/25 transition-all duration-300 hover:bg-primary/50" />
                ))}
             </div>
          )}
        </div>
      </section>
    </SectionReveal>
  );
}
