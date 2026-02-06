import db from "@/lib/db";
import { ProductForm } from "../_components/ProductForm";

export default async function NewProductPage() {
  const categories = await db.category.findMany();

  return <ProductForm categories={categories} />;
}
