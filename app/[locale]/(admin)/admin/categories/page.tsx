import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import db from "@/lib/db";
import Image from "next/image";
import { deleteCategory } from "@/app/actions";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteCategoryButton } from "./_components/DeleteCategoryButton";
import { CategoryList } from "@/components/admin/CategoryList";

async function getCategories() {
  return db.category.findMany({
    where: { parentId: null },
    orderBy: { displayOrder: "asc" },
    include: {
      children: {
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { displayOrder: "asc" },
      },
      _count: {
        select: { products: true, children: true },
      },
    },
  });
}

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  // const t = await getTranslations("Admin.Categories"); // Todo: Add translations

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Categories</h1>
        <Button size="sm" asChild>
          <Link href="/admin/categories/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>
      <CategoryList initialCategories={categories as any} />
    </>
  );
}
