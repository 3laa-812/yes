"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { initiatePaymobPayment } from "@/lib/paymob";
import { auth } from "@/auth";
import { translateText } from "@/lib/translation";

export async function generateTranslation(text: string, targetLang: "ar" | "en") {
  try {
    const translated = await translateText(text, targetLang);
    return { success: true, text: translated };
  } catch (error) {
    console.error("Translation action error:", error);
    return { success: false, error: "Translation failed" };
  }
}

// Order Create Schema

const orderSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(1),
  city: z.string().min(1),
  paymentMethod: z.enum(["COD", "ONLINE"]),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    size: z.string().optional(),
    color: z.string().optional(),
  })).min(1),
});

const productSchema = z.object({
  name_en: z.string().min(1),
  name_ar: z.string().optional(), // Can be auto-generated
  description_en: z.string().min(1),
  description_ar: z.string().optional(), // Can be auto-generated
  price: z.number().min(0.01),
  discountPrice: z.number().optional(),
  categoryId: z.string().min(1), // Now refers to the final category ID (sub or main)
  // Removed subCategoryId schema as it's merged into category logic or handled by frontend sending the correct ID
  images: z.array(z.string().url()).min(1),
});

const variantSchema = z.object({
  size: z.string().min(1),
  color: z.string().min(1),
  stock: z.number().min(0),
});

// ... imports ...

export async function createProduct(formData: FormData) {

  // Parse variants first
  const variantsRaw = formData.get("variants") ? JSON.parse(formData.get("variants") as string) : [];

  // Logic: 
  // If frontend sends "subCategoryId", we use that as the product's categoryId.
  // If not, we use "categoryId" (main).
  // Schema expects just "categoryId", so we map it here.
  const mainCatId = formData.get("categoryId");
  const subCatId = formData.get("subCategoryId");
  const finalCategoryId = subCatId && subCatId !== "" ? subCatId : mainCatId;

  const rawData = {
    name_en: formData.get("name_en"),
    name_ar: formData.get("name_ar") || undefined,
    description_en: formData.get("description_en"),
    description_ar: formData.get("description_ar") || undefined,
    price: Number(formData.get("price")),
    discountPrice: formData.get("discountPrice") ? Number(formData.get("discountPrice")) : undefined,
    categoryId: finalCategoryId,
    images: formData.get("imageUrls") ? JSON.parse(formData.get("imageUrls") as string) : [],
  };

  const validatedFields = productSchema.safeParse(rawData);
  const validatedVariants = z.array(variantSchema).safeParse(variantsRaw);

  if (!validatedFields.success || !validatedVariants.success) {
    console.error("Create Product Validation Error - Fields:", validatedFields.error?.flatten().fieldErrors);
    console.error("Create Product Validation Error - Variants:", validatedVariants.error?.flatten().fieldErrors);
    console.error("Raw Data:", rawData);
    return { success: false, error: "Invalid fields" };
  }

  let { name_en, name_ar, description_en, description_ar, price, discountPrice, categoryId, images } = validatedFields.data;
  const variants = validatedVariants.data;

  // Auto-translate if missing
  if (!name_ar) {
    name_ar = await translateText(name_en, "ar");
  }
  if (!description_ar) {
    description_ar = await translateText(description_en, "ar");
  }

  // Derive unique sizes and colors for display
  const sizes = Array.from(new Set(variants.map(v => v.size)));
  const colors = Array.from(new Set(variants.map(v => v.color)));
  const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);

  const product = await db.product.create({
    data: {
      name_en,
      name_ar: name_ar!,
      description_en,
      description_ar: description_ar!,
      price,
      discountPrice,
      categoryId,
      // No subCategoryId field anymore
      images: JSON.stringify(images),
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      stock: totalStock,
      variants: {
        create: variants.map(v => ({
            size: v.size,
            color: v.color,
            stock: v.stock
        }))
      }
    },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProduct(formData: FormData) {
    const productId = formData.get("productId") as string;
    try {
        await db.product.delete({
            where: { id: productId }
        });
        revalidatePath("/admin/products");
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2003') {
            return { success: false, error: "Cannot delete product with associated orders. Please archive it instead." };
        }
        return { success: false, error: error.message };
    }
}

export async function updateProduct(formData: FormData) {
  const productId = formData.get("productId") as string;
  const variantsRaw = formData.get("variants") ? JSON.parse(formData.get("variants") as string) : [];

  const mainCatId = formData.get("categoryId");
  const subCatId = formData.get("subCategoryId");
  const finalCategoryId = subCatId && subCatId !== "" ? subCatId : mainCatId;

  const rawData = {
      name_en: formData.get("name_en"),
      name_ar: formData.get("name_ar") || undefined,
      description_en: formData.get("description_en"),
      description_ar: formData.get("description_ar") || undefined,
      price: Number(formData.get("price")),
      discountPrice: formData.get("discountPrice") ? Number(formData.get("discountPrice")) : undefined,
      categoryId: finalCategoryId,
      images: formData.get("imageUrls") ? JSON.parse(formData.get("imageUrls") as string) : [],
  };

  const updateSchema = productSchema.partial();

  const validatedFields = updateSchema.safeParse(rawData);
  const validatedVariants = z.array(variantSchema).safeParse(variantsRaw);

  if (!validatedFields.success || !validatedVariants.success) {
      console.error("Update Product Validation Error - Fields:", validatedFields.error?.flatten().fieldErrors);
      console.error("Update Product Validation Error - Variants:", validatedVariants.error?.flatten().fieldErrors);
      console.error("Raw Data:", rawData);
      console.error("Variants Raw:", variantsRaw);
      return { success: false, error: "Invalid fields" };
  }

  let { name_en, name_ar, description_en, description_ar, price, discountPrice, categoryId, images } = validatedFields.data;
  const variants = validatedVariants.data;

   if (!name_ar && name_en) {
    name_ar = await translateText(name_en, "ar");
  }
  if (!description_ar && description_en) {
    description_ar = await translateText(description_en, "ar");
  }
  
  const sizes = Array.from(new Set(variants.map(v => v.size)));
  const colors = Array.from(new Set(variants.map(v => v.color)));
  const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);

  await db.$transaction(async (tx) => {
      // 1. Update Product Base
      await tx.product.update({
        where: { id: productId },
        data: {
          name_en,
          name_ar,
          description_en,
          description_ar,
          price,
          discountPrice,
          categoryId,
          // No subCategoryId field
          images: JSON.stringify(images),
          sizes: JSON.stringify(sizes),
          colors: JSON.stringify(colors),
          stock: totalStock
        },
      });

      // 2. Delete existing variants
      await tx.productVariant.deleteMany({
          where: { productId }
      });

      // 3. Create new variants
      if (variants.length > 0) {
        await tx.productVariant.createMany({
            data: variants.map(v => ({
                productId,
                size: v.size,
                color: v.color,
                stock: v.stock
            }))
        });
      }
  });

  revalidatePath("/admin/products");
  return { success: true };
}

