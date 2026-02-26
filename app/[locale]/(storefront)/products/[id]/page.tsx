import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { formatCurrency, cn } from "@/lib/utils";
import { ImageGallery } from "@/components/storefront/ImageGallery";
import { ProductSelector } from "@/components/storefront/ProductSelector";

interface ProductPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

async function getProduct(id: string) {
  const product = await db.product.findUnique({
    where: {
      id: id,
    },
    include: {
      category: true,
      variants: true,
    },
  });

  if (!product) {
    return null;
  }
  return product;
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const { id, locale } = await params;
  const product = await getProduct(id);
  const t = await getTranslations("Storefront.ProductDetails");

  if (!product) {
    return notFound();
  }

  const basePrice = Number(product.price);
  const hasSecondaryPrice =
    product.discountPrice !== null && product.discountPrice !== undefined;
  const secondaryPrice = hasSecondaryPrice
    ? Number(product.discountPrice)
    : basePrice;

  let originalPrice = basePrice;
  let effectivePrice = basePrice;
  let isDiscounted = false;

  if (
    hasSecondaryPrice &&
    basePrice > 0 &&
    secondaryPrice > 0 &&
    basePrice !== secondaryPrice
  ) {
    originalPrice = Math.max(basePrice, secondaryPrice);
    effectivePrice = Math.min(basePrice, secondaryPrice);
    isDiscounted = effectivePrice < originalPrice;
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image Gallery */}
          <ImageGallery images={JSON.parse(product.images as string)} />

          {/* Product Info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {locale === "ar" ? product.name_ar : product.name_en}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">{t("productInfo")}</h2>
              <div className="flex items-end gap-3">
                <p
                  className={cn(
                    "text-3xl tracking-tight font-bold",
                    isDiscounted ? "text-primary" : "text-foreground",
                  )}
                >
                  {formatCurrency(effectivePrice, locale)}
                </p>
                {isDiscounted ? (
                  <p className="text-xl tracking-tight text-muted-foreground line-through decoration-muted-foreground/50 mb-1">
                    {formatCurrency(originalPrice, locale)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">{t("description")}</h3>
              <div
                className="space-y-6 text-base text-muted-foreground prose prose-sm sm:prose lg:prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    locale === "ar"
                      ? product.description_ar
                      : product.description_en,
                }}
              />
            </div>

            <ProductSelector
              id={product.id}
              name={locale === "ar" ? product.name_ar : product.name_en}
              name_en={product.name_en}
              name_ar={product.name_ar}
              price={basePrice}
              discountPrice={
                hasSecondaryPrice ? Number(product.discountPrice) : null
              }
              image={JSON.parse(product.images as string)[0]}
              category={
                locale === "ar"
                  ? product.category.name_ar
                  : product.category.name_en
              }
              category_en={product.category.name_en}
              category_ar={product.category.name_ar}
              sizes={JSON.parse(product.sizes as string)}
              colors={JSON.parse(product.colors as string)}
              variants={product.variants}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
