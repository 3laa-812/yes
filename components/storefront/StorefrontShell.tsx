import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { auth } from "@/auth";
import db from "@/lib/db";
import { unstable_cache } from "next/cache";
import { FacebookPixel } from "@/components/FacebookPixel";

const getCategories = unstable_cache(
  async () => {
    const categories = await db.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { displayOrder: "asc" },
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
      orderBy: { displayOrder: "asc" },
    });

    return categories.filter((category) => {
      const activeChildren = category.children.filter(
        (child) => child._count.products > 0,
      );
      const hasProducts =
        category._count.products > 0 || activeChildren.length > 0;

      if (hasProducts) {
        category.children = activeChildren;
        return true;
      }
      return false;
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
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
