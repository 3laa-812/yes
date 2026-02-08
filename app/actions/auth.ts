"use server";

import { z } from "zod";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";

// ... existing code ...

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}
import { AuthError } from "next-auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerCustomer(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData);
  const validatedFields = registerSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, phone, email, password } = validatedFields.data;

  try {
    // Check if phone already exists
    const existingPhone = await db.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return {
        error: "Phone number already registered. Please sign in.",
      };
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await db.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return {
          error: "Email already registered.",
        };
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        phone,
        email: email || null, // Ensure empty string becomes null
        password: hashedPassword,
        role: "USER",
      },
    });

    // Auto login
    try {
        await signIn("credentials", {
            identifier: phone, // Use phone as primary identifier for new registers
            password,
            redirectTo: "/",
        });
    } catch (error) {
        if (error instanceof AuthError) {
          return { error: "Registration successful, but auto-login failed." };
        }
        throw error; // Rethrow redirect
    }

  } catch (error: any) {
    console.error("Registration Error Details:", error);
    
    // Check if it's a redirect error (Next.js redirection)
    if (error.message === "NEXT_REDIRECT" || error.digest?.startsWith("NEXT_REDIRECT")) {
        throw error;
    }
    
    
    return {
      error: `Registration failed: ${error.message}`,
    };
  }
}
