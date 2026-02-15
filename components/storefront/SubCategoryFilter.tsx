"use client";

import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

interface SubCategory {
  id: string;
  name_en: string;
  name_ar: string;
}

interface SubCategoryFilterProps {
  subCategories: SubCategory[];
  slug: string; // Parent category slug
  locale: string;
}

export function SubCategoryFilter({
  subCategories,
  slug,
  locale,
}: SubCategoryFilterProps) {
  const searchParams = useSearchParams();
  const currentSubId = searchParams.get("subCategoryId");

  const items = [
    { id: null, name_en: "All", name_ar: "الكل" },
    ...subCategories,
  ];

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex gap-2 min-w-max px-1">
        {items.map((item) => {
          const isActive =
            item.id === currentSubId || (item.id === null && !currentSubId);
          const href = item.id
            ? `/collections/${slug}?subCategoryId=${item.id}`
            : `/collections/${slug}`;

          return (
            <Link
              key={item.id || "all"}
              href={href}
              className={cn(
                "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">
                {locale === "ar" ? item.name_ar : item.name_en}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
