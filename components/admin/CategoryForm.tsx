"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory, updateCategory } from "@/app/actions";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
  };
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const t = useTranslations("Admin.Categories");
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState(category?.slug || "");
  const [image, setImage] = useState<string | null>(category?.image || null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!category) {
      // Auto-generate slug from name if creating new
      const val = e.target.value;
      setSlug(
        val
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, ""),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // Append image if we have it in state, although hidden input handles it if present
    // But verify hidden input is there.

    try {
      const action = category ? updateCategory : createCategory;
      const res = await action(formData);

      if (res.success) {
        toast.success(category ? t("categoryUpdated") : t("categoryCreated"));
        if (!category) {
          router.push("/admin/categories");
        } else {
          router.refresh();
        }
      } else {
        toast.error((res.error as string) || t("deleteFailed"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("deleteFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {category && <input type="hidden" name="id" value={category.id} />}
      <Card>
        <CardHeader>
          <CardTitle>{category ? t("editCategory") : t("newCategory")}</CardTitle>
          <CardDescription>
            {category
              ? t("updateDetails")
              : t("addNew")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("nameLabel")}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name}
              onChange={handleNameChange}
              required
              placeholder={t("namePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder={t("slugPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <input type="hidden" name="image" value={image || ""} />
            {image ? (
              <div className="relative w-40 h-40 rounded-md overflow-hidden border">
                <Image
                  src={image}
                  alt={t("imageAlt")}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50">
                {/* Placeholder for Upload Thing or simple URL input for now */}
                <Input
                  placeholder={t("imageUrlPlaceholder")}
                  onChange={(e) => setImage(e.target.value)}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  Or upload (Preview)
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={() => window.history.back()}
          >
            {t("cancel")}
          </Button>
          <Button disabled={loading} type="submit">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? t("saving") : category ? t("update") : t("create")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
