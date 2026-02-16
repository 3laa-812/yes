'use server'

import db from "@/lib/db"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { hash, compare } from "bcryptjs"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function checkOwner() {
    const session = await auth();
    if (session?.user?.role !== Role.OWNER) {
        throw new Error("Unauthorized");
    }
    // Force non-null assertion or check
    if (!session || !session.user || !session.user.id) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user || user.role !== Role.OWNER) {
        throw new Error("Unauthorized");
    }

    return user;
}

export async function changeOwnPassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }
    
    // Safety check for user id
    if (!session.user.id) throw new Error("User ID missing");

    if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
    }

    if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user || !user.password) {
        throw new Error("User not found");
    }

    const isMatch = await compare(currentPassword, user.password);
    
    if (!isMatch) {
        throw new Error("Incorrect current password");
    }

    const hashedPassword = await hash(newPassword, 12);

    await db.$transaction(async (tx: any) => {
        await tx.user.update({
            where: { id: session!.user!.id },
            data: { password: hashedPassword }
        });

         await tx.activityLog.create({
            data: {
                userId: session!.user!.id as string,
                action: "CHANGE_PASSWORD",
                details: "User changed their own password"
            }
        });
    });
}

export async function createAdmin(formData: FormData) {
    const actor = await checkOwner();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as Role;

    if (!Object.values(Role).includes(role)) {
        throw new Error("Invalid role");
    }

    const hashedPassword = await hash(password, 12);

    await db.$transaction(async (tx: any) => {
        const newUser = await tx.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                isActive: true,
            }
        });

        await tx.activityLog.create({
            data: {
                userId: actor.id as string,
                action: "CREATE_ADMIN",
                details: `Created admin ${newUser.email} with role ${role}`
            }
        });
    });

    revalidatePath("/admin/admins");
}

export async function updateAdminRole(userId: string, newRole: Role) {
    const actor = await checkOwner();

    if (userId === actor.id) {
        throw new Error("Cannot change your own role");
    }

    await db.$transaction(async (tx: any) => {
        await tx.user.update({
            where: { id: userId },
            data: { role: newRole }
        });

        await tx.activityLog.create({
            data: {
                userId: actor.id as string,
                action: "UPDATE_ADMIN_ROLE",
                details: `Updated user ${userId} to role ${newRole}`
            }
        });
    });
    
    revalidatePath("/admin/admins");
}

export async function toggleAdminStatus(userId: string, isActive: boolean) {
    const actor = await checkOwner();
    
    if (userId === actor.id) {
         throw new Error("Cannot deactivate yourself");
    }

    await db.$transaction(async (tx: any) => {
        await tx.user.update({
            where: { id: userId },
            data: { isActive }
        });

        await tx.activityLog.create({
            data: {
                userId: actor.id as string,
                action: "TOGGLE_ADMIN_STATUS",
                details: `Set user ${userId} status to ${isActive}`
            }
        });
    });

    revalidatePath("/admin/admins");
}

export async function resetAdminPassword(userId: string, newPassword: string) {
    const actor = await checkOwner();

    const hashedPassword = await hash(newPassword, 12);

    await db.$transaction(async (tx: any) => {
        await tx.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

         await tx.activityLog.create({
            data: {
                userId: actor.id as string,
                action: "RESET_PASSWORD",
                details: `Reset password for user ${userId}`
            }
        });
    });
    
    revalidatePath("/admin/admins");
}
