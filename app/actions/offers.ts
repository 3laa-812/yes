"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Role } from "@prisma/client";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== Role.OWNER && session.user.role !== Role.MANAGER)) {
    throw new Error("Unauthorized");
  }
}

export async function getActiveOffers() {
  const now = new Date();
  
  const offers = await db.offer.findMany({
    where: {
      enabled: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
      ]
    },
    orderBy: { createdAt: "desc" }
  });

  // For each offer, fetch the products. 
  // We need to fetch the products and maintain the order specified in productIds[]
  const offersWithProducts = await Promise.all(offers.map(async (offer: any) => {
    if (!offer.productIds || offer.productIds.length === 0) {
      return { ...offer, products: [] };
    }

    const products = await db.product.findMany({
      where: {
        id: { in: offer.productIds }
      },
      include: {
        category: true,
      }
    });

    // Sort products based on productIds array order
    const sortedProducts = offer.productIds
      .map((id: string) => products.find(p => p.id === id))
      .filter(Boolean);

    return {
      ...offer,
      products: sortedProducts
    };
  }));

  // Filter out offers that have 0 valid products
  return offersWithProducts.filter((o: any) => o.products.length > 0);
}

export async function getAdminOffers() {
  await checkAdmin();
  
  const offers = await db.offer.findMany({
    orderBy: { createdAt: "desc" }
  });

  return offers;
}

export async function createOffer(data: {
  title_en: string;
  title_ar: string;
  enabled: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  productIds: string[];
  bundlePrice?: number | null;
}) {
  await checkAdmin();

  const offer = await db.offer.create({
    data
  });

  revalidatePath("/", "layout"); // Revalidate the whole app layout to update storefront
  return offer;
}

export async function updateOffer(id: string, data: Partial<{
  title_en: string;
  title_ar: string;
  enabled: boolean;
  startDate: Date | null;
  endDate: Date | null;
  productIds: string[];
  bundlePrice: number | null;
}>) {
  await checkAdmin();

  const offer = await db.offer.update({
    where: { id },
    data
  });

  revalidatePath("/", "layout");
  return offer;
}

export async function deleteOffer(id: string) {
  await checkAdmin();

  await db.offer.delete({
    where: { id }
  });

  revalidatePath("/", "layout");
}
