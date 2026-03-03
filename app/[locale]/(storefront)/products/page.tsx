import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllProducts, getCategories } from "@/lib/data/storefront";
import { languageAlternates, localizedUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title =
    locale === "ar"
      ? "تسوق جميع منتجات YES الرجالية | ملابس وإطلالات كاملة"
      : "All YES Men’s Wear Products | Shop the Full Collection";

  const description =
    locale === "ar"
      ? "استعرض جميع منتجات YES من القمصان والبناطيل والتيشيرتات وأكثر. فرز حسب الفئة واكتشف أفضل الإطلالات الرجالية بتصاميم عصرية وجودة عالية."
      : "Browse all YES men’s wear products including shirts, pants, t‑shirts and more. Explore every collection in one place with modern cuts, bold details and easy on‑site navigation.";

  const path = "/products";

  return {
    title,
    description,
    alternates: {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canonical: localizedUrl(locale as any, path),
      languages: languageAlternates(path),
    },
    openGraph: {
      title,
      description,
                                   
      type: "website",
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      url: localizedUrl(locale as any, path),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Storefront.Products");
  const products = await getAllProducts();
  const categories = await getCategories();

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {t("allProducts")}
          </h2>
          <span className="text-muted-foreground">
            {t("productsCount", { count: products.length })}
          </span>
        </div>

        {/* Category Pills */}
        <div className="mt-6 flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button variant="default" size="sm" asChild className="rounded-full">
            <Link href="/products">{t("all")}</Link>
          </Button>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {categories.map((cat: any) => (
            <Button
              key={cat.id}
              variant="outline"
              size="sm"
              asChild
              className="rounded-full"
            >
              <Link href={`/collections/${cat.slug}`}>
                {locale === "ar" ? cat.name_ar : cat.name_en}
              </Link>
            </Button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {products.map((product: any) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={locale === "ar" ? product.name_ar : product.name_en}
              name_en={product.name_en}
              name_ar={product.name_ar}
              price={product.price as unknown as number}
              discountPrice={product.discountPrice as unknown as number}
              category={
                locale === "ar"
                  ? product.category.name_ar
                  : product.category.name_en
              }
              category_en={product.category.name_en}
              category_ar={product.category.name_ar}
              image={JSON.parse(product.images as string)[0]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
