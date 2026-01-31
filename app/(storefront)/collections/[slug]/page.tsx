import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import db from "@/lib/db";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getProductsByCategory(slug: string) {
  const category = await db.category.findUnique({
    where: {
      slug: slug,
    },
    include: {
      products: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!category) {
    return null;
  }
  return category;
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getProductsByCategory(slug);

  if (!category) {
    return notFound();
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {category.name} Collection
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {category.products.map((product: any) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price as unknown as number}
              category={product.category.name}
              image={JSON.parse(product.images as string)[0]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
