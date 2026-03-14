"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
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
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10),
  address: z.string().min(1),
  city: z.string().min(1),
  paymentMethod: z.enum(["COD", "ONLINE", "VODAFONE_CASH", "INSTAPAY", "BANK_TRANSFER", "MEEZA"]),
  referenceId: z.string().optional(),
  proofUrl: z.string().optional(),
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
  discountPrice: z.number().nullable().optional(),
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
    discountPrice: formData.get("discountPrice") ? Number(formData.get("discountPrice")) : null,
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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const product = await db.product.create({
    data: {
      name_en,
      name_ar: name_ar!,
      description_en,
      description_ar: description_ar!,
      price,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      discountPrice: formData.get("discountPrice") ? Number(formData.get("discountPrice")) : null,
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

                                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.$transaction(async (tx: any) => {
      // 1. Update Product Base
      await tx.product.update({
        where: { id: productId },
        data: {
          name_en,
          name_ar,
          description_en,
          description_ar,
          price,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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

                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createOrder(data: any) {
  const validatedFields = orderSchema.safeParse(data);

  if (!validatedFields.success) {
    console.error("Order Validation Error:", validatedFields.error.flatten().fieldErrors);
    return { success: false, error: "Invalid fields" };
  }

  const { firstName, lastName, email, phone, address, city, paymentMethod, referenceId, proofUrl, items } = validatedFields.data;

  // Extra safety: manual payment methods must include either a proof image or a reference
  if (["VODAFONE_CASH", "INSTAPAY", "BANK_TRANSFER", "MEEZA"].includes(paymentMethod)) {
    if (!proofUrl && !referenceId) {
      console.error("Manual payment missing proof or reference", {
        paymentMethod,
        hasProofUrl: Boolean(proofUrl),
        hasReferenceId: Boolean(referenceId),
      });
      return {
        success: false,
        error: "Payment proof or reference is required for manual payments.",
      };
    }
  }

  // 1. Manage Customer (User)
  let userId: string | undefined = undefined;
  const session = await auth();

  if (session?.user?.id) {
    // Authenticated user checkout
    userId = session.user.id;
    
    // Ensure phone is updated if it was missing
    if (phone) {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (user && !user.phone) {
            await db.user.update({ where: { id: userId }, data: { phone } });
        }
    }
  } else if (email) {
      // Guest with an email provided - we'll check if a user exists with this email
      const user = await db.user.findUnique({ where: { email } });

      if (user) {
          userId = user.id;
          if (!user.phone && phone) {
              await db.user.update({ where: { id: user.id }, data: { phone } });
          }
      }
      // Note: We DO NOT auto-create a user here anymore. 
      // This is a strict Guest Checkout. If they want an account, they create it post-checkout.
  }
  // If no session and no matching email, userId remains undefined (Guest Order).

  // 2. Pre-fetch and Validate Products Outside Transaction
  let total = 0;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderItemsData: any[] = [];
  const stockUpdates: { id: string; type: "product" | "variant"; quantity: number }[] = [];

  for (const item of items) {
    const product = await db.product.findUnique({
      where: { id: item.productId },
      include: { variants: true }
    });
    
    if (!product) {
      return { success: false, error: `Product not found: ${item.productId}` };
    }

    // Block checkout if product is marked as sold out by admin
    if (product.isSoldOut) {
      return { success: false, error: `"${product.name_en}" is currently sold out. Please remove it from your cart.` };
    }

    if (item.size && item.color) {
        const variant = product.variants.find(v => v.size === item.size && v.color === item.color);

        if (!variant) {
            return { success: false, error: `Variant not found: ${product.name_en} (${item.size}, ${item.color})` };
        }

        if (variant.stock < item.quantity) {
             return { success: false, error: `Insufficient stock for ${product.name_en} (${item.size}, ${item.color})` };
        }
        
        stockUpdates.push({ id: variant.id, type: "variant", quantity: item.quantity });
        // Also deduct from global product stock
        stockUpdates.push({ id: product.id, type: "product", quantity: item.quantity });

    } else {
        if (product.stock < item.quantity) {
             return { success: false, error: `Insufficient stock for ${product.name_en}` };
        }
           
        stockUpdates.push({ id: product.id, type: "product", quantity: item.quantity });
    }

    // Pricing Logic
    const originalPrice = Number(product.price);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const discountVal = product.discountPrice ? Number(product.discountPrice) : originalPrice;
    const basePrice = Number(product.price);
    const hasSecondaryPrice = product.discountPrice !== null && product.discountPrice !== undefined;
    const secondaryPrice = hasSecondaryPrice ? Number(product.discountPrice) : basePrice;

    let priceToUse = basePrice;
    if (hasSecondaryPrice && basePrice > 0 && secondaryPrice > 0 && basePrice !== secondaryPrice) {
      priceToUse = Math.min(basePrice, secondaryPrice);
    }
    
    total += priceToUse * item.quantity;
    
    orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: priceToUse, 
        selectedSize: item.size,
        selectedColor: item.color
                                                
    });
  }

  // 3. Execute Critical Writes in Transaction
  let order;
  try {
                                               // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order = await db.$transaction(async (tx: any) => {
          // Update stocks
          for (const update of stockUpdates) {
             if (update.type === "variant") {
                 await tx.productVariant.update({
                     where: { id: update.id },
                     data: { stock: { decrement: update.quantity } }
                 });
             } else {
                 await tx.product.update({
                     where: { id: update.id },
                     data: { stock: { decrement: update.quantity } }
                 });
             }
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

          const createdOrder = await tx.order.create({
              data: {
                  userId,
                  total: total,
                  status: ["VODAFONE_CASH", "INSTAPAY", "BANK_TRANSFER", "MEEZA"].includes(paymentMethod) ? "PENDING_VERIFICATION" : "PENDING",
                  paymentMethod: paymentMethod,
                  paymentStatus: "PENDING",
                  addressId: newAddress.id,
                  items: {
                      create: orderItemsData
                  }
              }
                   
          });

          return createdOrder;
      }, {
          maxWait: 5000, 
          timeout: 10000, 
      });
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
      console.error("Order Creation Failed:", error);
      return { success: false, error: error.message || "Order creation failed" };
  }

  if (!order) return { success: false, error: "Transaction failed" };

  if (!order) return { success: false, error: "Transaction failed" };

  if (paymentMethod === "COD") {
      return { success: true, orderId: order.id, redirectUrl: `/checkout/success?orderId=${order.id}` };
  } else if (["VODAFONE_CASH", "INSTAPAY", "BANK_TRANSFER", "MEEZA"].includes(paymentMethod)) {
      // Create manual payment record
      const payment = await db.payment.create({
        data: {
          orderId: order.id,
          amount: Number(order.total),
          provider: paymentMethod,
          status: "PENDING",
          transactionId: referenceId || null,
          proofUrl: proofUrl || null,
        },
      });

      console.log("Manual payment created", {
        orderId: order.id,
        paymentId: payment.id,
        provider: payment.provider,
        hasProofUrl: Boolean(payment.proofUrl),
        hasTransactionId: Boolean(payment.transactionId),
      });
      return { success: true, orderId: order.id, redirectUrl: `/checkout/success?orderId=${order.id}` };
  } else {
      try {
      const paymentData = await initiatePaymobPayment(
          order.id, 
          Number(order.total),
          {
              first_name: firstName,
              last_name: lastName,
              email: email || "guest@thekitchen.com",
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

export async function checkoutGetUserDetailsByPhone(phone: string) {
    try {
        // Find the most recent order with this phone number to extract address/name
        const recentAddress = await db.address.findFirst({
            where: { phone },
            orderBy: { createdAt: 'desc' }
        });

        // Also check if there is an actual User tied to this phone (optional, address is better)
        const user = await db.user.findUnique({
            where: { phone }
        });

        if (recentAddress) {
            // Parse firstName and lastName from address name
            const nameParts = recentAddress.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            return {
                success: true,
                data: {
                    firstName,
                    lastName,
                    email: user?.email || '',
                    address: recentAddress.street,
                    city: recentAddress.city,
                }
            };
        } else if (user) {
            const nameParts = (user.name || '').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            return {
                success: true,
                data: {
                    firstName,
                    lastName,
                    email: user.email || '',
                    address: '',
                    city: '',
                }
            };
        }

        return { success: false, error: "No details found for this number" };
    } catch (error) {
        console.error("Fetch user by phone error:", error);
        return { success: false, error: "Failed to fetch user details" };
    }
}

// --- Guest Account Creation ---
import bcrypt from "bcryptjs";

export async function createAccountFromGuestOrder(orderId: string, email: string, password: string) {
    try {
        const order = await db.order.findUnique({
            where: { id: orderId },
            include: { shippingAddress: true }
        });

        if (!order || order.userId) {
            return { success: false, error: "Order not found or already linked to an account." };
        }

        if (!email || !password || password.length < 6) {
            return { success: false, error: "Valid email and password (min 6 chars) are required." };
        }

        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return { success: false, error: "An account with this email already exists." };
        }

        let existingPhoneUser = null;
        if (order.shippingAddress?.phone) {
             existingPhoneUser = await db.user.findUnique({ where: { phone: order.shippingAddress.phone } });
            if (existingPhoneUser) {
               return { success: false, error: "An account with this phone number already exists. Please log in." };
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data: {
                name: order.shippingAddress?.name || "Guest User",
                email: email,
                password: hashedPassword,
                phone: order.shippingAddress?.phone,
                role: "USER"
            }
        });

        // Link order and address to the new user
        await db.order.update({
            where: { id: orderId },
            data: { userId: newUser.id }
        });

        if (order.addressId) {
            await db.address.update({
                where: { id: order.addressId },
                data: { userId: newUser.id }
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Create account from order error:", error);
        return { success: false, error: "Failed to create account" };
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Update Category Order Error:", error);
    return { success: false, error: error.message };
  }
}


export async function toggleProductSoldOut(productId: string, isSoldOut: boolean) {
  try {
    await db.product.update({
      where: { id: productId },
      data: { isSoldOut },
    });
    // Admin paths
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    // Storefront product list pages
    revalidatePath("/en/products");
    revalidatePath("/ar/products");
    // Individual product detail pages (both locales)
    revalidatePath(`/en/products/${productId}`);
    revalidatePath(`/ar/products/${productId}`);
    // Collection / category pages
    revalidatePath("/en/collections");
    revalidatePath("/ar/collections");
    // Home page (featured products)
    revalidatePath("/en");
    revalidatePath("/ar");
    return { success: true };
  } catch (error: any) {
    console.error("Toggle Product SoldOut Error:", error);
    return { success: false, error: error.message };
  }
}
