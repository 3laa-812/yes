import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SubCategoryFilter } from "@/components/storefront/SubCategoryFilter";
import { ComingSoonCategory } from "@/components/storefront/ComingSoonCategory";
import { getCategoryWithProducts } from "@/lib/data/storefront";
import { languageAlternates, localizedUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const category = await getCategoryWithProducts(slug);
  const t = await getTranslations("Storefront.Collections");

  const categoryName =
    category && locale === "ar" ? category.name_ar : category?.name_en;

  const title = categoryName
    ? t("collection", { name: categoryName })
    : locale === "ar"
      ? t("collection", { name: slug }) + " | YES"
      : t("collection", { name: slug }) + " | YES";

  const description =
    locale === "ar"
      ? `اكتشف مجموعة ${categoryName || slug} من YES للملابس الرجالية. تصفح تشكيلة مختارة من القطع المتناسقة لإطلالات عصرية كاملة لكل مناسبة.`
      : `Explore the YES ${categoryName || slug} collection for modern men’s wear. Browse curated pieces designed to build complete, confident looks for every occasion.`;

  const path = `/collections/${slug}`;

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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ subCategoryId?: string }>;
}) {
  const { slug, locale } = await params;
  const { subCategoryId } = await searchParams;
  const category = await getCategoryWithProducts(slug, subCategoryId);

  const t = await getTranslations("Storefront.Collections");

  if (!category) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 capitalize">
            {t("collection", { name: slug })}
          </h2>
          <p className="mt-4 text-gray-500">{t("categoryNotFound")}</p>
        </div>
      </div>
    );
  }

  const categoryName = locale === "ar" ? category.name_ar : category.name_en;

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground capitalize">
            {t("collection", { name: categoryName })}
          </h2>
          <span className="text-muted-foreground">
            {t("productsCount", { count: category.products.length })}
          </span>
        </div>

        {/* SubCategory Pills */}
        <div className="mt-6">
          <SubCategoryFilter
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            subCategories={category.subCategories as any}
            slug={slug}
            locale={locale}
          />
        </div>

        {category.products.length === 0 ? (
          <ComingSoonCategory categoryName={categoryName} />
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {category.products.map((product: any) => (
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
        )}
      </div>
    </div>
  );
}
