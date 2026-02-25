import dynamic from "next/dynamic";
import { Suspense } from "react";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { FeaturedProductsGrid } from "@/components/storefront/FeaturedProductsGrid";
import { FeaturedProductsSkeleton } from "@/components/storefront/FeaturedProductsSkeleton";

const Hero = dynamic(() =>
  import("@/components/storefront/Hero").then((mod) => mod.Hero),
);

export const revalidate = 60;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations("HomePage");

  return (
    <div className="bg-background min-h-screen">
      <Hero />

      <SectionReveal className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {t("featuredCollection")}
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
          >
            {t("viewAll")}
            <span aria-hidden="true" className="rtl:rotate-180 inline-block">
              {" "}
              &rarr;
            </span>
          </Link>
        </div>

        <Suspense fallback={<FeaturedProductsSkeleton />}>
          <FeaturedProductsGrid />
        </Suspense>
      </SectionReveal>

      {/* Brand Story Section */}
      <SectionReveal delay={0.2} className="bg-secondary py-24 my-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            {t("crafted")}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("craftedDesc")}
          </p>
        </div>
      </SectionReveal>
    </div>
  );
}