// ... (createOrder remains the same)

export async function createOrder(data: any) {
  const validatedFields = orderSchema.safeParse(data);

  if (!validatedFields.success) {
    console.error("Order Validation Error:", validatedFields.error.flatten().fieldErrors);
    return { success: false, error: "Invalid fields" };
  }

  const { firstName, lastName, email, phone, address, city, paymentMethod, items } = validatedFields.data;

  // 1. Manage Customer (User)
  let userId: string | undefined;
  const session = await auth();

  if (session?.user?.id) {
    userId = session.user.id;
  } else {
      let user = await db.user.findUnique({ where: { email } });

      if (user) {
          userId = user.id;
          if (!user.phone) {
              await db.user.update({ where: { id: user.id }, data: { phone } });
          }
      } else {
          user = await db.user.create({
              data: {
                  email,
                  name: `${firstName} ${lastName}`,
                  phone,
                  role: "USER"
              }
          });
          userId = user.id;
      }
  }

  // 2. Validate Stock & Calculate Total
  let total = 0;
  const orderItemsData: any[] = [];

  let order;
  try {
      order = await db.$transaction(async (tx) => {
          for (const item of items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Product not found: ${item.productId}`);

            if (item.size && item.color) {
                const variant = await tx.productVariant.findFirst({
                    where: { 
                        productId: item.productId,
                        size: item.size,
                        color: item.color
                    }
                });

                if (!variant) {
                    throw new Error(`Variant not found: ${product.name_en} (${item.size}, ${item.color})`);
                }

                if (variant.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name_en} (${item.size}, ${item.color})`);
                }

                await tx.productVariant.update({
                    where: { id: variant.id },
                    data: { stock: { decrement: item.quantity } }
                });
                
                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: { decrement: item.quantity } }
                });

            } else {
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name_en}`);
                }
                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            const priceToUse = product.discountPrice ? Number(product.discountPrice) : Number(product.price);
            const itemTotal = priceToUse * item.quantity;
            total += itemTotal;
            
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: priceToUse, 
                selectedSize: item.size,
                selectedColor: item.color
            });
          }

          const newAddress = await tx.address.create({
              data: {
                  name: `${firstName} ${lastName}`,
                  phone,
                  street: address,
                  city,
                  country: "Egypt",
                  userId
              }
          });

          const order = await tx.order.create({
              data: {
                  userId,
                  total: total,
                  status: "PENDING",
                  paymentMethod: paymentMethod === "COD" ? "COD" : "ONLINE",
                  paymentStatus: "PENDING",
                  addressId: newAddress.id,
                  items: {
                      create: orderItemsData
                  }
              }
          });

          return order;
      });
  } catch (error: any) {
      console.error("Order Creation Failed:", error);
      return { success: false, error: error.message || "Order creation failed" };
  }

  if (!order) return { success: false, error: "Transaction failed" };

      if (paymentMethod === "COD") {
          return { success: true, orderId: order.id, redirectUrl: `/checkout/success?orderId=${order.id}` };
      } else {
          try {
          const paymentData = await initiatePaymobPayment(
              order.id, 
              Number(order.total),
              {
                  first_name: firstName,
                  last_name: lastName,
                  email,
                  phone_number: phone,
                  street: address,
                  city
              }
          );
          
          await db.payment.create({
              data: {
                  orderId: order.id,
                  amount: Number(order.total),
                  provider: "PAYMOB",
                  status: "PENDING",
                  transactionId: String(paymentData.paymobOrderId)
              }
          });

          const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${paymentData.iframeId}?payment_token=${paymentData.paymentKey}`;
          return { success: true, orderId: order.id, redirectUrl: iframeUrl };

      } catch (error) {
          console.error("Paymob Init Error:", error);
          return { success: false, error: "Payment initialization failed" };
      }
  }
}

