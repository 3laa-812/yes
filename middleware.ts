import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const { auth } = NextAuth(authConfig)
const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;
    
    // Check for admin routes, accounting for locale prefixes
    const isUrlAdmin = pathname.includes('/admin');

    if (isUrlAdmin && !isLoggedIn) {
        // Determine current locale to redirect correctly, default to 'en'
        const localeMatch = pathname.match(new RegExp(`^/(${routing.locales.join('|')})`));
        const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

        const callbackUrl = encodeURIComponent(pathname);
        return Response.redirect(new URL(`/${locale}/auth/signin?callbackUrl=${callbackUrl}`, req.nextUrl));
    }

    return intlMiddleware(req);
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
