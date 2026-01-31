"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const status = formData.get("status") as string;
    
    await db.order.update({
        where: { id: orderId },
        data: { status }
    });
    
    revalidatePath("/admin/orders");
}
