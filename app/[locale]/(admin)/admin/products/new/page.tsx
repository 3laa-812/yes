import db from "@/lib/db";
import { ProductForm } from "../_components/ProductForm";

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    include: { subCategories: true },
  });

  return <ProductForm categories={categories} />;
}
