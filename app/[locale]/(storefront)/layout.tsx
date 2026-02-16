import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { FadeIn } from "@/components/ui/motion";
import { auth } from "@/auth";
import { FacebookPixel } from "@/components/FacebookPixel";
import { FacebookPixelTracker } from "@/components/FacebookPixelTracker";

import db from "@/lib/db";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";

export const dynamic = "force-dynamic";

import { unstable_cache } from "next/cache";

const getCategories = unstable_cache(
  async () => {
    return await db.category.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { displayOrder: "asc" } } },
      orderBy: { displayOrder: "asc" },
    });
  },
  ["storefront-categories"],
  { revalidate: 3600, tags: ["categories"] },
);

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <FacebookPixel />
      <FacebookPixelTracker />
      <Navbar user={session?.user} categories={categories} />
      <FadeIn className="flex-1">{children}</FadeIn>
      <WhatsAppButton />
      <Footer />
    </div>
  );
}
