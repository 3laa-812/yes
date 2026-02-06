import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import db from "@/lib/db"
import { authConfig } from "./auth.config"
import bcrypt from "bcryptjs"

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
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);

                    if (!user) return null;
                    
                    if (!user.isActive) {
                         throw new Error("Account is disabled.");
                    }

                    const passwordsMatch = user.password 
                        ? await bcrypt.compare(password, user.password)
                        : false; 

                    if (passwordsMatch) {
                         return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                         };
                    }
                }
                
                // Basic rate limiting / timing attack mitigation
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
})
