import db from "@/lib/db";
import { ProductForm } from "../_components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    return <div>Product not found</div>;
  }

  const categories = await db.category.findMany();

  return <ProductForm initialData={product} categories={categories} />;
}
