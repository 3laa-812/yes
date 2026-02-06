"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { initiatePaymobPayment } from "@/lib/paymob";

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

export async function createOrder(data: any) {
  const validatedFields = orderSchema.safeParse(data);

  if (!validatedFields.success) {
    console.error("Order Validation Error:", validatedFields.error.flatten().fieldErrors);
    return { success: false, error: "Invalid fields" };
  }

  const { firstName, lastName, email, phone, address, city, paymentMethod, items } = validatedFields.data;

  // 1. Calculate Total Price securely from DB
  let total = 0;
  const orderItemsData = [];

  for (const item of items) {
    const product = await db.product.findUnique({ where: { id: item.productId } });
    if (!product) {
        return { success: false, error: `Product not found: ${item.productId}` };
    }
    const itemTotal = Number(product.price) * item.quantity;
    total += itemTotal;
    
    orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Store the price at time of purchase
        selectedSize: item.size,
        selectedColor: item.color
    });
  }

  // 2. Create User/Address if needed (Simplified: Just store address in Order for now, or create dedicated Address)
  // We'll create a dedicated address record linked to the user if we had a user ID, 
  // but here we might be guest or auth'd. For simplicity let's assume guest/detached address for this step 
  // or link to existing user if we can get auth session. 
  // For now, we will create an Address record but maybe not link it to a User if we don't have the ID handy (server action doesn't check auth yet).
  // Let's create the Address record.

  const newAddress = await db.address.create({
      data: {
          name: `${firstName} ${lastName}`,
          phone,
          street: address,
          city,
          country: "Egypt",
          // User linkage would go here if we extracted userId
      }
  });

  // 3. Create Order
  const order = await db.order.create({
      data: {
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

  // 4. Handle Payment Flow
  if (paymentMethod === "COD") {
      // Success immediate
      return { success: true, orderId: order.id, redirectUrl: `/checkout/success?orderId=${order.id}` };
  } else {
      // Initiate Paymob
      try {
          const paymentData = await initiatePaymobPayment(
              order.id, // Merchant Order ID
              total,
              {
                  first_name: firstName,
                  last_name: lastName,
                  email,
                  phone_number: phone,
                  street: address,
                  city
              }
          );
          
          // Create a Payment record
          await db.payment.create({
              data: {
                  orderId: order.id,
                  amount: total,
                  provider: "PAYMOB",
                  status: "PENDING",
                  transactionId: String(paymentData.paymobOrderId) // Storing Paymob Order ID initially
              }
          });

          // Return the iframe URL
          // Frame ID is from env, but we can construct the full URL
          const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${paymentData.iframeId}?payment_token=${paymentData.paymentKey}`;
          
          return { success: true, orderId: order.id, redirectUrl: iframeUrl };

      } catch (error) {
          console.error("Paymob Init Error:", error);
          return { success: false, error: "Payment initialization failed" };
      }
  }
}
