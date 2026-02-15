import { CategoryForm } from "@/components/admin/CategoryForm";
import db from "@/lib/db";

export default async function NewCategoryPage() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { name_en: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <CategoryForm categories={categories} />
    </div>
  );
}
