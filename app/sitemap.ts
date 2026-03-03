import type { MetadataRoute } from "next";
import db from "@/lib/db";
import { getSiteUrl, localizedUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const baseUrl = getSiteUrl();

  const [products, categories] = await Promise.all([
    db.product.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    }),
    db.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      where: {
        parentId: null,
      },
    }),
  ]);

  const locales: Array<"en" | "ar"> = ["en", "ar"];

  const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: localizedUrl(locale, ""),
      lastModified: new Date(),
    },
    {
      url: localizedUrl(locale, "/products"),
      lastModified: new Date(),
    },
  ]);

  const categoryEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    categories.map((category) => ({
      url: localizedUrl(locale, `/collections/${category.slug}`),
      lastModified: category.updatedAt,
    })),
  );

  const productEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    products.map((product) => ({
      url: localizedUrl(locale, `/products/${product.id}`),
      lastModified: product.updatedAt,
    })),
  );

  return [...staticPages, ...categoryEntries, ...productEntries];
}

