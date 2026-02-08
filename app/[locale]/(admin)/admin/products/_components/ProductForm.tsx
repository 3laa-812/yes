"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { createProduct, updateProduct } from "@/app/actions";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProductFormProps {
  initialData?: any;
  categories: { id: string; name: string }[];
}

const PREDEFINED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const PREDEFINED_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#008000" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Navy", value: "#000080" },
  { name: "Gray", value: "#808080" },
];

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(
    initialData?.images ? JSON.parse(initialData.images) : [],
  );

  // Variants State
  const [variants, setVariants] = useState<any[]>(initialData?.variants || []);
  const [newVariant, setNewVariant] = useState({
    size: "",
    color: "",
    stock: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleAddVariant = () => {
    if (!newVariant.size || !newVariant.color) {
      toast.error("Please select both size and color");
      return;
    }
    // Check for duplicate
    const exists = variants.find(
      (v) => v.size === newVariant.size && v.color === newVariant.color,
    );
    if (exists) {
      toast.error("This variant already exists");
      return;
    }

    setVariants([...variants, { ...newVariant }]);
    setNewVariant({ size: "", color: "", stock: 0 }); // Reset but keep stock 0? Maybe 10 default
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("imageUrls", JSON.stringify(images));
    formData.set("variants", JSON.stringify(variants));

    try {
      let result;
      if (initialData) {
        result = await updateProduct(formData);
      } else {
        result = await createProduct(formData);
      }

      if (result.success) {
        toast.success(
          initialData
            ? "Product updated successfully!"
            : "Product created successfully!",
        );
        router.refresh();
        router.push("/admin/products");
      } else {
        toast.error((result as any).error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {" "}
      {/* Widened layout for better visual */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {initialData ? "Edit Product" : "New Product"}
        </h1>
      </div>
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {initialData && (
          <input type="hidden" name="productId" value={initialData.id} />
        )}

        {/* Left Column: Basic Info & Media */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Basic information about the product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  name="name"
                  defaultValue={initialData?.name}
                  required
                  placeholder="e.g. Cotton T-Shirt"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  defaultValue={initialData?.description}
                  required
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the product..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  name="category"
                  defaultValue={initialData?.categoryId || undefined}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Upload high quality images</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Variants Section */}
          <Card>
            <CardHeader>
              <CardTitle>Variants & Stock</CardTitle>
              <CardDescription>
                Manage available sizes, colors and stock levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-lg bg-gray-50/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Size</label>
                  <Select
                    value={newVariant.size}
                    onValueChange={(val) =>
                      setNewVariant({ ...newVariant, size: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_SIZES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <Select
                    value={newVariant.color}
                    onValueChange={(val) =>
                      setNewVariant({ ...newVariant, color: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Color" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_COLORS.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: c.value }}
                            ></div>
                            {c.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock</label>
                  <Input
                    type="number"
                    min="0"
                    value={newVariant.stock}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddVariant}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>

              {variants.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((v, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{v.size}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full border"
                                style={{
                                  backgroundColor:
                                    PREDEFINED_COLORS.find(
                                      (c) => c.name === v.color,
                                    )?.value || v.color,
                                }}
                              />
                              {v.color}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                v.stock > 0 ? "secondary" : "destructive"
                              }
                            >
                              {v.stock}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveVariant(idx)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pricing & Quick Actions */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Price (EGP)</label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={Number(initialData?.price || 0)}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Discounted Price (Optional)
                </label>
                <Input
                  name="discountPrice"
                  type="number"
                  step="0.01"
                  defaultValue={
                    initialData?.discountPrice
                      ? Number(initialData.discountPrice)
                      : ""
                  }
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Set to show previous price as struck-through.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full text-lg h-12"
          >
            {isLoading
              ? "Saving..."
              : initialData
                ? "Update Product"
                : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
