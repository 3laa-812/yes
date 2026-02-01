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
  // Parse and validate using Zod
  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    categoryId: formData.get("category"),
    images: formData.get("imageUrls") ? JSON.parse(formData.get("imageUrls") as string) : [],
    // Sizes and colors are hardcoded for now, matching previous logic but could be dynamic later
    sizes: ["S", "M", "L"], 
    colors: ["#000000", "#ffffff"],
  };

  const validatedFields = productSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation Error:", validatedFields.error.flatten().fieldErrors);
    throw new Error("Invalid fields");
  }

  const { name, description, price, categoryId, images, sizes, colors } = validatedFields.data;

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
  
  // Reuse the schema but make some fields optional if we wanted partial updates, 
  // but for this form we basically resubmit everything.
  // We need to parse images again.
  const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      categoryId: formData.get("category"),
      images: formData.get("imageUrls") ? JSON.parse(formData.get("imageUrls") as string) : [],
      // Ensure specific fields required by the schema are present (sizes/colors not in update form yet, but schema requires them? 
      // Wait, schema requires them. If we update, we might overwrite sizes/colors if we generated them from scratch.
      // The schema above says: sizes: z.array(z.string()).min(1).
      // But updateProduct didn't use to update sizes/colors.
      // Let's omit sizes/colors from validation for update by using a partial schema or just picking fields.
      // For now, let's just validate the fields we ARE updating.
  };

  // Create a partial schema for update or just validate fields manually?
  // Let's match the create logic but be mindful that we aren't updating sizes/colors here.
  // Actually, the schema requires sizes/colors. If we don't assume them, validation fails.
  // Let's pass dummy values for validation purposes or refrain from validating strict schema on update for now?
  // Better: Let's validate the fields we have.
  
  const updateSchema = productSchema.pick({
      name: true,
      description: true,
      price: true,
      categoryId: true,
      images: true
  });

  const validatedFields = updateSchema.safeParse(rawData);

  if (!validatedFields.success) {
      console.error("Validation Error:", validatedFields.error.flatten().fieldErrors);
      throw new Error("Invalid fields");
  }

  const { name, description, price, categoryId, images } = validatedFields.data;

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
