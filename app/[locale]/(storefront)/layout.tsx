import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { FadeIn } from "@/components/ui/motion";
import { auth } from "@/auth";

import db from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const categories = await db.category.findMany({
    include: { subCategories: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={session?.user} categories={categories} />
      <FadeIn className="flex-1">{children}</FadeIn>
      <Footer />
    </div>
  );
}
