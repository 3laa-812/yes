import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import db from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { deleteProduct } from "@/app/actions";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

async function getProducts() {
  return db.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });
}

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();
  const t = await getTranslations("Admin.Products");
  const locale = await getLocale();
  const dateLocale = locale === "ar" ? ar : enUS;

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">{t("title")}</h1>
        <Button className="ml-auto" size="sm" asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("addProduct")}
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("image")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("name")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("status")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("price")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("totalSales")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("createdAt")}
                </th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {products.map((product: any) => (
                <tr
                  key={product.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle">
                    {(() => {
                      let imageUrl = "/placeholder.png";
                      try {
                        const images = JSON.parse(product.images as string);
                        if (Array.isArray(images) && images.length > 0) {
                          imageUrl = images[0];
                        }
                      } catch (e) {
                        console.error("Failed to parse product images", e);
                      }
                      return (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="aspect-square rounded-md object-cover"
                        />
                      );
                    })()}
                  </td>
                  <td className="p-4 align-middle font-medium">
                    {product.name}
                  </td>
                  <td className="p-4 align-middle">
                    {product.stock > 0 ? t("active") : t("draft")}
                  </td>
                  <td className="p-4 align-middle">
                    {formatPrice(Number(product.price))}
                  </td>
                  <td className="p-4 align-middle">0</td>
                  <td className="p-4 align-middle">
                    {format(new Date(product.createdAt), "MMM d, yyyy", {
                      locale: dateLocale,
                    })}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}`}>
                          {t("edit")}
                        </Link>
                      </Button>
                      <form action={deleteProduct}>
                        <input
                          type="hidden"
                          name="productId"
                          value={product.id}
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          {t("delete")}
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
