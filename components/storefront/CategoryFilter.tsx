"use client";

import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  locale: string;
  allLabel: string;
}

export function CategoryFilter({
  categories,
  locale,
  allLabel,
}: CategoryFilterProps) {
  const pathname = usePathname();

  // Next-intl routes might be like /en/products or /ar/products
  const isAllProducts = pathname.endsWith("/products");

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide pt-2">
      <div className="flex gap-2 min-w-max px-1">
        {/* All Products Pill */}
        <Link
          href="/products"
          className={cn(
            "relative rounded-full px-6 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
            isAllProducts
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          {isAllProducts && (
            <motion.div
              layoutId="active-category-pill"
              className="absolute inset-0 bg-primary rounded-full shadow-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{allLabel}</span>
        </Link>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const href = `/collections/${cat.slug}`;
          const isActive = pathname.includes(href);

          return (
            <Link
              key={cat.id}
              href={href}
              className={cn(
                "relative rounded-full px-6 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-category-pill"
                  className="absolute inset-0 bg-primary rounded-full shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">
                {locale === "ar" ? cat.name_ar : cat.name_en}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
