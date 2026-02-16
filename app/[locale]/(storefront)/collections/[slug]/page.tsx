import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import db from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { SubCategoryFilter } from "@/components/storefront/SubCategoryFilter";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<{
    subCategoryId?: string;
  }>;
}

async function getCategoryWithProducts(slug: string, subCategoryId?: string) {
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      children: true,
    },
  });

  if (!category) return null;

  // Filter logic:
  // If subCategoryId is present, ensure it's a valid child and fetch only its products.
  // If not, fetch products for the main category AND all its children.

  let targetCategoryIds = [
    category.id,
    ...category.children.map((c: any) => c.id),
  ];

  if (subCategoryId) {
    const isChild = category.children.some((c: any) => c.id === subCategoryId);
    if (isChild) {
      targetCategoryIds = [subCategoryId];
    } else {
      // If subCategoryId is invalid/unrelated, we return products for the main category only (or empty?)
      // Use case: user clicks a stale link. Let's fallback to main category view effectively ignoring the invalid sub.
      // Or strictly return empty. Let's return empty to avoid confusion.
      targetCategoryIds = [];
    }
  }

  const products = await db.product.findMany({
    where: {
      categoryId: { in: targetCategoryIds },
    },
    include: {
      category: true,
    },
  });

  // Return structure compatible with component expectation (mapping children to subCategories)
  return {
    ...category,
    subCategories: category.children,
    products,
  };
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug, locale } = await params;
  const { subCategoryId } = await searchParams;
  const category = await getCategoryWithProducts(slug, subCategoryId);

  if (!category) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 capitalize">
            {slug} Collection
          </h2>
          <p className="mt-4 text-gray-500">Category not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-foreground capitalize">
            {locale === "ar" ? category.name_ar : category.name_en} Collection
          </h2>
          <span className="text-muted-foreground">
            {category.products.length} Products
          </span>
        </div>

        {/* SubCategory Pills */}
        <div className="mt-6">
          <SubCategoryFilter
            subCategories={category.subCategories as any}
            slug={slug}
            locale={locale}
          />
        </div>

        {category.products.length === 0 ? (
          <div className="mt-10 text-center py-20 border-2 border-dashed rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold text-muted-foreground">
              No products found
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Try clearing the filters or check back later.
            </p>
            {subCategoryId && (
              <Button variant="link" asChild className="mt-4">
                <Link href={`/collections/${slug}`}>Clear Filters</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
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