// --- Category Actions ---

const categorySchema = z.object({
  name_en: z.string().min(1),
  name_ar: z.string().optional(),
  slug: z.string().min(1),
  image: z.string().optional(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().default(true).optional(),
  displayOrder: z.number().default(0).optional(),
});

export async function createCategory(formData: FormData) {
  const rawData = {
    name_en: formData.get("name_en"),
    name_ar: formData.get("name_ar") || undefined,
    slug: formData.get("slug"),
    image: formData.get("image") || undefined,
    parentId: formData.get("parentId") || null,
    isActive: formData.get("isActive") === "true",
    displayOrder: Number(formData.get("displayOrder")) || 0,
  };

  const validatedFields = categorySchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid fields" };
  }

  let { name_en, name_ar, slug, image, parentId, isActive, displayOrder } = validatedFields.data;

  if (!name_ar) {
      name_ar = await translateText(name_en, "ar");
  }

  try {
    await db.category.create({
      data: {
          name_en,
          name_ar: name_ar!,
          slug,
          image,
          parentId,
          isActive: isActive !== undefined ? isActive : true,
          displayOrder: displayOrder || 0,
      },
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Create Category Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCategory(formData: FormData) {
  const categoryId = formData.get("id") as string;
  const rawData = {
    name_en: formData.get("name_en"),
    name_ar: formData.get("name_ar") || undefined,
    slug: formData.get("slug"),
    image: formData.get("image") || undefined,
    parentId: formData.get("parentId") || null,
    isActive: formData.get("isActive") === "true",
    displayOrder: Number(formData.get("displayOrder")) || 0,
  };

  const validatedFields = categorySchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid fields" };
  }

  let { name_en, name_ar, slug, image, parentId, isActive, displayOrder } = validatedFields.data;
  
  if (!name_ar) {
      name_ar = await translateText(name_en, "ar");
  }

  try {
    await db.category.update({
      where: { id: categoryId },
      data: {
          name_en,
          name_ar: name_ar!,
          slug,
          image,
          parentId,
          isActive: isActive !== undefined ? isActive : true,
          displayOrder: displayOrder || 0,
      },
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Update Category Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(formData: FormData) {
  const categoryId = formData.get("id") as string;
  try {
    await db.category.delete({
      where: { id: categoryId },
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2003') {
        return { success: false, error: "Cannot delete category with associated products or sub-categories. Please remove them first." };
    }
    return { success: false, error: error.message };
  }
}

export async function updateCategoryOrder(updates: { id: string; displayOrder: number }[]) {
  try {
    const transaction = updates.map((update) =>
      db.category.update({
        where: { id: update.id },
        data: { displayOrder: update.displayOrder },
      })
    );
    await db.$transaction(transaction);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Update Category Order Error:", error);
    return { success: false, error: error.message };
  }
}


