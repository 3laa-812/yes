import type { NextAuthConfig } from "next-auth"
import { Role } from "@prisma/client"

export const authConfig = {
    pages: {
        signIn: '/auth/signin',
    },
    callbacks: {
        async session({ session, token }) {
            if (token.role && session.user) {
                // @ts-ignore
                session.user.role = token.role as Role;
                session.user.id = token.sub as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.sub = user.id;
            }
            return token;
        },
    },
    session: {
        maxAge: 24 * 60 * 60, // 24 hours
        strategy: "jwt",
    },
    providers: [],
} satisfies NextAuthConfig
