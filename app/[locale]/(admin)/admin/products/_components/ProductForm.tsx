"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { createProduct, updateProduct } from "@/app/actions";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
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
import { ColorPalette } from "@/components/admin/products/ColorPalette";
import { getColorValue, getColorDisplayName, findColorByName } from "@/lib/colors";

interface ProductFormProps {
  initialData?: any;
  categories: {
    id: string;
    name_en: string;
    name_ar?: string; // Optional if some migration isn't perfect, but schema says required
    children: { id: string; name_en: string; name_ar?: string }[];
  }[];
}

const PREDEFINED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const t = useTranslations("Admin.Products");
  const locale = useLocale() as "en" | "ar";
  const [images, setImages] = useState<string[]>(
    initialData?.images ? JSON.parse(initialData.images) : [],
  );

  // Category & SubCategory State Logic
  // We need to determine if initialData.categoryId belongs to a main category or a subcategory
  let initialMainId = "";
  let initialSubId = "";

  if (initialData?.categoryId) {
    // Check if it's a main category
    const mainCat = categories.find((c) => c.id === initialData.categoryId);
    if (mainCat) {
      initialMainId = mainCat.id;
    } else {
      // Check if it's a child of any main category
      const parentCat = categories.find((c) =>
        c.children.some((child) => child.id === initialData.categoryId),
      );
      if (parentCat) {
        initialMainId = parentCat.id;
        initialSubId = initialData.categoryId;
      }
    }
  }

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>(initialMainId);
  const [selectedSubCategoryId, setSelectedSubCategoryId] =
    useState<string>(initialSubId);

  // Derived state for available subcategories (using children)
  const availableSubCategories =
    categories.find((c) => c.id === selectedCategoryId)?.children || [];

  // Variants State
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>(initialData?.variants || []);
  const [newVariant, setNewVariant] = useState({
    size: "",
    color: "",
    stock: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleAddVariant = () => {
    if (!newVariant.size || !newVariant.color) {
      toast.error(t("selectSizeAndColor"));
      return;
    }
    // Check for duplicate
    const exists = variants.find(
      (v) => v.size === newVariant.size && v.color === newVariant.color,
    );
    if (exists) {
      toast.error(t("variantExists"));
      return;
    }

    setVariants([...variants, { ...newVariant }]);
    setNewVariant({ size: "", color: "", stock: 0 }); // Reset but keep stock 0? Maybe 10 default
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  async function handleAutoTranslate(field: "name" | "description") {
    setIsTranslating(true);
    const form = document.querySelector("form") as HTMLFormElement;
    if (!form) return;

    // Get English value
    const enInput = form.querySelector(`[name="${field}_en"]`) as
      | HTMLInputElement
      | HTMLTextAreaElement;
    const enValue = enInput?.value;

    // Get Arabic input to update
    const arInput = form.querySelector(`[name="${field}_ar"]`) as
      | HTMLInputElement
      | HTMLTextAreaElement;

    if (enValue && arInput) {
      try {
        const { generateTranslation } = await import("@/app/actions");
        const result = await generateTranslation(enValue, "ar");

        if (result.success && result.text) {
          // Update the input value
          arInput.value = result.text;
          // Trigger change event if needed for state (though this form uses uncontrolled inputs via formData on submit, but if we had state...)
          // Since we use defaultValue in render and formData on submit, setting .value directly works for visual.
          toast.success("Translation generated!");
        } else {
          toast.error("Failed to generate translation.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error generating translation.");
      }
    } else {
      toast.warning("Please enter English text first.");
    }
    setIsTranslating(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("imageUrls", JSON.stringify(images));
    formData.set("variants", JSON.stringify(variants));

    // Explicitly set categoryId based on selection
    // If subCategory selected, it IS the categoryId
    // If only Main selected, use it (though specific requirements usually enforce subcategory for leaf products, we allow either)
    if (selectedSubCategoryId) {
      formData.set("categoryId", selectedSubCategoryId);
    } else {
      formData.set("categoryId", selectedCategoryId);
    }
    // Remove the temporary fields from formData as they are not in the schema
    formData.delete("subCategoryId");
    formData.delete("mainCategoryId");

    try {
      let result;
      if (initialData) {
        result = await updateProduct(formData);
      } else {
        result = await createProduct(formData);
      }

      if (result.success) {
        toast.success(initialData ? t("productUpdated") : t("productCreated"));
        router.refresh();
        router.push("/admin/products");
      } else {
        toast.error((result as any).error || t("somethingWentWrong"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("somethingWentWrong"));
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
          {initialData ? t("editProduct") : t("newProduct")}
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
              <CardTitle>{t("productDetails")}</CardTitle>
              <CardDescription>{t("basicInfo")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Name (Bilingual) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name (English)</label>
                  <Input
                    name="name_en"
                    defaultValue={initialData?.name_en || initialData?.name} // Fallback for transition
                    required
                    placeholder="Product Name in English"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Name (Arabic)</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-blue-500"
                      onClick={() => handleAutoTranslate("name")}
                    >
                      Auto-Generate
                    </Button>
                  </div>
                  <Input
                    name="name_ar"
                    defaultValue={initialData?.name_ar}
                    placeholder="Product Name in Arabic (Auto-generated if empty)"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Description (Bilingual) */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Description (English)
                  </label>
                  <textarea
                    name="description_en"
                    defaultValue={
                      initialData?.description_en || initialData?.description
                    }
                    required
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Product Description in English"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                      Description (Arabic)
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-blue-500"
                      onClick={() => handleAutoTranslate("description")}
                    >
                      Auto-Generate
                    </Button>
                  </div>
                  <textarea
                    name="description_ar"
                    defaultValue={initialData?.description_ar}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right"
                    placeholder="Product Description in Arabic"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("categoryLabel")}
                  </label>
                  <Select
                    name="mainCategoryId" // internal use, not submitted directly as 'categoryId'
                    value={selectedCategoryId}
                    onValueChange={(val) => {
                      setSelectedCategoryId(val);
                      setSelectedSubCategoryId(""); // Reset subcategory on category change
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name_en} / {category.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sub-Category</label>
                  <Select
                    name="subCategoryId" // will be picked up by formData if set
                    value={selectedSubCategoryId}
                    onValueChange={setSelectedSubCategoryId}
                    disabled={
                      !selectedCategoryId || availableSubCategories.length === 0
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          availableSubCategories.length === 0
                            ? "No Sub-Categories"
                            : "Select Sub-Category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubCategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name_en} / {sub.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                Manage available sizes, colors and stock levels. Use Bulk
                Generate to quickly add multiple variants.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bulk Generation UI */}
              <div className="border p-4 rounded-lg bg-gray-50 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    Bulk Generate Variants
                  </h3>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (
                        selectedSizes.length === 0 ||
                        selectedColors.length === 0
                      ) {
                        toast.error("Select at least one size and one color");
                        return;
                      }
                      const newVariants: any[] = [];
                      selectedSizes.forEach((size) => {
                        selectedColors.forEach((color) => {
                          // Check for duplicate
                          const exists = variants.find(
                            (v) => v.size === size && v.color === color,
                          );
                          if (!exists) {
                            newVariants.push({ size, color, stock: 0 });
                          }
                        });
                      });
                      setVariants([...variants, ...newVariants]);
                      setSelectedSizes([]);
                      setSelectedColors([]);
                      toast.success(`Generated ${newVariants.length} variants`);
                    }}
                  >
                    Generate Selected
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sizes */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Select Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_SIZES.map((size) => {
                        const isSelected = selectedSizes.includes(size);
                        return (
                          <Button
                            key={size}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSizes(
                                  selectedSizes.filter((s) => s !== size),
                                );
                              } else {
                                setSelectedSizes([...selectedSizes, size]);
                              }
                            }}
                            className="h-8 min-w-12"
                          >
                            {size}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colors - New Color Palette */}
                  <div className="space-y-3">
                    <ColorPalette
                      selectedColors={selectedColors}
                      onSelectionChange={setSelectedColors}
                    />
                  </div>
                </div>
              </div>

              {/* Variants Table */}
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
                          <TableCell className="font-medium">
                            {v.size}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded-full border shadow-sm shrink-0"
                                style={{
                                  backgroundColor: getColorValue(v.color),
                                }}
                              />
                              <span className="text-sm text-foreground font-medium">
                                {getColorDisplayName(v.color, locale)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={v.stock}
                              min="0"
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                const newVars = [...variants];
                                newVars[idx].stock = val;
                                setVariants(newVars);
                              }}
                              className="w-24 h-8"
                            />
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
                  placeholder={t("pricePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("discountPriceLabel")}
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
                  placeholder={t("discountPricePlaceholder")}
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
              ? t("saving")
              : initialData
                ? t("updateProduct")
                : t("createProduct")}
          </Button>
        </div>
      </form>
    </div>
  );
}
