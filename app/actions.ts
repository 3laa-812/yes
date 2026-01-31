"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0.01),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  sizes: z.array(z.string()).min(1),
  colors: z.array(z.string()).min(1),
});

// ... imports ...

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const categoryId = formData.get("category") as string;
  
  // New: Parse images from JSON string instead of file processing
  const imageUrls = formData.get("imageUrls") as string;
  const images = imageUrls ? JSON.parse(imageUrls) : [];

  const sizes = ["S", "M", "L"]; 
  const colors = ["#000000", "#ffffff"];

  await db.product.create({
    data: {
      name,
      description,
      price,
      categoryId,
      images: JSON.stringify(images),
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      stock: 10,
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
    const productId = formData.get("productId") as string;
    await db.product.delete({
        where: { id: productId }
    });
    revalidatePath("/admin/products");
}

export async function updateProduct(formData: FormData) {
  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const categoryId = formData.get("category") as string;

  // New: Parse images from JSON string
  const imageUrls = formData.get("imageUrls") as string;
  const images = imageUrls ? JSON.parse(imageUrls) : [];

  await db.product.update({
    where: { id: productId },
    data: {
      name,
      description,
      price,
      categoryId,
      images: JSON.stringify(images),
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
