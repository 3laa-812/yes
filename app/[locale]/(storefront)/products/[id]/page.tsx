import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ImageGallery } from "@/components/storefront/ImageGallery";
import { ProductSelector } from "@/components/storefront/ProductSelector";

interface ProductPageProps {
  params: Promise<{
    id: string;
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
  const { id } = await params;
  const product = await getProduct(id);
  const t = await getTranslations("Storefront.ProductDetails");

  if (!product) {
    return notFound();
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
              {product.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">{t("productInfo")}</h2>
              <div className="flex items-end gap-4">
                <p
                  className={`text-3xl tracking-tight ${product.discountPrice && (product.discountPrice as any) < product.price ? "text-destructive font-bold" : "text-foreground"}`}
                >
                  {formatPrice(
                    product.discountPrice &&
                      (product.discountPrice as any) < product.price
                      ? (product.discountPrice as any)
                      : (product.price as any),
                  )}
                </p>
                {product.discountPrice &&
                  (product.discountPrice as any) < product.price && (
                    <p className="text-xl tracking-tight text-muted-foreground line-through mb-1">
                      {formatPrice(product.price as any)}
                    </p>
                  )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">{t("description")}</h3>
              <div
                className="space-y-6 text-base text-muted-foreground prose prose-sm sm:prose lg:prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            <ProductSelector
              id={product.id}
              name={product.name}
              price={Number(product.price)}
              discountPrice={Number(product.discountPrice)}
              image={JSON.parse(product.images as string)[0]}
              category={product.category.name}
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
