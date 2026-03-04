import { Button } from "@/components/ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

import db from "@/lib/db";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from "next/image";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { deleteCategory } from "@/app/actions";

import { Link } from "@/i18n/routing";

import { getTranslations } from "next-intl/server";

import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Table,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TableBody,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TableCell,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TableHead,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TableHeader,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TableRow,
} from "@/components/ui/table";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export default async function AdminCategoriesPage({
  params,
}: {
  params: { locale: string };
}) {
  const categories = await getCategories();
  const t = await getTranslations("Admin.Categories");

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{t("pageTitle")}</h1>
        <Button size="sm" asChild>
          <Link href="/admin/categories/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("addCategory")}
          </Link>
        </Button>
      </div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <CategoryList initialCategories={categories as any} />
    </>
  );
}
