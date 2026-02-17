import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { FadeIn } from "@/components/ui/motion";
import { auth } from "@/auth";
import db from "@/lib/db";
import { unstable_cache } from "next/cache";
import { FacebookPixel } from "@/components/FacebookPixel";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";

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

export async function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <FacebookPixel />
      <Navbar user={session?.user} categories={categories} />
      <FadeIn className="flex-1">{children}</FadeIn>
      <WhatsAppButton />
      <Footer />
    </div>
  );
}

