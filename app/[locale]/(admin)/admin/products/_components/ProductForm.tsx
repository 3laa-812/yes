"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { createProduct, updateProduct } from "@/app/actions";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Import toast

interface ProductFormProps {
  initialData?: any;
  categories: { id: string; name: string }[];
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(
    initialData?.images ? JSON.parse(initialData.images) : [],
  );

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsLoading(true);

    // Append images to formData as JSON string (or individual fields if preferred, but JSON is easier for our existing schema)
    // Actually actions.ts expects 'files' or 'images'. We will need to update actions to parse 'imageUrls'
    // Let's pass 'imageUrls' as a JSON string
    formData.set("imageUrls", JSON.stringify(images));

    try {
      if (initialData) {
        await updateProduct(formData);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(formData);
        toast.success("Product created successfully!");
      }
      // Actions now handle redirect, but we can do it here too if needed
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">
          {initialData ? "Edit Product" : "New Product"}
        </h1>
      </div>

      <form action={onSubmit} className="space-y-8">
        {initialData && (
          <input type="hidden" name="productId" value={initialData.id} />
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Product Images</label>
          <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
            <FileUpload
              endpoint="imageUploader"
              value={images}
              onChange={(url) => {
                if (url) setImages((current) => [...current, url]);
              }}
              onRemove={(url) =>
                setImages((current) =>
                  current.filter((currentUrl) => currentUrl !== url),
                )
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input
            name="name"
            defaultValue={initialData?.name}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            defaultValue={initialData?.description}
            required
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={Number(initialData?.price || 0)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select
              name="category"
              defaultValue={initialData?.categoryId || ""}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : initialData
              ? "Update Product"
              : "Create Product"}
        </Button>
      </form>
    </div>
  );
}
