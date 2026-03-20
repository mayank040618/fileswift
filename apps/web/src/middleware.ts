import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    '/',
    '/pricing',
    '/about',
    '/contact',
    '/terms',
    '/privacy-policy',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
    '/tools(.*)',
    '/ads.txt'
]);

export default clerkMiddleware((auth, request) => {
    const host = request.headers.get('host');
    const { pathname, search } = request.nextUrl;

    // Redirect fileswift.in to www.fileswift.in
    if (host === 'fileswift.in') {
        return NextResponse.redirect(
            new URL(`https://www.fileswift.in${pathname}${search}`),
            301
        );
    }

    if (!isPublicRoute(request)) {
        auth().protect();
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)', '/ads.txt'],
};

