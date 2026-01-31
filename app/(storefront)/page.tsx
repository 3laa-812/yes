import { Hero } from "@/components/storefront/Hero";
import { ProductCard } from "@/components/storefront/ProductCard";
import db from "@/lib/db";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion";

async function getFeaturedProducts() {
  const products = await db.product.findMany({
    take: 4,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true, // Include category relation to get category name
    },
  });
  return products;
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <div className="bg-white">
      <Hero />

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Featured Collection
          </h2>
          <a
            href="/products"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all<span aria-hidden="true"> &rarr;</span>
          </a>
        </div>

        <StaggerContainer className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price as unknown as number}
                category={product.category.name}
                image={JSON.parse(product.images as string)[0]}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
}
