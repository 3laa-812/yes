import { ProductCard } from "@/components/storefront/ProductCard";
import { getFeaturedProducts } from "@/lib/data/storefront";

export async function FeaturedProductsGrid() {
  const products = await getFeaturedProducts();

  return (
    <div className="grid grid-cols-2 gap-4 lg:gap-8 sm:grid-cols-3 lg:grid-cols-4 cursor-pointer">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {products.map((product: any) => (
        <div key={product.id}>
          <ProductCard
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
          />
        </div>
      ))}
    </div>
  );
}
