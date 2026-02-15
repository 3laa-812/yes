import db from "@/lib/db";
import { ProductForm } from "../_components/ProductForm";

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { displayOrder: "asc" } } },
    orderBy: { displayOrder: "asc" },
  });

  return <ProductForm categories={categories} />;
}
