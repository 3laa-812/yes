import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

import { getAllProducts, getCategories } from "@/lib/data/storefront";

export const revalidate = 60;

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const products = await getAllProducts();
  const categories = await getCategories();

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            All Products
          </h2>
          <span className="text-muted-foreground">
            {products.length} Products
          </span>
        </div>

        {/* Category Pills */}
        <div className="mt-6 flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button variant="default" size="sm" asChild className="rounded-full">
            <Link href="/products">All</Link>
          </Button>
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
