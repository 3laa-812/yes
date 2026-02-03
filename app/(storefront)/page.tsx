import { Hero } from "@/components/storefront/Hero";
import { ProductCard } from "@/components/storefront/ProductCard";
import db from "@/lib/db";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { SectionReveal } from "@/components/ui/SectionReveal";
import Link from "next/link";

async function getFeaturedProducts() {
  const products = await db.product.findMany({
    take: 4,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true, // Include category relation to get category name
    },
  });
  return products;
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <div className="bg-background min-h-screen">
      <Hero />

      <SectionReveal className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Featured Collection
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:text-primary/70 transition-colors"
          >
            View all<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        <StaggerContainer className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price as unknown as number}
                category={product.category.name}
                image={JSON.parse(product.images as string)[0]}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionReveal>

      {/* Brand Story Section */}
      <SectionReveal delay={0.2} className="bg-secondary py-24 my-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            CRAFTED FOR THE BOLD
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We believe style is a form of silence. It allows you to say
            everything without speaking a word. Our collections are designed for
            those who navigate the world with purpose and elegance.
          </p>
        </div>
      </SectionReveal>
    </div>
  );
}
