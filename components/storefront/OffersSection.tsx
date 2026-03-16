"use client";

import { useTranslations } from "next-intl";
import { OfferCard } from "./OfferCard";
import { MoveRight, MoveLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { SectionReveal } from "@/components/ui/SectionReveal";

interface OffersSectionProps {
  offers: Array<{
    id?: string;
    title_en?: string | null;
    title_ar?: string | null;
    products?: Array<{
      id: string;
      name_ar?: string | null;
      name_en?: string | null;
      images?: string | null;
      price: number | string;
      discountPrice?: number | string | null;
    }>;
  }>;
  locale: string;
}

export function OffersSection({ offers, locale }: OffersSectionProps) {
  const t = useTranslations("HomePage");

  if (!offers || offers.length === 0) return null;

  const mainOffer = offers[0];
  const products = mainOffer?.products ?? [];

  if (products.length === 0) return null;

  const isRTL = locale === "ar";

  return (
    <SectionReveal
      delay={0.1}
      className="w-full py-14 md:py-20"
    >
      <section
        className="relative overflow-hidden rounded-3xl md:rounded-4xl bg-linear-to-br from-muted/60 via-muted/40 to-background px-4 py-12 md:px-8 md:py-16"
        style={{
          boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* Subtle decorative gradient */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.08), transparent)",
          }}
        />

        <div className="container relative mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-8 flex flex-col gap-2 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.5rem]">
                {t("hotDeals")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground md:text-base">
                {locale === "ar"
                  ? mainOffer.title_ar ?? mainOffer.title_en
                  : mainOffer.title_en ?? mainOffer.title_ar}
              </p>
            </div>
            <Link
              href="/products"
              className="mt-2 inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:mt-0"
            >
              {isRTL ? (
                <>
                  <MoveLeft className="h-4 w-4 ltr:ml-2 rtl:mr-2" aria-hidden />
                  عرض الكل
                </>
              ) : (
                <>
                  View all
                  <MoveRight className="h-4 w-4 ltr:ml-2 rtl:mr-2" aria-hidden />
                </>
              )}
            </Link>
          </div>

          {/* Mobile: horizontal scroll */}
          <div
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:hidden scrollbar-thin"
            style={{ scrollbarWidth: "thin" }}
            role="list"
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className="w-[78vw] min-w-[78vw] shrink-0 snap-center sm:w-[55vw] sm:min-w-[55vw]"
                role="listitem"
              >
                <OfferCard
                  product={product}
                  locale={locale}
                  index={index}
                />
              </div>
            ))}
          </div>

          {/* Desktop: Option A — 1 large featured + 2–3 smaller */}
          <div className="hidden md:grid md:grid-cols-3 md:gap-5 lg:gap-6 min-h-[420px]">
            {products[0] && (
              <div className="col-span-2 row-span-2">
                <OfferCard
                  product={products[0]}
                  locale={locale}
                  isFeatured
                  index={0}
                />
              </div>
            )}
            {products.slice(1, 4).map((product, index) => (
              <div key={product.id} className="col-span-1">
                <OfferCard
                  product={product}
                  locale={locale}
                  index={index + 1}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}
