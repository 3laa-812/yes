import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { Metadata } from "next";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { FeaturedProductsGrid } from "@/components/storefront/FeaturedProductsGrid";
import { FeaturedProductsSkeleton } from "@/components/storefront/FeaturedProductsSkeleton";
import { languageAlternates, localizedUrl } from "@/lib/seo";

const Hero = dynamic(() =>
  import("@/components/storefront/Hero").then((mod) => mod.Hero),
);

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  const title =
    locale === "ar"
      ? "YES للملابس الرجالية العصرية | أحدث المجموعات 2026"
      : "YES Men’s Wear | Modern Style Collection 2026";

  const description =
    locale === "ar"
      ? "اكتشف أزياء YES الرجالية العصرية من القمصان والبناطيل والبدل بتصاميم جريئة وجودة عالية. تسوق أحدث المجموعات لعام 2026 مع تجربة تسوق سلسة باللغة العربية."
      : "Discover YES modern men’s wear – shirts, pants and suits crafted for bold everyday style. Explore the 2026 collection with fast browsing, secure checkout and a seamless English experience.";

  const path = "";

  return {
    title,
    description,
    alternates: {
      canonical: localizedUrl(locale as any, path),
      languages: languageAlternates(path),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: localizedUrl(locale as any, path),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("HomePage");

  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "YES",
            url: localizedUrl(locale as any, ""),
            logo: "/branding/logo-dark.png",
            sameAs: [],
          }),
        }}
      />
      <Hero />

      <SectionReveal className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {t("featuredCollection")}
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
          >
            {t("viewAll")}
            <span aria-hidden="true" className="rtl:rotate-180 inline-block">
              {" "}
              &rarr;
            </span>
          </Link>
        </div>

        <Suspense fallback={<FeaturedProductsSkeleton />}>
          <FeaturedProductsGrid />
        </Suspense>
      </SectionReveal>

      {/* Brand Story Section */}
      <SectionReveal delay={0.2} className="bg-secondary py-24 my-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            {t("crafted")}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("craftedDesc")}
          </p>
        </div>
      </SectionReveal>
    </div>
  );
}
