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

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const categoryId = formData.get("category") as string;
  
  // Handle File Uploads
  const files = formData.getAll("file") as File[];
  const images: string[] = [];
  
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }

  for (const file of files) {
       if (file instanceof File && file.size > 0) {
           const bytes = await file.arrayBuffer();
           const buffer = Buffer.from(bytes);
           const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
           const filepath = path.join(uploadDir, filename);
           await fs.writeFile(filepath, buffer);
           images.push(`/uploads/${filename}`);
       }
  }

  // Fallback to empty if no images uploaded (or handle validation)
  if (images.length === 0) {
      // images.push("https://dummyimage.com/600x400/000/fff"); // Optional fallback
  }

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

  // Handle New File Uploads
  const files = formData.getAll("file") as File[];
  const newImages: string[] = [];

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }

  for (const file of files) {
       if (file instanceof File && file.size > 0) {
           const bytes = await file.arrayBuffer();
           const buffer = Buffer.from(bytes);
           const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
           const filepath = path.join(uploadDir, filename);
           await fs.writeFile(filepath, buffer);
           newImages.push(`/uploads/${filename}`);
       }
  }

  // Fetch existing product to append images
  const existingProduct = await db.product.findUnique({ where: { id: productId } });
  let currentImages = existingProduct?.images ? JSON.parse(existingProduct.images as string) : [];

  // Combine existing and new images
  const updatedImages = [...currentImages, ...newImages];

  await db.product.update({
    where: { id: productId },
    data: {
      name,
      description,
      price,
      categoryId,
      images: JSON.stringify(updatedImages),
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
