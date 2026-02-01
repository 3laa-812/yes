import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import db from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { deleteProduct } from "@/app/actions";
import Link from "next/link";

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

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Products</h1>
        <Button className="ml-auto" size="sm" asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Image
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Price
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Total Sales
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Created at
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Actions
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
                    {product.stock > 0 ? "Active" : "Draft"}
                  </td>
                  <td className="p-4 align-middle">
                    {formatPrice(Number(product.price))}
                  </td>
                  <td className="p-4 align-middle">0</td>
                  <td className="p-4 align-middle">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}`}>Edit</Link>
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
                          Delete
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
