import db from "@/lib/db";
import { ProductForm } from "../_components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await db.product.findUnique({
    where: { id },
    include: {
      variants: true,
    },
  })) as any;

  if (!product) {
    return <div>Product not found</div>;
  }

  const categories = await db.category.findMany({
    include: { subCategories: true },
  });

  // Serialize data to avoid "Only plain objects" error
  const serializedProduct = {
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice
      ? Number(product.discountPrice)
      : undefined,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    variants: product.variants.map((v: any) => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    })),
  };

  return (
    <ProductForm initialData={serializedProduct} categories={categories} />
  );
}
