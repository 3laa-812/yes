import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isUrlAdmin = req.nextUrl.pathname.startsWith('/admin');

    if (isUrlAdmin && !isLoggedIn) {
        const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
        return Response.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.nextUrl));
    }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
