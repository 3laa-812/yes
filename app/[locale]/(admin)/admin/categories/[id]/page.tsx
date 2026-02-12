import { CategoryForm } from "@/components/admin/CategoryForm";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import { SubCategoriesManager } from "@/components/admin/SubCategoriesManager";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await db.category.findUnique({
    where: { id },
    include: { subCategories: true },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <CategoryForm category={category} />

      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Sub-Categories</h2>
        <SubCategoriesManager
          categoryId={category.id}
          initialSubCategories={category.subCategories}
        />
      </div>
    </div>
  );
}
