"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { OrderStatus, Role } from "@prisma/client";
import { auth } from "@/auth";

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

export async function deleteOrder(orderId: string) {
    const session = await auth();
    if (!session?.user || (session.user.role !== Role.OWNER && session.user.role !== Role.MANAGER)) {
        throw new Error("Unauthorized");
    }

    await db.$transaction([
        db.orderItem.deleteMany({ where: { orderId } }),
        db.payment.deleteMany({ where: { orderId } }),
        db.order.delete({ where: { id: orderId } })
    ]);

    revalidatePath("/admin/orders");
}

export async function deleteOrdersBulk(orderIds: string[]) {
    const session = await auth();
    if (!session?.user || (session.user.role !== Role.OWNER && session.user.role !== Role.MANAGER)) {
        throw new Error("Unauthorized");
    }

    await db.$transaction([
        db.orderItem.deleteMany({ where: { orderId: { in: orderIds } } }),
        db.payment.deleteMany({ where: { orderId: { in: orderIds } } }),
        db.order.deleteMany({ where: { id: { in: orderIds } } })
    ]);

    revalidatePath("/admin/orders");
}
