import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const { auth } = NextAuth(authConfig)
const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;
    
    const isUrlAdmin = pathname.includes('/admin');
    const isUrlProtected = pathname.includes('/checkout') || pathname.includes('/account'); // Add other customer protected routes
    
    // console.log(`[Middleware] ${req.method} ${pathname} | Auth: ${isLoggedIn} | Admin: ${isUrlAdmin}`);

    const userRole = req.auth?.user?.role as string | undefined;

    if (isUrlAdmin) {
        if (!isLoggedIn) {
             // console.log(`[Middleware] Redirecting unauthenticated admin request to signin`);
             const localeMatch = pathname.match(new RegExp(`^/(${routing.locales.join('|')})`));
             const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
             const callbackUrl = encodeURIComponent(pathname);
             return Response.redirect(new URL(`/${locale}/auth/signin?callbackUrl=${callbackUrl}`, req.nextUrl));
        }

        if (userRole !== 'OWNER' && userRole !== 'MANAGER') {
             // console.log(`[Middleware] Redirecting unauthorized user from admin`);
             const localeMatch = pathname.match(new RegExp(`^/(${routing.locales.join('|')})`));
             const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
             return Response.redirect(new URL(`/${locale}`, req.nextUrl));
        }
    }

    if (isUrlProtected && !isLoggedIn) {
        // console.log(`[Middleware] Redirecting unauthenticated customer request to login`);
        const localeMatch = pathname.match(new RegExp(`^/(${routing.locales.join('|')})`));
        const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
        const callbackUrl = encodeURIComponent(pathname);
        return Response.redirect(new URL(`/${locale}/login?callbackUrl=${callbackUrl}`, req.nextUrl));
    }

    return intlMiddleware(req);
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
