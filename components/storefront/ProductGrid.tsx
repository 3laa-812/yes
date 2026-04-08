import { ProductCard } from "@/components/storefront/ProductCard";
import { getFeaturedProducts } from "@/lib/data/storefront";

/**
 * Responsive product grid — 2 cols on mobile, 3 on sm, 4 on lg.
 * Parses `colors` and `sizes` from the product record when available.
 */
export async function ProductGrid() {
  const products = await getFeaturedProducts();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5 lg:gap-6">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {products.map((product: any) => {
        // Safely parse colors / sizes arrays stored as JSON strings
        let colors: string[] = [];
        let sizes: string[] = [];
        try {
          if (product.colors) colors = JSON.parse(product.colors as string);
        } catch {}
        try {
          if (product.sizes) sizes = JSON.parse(product.sizes as string);
        } catch {}

        return (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            name_en={product.name_en}
            name_ar={product.name_ar}
            price={product.price as unknown as number}
            discountPrice={product.discountPrice as unknown as number}
            category={product.category.name}
            category_en={product.category.name_en}
            category_ar={product.category.name_ar}
            image={JSON.parse(product.images as string)[0]}
            isSoldOut={product.isSoldOut ?? false}
            colors={colors}
            sizes={sizes}
          />
        );
      })}
    </div>
  );
}
