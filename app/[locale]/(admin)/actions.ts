"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export async function updateOrderStatus(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const status = formData.get("status") as OrderStatus;
    
    await db.order.update({
        where: { id: orderId },
        data: { status }
    });
    
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
}

export async function managePayment(orderId: string, action: "approve" | "reject") {
    const paymentStatus = action === "approve" ? "PAID" : "FAILED";
    const orderStatus = action === "approve" ? "CONFIRMED" : "REJECTED";
    
    await db.payment.updateMany({
        where: { orderId },
        data: { status: paymentStatus }
    });
    
    await db.order.update({
        where: { id: orderId },
        data: { status: orderStatus, paymentStatus: paymentStatus }
    });
    
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
}
