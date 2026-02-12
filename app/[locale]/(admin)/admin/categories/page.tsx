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

async function getCategories() {
  return db.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: { products: true, subCategories: true },
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
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Sub-Categories</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  No categories found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover aspect-square"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xs">
                        No Img
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>{category._count.subCategories}</TableCell>
                  <TableCell>{category._count.products}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/categories/${category.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteCategoryButton id={category.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
