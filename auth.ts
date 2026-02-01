import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import db from "@/lib/db"
import { authConfig } from "./auth.config"

async function getUser(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                // Mock auth for simplicity as requested - check if email is admin@example.com
                // In production, use bcrypt to compare passwords
                if (credentials.email === "admin@example.com" && credentials.password === "admin") {
                     return {
                        id: "1",
                        name: "Admin",
                        email: "admin@example.com",
                        role: "ADMIN",
                     }
                }
                return null
            },
        }),
    ],
})
