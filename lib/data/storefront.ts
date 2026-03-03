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
    const categories = await db.category.findMany({
      where: { parentId: null },
      orderBy: { name_en: "asc" },
      include: {
        children: {
          include: {
            _count: { select: { products: true } }
          }
        },
        _count: { select: { products: true } }
      }
    });

    return categories.filter((category) => {
      const childrenWithProducts = category.children.reduce(
        (acc, child) => acc + child._count.products,
        0
      );
      return category._count.products > 0 || childrenWithProducts > 0;
    });
  },
  ["storefront-all-categories"],
  { revalidate: 3600, tags: ["categories"] },
);

export const getCategoryWithProducts = unstable_cache(
  async (slug: string, subCategoryId?: string) => {
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        children: {
          include: {
            _count: { select: { products: true } }
          },
          orderBy: { displayOrder: "asc" }
        },
      },
    });

    if (!category) return null;

    // Filter children to only those with products
    const activeChildren = category.children.filter(c => c._count.products > 0);

    let targetCategoryIds = [
      category.id,
                                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...activeChildren.map((c: any) => c.id),
    ];

                                                  
    if (subCategoryId) {
                                                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      children: activeChildren,
      subCategories: activeChildren,
      products,
    };
  },
  ["storefront-category-with-products"],
  { revalidate: 60, tags: ["products", "categories"] },
);

