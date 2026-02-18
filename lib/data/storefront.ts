import db from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getFeaturedProducts = unstable_cache(
  async () => {
    return db.product.findMany({
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
      },
    });
  },
  ["storefront-featured-products"],
  { revalidate: 60, tags: ["products"] },
);

export const getAllProducts = unstable_cache(
  async () => {
    return db.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
      },
    });
  },
  ["storefront-all-products"],
  { revalidate: 60, tags: ["products"] },
);

export const getCategories = unstable_cache(
  async () => {
    return db.category.findMany({ orderBy: { name_en: "asc" } });
  },
  ["storefront-all-categories"],
  { revalidate: 3600, tags: ["categories"] },
);

export const getCategoryWithProducts = unstable_cache(
  async (slug: string, subCategoryId?: string) => {
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        children: true,
      },
    });

    if (!category) return null;

    let targetCategoryIds = [
      category.id,
      ...category.children.map((c: any) => c.id),
    ];

    if (subCategoryId) {
      const isChild = category.children.some((c: any) => c.id === subCategoryId);
      if (isChild) {
        targetCategoryIds = [subCategoryId];
      } else {
        targetCategoryIds = [];
      }
    }

    const products = await db.product.findMany({
      where: {
        categoryId: { in: targetCategoryIds },
      },
      include: {
        category: true,
      },
    });

    return {
      ...category,
      subCategories: category.children,
      products,
    };
  },
  ["storefront-category-with-products"],
  { revalidate: 60, tags: ["products", "categories"] },
);

