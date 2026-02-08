"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { initiatePaymobPayment } from "@/lib/paymob";
import { auth } from "@/auth";

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
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0.01),
  discountPrice: z.number().optional(),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  // sizes and colors will be derived from variants, so optional here or we validate variants
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

  
  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    discountPrice: formData.get("discountPrice") ? Number(formData.get("discountPrice")) : undefined,
    categoryId: formData.get("category"),
    images: formData.get("imageUrls") ? JSON.parse(formData.get("imageUrls") as string) : [],
  };

  const validatedFields = productSchema.safeParse(rawData);
  const validatedVariants = z.array(variantSchema).safeParse(variantsRaw);

  if (!validatedFields.success || !validatedVariants.success) {
    console.error("Create Product Validation Error - Fields:", validatedFields.error?.flatten().fieldErrors);
    console.error("Create Product Validation Error - Variants:", validatedVariants.error?.flatten().fieldErrors);
    console.error("Raw Data:", rawData);
    throw new Error("Invalid fields");
  }

  const { name, description, price, discountPrice, categoryId, images } = validatedFields.data;
  const variants = validatedVariants.data;

  // Derive unique sizes and colors for display
  const sizes = Array.from(new Set(variants.map(v => v.size)));
  const colors = Array.from(new Set(variants.map(v => v.color)));
  const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);

  const product = await db.product.create({
    data: {
      name,
      description,
      price,
      discountPrice,
      categoryId,
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
    await db.product.delete({
        where: { id: productId }
    });
    revalidatePath("/admin/products");
}

export async function updateProduct(formData: FormData) {
  const productId = formData.get("productId") as string;
  const variantsRaw = formData.get("variants") ? JSON.parse(formData.get("variants") as string) : [];

  const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      discountPrice: formData.get("discountPrice") ? Number(formData.get("discountPrice")) : undefined,
      categoryId: formData.get("category"),
      images: formData.get("imageUrls") ? JSON.parse(formData.get("imageUrls") as string) : [],
  };

  const updateSchema = productSchema.pick({
      name: true,
      description: true,
      price: true,
      discountPrice: true,
      categoryId: true,
      images: true
  });

  const validatedFields = updateSchema.safeParse(rawData);
  const validatedVariants = z.array(variantSchema).safeParse(variantsRaw);

  if (!validatedFields.success || !validatedVariants.success) {
      console.error("Update Product Validation Error - Fields:", validatedFields.error?.flatten().fieldErrors);
      console.error("Update Product Validation Error - Variants:", validatedVariants.error?.flatten().fieldErrors);
      console.error("Raw Data:", rawData);
      console.error("Variants Raw:", variantsRaw);
      return { success: false, error: "Invalid fields" };
  }

  const { name, description, price, discountPrice, categoryId, images } = validatedFields.data;
  const variants = validatedVariants.data;
  
  const sizes = Array.from(new Set(variants.map(v => v.size)));
  const colors = Array.from(new Set(variants.map(v => v.color)));
  const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);

  // Transaction to update product and replace variants
  await db.$transaction(async (tx) => {
      // 1. Update Product Base
      await tx.product.update({
        where: { id: productId },
        data: {
          name,
          description,
          price,
          discountPrice,
          categoryId,
          images: JSON.stringify(images),
          sizes: JSON.stringify(sizes),
          colors: JSON.stringify(colors),
          stock: totalStock
        },
      });

      // 2. Delete existing variants (simplest strategy to handle removals/updates)
      await tx.productVariant.deleteMany({
          where: { productId }
      });

      // 3. Create new variants
      // Note: createMany is safer for performance
      // If sqlite, createMany is not supported, loop is needed. 
      // But user environment is likely Postgres ("provider = postgresql").
      // Check prisma schema again. Yes, postgresql.
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

// ... (previous imports)
import { cookies } from "next/headers"; // If we need auth later, but for now we trust form data for guest

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
    // Update phone/email if needed? 
    // For now just link.
  } else {
      // Check if user exists by email
      let user = await db.user.findUnique({ where: { email } });

      if (user) {
          userId = user.id;
          // Optionally update phone if missing
          if (!user.phone) {
              await db.user.update({ where: { id: user.id }, data: { phone } });
          }
      } else {
          // Create new Customer User
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

  // specific type for transaction
  let order;
  try {
      order = await db.$transaction(async (tx) => {
          for (const item of items) {
            // Find Product
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Product not found: ${item.productId}`);

            // Find Variant (if size/color specified)
            if (item.size && item.color) {
                const variant = await tx.productVariant.findFirst({
                    where: { 
                        productId: item.productId,
                        size: item.size,
                        color: item.color
                    }
                });

                if (!variant) {
                    // Fallback to product stock if no variant system used for this product?
                    // But our plan enforces variants.
                    // If migration happened, we might have issues. 
                    // Let's assume strict stock check if variant exists in DB, else loose check.
                    // For now, strict:
                    throw new Error(`Variant not found: ${product.name} (${item.size}, ${item.color})`);
                }

                if (variant.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name} (${item.size}, ${item.color})`);
                }

                // Decrement Stock
                await tx.productVariant.update({
                    where: { id: variant.id },
                    data: { stock: { decrement: item.quantity } }
                });
                
                // Also decrement total product stock for quick reference?
                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: { decrement: item.quantity } }
                });

            } else {
                // No size/color? Check global stock
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }
                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // Price Logic: Use discountPrice if available
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

          // 3. Create Address
          const newAddress = await tx.address.create({
              data: {
                  name: `${firstName} ${lastName}`,
                  phone,
                  street: address,
                  city,
                  country: "Egypt",
                  userId // Link address to user
              }
          });

          // 4. Create Order
          const order = await tx.order.create({
              data: {
                  userId, // Link order to User
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

          // Pass order out of transaction scope for return
          return order;
          return order;
      });
  } catch (error: any) {
      console.error("Order Creation Failed:", error.message);
      return { success: false, error: error.message || "Order creation failed" };
  }

  if (!order) return { success: false, error: "Transaction failed" };

      // 5. Handle Payment Flow
      if (paymentMethod === "COD") {
          return { success: true, orderId: order.id, redirectUrl: `/checkout/success?orderId=${order.id}` };
      } else {
          try {
          const paymentData = await initiatePaymobPayment(
              order.id, 
              Number(order.total), // Ensure number
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
          // Don't fail the order creation entirely if payment fails? 
          // Actually we should maybe return error but order is created PENDING.
          // User can retry payment? For now, redirect to failure page or similar.
          return { success: false, error: "Payment initialization failed" };
      }
  }
}
